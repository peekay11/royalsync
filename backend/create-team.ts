import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant found");

  for (const member of team) {
    const email = `${member}@royalsync.com`;
    const password = `${member}2026!`;
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'SUPER_ADMIN' },
      create: {
        email,
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        firstName: member.charAt(0).toUpperCase() + member.slice(1),
        lastName: 'Admin',
        tenantId: tenant.id
      }
    });
    details.push({ email, password, role: 'SUPER_ADMIN' });
  }

  console.log(JSON.stringify(details, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
