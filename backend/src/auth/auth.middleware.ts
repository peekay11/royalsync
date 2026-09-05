import type { MiddlewareHandler } from 'hono';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from './auth.controller';
import type { AppEnv, AppUser } from '../common/types';

export const authenticate: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AppUser;
    c.set('user', payload);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

export function authorize(resource: string, action: string): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !user.permissions) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const hasPerm = user.permissions.includes(`${resource}:${action}`);
    if (!hasPerm) {
      return c.json({ error: 'Forbidden: Missing permission' }, 403);
    }
    await next();
  };
}
