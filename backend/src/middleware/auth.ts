import crypto from 'node:crypto';
import type { Response } from 'express';
import type { AuthRequest, AuthUser, Middleware, Role } from '../types/auth';

const secret = () => {
  const value = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'royalsync-production-auth-secret-key-2026';
  return value;
};

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};

export const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return actual.length === hash.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(hash));
};

export const createToken = (user: AuthUser) => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ ...user, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 });
  const input = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', secret()).update(input).digest('base64url');
  return `${input}.${signature}`;
};

const readToken = (token: string): AuthUser | null => {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;
  const input = `${header}.${payload}`;
  const expected = crypto.createHmac('sha256', secret()).update(input).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AuthUser & { exp?: number };
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return { id: decoded.id, email: decoded.email, role: decoded.role, clientId: decoded.clientId };
};

export const requireAuth: Middleware = (req: AuthRequest, res: Response, next) => {
  const value = req.header('authorization');
  if (!value?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  try {
    const user = readToken(value.slice(7));
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid authentication token' });
  }
};

export const requireRole = (...roles: Role[]): Middleware => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403).json({ success: false, error: 'Insufficient permissions' });
    return;
  }
  next();
};