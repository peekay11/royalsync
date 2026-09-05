import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.create({ data: { name: 'Demo Tenant' } })

  const clientRole = await prisma.role.create({ data: { name: 'CLIENT' } })
  const adviserRole = await prisma.role.create({ data: { name: 'ADVISER' } })

  const hash = await bcrypt.hash('password123', 10)

  const u1 = await prisma.user.create({
    data: {
      email: 'client@example.com',
      passwordHash: hash,
      tenantId: tenant.id,
      roles: { create: { roleId: clientRole.id } }
    }
  })

  await prisma.user.create({
    data: {
      email: 'adviser@example.com',
      passwordHash: hash,
      tenantId: tenant.id,
      roles: { create: { roleId: adviserRole.id } }
    }
  })

  const client = await prisma.client.create({
    data: {
      userId: u1.id,
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe'
    }
  });

  // Financial Health
  await prisma.asset.create({ data: { clientId: client.id, name: 'House', value: 1000000 } })
  await prisma.asset.create({ data: { clientId: client.id, name: 'Car', value: 250000 } })
  await prisma.liability.create({ data: { clientId: client.id, name: 'Mortgage', value: 400000 } })
  
  await prisma.income.create({ data: { clientId: client.id, source: 'Salary', amount: 35000, frequency: 'MONTHLY' } })
  await prisma.expense.create({ data: { clientId: client.id, category: 'Groceries', amount: 1500, frequency: 'WEEKLY' } })

  // Goal
  await prisma.goal.create({
    data: {
      tenantId: client.tenantId,
      ownerId: client.id,
      name: 'Retirement Fund',
      targetAmount: 100000,
      currentAmount: 40000
    }
  });

  // Policy (Automation trigger)
  const d = new Date();
  d.setDate(d.getDate() + 10); // 10 days out
  await prisma.policy.create({
    data: {
      tenantId: client.tenantId,
      clientId: client.id,
      type: 'Motor',
      certificateExpiryDate: d
    }
  });

  console.log('Seeded Full Demo State successfully')
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect())
