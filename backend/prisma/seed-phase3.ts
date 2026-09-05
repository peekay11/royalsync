import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const client = await prisma.client.findFirst();
  if (client) {
    await prisma.goal.create({
      data: {
        tenantId: client.tenantId,
        ownerId: client.id,
        name: 'Retirement Fund',
        targetAmount: 100000,
        currentAmount: 25000
      }
    });
    console.log('Seeded Phase 3');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
