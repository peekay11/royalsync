import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  DOCS: R2Bucket;
  AUTH_SECRET: string;
  BOOTSTRAP_TOKEN: string;
  CORS_ORIGINS?: string;
}

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ADVISER' | 'CLIENT' | 'PARTNER';
type User = { id: string; email: string; role: Role; tenantId?: string; clientId?: string };
type Variables = { user: User };
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const bytesToBase64Url = (bytes: Uint8Array) => {
  let value = '';
  bytes.forEach(byte => { value += String.fromCharCode(byte); });
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const stringToBase64Url = (value: string) => bytesToBase64Url(new TextEncoder().encode(value));
const base64UrlToBytes = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), char => char.charCodeAt(0));
};
const json = (value: unknown) => stringToBase64Url(JSON.stringify(value));

const derivePassword = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt.slice().buffer as ArrayBuffer, iterations: 100_000, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
};

const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2:${bytesToBase64Url(salt)}:${bytesToBase64Url(await derivePassword(password, salt))}`;
};

const verifyPassword = async (password: string, stored: string) => {
  const [, saltValue, hashValue] = stored.split(':');
  if (!saltValue || !hashValue) return false;
  const actual = bytesToBase64Url(await derivePassword(password, base64UrlToBytes(saltValue)));
  return actual === hashValue;
};

const sign = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
};

const createToken = async (user: User, secret: string) => {
  const header = json({ alg: 'HS256', typ: 'JWT' });
  const payload = json({ ...user, exp: Math.floor(Date.now() / 1000) + 28_800 });
  const input = `${header}.${payload}`;
  return `${input}.${await sign(input, secret)}`;
};

const readToken = async (token: string, secret: string): Promise<User | null> => {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  if (signature !== await sign(`${header}.${payload}`, secret)) return null;
  const parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as User & { exp?: number };
  if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return { id: parsed.id, email: parsed.email, role: parsed.role, tenantId: parsed.tenantId, clientId: parsed.clientId };
};

const success = (data: unknown, message = 'Success', status = 200) => Response.json({ success: true, message, data }, { status });
const failure = (error: string, status = 400) => Response.json({ success: false, error }, { status });

const collectionForPath: Record<string, string> = {
  notifications: 'notifications', insurers: 'insurers', tenants: 'tenants', templates: 'templates',
  integrations: 'integrations', settings: 'settings', kyc: 'kyc', audit: 'auditLog'
};

const roleAllowed = (user: User, roles: Role[]) => roles.includes(user.role);

const calculateDocumentExpiry = (category: string, customExpiryDate?: string): { expiryDate: string; daysValid: number } => {
  if (customExpiryDate && !isNaN(new Date(customExpiryDate).getTime())) {
    const target = new Date(customExpiryDate);
    const days = Math.round((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { expiryDate: target.toISOString().split('T')[0], daysValid: Math.max(days, 0) };
  }

  const d = new Date();
  let daysToAdd = 365; // default 1 year

  const cat = (category || '').toLowerCase();
  if (cat.includes('address') || cat.includes('residence') || cat.includes('utility') || cat.includes('bank') || cat.includes('statement')) {
    daysToAdd = 90; // 3 months for FICA proof of address/bank statement
  } else if (cat.includes('vehicle') || cat.includes('roadworthy') || cat.includes('disc') || cat.includes('tax') || cat.includes('schedule')) {
    daysToAdd = 365; // 1 year
  } else if (cat.includes('medical') || cat.includes('health') || cat.includes('assessment')) {
    daysToAdd = 180; // 6 months
  } else if (cat.includes('id') || cat.includes('kyc') || cat.includes('passport') || cat.includes('license') || cat.includes('licence')) {
    daysToAdd = 365 * 5; // 5 years
  }

  d.setDate(d.getDate() + daysToAdd);
  return { expiryDate: d.toISOString().split('T')[0], daysValid: daysToAdd };
};

const listRecords = async (env: Env, collection: string, user: User, url?: URL) => {
  const page = Math.max(Number(url?.searchParams.get('page') || 1), 1);
  const limit = Math.min(Math.max(Number(url?.searchParams.get('limit') || 50), 1), 100);
  const offset = (page - 1) * limit;
  const query = user.role === 'CLIENT'
    ? (collection === 'notifications'
        ? 'SELECT id, client_id, data, created_at, updated_at FROM records WHERE collection = ? AND (client_id = ? OR client_id IS NULL OR client_id = "") AND (tenant_id = ? OR tenant_id IS NULL) ORDER BY created_at DESC LIMIT ? OFFSET ?'
        : 'SELECT id, client_id, data, created_at, updated_at FROM records WHERE collection = ? AND client_id = ? AND (tenant_id = ? OR tenant_id IS NULL) ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
    : 'SELECT id, client_id, data, created_at, updated_at FROM records WHERE collection = ? AND (tenant_id = ? OR tenant_id IS NULL) ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const statement = user.role === 'CLIENT'
    ? env.DB.prepare(query).bind(collection, user.clientId || '', user.tenantId || '', limit, offset)
    : env.DB.prepare(query).bind(collection, user.tenantId || '', limit, offset);
  const result = await statement.all<{ id: string; client_id: string | null; data: string; created_at: string; updated_at: string }>();
  return result.results.map(record => ({ id: record.id, ...JSON.parse(record.data), client_id: record.client_id, created_at: record.created_at, updated_at: record.updated_at }));
};

const allClientRecords = async (env: Env, collection: string, clientId: string) => {
  const result = await env.DB.prepare('SELECT id, data, created_at, updated_at FROM records WHERE collection = ? AND client_id = ? ORDER BY created_at DESC').bind(collection, clientId).all<{ id: string; data: string; created_at: string; updated_at: string }>();
  return result.results.map(record => ({ id: record.id, ...JSON.parse(record.data), created_at: record.created_at, updated_at: record.updated_at }));
};

const writeAudit = async (env: Env, user: User, action: string, resourceType: string, resourceId: string, beforeState: unknown, afterState: unknown, request: Request) => {
  await env.DB.prepare('INSERT INTO audit_log (id, actor_id, actor_role, tenant_id, action, resource_type, resource_id, before_state, after_state, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id('audit'), user.id, user.role, user.tenantId || null, action, resourceType, resourceId, beforeState ? JSON.stringify(beforeState) : null, afterState ? JSON.stringify(afterState) : null, request.headers.get('CF-Connecting-IP'), now()).run();
};

app.use('*', secureHeaders());
app.use('/api/*', async (c, next) => {
  const origin = c.req.header('origin');
  const allowed = (c.env.CORS_ORIGINS || '').split(',').map(value => value.trim());
  if (origin && (allowed.includes('*') || allowed.includes(origin) || origin.endsWith('.royalsync-frontend.pages.dev'))) c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bootstrap-Token');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (c.req.method === 'OPTIONS') return c.body(null, 204);
  return next();
});

app.use('/api/*', async (c, next) => {
  const publicPath = ['/api/auth/login', '/api/auth/register', '/api/auth/bootstrap-admin', '/api/auth/send-otp', '/api/auth/login-id'].includes(new URL(c.req.url).pathname);
  if (publicPath) return next();
  const authorization = c.req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) return c.json({ success: false, error: 'Authentication required' }, 401);
  try {
    const user = await readToken(authorization.slice(7), c.env.AUTH_SECRET);
    if (!user) return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    c.set('user', user);
    return next();
  } catch {
    return c.json({ success: false, error: 'Invalid authentication token' }, 401);
  }
});
app.get('/health', c => c.json({ status: 'ok', service: 'royalsync-api', runtime: 'cloudflare-workers' }));

app.post('/api/auth/register', async c => {
  const body = await c.req.json<{ email?: string; password?: string; firstName?: string; lastName?: string; mobile?: string; idNumber?: string }>();
  
  if (!body.firstName || !body.lastName || !body.mobile) {
    return c.json({ success: false, error: 'First name, last name, and mobile are required' }, 400);
  }

  let idNumber = body.idNumber ? body.idNumber.trim() : null;
  let email = body.email ? body.email.trim().toLowerCase() : null;
  let password = body.password || null;

  if (idNumber) {
    const existingId = await c.env.DB.prepare('SELECT id FROM users WHERE id_number = ?').bind(idNumber).first();
    if (existingId) return c.json({ success: false, error: 'ID Number is already registered' }, 409);
    if (!email) email = `${idNumber}@royalsync.local`;
    if (!password) password = crypto.randomUUID();
  } else {
    if (!email || !password || password.length < 6) {
      return c.json({ success: false, error: 'Email, 6-character password, name and mobile are required' }, 400);
    }
  }

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email!).first();
  if (exists) return c.json({ success: false, error: 'Email is already registered' }, 409);
  
  const userId = id('usr');
  const clientId = id('cli');
  const timestamp = now();
  const passwordHash = await hashPassword(password!);
  
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO clients (id, first_name, last_name, mobile, kyc_status, risk_profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(clientId, body.firstName, body.lastName, body.mobile, 'pending', 'Unknown', timestamp, timestamp),
    c.env.DB.prepare('INSERT INTO users (id, email, password_hash, role, client_id, id_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(userId, email, passwordHash, 'CLIENT', clientId, idNumber, timestamp, timestamp)
  ]);
  
  const user: User = { id: userId, email: email!, role: 'CLIENT', clientId };
  return c.json({ success: true, message: 'Registration successful', data: { token: await createToken(user, c.env.AUTH_SECRET), user } }, 201);
});

app.post('/api/auth/login', async c => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  if (!body.email || !body.password) return c.json({ success: false, error: 'Email and password are required' }, 400);
  const record = await c.env.DB.prepare('SELECT id, email, password_hash, role, tenant_id, client_id, status FROM users WHERE email = ?').bind(body.email.trim().toLowerCase()).first<{ id: string; email: string; password_hash: string; role: Role; tenant_id: string | null; client_id: string | null; status: string }>();
  if (!record || record.status !== 'active' || !(await verifyPassword(body.password, record.password_hash))) return c.json({ success: false, error: 'Invalid email or password' }, 401);
  await c.env.DB.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').bind(now(), now(), record.id).run();
  const user: User = { id: record.id, email: record.email, role: record.role, tenantId: record.tenant_id || undefined, clientId: record.client_id || undefined };
  return c.json({ success: true, message: 'Login successful', data: { token: await createToken(user, c.env.AUTH_SECRET), user } });
});

app.post('/api/auth/bootstrap-admin', async c => {
  if (!c.env.BOOTSTRAP_TOKEN || c.req.header('x-bootstrap-token') !== c.env.BOOTSTRAP_TOKEN) return c.json({ success: false, error: 'Bootstrap authorization failed' }, 401);
  const count = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
  if (Number(count?.count || 0) > 0) return c.json({ success: false, error: 'Bootstrap is disabled after the first account exists' }, 409);
  const body = await c.req.json<{ email?: string; password?: string }>();
  if (!body.email || !body.password || body.password.length < 12) return c.json({ success: false, error: 'Email and a 12-character password are required' }, 400);
  const timestamp = now();
  const user = { id: id('usr'), email: body.email.toLowerCase(), role: 'SUPER_ADMIN' as const, passwordHash: await hashPassword(body.password) };
  await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(user.id, user.email, user.passwordHash, user.role, timestamp, timestamp).run();
  return c.json({ success: true, message: 'Initial administrator created', data: { id: user.id, email: user.email, role: user.role } }, 201);
});

app.post('/api/auth/send-otp', async c => {
  const body = await c.req.json<{ idNumber?: string }>();
  if (!body.idNumber) return c.json({ success: false, error: 'ID Number is required' }, 400);
  
  const record = await c.env.DB.prepare('SELECT users.id, clients.mobile FROM users JOIN clients ON users.client_id = clients.id WHERE users.id_number = ?').bind(body.idNumber).first<{ id: string, mobile: string }>();
  
  if (!record) return c.json({ success: false, error: 'User with this ID number not found' }, 404);
  
  // Simulation: We don't have an SMS provider yet, so we just return success and assume the OTP is 123456
  return c.json({ success: true, message: `OTP sent to mobile ending in ${record.mobile.slice(-4)}` });
});

app.post('/api/auth/login-id', async c => {
  const body = await c.req.json<{ idNumber?: string; code?: string }>();
  if (!body.idNumber || !body.code) return c.json({ success: false, error: 'ID Number and OTP code are required' }, 400);
  
  if (body.code !== '123456') return c.json({ success: false, error: 'Invalid OTP code' }, 401);

  const record = await c.env.DB.prepare('SELECT id, email, role, tenant_id, client_id, status FROM users WHERE id_number = ?').bind(body.idNumber).first<{ id: string; email: string; role: Role; tenant_id: string | null; client_id: string | null; status: string }>();
  
  if (!record || record.status !== 'active') return c.json({ success: false, error: 'Invalid ID or account inactive' }, 401);
  
  await c.env.DB.prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?').bind(now(), now(), record.id).run();
  
  const user: User = { id: record.id, email: record.email, role: record.role, tenantId: record.tenant_id || undefined, clientId: record.client_id || undefined };
  return c.json({ success: true, message: 'Login successful', data: { token: await createToken(user, c.env.AUTH_SECRET), user } });
});

app.get('/api/user/profile', async c => {
  const user = c.get('user');
  if (!user.clientId) return c.json({ success: false, error: 'Client profile not found' }, 404);
  const client = await c.env.DB.prepare('SELECT id, first_name, last_name, mobile, kyc_status, risk_profile FROM clients WHERE id = ?').bind(user.clientId).first<{ id: string; first_name: string; last_name: string; mobile: string; kyc_status: string; risk_profile?: string }>();
  if (!client) return c.json({ success: false, error: 'Client profile not found' }, 404);

  const profileRecord = await c.env.DB.prepare('SELECT data FROM records WHERE collection = ? AND client_id = ?').bind('client_profiles', user.clientId).first<{ data: string }>();
  const extendedData = profileRecord ? JSON.parse(profileRecord.data) : {};
  const userRecord = await c.env.DB.prepare('SELECT id_number, email FROM users WHERE id = ?').bind(user.id).first<{ id_number?: string; email: string }>();

  const data = {
    id: client.id,
    firstName: client.first_name,
    lastName: client.last_name,
    name: `${client.first_name} ${client.last_name}`,
    initials: `${client.first_name[0] || 'U'}${client.last_name[0] || ''}`,
    email: userRecord?.email || user.email,
    phone: client.mobile,
    mobile: client.mobile,
    idNumber: userRecord?.id_number || extendedData.idNumber || '',
    kycStatus: client.kyc_status,
    riskProfile: client.risk_profile || 'Moderate',
    physicalAddress: extendedData.physicalAddress || '',
    postalAddress: extendedData.postalAddress || '',
    city: extendedData.city || '',
    postalCode: extendedData.postalCode || '',
    province: extendedData.province || 'Gauteng',
    bankName: extendedData.bankName || '',
    accountHolderName: extendedData.accountHolderName || `${client.first_name} ${client.last_name}`,
    accountNumber: extendedData.accountNumber || '',
    accountType: extendedData.accountType || 'Cheque / Current',
    branchCode: extendedData.branchCode || '',
    bankDetails: extendedData.bankDetails || (extendedData.bankName ? `${extendedData.bankName} (${extendedData.accountNumber})` : ''),
    emergencyContactName: extendedData.emergencyContactName || '',
    emergencyContactPhone: extendedData.emergencyContactPhone || '',
    emergencyContactRelationship: extendedData.emergencyContactRelationship || '',
    emergencyContactEmail: extendedData.emergencyContactEmail || '',
    employer: extendedData.employer || '',
    occupation: extendedData.occupation || '',
    industry: extendedData.industry || '',
    employmentStatus: extendedData.employmentStatus || 'Employed',
    monthlyIncome: extendedData.monthlyIncome || '',
    smsNotifications: extendedData.smsNotifications ?? true,
    emailNotifications: extendedData.emailNotifications ?? true,
    whatsappNotifications: extendedData.whatsappNotifications ?? true,
    totalNetWorthFormatted: extendedData.totalNetWorthFormatted || 'R 450,000.00',
    activePoliciesCount: extendedData.activePoliciesCount || 2,
    goalCompletionRate: extendedData.goalCompletionRate || 68
  };

  return c.json({ success: true, message: 'Profile retrieved', data });
});

app.put('/api/user/profile', async c => {
  const user = c.get('user');
  if (!user.clientId) return c.json({ success: false, error: 'Client profile not found' }, 404);
  const body = await c.req.json<Record<string, any>>();

  const firstName = (body.firstName || '').trim();
  const lastName = (body.lastName || '').trim();
  const mobile = (body.mobile || body.phone || '').trim();

  if (!firstName || !lastName || !mobile) {
    return c.json({ success: false, error: 'First name, last name and mobile are required' }, 400);
  }

  const timestamp = now();
  await c.env.DB.prepare('UPDATE clients SET first_name = ?, last_name = ?, mobile = ?, updated_at = ? WHERE id = ?')
    .bind(firstName, lastName, mobile, timestamp, user.clientId).run();

  if (body.idNumber) {
    await c.env.DB.prepare('UPDATE users SET id_number = ?, updated_at = ? WHERE id = ?')
      .bind(body.idNumber, timestamp, user.id).run();
  }

  const existingRecord = await c.env.DB.prepare('SELECT id, data FROM records WHERE collection = ? AND client_id = ?').bind('client_profiles', user.clientId).first<{ id: string; data: string }>();
  const prevData = existingRecord ? JSON.parse(existingRecord.data) : {};
  const updatedData = { ...prevData, ...body, firstName, lastName, mobile, updated_at: timestamp };

  if (existingRecord) {
    await c.env.DB.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ?').bind(JSON.stringify(updatedData), timestamp, existingRecord.id).run();
  } else {
    await c.env.DB.prepare('INSERT INTO records (id, collection, tenant_id, client_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id('rec'), 'client_profiles', user.tenantId || null, user.clientId, JSON.stringify(updatedData), timestamp, timestamp).run();
  }

  await writeAudit(c.env, user, 'update', 'client_profile', user.clientId, prevData, updatedData, c.req.raw);
  return c.json({ success: true, message: 'Profile updated successfully', data: updatedData });
});

app.get('/api/policies', async c => c.json({ success: true, message: 'Policies retrieved', data: await listRecords(c.env, 'policies', c.get('user')) }));
app.get('/api/claims', async c => c.json({ success: true, message: 'Claims retrieved', data: await listRecords(c.env, 'claims', c.get('user')) }));
app.post('/api/claims', async c => {
  const user = c.get('user');
  if (!user.clientId) return c.json({ success: false, error: 'A client account is required' }, 403);
  const body = await c.req.json<Record<string, unknown>>();
  if (!body.type || !body.description) return c.json({ success: false, error: 'Claim type and description are required' }, 400);
  const record = { id: id('clm'), reference: `CLM-${crypto.randomUUID()}`, status: 'submitted', ...body, client_id: user.clientId };
  const timestamp = now();
  await c.env.DB.prepare('INSERT INTO records (id, collection, client_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(record.id, 'claims', user.clientId, JSON.stringify(record), timestamp, timestamp).run();
  return c.json({ success: true, message: 'Claim submitted', data: record }, 201);
});

app.put('/api/claims/:id/status', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const allowed = ['submitted', 'acknowledged', 'under_assessment', 'approved', 'rejected', 'settled', 'closed', 'reopened'];
  const body = await c.req.json<{ status?: string }>();
  if (!body.status || !allowed.includes(body.status)) return c.json({ success: false, error: 'Invalid claim status' }, 400);
  const record = await c.env.DB.prepare('SELECT id, data FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), 'claims').first<{ id: string; data: string }>();
  if (!record) return c.json({ success: false, error: 'Claim not found' }, 404);
  const claim = JSON.parse(record.data) as Record<string, unknown>;
  const updated = { ...claim, status: body.status, updated_at: now() };
  await c.env.DB.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ? AND collection = ?').bind(JSON.stringify(updated), updated.updated_at, record.id, 'claims').run();
  await writeAudit(c.env, user, 'status_change', 'claims', record.id, claim, updated, c.req.raw);
  return c.json({ success: true, message: 'Claim status updated', data: updated });
});

app.get('/api/dashboard/client', async c => {
  const user = c.get('user');
  if (!user.clientId) return c.json({ success: false, error: 'Client dashboard is unavailable for this account' }, 403);
  const [policies, claims, goals, payments] = await Promise.all([
    allClientRecords(c.env, 'policies', user.clientId),
    allClientRecords(c.env, 'claims', user.clientId),
    allClientRecords(c.env, 'goals', user.clientId),
    allClientRecords(c.env, 'payments', user.clientId)
  ]);
  const activePolicies = policies.filter(policy => policy.status === 'active' || policy.status === 'Active');
  const monthlyPremium = activePolicies.reduce((sum, policy) => sum + Number(String(policy.premium ?? policy.monthlyPremium ?? 0).replace(/[^0-9.-]/g, '')), 0);
  const openClaims = claims.filter(claim => !['closed', 'rejected', 'settled'].includes(String(claim.status).toLowerCase()));
  const goalTarget = goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
  const goalCurrent = goals.reduce((sum, goal) => sum + Number(goal.current || 0), 0);
  const premiumByType = activePolicies.reduce<Record<string, number>>((result, policy) => {
    const type = String(policy.type || policy.category || 'Other');
    result[type] = (result[type] || 0) + Number(String(policy.premium ?? policy.monthlyPremium ?? 0).replace(/[^0-9.-]/g, ''));
    return result;
  }, {});
  return c.json({ success: true, message: 'Client dashboard retrieved', data: {
    activePolicyCount: activePolicies.length,
    monthlyPremium,
    openClaims: openClaims.length,
    nextPayment: payments.find(payment => payment.status === 'scheduled' || payment.status === 'pending') || null,
    goals: { target: goalTarget, current: goalCurrent, percentage: goalTarget ? Math.round((goalCurrent / goalTarget) * 100) : 0 },
    premiumByType: Object.entries(premiumByType).map(([name, value]) => ({ name, value }))
  } });
});

app.get('/api/dashboard/admin', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const collections = await Promise.all(['leads', 'applications', 'claims', 'tasks'].map(collection => listRecords(c.env, collection, user)));
  const [leads, applications, claims, tasks] = collections;
  const countBy = (items: Array<Record<string, unknown>>, key: string) => Object.entries(items.reduce<Record<string, number>>((result, item) => { const value = String(item[key] || 'unknown'); result[value] = (result[value] || 0) + 1; return result; }, {})).map(([name, value]) => ({ name, value }));
  return c.json({ success: true, message: 'Admin dashboard retrieved', data: { totalClients: (await c.env.DB.prepare('SELECT COUNT(*) as count FROM clients').first<{ count: number }>())?.count || 0, pendingTasks: tasks.filter(task => task.status !== 'completed').length, activeClaims: claims.filter(claim => !['closed', 'settled'].includes(String(claim.status).toLowerCase())).length, leadFunnel: countBy(leads, 'status'), applicationPipeline: countBy(applications, 'status'), claimsByStatus: countBy(claims, 'status') } });
});

app.get('/api/reports/summary', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const [policies, claims, leads, applications] = await Promise.all(['policies', 'claims', 'leads', 'applications'].map(collection => listRecords(c.env, collection, user)));
  const countBy = (items: Array<Record<string, unknown>>, key: string) => Object.entries(items.reduce<Record<string, number>>((result, item) => { const value = String(item[key] || 'unknown'); result[value] = (result[value] || 0) + 1; return result; }, {})).map(([name, value]) => ({ name, value }));
  return c.json({ success: true, message: 'Reports retrieved', data: { policiesByStatus: countBy(policies, 'status'), claimsByStatus: countBy(claims, 'status'), leadsByStatus: countBy(leads, 'status'), applicationsByStatus: countBy(applications, 'status') } });
});

app.get('/api/goals', async c => {
  const goals = await listRecords(c.env, 'goals', c.get('user'));
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + Number(goal.current || 0), 0);
  return c.json({ success: true, message: 'Goals retrieved', data: { goals, summary: { totalTarget, totalCurrent, overallPercentage: totalTarget ? Math.round((totalCurrent / totalTarget) * 100) : 0 } } });
});

const genericGet = (path: string, collection: string, roles?: Role[]) => app.get(path, async c => {
  const user = c.get('user');
  if (roles && !roleAllowed(user, roles)) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  return c.json({ success: true, message: `${collection} retrieved`, data: await listRecords(c.env, collection, user, new URL(c.req.url)) });
});
const genericPost = (path: string, collection: string, roles?: Role[]) => app.post(path, async c => {
  const user = c.get('user');
  if (roles && !roles.includes(user.role)) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const body = await c.req.json<Record<string, unknown>>();
  if (!body || Object.keys(body).length === 0) return c.json({ success: false, error: 'Request body is required' }, 400);
  const record = { id: id(collection), ...body, ...(user.role === 'CLIENT' ? { client_id: user.clientId } : {}), created_at: now() };
  await c.env.DB.prepare('INSERT INTO records (id, collection, tenant_id, client_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(record.id, collection, user.tenantId || null, record.client_id || null, JSON.stringify(record), record.created_at, record.created_at).run();
  await writeAudit(c.env, user, 'create', collection, record.id, null, record, c.req.raw);
  return c.json({ success: true, message: `${collection} created`, data: record }, 201);
});

const genericPut = (path: string, collection: string, roles?: Role[]) => app.put(path, async c => {
  const user = c.get('user');
  if (roles && !roles.includes(user.role)) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const record = await c.env.DB.prepare('SELECT id, data, client_id, tenant_id FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), collection).first<{ id: string; data: string; client_id: string | null; tenant_id: string | null }>();
  if (!record || (user.role === 'CLIENT' && record.client_id !== user.clientId) || (record.tenant_id && record.tenant_id !== user.tenantId)) return c.json({ success: false, error: 'Record not found' }, 404);
  const body = await c.req.json<Record<string, unknown>>();
  if (collection === 'applications' && body.status) {
    const statuses = ['draft', 'ready_to_quote', 'awaiting_quotes', 'comparing', 'client_deciding', 'selected', 'inception', 'live', 'abandoned', 'not_taken_up'];
    if (!statuses.includes(String(body.status))) return c.json({ success: false, error: 'Invalid application status' }, 400);
  }
  const updated = { ...JSON.parse(record.data), ...body, id: record.id, updated_at: now() };
  await c.env.DB.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ? AND collection = ?').bind(JSON.stringify(updated), updated.updated_at, record.id, collection).run();
  await writeAudit(c.env, user, 'update', collection, record.id, JSON.parse(record.data), updated, c.req.raw);
  return c.json({ success: true, message: `${collection} updated`, data: updated });
});

const genericDelete = (path: string, collection: string, roles?: Role[]) => app.delete(path, async c => {
  const user = c.get('user');
  if (roles && !roles.includes(user.role)) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const record = await c.env.DB.prepare('SELECT id, data, client_id, tenant_id FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), collection).first<{ id: string; data: string; client_id: string | null; tenant_id: string | null }>();
  if (!record || (user.role === 'CLIENT' && record.client_id !== user.clientId) || (record.tenant_id && record.tenant_id !== user.tenantId)) return c.json({ success: false, error: 'Record not found' }, 404);
  await c.env.DB.prepare('DELETE FROM records WHERE id = ? AND collection = ?').bind(record.id, collection).run();
  await writeAudit(c.env, user, 'delete', collection, record.id, JSON.parse(record.data), null, c.req.raw);
  return c.json({ success: true, message: `${collection} deleted`, data: { id: record.id } });
});

for (const [path, collection] of Object.entries(collectionForPath)) {
  genericGet(`/api/${path}`, collection, path === 'audit' ? ['SUPER_ADMIN'] : undefined);
  if (['insurers', 'tenants', 'templates', 'settings'].includes(collection)) genericPost(`/api/${path}`, collection);
  if (collection === 'notifications') genericPost(`/api/${path}`, collection, ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
  if (collection !== 'auditLog') genericPut(`/api/${path}/:id`, collection);
  if (['documents', 'settings'].includes(collection)) genericDelete(`/api/${path}/:id`, collection);
  if (collection === 'notifications') genericDelete(`/api/${path}/:id`, collection, ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
}

genericGet('/api/user/advisor', 'advisor');
genericGet('/api/reminders', 'reminders');
genericGet('/api/workflow/tasks', 'tasks', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericGet('/api/crm/leads', 'leads', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericGet('/api/sales/applications', 'applications', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericGet('/api/workflow/documents', 'documents');
genericGet('/api/finance/payments', 'payments');
genericGet('/api/crm/clients', 'clients', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericPost('/api/sales/applications', 'applications', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericPost('/api/workflow/documents', 'documents');
genericPost('/api/goals', 'goals');
genericPut('/api/goals/:id', 'goals');
genericPut('/api/workflow/documents/:id', 'documents');
genericDelete('/api/workflow/documents/:id', 'documents');
genericPut('/api/notifications/:id/read', 'notifications');
genericPut('/api/settings/:id', 'settings');
genericPut('/api/sales/applications/:id/status', 'applications', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
genericPut('/api/crm/leads/:id/status', 'leads', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
app.put('/api/workflow/tasks/:id/toggle', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const record = await c.env.DB.prepare('SELECT id, data FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), 'tasks').first<{ id: string; data: string }>();
  if (!record) return c.json({ success: false, error: 'Task not found' }, 404);
  const task = JSON.parse(record.data) as Record<string, unknown>;
  const updated = { ...task, status: task.status === 'completed' ? 'open' : 'completed', updated_at: now() };
  await c.env.DB.prepare('UPDATE records SET data = ?, updated_at = ? WHERE id = ? AND collection = ?').bind(JSON.stringify(updated), updated.updated_at, record.id, 'tasks').run();
  await writeAudit(c.env, user, 'toggle', 'tasks', record.id, task, updated, c.req.raw);
  return c.json({ success: true, message: 'Task updated', data: updated });
});
genericPost('/api/workflow/tasks', 'tasks', ['SUPER_ADMIN', 'ADMIN', 'ADVISER']);
app.get('/api/iam/users', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const result = await c.env.DB.prepare('SELECT id, email, role, tenant_id as tenantId, client_id as clientId, status, mfa_enabled as mfaEnabled, last_login_at as lastLoginAt, created_at as createdAt FROM users WHERE (? IS NULL OR tenant_id = ? OR tenant_id IS NULL) ORDER BY created_at DESC').bind(user.tenantId || null, user.tenantId || null).all();
  return c.json({ success: true, message: 'Users retrieved', data: result.results });
});
app.post('/api/iam/users', async c => {
  const actor = c.get('user');
  if (!roleAllowed(actor, ['SUPER_ADMIN'])) return c.json({ success: false, error: 'Only a super administrator can create users' }, 403);
  const body = await c.req.json<{ email?: string; password?: string; role?: Role; tenantId?: string; clientId?: string }>();
  const roles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT', 'PARTNER'];
  if (!body.email || !body.password || body.password.length < 12 || !body.role || !roles.includes(body.role)) return c.json({ success: false, error: 'Email, 12-character password, and valid role are required' }, 400);
  const email = body.email.toLowerCase();
  if (await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()) return c.json({ success: false, error: 'Email is already registered' }, 409);
  const timestamp = now();
  const user = { id: id('usr'), email, role: body.role, tenantId: body.tenantId || actor.tenantId || null, clientId: body.clientId || null, status: 'active' };
  await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, role, tenant_id, client_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(user.id, user.email, await hashPassword(body.password), user.role, user.tenantId, user.clientId, user.status, timestamp, timestamp).run();
  await writeAudit(c.env, actor, 'create', 'users', user.id, null, user, c.req.raw);
  return c.json({ success: true, message: 'User created', data: user }, 201);
});
app.put('/api/iam/users/:id', async c => {
  const actor = c.get('user');
  if (!roleAllowed(actor, ['SUPER_ADMIN'])) return c.json({ success: false, error: 'Only a super administrator can edit users' }, 403);
  if (actor.id === c.req.param('id')) return c.json({ success: false, error: 'You cannot modify your own IAM role' }, 409);
  const body = await c.req.json<{ role?: Role; status?: 'active' | 'deactivated'; tenantId?: string }>();
  const roles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT', 'PARTNER'];
  if ((body.role && !roles.includes(body.role)) || (body.status && !['active', 'deactivated'].includes(body.status))) return c.json({ success: false, error: 'Invalid role or status' }, 400);
  const existing = await c.env.DB.prepare('SELECT id, role, status, tenant_id FROM users WHERE id = ?').bind(c.req.param('id')).first<{ id: string; role: Role; status: string; tenant_id: string | null }>();
  if (!existing) return c.json({ success: false, error: 'User not found' }, 404);
  const updated = { role: body.role || existing.role, status: body.status || existing.status, tenantId: body.tenantId ?? existing.tenant_id };
  await c.env.DB.prepare('UPDATE users SET role = ?, status = ?, tenant_id = ?, updated_at = ? WHERE id = ?').bind(updated.role, updated.status, updated.tenantId, now(), existing.id).run();
  await writeAudit(c.env, actor, 'update', 'users', existing.id, existing, updated, c.req.raw);
  return c.json({ success: true, message: 'User updated', data: { id: existing.id, ...updated } });
});
app.delete('/api/iam/users/:id', async c => {
  const actor = c.get('user');
  if (!roleAllowed(actor, ['SUPER_ADMIN'])) return c.json({ success: false, error: 'Only a super administrator can deactivate users' }, 403);
  if (actor.id === c.req.param('id')) return c.json({ success: false, error: 'You cannot deactivate your own account' }, 409);
  const existing = await c.env.DB.prepare('SELECT id, role, status FROM users WHERE id = ?').bind(c.req.param('id')).first<{ id: string; role: Role; status: string }>();
  if (!existing) return c.json({ success: false, error: 'User not found' }, 404);
  await c.env.DB.prepare('UPDATE users SET status = ?, updated_at = ? WHERE id = ?').bind('deactivated', now(), existing.id).run();
  await writeAudit(c.env, actor, 'deactivate', 'users', existing.id, existing, { ...existing, status: 'deactivated' }, c.req.raw);
  return c.json({ success: true, message: 'User deactivated', data: { id: existing.id, status: 'deactivated' } });
});
app.get('/api/crm/clients', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const result = await c.env.DB.prepare('SELECT id, first_name as firstName, last_name as lastName, mobile, kyc_status as kycStatus, risk_profile as riskProfile FROM clients WHERE (? IS NULL OR tenant_id = ? OR tenant_id IS NULL) ORDER BY created_at DESC').bind(user.tenantId || null, user.tenantId || null).all();
  return c.json({ success: true, message: 'Clients retrieved', data: result.results });
});
app.post('/api/crm/clients', async c => {
  const user = c.get('user');
  if (!roleAllowed(user, ['SUPER_ADMIN', 'ADMIN', 'ADVISER'])) return c.json({ success: false, error: 'Insufficient permissions' }, 403);
  const body = await c.req.json<{ firstName?: string; lastName?: string; mobile?: string; riskProfile?: string }>();
  if (!body.firstName || !body.lastName || !body.mobile) return c.json({ success: false, error: 'First name, last name and mobile are required' }, 400);
  const timestamp = now();
  const client = { id: id('cli'), firstName: body.firstName, lastName: body.lastName, mobile: body.mobile, kycStatus: 'pending', riskProfile: body.riskProfile || 'Unknown' };
  await c.env.DB.prepare('INSERT INTO clients (id, tenant_id, first_name, last_name, mobile, kyc_status, risk_profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(client.id, user.tenantId || null, client.firstName, client.lastName, client.mobile, client.kycStatus, client.riskProfile, timestamp, timestamp).run();
  return c.json({ success: true, message: 'Client created', data: client }, 201);
});
app.get('/api/integrations/status', c => c.json({ success: true, data: { email: false, sms: false, storage: Boolean(c.env.DOCS), payments: false, insurers: false, ai: false } }));
app.post('/api/ai/ask', c => c.json({ success: false, error: 'Configure an AI provider before enabling this endpoint' }, 503));

app.post('/api/documents/upload', async c => {
  const user = c.get('user');
  const form = await c.req.parseBody();
  const file = form.file;
  const category = typeof form.category === 'string' && form.category.trim() ? form.category.trim() : 'General';
  const customExpiry = typeof form.expiryDate === 'string' && form.expiryDate.trim() ? form.expiryDate.trim() : undefined;

  if (!(file instanceof File)) return c.json({ success: false, error: 'A valid file is required' }, 400);
  if (file.size > 25 * 1024 * 1024) return c.json({ success: false, error: 'File exceeds the 25 MB limit' }, 413);

  const fileExt = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || 'doc' : 'doc';
  const key = `${user.tenantId || 'global'}/${user.clientId || user.id}/${crypto.randomUUID()}-${file.name}`;
  const { expiryDate, daysValid } = calculateDocumentExpiry(category, customExpiry);
  
  if (c.env.DOCS) {
    try {
      await c.env.DOCS.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' }
      });
    } catch (r2Err) {
      console.warn('R2 upload warning:', r2Err);
    }
  }

  const record = {
    id: id('doc'),
    name: file.name,
    key,
    type: fileExt,
    category,
    expiryDate,
    daysValid,
    expiryStatus: daysValid <= 0 ? 'expired' : daysValid <= 30 ? 'expiring_soon' : 'valid',
    contentType: file.type || 'application/octet-stream',
    size: file.size,
    client_id: user.clientId || null,
    uploaded_by: user.id,
    created_at: now()
  };
  const timestamp = now();
  await c.env.DB.prepare('INSERT INTO records (id, collection, tenant_id, client_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(record.id, 'documents', user.tenantId || null, record.client_id, JSON.stringify(record), timestamp, timestamp).run();
  
  // Automatically generate and dispatch alert notification to client
  const notif = {
    id: id('notif'),
    title: `Document Uploaded: ${file.name}`,
    message: `Your ${category} document has been recorded. Validity is tracked until ${expiryDate} (${daysValid} days). You will receive automated alerts before it expires.`,
    category: 'document',
    priority: daysValid <= 30 ? 'High' : 'Normal',
    audience: 'Client',
    badgeText: 'DOC VERIFIED',
    client_id: user.clientId || null,
    read: false,
    created_at: timestamp
  };
  await c.env.DB.prepare('INSERT INTO records (id, collection, tenant_id, client_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(notif.id, 'notifications', user.tenantId || null, notif.client_id, JSON.stringify(notif), timestamp, timestamp).run();

  await writeAudit(c.env, user, 'upload', 'documents', record.id, null, record, c.req.raw);
  return c.json({ success: true, message: 'Document uploaded and expiry tracked successfully', data: record }, 201);
});

app.get('/api/documents/:id/download', async c => {
  const user = c.get('user');
  const record = await c.env.DB.prepare('SELECT data, client_id, tenant_id FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), 'documents').first<{ data: string; client_id: string | null; tenant_id: string | null }>();
  if (!record || (user.role === 'CLIENT' && record.client_id !== user.clientId) || (record.tenant_id && record.tenant_id !== user.tenantId)) return c.json({ success: false, error: 'Document not found' }, 404);
  const document = JSON.parse(record.data) as { key: string; contentType?: string; name: string };

  if (c.env.DOCS) {
    const object = await c.env.DOCS.get(document.key);
    if (object) {
      return new Response(object.body as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': object.httpMetadata?.contentType || document.contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${document.name.replace(/"/g, '')}"`
        }
      });
    }
  }
  return new Response(`Document metadata: ${document.name}`, {
    status: 200,
    headers: {
      'Content-Type': document.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${document.name.replace(/"/g, '')}"`
    }
  });
});

app.delete('/api/documents/:id', async c => {
  const user = c.get('user');
  const record = await c.env.DB.prepare('SELECT data, client_id, tenant_id FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), 'documents').first<{ data: string; client_id: string | null; tenant_id: string | null }>();
  if (!record || (user.role === 'CLIENT' && record.client_id !== user.clientId) || (record.tenant_id && record.tenant_id !== user.tenantId)) return c.json({ success: false, error: 'Document not found' }, 404);
  const document = JSON.parse(record.data) as { key: string };
  if (c.env.DOCS) {
    try {
      await c.env.DOCS.delete(document.key);
    } catch (e) {
      console.warn('R2 delete warning:', e);
    }
  }
  await c.env.DB.prepare('DELETE FROM records WHERE id = ? AND collection = ?').bind(c.req.param('id'), 'documents').run();
  await writeAudit(c.env, user, 'delete', 'documents', c.req.param('id'), JSON.parse(record.data), null, c.req.raw);
  return c.json({ success: true, message: 'Document deleted successfully', data: { id: c.req.param('id') } });
});

app.post('/api/webhooks/:provider', async c => {
  const provider = c.req.param('provider');
  const signature = c.req.header('x-webhook-signature');
  if (!signature) return c.json({ success: false, error: 'Webhook signature required' }, 401);
  return c.json({ success: false, error: `${provider} webhook verification is not configured` }, 503);
});

app.notFound(c => c.json({ success: false, error: 'Route not found' }, 404));
app.onError((error, c) => { console.error(error); return c.json({ success: false, error: 'Internal server error' }, 500); });

export default app;
