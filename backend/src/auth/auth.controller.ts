import type { Context } from 'hono';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../common/prisma';
import type { AppEnv } from '../common/types';

export const JWT_SECRET = 'supersecretjwtkey';

export async function login(c: Context<AppEnv>) {
  const { email, password } = await c.req.json();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } }
  });

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const roleNames = user.roles.map(ur => ur.role.name);
  const permissions = user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission));

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      roles: roleNames,
      permissions: permissions.map(p => `${p.resource}:${p.action}`)
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return c.json({ token, user: { id: user.id, email: user.email, roles: roleNames } });
}

export async function getMe(c: Context<AppEnv>) {
  return c.json({ user: c.get('user') });
}
