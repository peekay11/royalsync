import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found");

  let adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
  }

  const team = ['paseka', 'olive', 'bhekani', 'tshepiso'];
  const details = [];

  for (const member of team) {
    const email = `${member}@royalsync.com`;
    const password = `${member}2026!`;
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash },
      create: {
        email,
        passwordHash: hash,
        tenantId: tenant.id,
        roles: { create: { roleId: adminRole.id } }
      }
    });
    details.push({ email, password, role: 'SUPER_ADMIN' });
  }

  console.log(JSON.stringify(details, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
