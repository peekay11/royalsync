const crypto = globalThis.crypto;

const bytesToBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const derivePassword = async (password: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt.buffer, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
};

const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hashBytes = await derivePassword(password, salt);
  return `pbkdf2:${bytesToBase64Url(salt)}:${bytesToBase64Url(hashBytes)}`;
};

async function main() {
  const users = [
    { email: 'client@example.com', pass: 'password12345', role: 'CLIENT', name: 'Demo Client' },
    { email: 'adviser@example.com', pass: 'password12345', role: 'ADVISER', name: 'Demo Adviser' },
    { email: 'paseka@royalsync.com', pass: 'paseka2026!', role: 'SUPER_ADMIN', name: 'Paseka' },
    { email: 'olive@royalsync.com', pass: 'olive2026!', role: 'SUPER_ADMIN', name: 'Olive' },
    { email: 'bhekani@royalsync.com', pass: 'bhekani2026!', role: 'SUPER_ADMIN', name: 'Bhekani' },
    { email: 'tshepiso@royalsync.com', pass: 'tshepiso2026!', role: 'SUPER_ADMIN', name: 'Tshepiso' }
  ];

  let sql = '';
  let idCounter = 1;
  const now = new Date().toISOString();

  // Insert a tenant
  sql += `INSERT INTO tenants (id, name, created_at, updated_at) VALUES ('tenant_1', 'RoyalSync Core', '${now}', '${now}');\n`;

  for (const u of users) {
    const hash = await hashPassword(u.pass);
    const userId = `usr_seed_${idCounter}`;
    const clientId = `cli_seed_${idCounter}`;
    idCounter++;

    sql += `INSERT INTO clients (id, tenant_id, first_name, last_name, mobile, kyc_status, risk_profile, created_at, updated_at) VALUES ('${clientId}', 'tenant_1', '${u.name}', 'User', '0000000000', 'pending', 'Unknown', '${now}', '${now}');\n`;
    sql += `INSERT INTO users (id, email, password_hash, role, tenant_id, client_id, status, created_at, updated_at) VALUES ('${userId}', '${u.email}', '${hash}', '${u.role}', 'tenant_1', '${clientId}', 'active', '${now}', '${now}');\n`;
  }

  require('fs').writeFileSync('d1-seed.sql', sql);
  console.log('Generated d1-seed.sql');
}

main().catch(console.error);
