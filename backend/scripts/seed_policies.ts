import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POLICY_TEMPLATES = [
  {
    insurerName: 'Santam',
    type: 'Comprehensive Motor Vehicle',
    prefix: 'ST-MTR',
    premium: 1850,
    sumAssured: 380000,
  },
  {
    insurerName: 'Discovery Life',
    type: 'Life Cover & Dread Disease',
    prefix: 'DL-LIF',
    premium: 2200,
    sumAssured: 4500000,
  },
  {
    insurerName: 'Old Mutual',
    type: 'Family Funeral Plan',
    prefix: 'OM-FUN',
    premium: 480,
    sumAssured: 100000,
  },
  {
    insurerName: 'Sanlam',
    type: 'Retirement Annuity & Wealth Builder',
    prefix: 'SL-RET',
    premium: 2500,
    sumAssured: 1200000,
  },
  {
    insurerName: 'Momentum',
    type: 'Income Protection & Disability',
    prefix: 'MO-INC',
    premium: 950,
    sumAssured: 2000000,
  },
  {
    insurerName: 'Hollard',
    type: 'Building & Home Contents Cover',
    prefix: 'HL-HOM',
    premium: 1150,
    sumAssured: 1800000,
  },
  {
    insurerName: 'FNB Insurance',
    type: 'Personal Valuables & All-Risk',
    prefix: 'FN-VAL',
    premium: 320,
    sumAssured: 85000,
  },
];

async function seedUserPolicies() {
  console.log('🚀 Seeding comprehensive policies for all clients...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('Tenant not found');
    return;
  }

  // Ensure insurers exist
  const insurerMap: Record<string, string> = {};
  const insurers = await prisma.insurer.findMany();
  for (const ins of insurers) {
    insurerMap[ins.name] = ins.id;
  }

  const clients = await prisma.client.findMany({
    include: { policies: true }
  });

  console.log(`Found ${clients.length} clients in database.`);

  let totalAdded = 0;

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const existingCount = client.policies.length;

    // We want every client to have at least 2 - 3 active policies
    const needed = Math.max(0, 3 - existingCount);

    if (needed > 0) {
      console.log(`Adding ${needed} policies for client: ${client.firstName} ${client.lastName}`);

      for (let j = 0; j < needed; j++) {
        const templateIdx = (i + j) % POLICY_TEMPLATES.length;
        const template = POLICY_TEMPLATES[templateIdx];
        const insurerId = insurerMap[template.insurerName] || insurers[0]?.id;

        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const policyNumber = `${template.prefix}-${randomNum}`;

        const inceptionDaysAgo = Math.floor(10 + Math.random() * 200);
        const inceptionDate = new Date(Date.now() - inceptionDaysAgo * 86400000);

        await prisma.policy.create({
          data: {
            tenantId: tenant.id,
            clientId: client.id,
            insurerId: insurerId || null,
            policyNumber,
            type: template.type,
            premium: template.premium,
            sumAssured: template.sumAssured,
            status: 'active',
            inceptionDate
          }
        });

        totalAdded++;
      }
    }

    // Also add sample payment history if none exists
    const paymentCount = await prisma.payment.count({ where: { clientId: client.id } });
    if (paymentCount === 0) {
      const dates = [
        new Date(Date.now() - 30 * 86400000),
        new Date(Date.now() - 60 * 86400000),
        new Date(Date.now() - 90 * 86400000)
      ];

      for (const date of dates) {
        await prisma.payment.create({
          data: {
            clientId: client.id,
            amount: 1850 + Math.floor(Math.random() * 500),
            date,
            status: 'paid',
            method: 'debit_order',
            description: `Monthly Premium Debit Order (Ref: RS-${Math.floor(100000 + Math.random() * 900000)})`
          }
        });
      }
    }

    // Also add sample financial goal if none exists
    const goalCount = await prisma.goal.count({ where: { clientId: client.id } });
    if (goalCount === 0) {
      await prisma.goal.create({
        data: {
          clientId: client.id,
          name: 'Emergency Buffer Fund',
          targetAmount: 50000,
          currentAmount: 22500,
          targetDate: new Date(Date.now() + 180 * 86400000),
          contributionAmount: 1500,
          contributionFrequency: 'Monthly',
          status: 'in_progress'
        }
      });
      await prisma.goal.create({
        data: {
          clientId: client.id,
          name: 'Retirement Wealth Builder',
          targetAmount: 2500000,
          currentAmount: 680000,
          targetDate: new Date(Date.now() + 1825 * 86400000),
          contributionAmount: 3000,
          contributionFrequency: 'Monthly',
          status: 'in_progress'
        }
      });
    }

    // Also add sample FICA document if none exists
    const docCount = await prisma.document.count({ where: { clientId: client.id } });
    if (docCount === 0) {
      await prisma.document.create({
        data: {
          clientId: client.id,
          name: `${client.firstName.toLowerCase()}_rsa_id_card.pdf`,
          type: 'KYC / ID',
          status: 'verified',
          url: '/api/documents/sample/rsa_id.pdf'
        }
      });
      await prisma.document.create({
        data: {
          clientId: client.id,
          name: 'proof_of_residence_utility.pdf',
          type: 'Proof of Address',
          status: 'verified',
          url: '/api/documents/sample/proof_residence.pdf'
        }
      });
    }
  }

  console.log(`✅ Successfully added ${totalAdded} new policies across all users/clients!`);
}

seedUserPolicies()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error seeding user policies:', e);
    prisma.$disconnect();
    process.exit(1);
  });
