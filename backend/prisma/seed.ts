import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const monthsAgo = (n: number) => new Date(Date.now() - n * 30 * 86_400_000);

async function main() {
  console.log('🌱 Starting seed...');

  // ─── INSURERS ─────────────────────────────────────────────────────────────
  const insurerData = [
    { name: 'Santam', domain: 'santam.co.za', category: 'short-term', contactEmail: 'brokers@santam.co.za' },
    { name: 'Discovery Life', domain: 'discovery.co.za', category: 'life', contactEmail: 'broker@discovery.co.za' },
    { name: 'Old Mutual', domain: 'oldmutual.com', category: 'life', contactEmail: 'brokers@oldmutual.com' },
    { name: 'Momentum', domain: 'momentum.co.za', category: 'life', contactEmail: 'brokers@momentum.co.za' },
    { name: 'Hollard', domain: 'hollard.co.za', category: 'short-term', contactEmail: 'brokers@hollard.co.za' },
    { name: 'Alexander Forbes', domain: 'alexanderforbes.com', category: 'employee-benefits', contactEmail: 'info@af.co.za' },
    { name: 'Sanlam', domain: 'sanlam.co.za', category: 'life', contactEmail: 'brokers@sanlam.co.za' },
    { name: 'FNB Insurance', domain: 'fnb.co.za', category: 'short-term', contactEmail: 'insurance@fnb.co.za' },
    { name: 'Standard Bank Insurance', domain: 'standardbank.co.za', category: 'short-term', contactEmail: 'insurance@standardbank.co.za' },
    { name: 'Absa Insurance', domain: 'absa.co.za', category: 'short-term', contactEmail: 'insurance@absa.co.za' },
  ];

  const insurers: Record<string, any> = {};
  for (const d of insurerData) {
    const ins = await prisma.insurer.upsert({
      where: { name: d.name },
      update: {},
      create: { ...d, status: 'active', apiStatus: 'active' }
    });
    insurers[d.name] = ins;
    console.log(`  ✓ Insurer: ${d.name}`);
  }

  // ─── TENANTS ──────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'royal-square' },
    update: {},
    create: { name: 'Royal Square Financial', slug: 'royal-square', status: 'active', plan: 'professional', createdAt: monthsAgo(6) }
  });
  console.log(`  ✓ Tenant: ${tenant.name}`);

  // ─── USERS ────────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@royalsquare.co.za' },
    update: {},
    create: {
      email: 'super@royalsquare.co.za',
      passwordHash: hashPassword('Admin@12345'),
      role: 'SUPER_ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      tenantId: tenant.id,
      status: 'active',
      createdAt: monthsAgo(6)
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@royalsquare.co.za' },
    update: {},
    create: {
      email: 'admin@royalsquare.co.za',
      passwordHash: hashPassword('Admin@12345'),
      role: 'ADMIN',
      firstName: 'Thandiwe',
      lastName: 'Dlamini',
      tenantId: tenant.id,
      status: 'active',
      createdAt: monthsAgo(5)
    }
  });

  const adviser1 = await prisma.user.upsert({
    where: { email: 'sipho@royalsquare.co.za' },
    update: {},
    create: {
      email: 'sipho@royalsquare.co.za',
      passwordHash: hashPassword('Admin@12345'),
      role: 'ADVISER',
      firstName: 'Sipho',
      lastName: 'Ndlovu',
      tenantId: tenant.id,
      status: 'active',
      createdAt: monthsAgo(5)
    }
  });

  const adviser2 = await prisma.user.upsert({
    where: { email: 'ntombi@royalsquare.co.za' },
    update: {},
    create: {
      email: 'ntombi@royalsquare.co.za',
      passwordHash: hashPassword('Admin@12345'),
      role: 'ADVISER',
      firstName: 'Ntombifikile',
      lastName: 'Mthembu',
      tenantId: tenant.id,
      status: 'active',
      createdAt: monthsAgo(4)
    }
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@santam.co.za' },
    update: {},
    create: {
      email: 'partner@santam.co.za',
      passwordHash: hashPassword('Admin@12345'),
      role: 'PARTNER',
      firstName: 'Santam',
      lastName: 'Integration',
      tenantId: tenant.id,
      status: 'active'
    }
  });

  console.log('  ✓ Core users created');

  // ─── CLIENTS ──────────────────────────────────────────────────────────────
  type ClientSeed = { firstName: string; lastName: string; mobile: string; email: string; idNumber: string; kycStatus: string; riskProfile: string; daysBack: number; };
  const clientSeeds: ClientSeed[] = [
    { firstName: 'Lungelo', lastName: 'Khumalo', mobile: '071 234 5678', email: 'lungelo@gmail.com', idNumber: '8501015800083', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 90 },
    { firstName: 'Priya', lastName: 'Naidoo', mobile: '082 345 6789', email: 'priya.naidoo@outlook.com', idNumber: '9203042860087', kycStatus: 'verified', riskProfile: 'Low', daysBack: 85 },
    { firstName: 'Johan', lastName: 'van der Merwe', mobile: '083 456 7890', email: 'johan.vdm@gmail.com', idNumber: '7712155100087', kycStatus: 'verified', riskProfile: 'High', daysBack: 80 },
    { firstName: 'Nomsa', lastName: 'Zulu', mobile: '060 567 8901', email: 'nomsa.zulu@webmail.co.za', idNumber: '8808196000089', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 75 },
    { firstName: 'Deon', lastName: 'Jacobs', mobile: '074 678 9012', email: 'deon.jacobs@icloud.com', idNumber: '8405255200081', kycStatus: 'verified', riskProfile: 'Low', daysBack: 70 },
    { firstName: 'Ayanda', lastName: 'Shabalala', mobile: '061 789 0123', email: 'ayanda.s@gmail.com', idNumber: '9506156800080', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 65 },
    { firstName: 'Fatima', lastName: 'Patel', mobile: '072 890 1234', email: 'fatima.patel@gmail.com', idNumber: '8812045800083', kycStatus: 'verified', riskProfile: 'Low', daysBack: 60 },
    { firstName: 'Riaan', lastName: 'Botha', mobile: '083 901 2345', email: 'riaan.botha@gmail.com', idNumber: '8103155100089', kycStatus: 'pending', riskProfile: 'High', daysBack: 55 },
    { firstName: 'Zanele', lastName: 'Mokoena', mobile: '064 012 3456', email: 'zanele.m@outlook.com', idNumber: '9301296000087', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 50 },
    { firstName: 'Pieter', lastName: 'du Toit', mobile: '073 123 4567', email: 'pieter.dutoit@gmail.com', idNumber: '7508255400082', kycStatus: 'verified', riskProfile: 'Low', daysBack: 45 },
    { firstName: 'Nokuthula', lastName: 'Mhlongo', mobile: '081 234 5678', email: 'nokuthula@gmail.com', idNumber: '8706136800086', kycStatus: 'pending', riskProfile: 'Unknown', daysBack: 40 },
    { firstName: 'André', lastName: 'Pretorius', mobile: '082 345 6789', email: 'andre.p@gmail.com', idNumber: '8904055100083', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 35 },
    { firstName: 'Thabo', lastName: 'Motsepe', mobile: '079 456 7890', email: 'thabo.motsepe@gmail.com', idNumber: '9107016200081', kycStatus: 'verified', riskProfile: 'Low', daysBack: 30 },
    { firstName: 'Lerato', lastName: 'Sithole', mobile: '060 567 8901', email: 'lerato.sithole@webmail.co.za', idNumber: '8612316800082', kycStatus: 'in_review', riskProfile: 'Moderate', daysBack: 25 },
    { firstName: 'Gavin', lastName: 'Smith', mobile: '083 678 9012', email: 'gavin.smith@outlook.com', idNumber: '7903195100080', kycStatus: 'verified', riskProfile: 'High', daysBack: 20 },
    { firstName: 'Precious', lastName: 'Nkosi', mobile: '071 789 0123', email: 'precious.nkosi@gmail.com', idNumber: '9210236800083', kycStatus: 'pending', riskProfile: 'Unknown', daysBack: 15 },
    { firstName: 'Bertus', lastName: 'Nel', mobile: '082 890 1234', email: 'bertus.nel@gmail.com', idNumber: '8604275300087', kycStatus: 'verified', riskProfile: 'Moderate', daysBack: 10 },
    { firstName: 'Sindisiwe', lastName: 'Cele', mobile: '073 901 2345', email: 'sindisiwe.cele@gmail.com', idNumber: '9405206800080', kycStatus: 'pending', riskProfile: 'Unknown', daysBack: 7 },
    { firstName: 'Imran', lastName: 'Khan', mobile: '064 012 3456', email: 'imran.khan@icloud.com', idNumber: '8808225800084', kycStatus: 'verified', riskProfile: 'Low', daysBack: 5 },
    { firstName: 'Nompumelelo', lastName: 'Dube', mobile: '061 123 4567', email: 'nompumelelo.d@gmail.com', idNumber: '9112066800088', kycStatus: 'pending', riskProfile: 'Unknown', daysBack: 2 },
  ];

  const clientUsers: any[] = [];
  const dbClients: any[] = [];

  for (const cs of clientSeeds) {
    const u = await prisma.user.upsert({
      where: { email: cs.email },
      update: {},
      create: {
        email: cs.email,
        passwordHash: hashPassword('Client@1234'),
        role: 'CLIENT',
        firstName: cs.firstName,
        lastName: cs.lastName,
        idNumber: cs.idNumber,
        tenantId: tenant.id,
        status: 'active',
        createdAt: daysAgo(cs.daysBack)
      }
    });
    const c = await prisma.client.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: u.id,
        firstName: cs.firstName,
        lastName: cs.lastName,
        mobile: cs.mobile,
        email: cs.email,
        idNumber: cs.idNumber,
        kycStatus: cs.kycStatus,
        riskProfile: cs.riskProfile,
        assignedAdviserId: dbClients.length % 2 === 0 ? adviser1.id : adviser2.id,
        createdAt: daysAgo(cs.daysBack)
      }
    });
    clientUsers.push(u);
    dbClients.push(c);
  }
  console.log(`  ✓ ${dbClients.length} clients created`);

  // ─── LEADS ────────────────────────────────────────────────────────────────
  const leadData = [
    { firstName: 'Brandon', lastName: 'Meyer', email: 'brandon.m@gmail.com', mobile: '082 111 2233', interest: 'Life Insurance', status: 'Won', daysBack: 88 },
    { firstName: 'Nozipho', lastName: 'Majola', email: 'nozipho@gmail.com', mobile: '071 222 3344', interest: 'Car Insurance', status: 'Quoted', daysBack: 75 },
    { firstName: 'Gerrit', lastName: 'Venter', email: 'gerrit.v@outlook.com', mobile: '083 333 4455', interest: 'Home Contents', status: 'Contacted', daysBack: 60 },
    { firstName: 'Naledi', lastName: 'Phiri', email: 'naledi.p@gmail.com', mobile: '060 444 5566', interest: 'Life Insurance', status: 'Qualified', daysBack: 50 },
    { firstName: 'Jason', lastName: 'Williams', email: 'jason.w@gmail.com', mobile: '074 555 6677', interest: 'Disability Cover', status: 'Won', daysBack: 45 },
    { firstName: 'Bongiwe', lastName: 'Zwane', email: 'bongiwe.z@gmail.com', mobile: '061 666 7788', interest: 'Life Insurance', status: 'New', daysBack: 40 },
    { firstName: 'Henk', lastName: 'Louw', email: 'henk.louw@gmail.com', mobile: '082 777 8899', interest: 'Business Insurance', status: 'Contacted', daysBack: 35 },
    { firstName: 'Sibongile', lastName: 'Ntuli', email: 'sibongile.n@webmail.co.za', mobile: '073 888 9900', interest: 'Car Insurance', status: 'Quoted', daysBack: 28 },
    { firstName: 'Marco', lastName: 'Ferreira', email: 'marco.f@icloud.com', mobile: '064 999 0011', interest: 'Home Owners', status: 'Lost', daysBack: 22 },
    { firstName: 'Thandeka', lastName: 'Gumede', email: 'thandeka.g@gmail.com', mobile: '081 000 1122', interest: 'Life Insurance', status: 'Qualified', daysBack: 18 },
    { firstName: 'Ernst', lastName: 'Steyn', email: 'ernst.steyn@gmail.com', mobile: '082 112 2334', interest: 'Employee Benefits', status: 'New', daysBack: 12 },
    { firstName: 'Lindiwe', lastName: 'Hadebe', email: 'lindiwe.h@gmail.com', mobile: '071 223 3445', interest: 'Car Insurance', status: 'New', daysBack: 5 },
    { firstName: 'Nico', lastName: 'du Plessis', email: 'nico.dp@gmail.com', mobile: '083 334 4556', interest: 'Life Insurance', status: 'Contacted', daysBack: 3 },
    { firstName: 'Siphesihle', lastName: 'Mbatha', email: 'siphesihle.m@outlook.com', mobile: '060 445 5667', interest: 'Disability Cover', status: 'New', daysBack: 1 },
  ];

  for (const ld of leadData) {
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        firstName: ld.firstName,
        lastName: ld.lastName,
        email: ld.email,
        mobile: ld.mobile,
        interest: ld.interest,
        status: ld.status,
        createdAt: daysAgo(ld.daysBack),
        updatedAt: daysAgo(Math.floor(ld.daysBack / 2))
      }
    });
  }
  console.log(`  ✓ ${leadData.length} leads created`);

  // ─── POLICIES ─────────────────────────────────────────────────────────────
  type PolicySeed = { clientIdx: number; insurerName: string; policyNumber: string; type: string; premium: number; sumAssured: number; status: string; daysBack: number; };
  const policySeeds: PolicySeed[] = [
    { clientIdx: 0, insurerName: 'Discovery Life', policyNumber: 'DL-2024-001123', type: 'Life Cover', premium: 1850, sumAssured: 5000000, status: 'active', daysBack: 85 },
    { clientIdx: 0, insurerName: 'Santam', policyNumber: 'ST-2024-887654', type: 'Motor Vehicle', premium: 2340, sumAssured: 320000, status: 'active', daysBack: 85 },
    { clientIdx: 1, insurerName: 'Old Mutual', policyNumber: 'OM-2024-334455', type: 'Life Cover', premium: 1560, sumAssured: 3000000, status: 'active', daysBack: 80 },
    { clientIdx: 1, insurerName: 'Hollard', policyNumber: 'HL-2024-223344', type: 'Home Contents', premium: 890, sumAssured: 150000, status: 'active', daysBack: 80 },
    { clientIdx: 2, insurerName: 'Sanlam', policyNumber: 'SL-2024-556677', type: 'Life Cover', premium: 3200, sumAssured: 7500000, status: 'active', daysBack: 75 },
    { clientIdx: 2, insurerName: 'Santam', policyNumber: 'ST-2024-998877', type: 'Home Owners', premium: 1450, sumAssured: 2800000, status: 'active', daysBack: 75 },
    { clientIdx: 2, insurerName: 'Absa Insurance', policyNumber: 'AB-2024-112233', type: 'Motor Vehicle', premium: 3100, sumAssured: 650000, status: 'active', daysBack: 70 },
    { clientIdx: 3, insurerName: 'Momentum', policyNumber: 'MO-2024-445566', type: 'Life Cover', premium: 1200, sumAssured: 2000000, status: 'active', daysBack: 70 },
    { clientIdx: 4, insurerName: 'Discovery Life', policyNumber: 'DL-2024-778899', type: 'Disability Cover', premium: 920, sumAssured: 0, status: 'active', daysBack: 65 },
    { clientIdx: 4, insurerName: 'FNB Insurance', policyNumber: 'FN-2024-334455', type: 'Motor Vehicle', premium: 1680, sumAssured: 280000, status: 'active', daysBack: 65 },
    { clientIdx: 5, insurerName: 'Old Mutual', policyNumber: 'OM-2024-667788', type: 'Life Cover', premium: 2100, sumAssured: 4500000, status: 'active', daysBack: 60 },
    { clientIdx: 6, insurerName: 'Sanlam', policyNumber: 'SL-2024-889900', type: 'Retirement Annuity', premium: 3500, sumAssured: 0, status: 'active', daysBack: 55 },
    { clientIdx: 7, insurerName: 'Hollard', policyNumber: 'HL-2024-001122', type: 'Motor Vehicle', premium: 2200, sumAssured: 400000, status: 'active', daysBack: 50 },
    { clientIdx: 8, insurerName: 'Santam', policyNumber: 'ST-2025-223344', type: 'Home Contents', premium: 750, sumAssured: 120000, status: 'active', daysBack: 45 },
    { clientIdx: 8, insurerName: 'Discovery Life', policyNumber: 'DL-2025-445566', type: 'Life Cover', premium: 2800, sumAssured: 6000000, status: 'active', daysBack: 45 },
    { clientIdx: 9, insurerName: 'Momentum', policyNumber: 'MO-2025-667788', type: 'Life Cover', premium: 1400, sumAssured: 2500000, status: 'active', daysBack: 40 },
    { clientIdx: 10, insurerName: 'Old Mutual', policyNumber: 'OM-2025-889900', type: 'Motor Vehicle', premium: 1900, sumAssured: 350000, status: 'active', daysBack: 35 },
    { clientIdx: 11, insurerName: 'Alexander Forbes', policyNumber: 'AF-2025-001234', type: 'Group Life', premium: 2600, sumAssured: 5500000, status: 'active', daysBack: 30 },
    { clientIdx: 12, insurerName: 'Sanlam', policyNumber: 'SL-2025-234567', type: 'Life Cover', premium: 1100, sumAssured: 2000000, status: 'active', daysBack: 25 },
    { clientIdx: 13, insurerName: 'Santam', policyNumber: 'ST-2025-456789', type: 'Motor Vehicle', premium: 2750, sumAssured: 520000, status: 'active', daysBack: 20 },
    { clientIdx: 14, insurerName: 'Discovery Life', policyNumber: 'DL-2025-678901', type: 'Income Protection', premium: 1650, sumAssured: 0, status: 'active', daysBack: 18 },
    { clientIdx: 5, insurerName: 'Hollard', policyNumber: 'HL-2025-890123', type: 'Home Owners', premium: 1200, sumAssured: 1800000, status: 'lapsed', daysBack: 60 },
    { clientIdx: 3, insurerName: 'FNB Insurance', policyNumber: 'FN-2025-012345', type: 'Motor Vehicle', premium: 1950, sumAssured: 380000, status: 'active', daysBack: 15 },
    { clientIdx: 15, insurerName: 'Momentum', policyNumber: 'MO-2025-234567', type: 'Life Cover', premium: 980, sumAssured: 1500000, status: 'active', daysBack: 10 },
    { clientIdx: 16, insurerName: 'Standard Bank Insurance', policyNumber: 'SB-2025-345678', type: 'Motor Vehicle', premium: 2100, sumAssured: 420000, status: 'active', daysBack: 7 },
  ];

  const dbPolicies: any[] = [];
  for (const ps of policySeeds) {
    const insurer = insurers[ps.insurerName];
    if (!insurer || !dbClients[ps.clientIdx]) continue;
    const policy = await prisma.policy.create({
      data: {
        tenantId: tenant.id,
        clientId: dbClients[ps.clientIdx].id,
        insurerId: insurer.id,
        policyNumber: ps.policyNumber,
        type: ps.type,
        premium: ps.premium,
        sumAssured: ps.sumAssured,
        status: ps.status,
        inceptionDate: daysAgo(ps.daysBack),
        createdAt: daysAgo(ps.daysBack)
      }
    });
    dbPolicies.push(policy);
  }
  console.log(`  ✓ ${dbPolicies.length} policies created`);

  // ─── APPLICATIONS ─────────────────────────────────────────────────────────
  const appSeeds = [
    { clientIdx: 17, insurerName: 'Discovery Life', productType: 'Life Cover', premium: 1400, sumAssured: 3000000, status: 'inception', daysBack: 8 },
    { clientIdx: 18, insurerName: 'Santam', productType: 'Motor Vehicle', premium: 2200, sumAssured: 380000, status: 'client_deciding', daysBack: 12 },
    { clientIdx: 19, insurerName: 'Old Mutual', productType: 'Life Cover', premium: 850, sumAssured: 1500000, status: 'awaiting_quotes', daysBack: 5 },
    { clientIdx: 16, insurerName: 'Sanlam', productType: 'Disability Cover', premium: 1100, sumAssured: 0, status: 'comparing', daysBack: 6 },
    { clientIdx: 14, insurerName: 'Momentum', productType: 'Retirement Annuity', premium: 3000, sumAssured: 0, status: 'ready_to_quote', daysBack: 3 },
    { clientIdx: 13, insurerName: 'Hollard', productType: 'Home Contents', premium: 650, sumAssured: 90000, status: 'draft', daysBack: 1 },
    { clientIdx: 12, insurerName: 'Santam', productType: 'Motor Vehicle', premium: 1800, sumAssured: 310000, status: 'live', daysBack: 20 },
    { clientIdx: 11, insurerName: 'Alexander Forbes', productType: 'Employee Benefits', premium: 4500, sumAssured: 0, status: 'abandoned', daysBack: 25 },
  ];

  for (const as of appSeeds) {
    const insurer = insurers[as.insurerName];
    if (!insurer || !dbClients[as.clientIdx]) continue;
    await prisma.application.create({
      data: {
        tenantId: tenant.id,
        clientId: dbClients[as.clientIdx].id,
        insurerId: insurer.id,
        productType: as.productType,
        premium: as.premium,
        sumAssured: as.sumAssured,
        status: as.status,
        createdAt: daysAgo(as.daysBack)
      }
    });
  }
  console.log(`  ✓ ${appSeeds.length} applications created`);

  // ─── CLAIMS ───────────────────────────────────────────────────────────────
  const claimSeeds = [
    { clientIdx: 0, policyIdx: 1, type: 'Motor', status: 'settled', description: 'Rear-end collision on N1 highway. Third party admitted liability.', amount: 45000, daysBack: 70 },
    { clientIdx: 2, policyIdx: 5, type: 'Property', status: 'approved', description: 'Storm damage to roof tiles during severe weather event.', amount: 28500, daysBack: 55 },
    { clientIdx: 3, policyIdx: 7, type: 'Life', status: 'under_assessment', description: 'Critical illness claim – stage 3 cancer diagnosis.', amount: 1000000, daysBack: 30 },
    { clientIdx: 6, policyIdx: 11, type: 'Property', status: 'submitted', description: 'Burglary – laptop, jewellery and TV stolen.', amount: 35000, daysBack: 10 },
    { clientIdx: 7, policyIdx: 12, type: 'Motor', status: 'acknowledged', description: 'Hit a pothole causing rim and tyre damage on both left wheels.', amount: 8500, daysBack: 8 },
    { clientIdx: 9, policyIdx: 13, type: 'Property', status: 'rejected', description: 'Flood damage – policy exclusion for flood events applies.', amount: 120000, daysBack: 20 },
    { clientIdx: 10, policyIdx: 16, type: 'Motor', status: 'submitted', description: 'Hailstorm dents on bonnet and roof.', amount: 12000, daysBack: 3 },
    { clientIdx: 4, policyIdx: 8, type: 'Disability', status: 'under_assessment', description: 'Back injury following workplace accident – unable to work.', amount: 0, daysBack: 15 },
  ];

  for (const cs of claimSeeds) {
    const policy = dbPolicies[cs.policyIdx];
    if (!policy || !dbClients[cs.clientIdx]) continue;
    await prisma.claim.create({
      data: {
        tenantId: tenant.id,
        clientId: dbClients[cs.clientIdx].id,
        policyId: policy.id,
        reference: `CLM-${(10000 + Math.floor(Math.random() * 89999)).toString()}`,
        type: cs.type,
        status: cs.status,
        incidentDate: daysAgo(cs.daysBack + 5),
        description: cs.description,
        amount: cs.amount,
        createdAt: daysAgo(cs.daysBack)
      }
    });
  }
  console.log(`  ✓ ${claimSeeds.length} claims created`);

  // ─── TASKS ────────────────────────────────────────────────────────────────
  const taskData = [
    { title: 'Follow up: Lungelo Khumalo – Life policy renewal', priority: 'high', status: 'open', daysBack: 2 },
    { title: 'Send KYC reminder to Riaan Botha', priority: 'high', status: 'open', daysBack: 1 },
    { title: 'Review Johan van der Merwe home insurance schedule', priority: 'normal', status: 'open', daysBack: 3 },
    { title: 'Prepare ROA for Nomsa Zulu – Momentum Life', priority: 'high', status: 'open', daysBack: 1 },
    { title: 'Chase Santam for claim status: CLM-10234', priority: 'normal', status: 'open', daysBack: 5 },
    { title: 'Upload signed Discovery Life application – Lerato Sithole', priority: 'normal', status: 'open', daysBack: 2 },
    { title: 'Onboard new client: Sindisiwe Cele', priority: 'low', status: 'open', daysBack: 1 },
    { title: 'Monthly commission reconciliation – August 2026', priority: 'normal', status: 'completed', daysBack: 15 },
    { title: 'Review Gavin Smith high-risk profile assessment', priority: 'high', status: 'open', daysBack: 4 },
    { title: 'Call Priya Naidoo – policy upgrade discussion', priority: 'normal', status: 'completed', daysBack: 20 },
    { title: 'Submit Discovery Life claim: Ayanda Shabalala', priority: 'high', status: 'completed', daysBack: 25 },
    { title: 'Update contact details for Pieter du Toit', priority: 'low', status: 'completed', daysBack: 30 },
    { title: 'Send renewal notice: Fatima Patel – Car Insurance', priority: 'normal', status: 'open', daysBack: 3 },
    { title: 'Book FNA session with Nokuthula Mhlongo', priority: 'normal', status: 'open', daysBack: 1 },
    { title: 'Process debit order update: André Pretorius', priority: 'high', status: 'open', daysBack: 2 },
  ];

  for (const t of taskData) {
    await prisma.task.create({
      data: {
        tenantId: tenant.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        assigneeId: taskData.indexOf(t) % 2 === 0 ? adviser1.id : adviser2.id,
        createdAt: daysAgo(t.daysBack),
        updatedAt: daysAgo(Math.max(0, t.daysBack - 1))
      }
    });
  }
  console.log(`  ✓ ${taskData.length} tasks created`);

  // ─── GOALS ────────────────────────────────────────────────────────────────
  const goalData = [
    { clientIdx: 0, name: 'Emergency Fund', target: 150000, current: 98000, freq: 'MONTHLY', contrib: 5000, daysBack: 85 },
    { clientIdx: 0, name: 'Retirement at 60', target: 8000000, current: 1200000, freq: 'MONTHLY', contrib: 15000, daysBack: 85 },
    { clientIdx: 1, name: 'Children\'s Education', target: 500000, current: 187000, freq: 'MONTHLY', contrib: 3500, daysBack: 80 },
    { clientIdx: 2, name: 'Dream Holiday – Greece', target: 120000, current: 67500, freq: 'MONTHLY', contrib: 3000, daysBack: 75 },
    { clientIdx: 3, name: 'Home Deposit', target: 300000, current: 145000, freq: 'MONTHLY', contrib: 8000, daysBack: 70 },
    { clientIdx: 4, name: 'Retirement Fund', target: 5000000, current: 2800000, freq: 'MONTHLY', contrib: 12000, daysBack: 65 },
    { clientIdx: 5, name: 'Emergency Fund', target: 80000, current: 12000, freq: 'MONTHLY', contrib: 2000, daysBack: 60 },
    { clientIdx: 6, name: 'Business Capital', target: 250000, current: 190000, freq: 'MONTHLY', contrib: 10000, daysBack: 55 },
    { clientIdx: 8, name: 'New Car Fund', target: 450000, current: 89000, freq: 'MONTHLY', contrib: 7500, daysBack: 45 },
    { clientIdx: 12, name: 'Investment Portfolio', target: 1000000, current: 340000, freq: 'MONTHLY', contrib: 20000, daysBack: 25 },
  ];

  for (const g of goalData) {
    if (!dbClients[g.clientIdx]) continue;
    await prisma.goal.create({
      data: {
        clientId: dbClients[g.clientIdx].id,
        name: g.name,
        targetAmount: g.target,
        currentAmount: g.current,
        contributionAmount: g.contrib,
        contributionFrequency: g.freq,
        status: 'active',
        createdAt: daysAgo(g.daysBack)
      }
    });
  }
  console.log(`  ✓ ${goalData.length} goals created`);

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────
  // Generate 3 months of debit order payments for first 10 clients
  let paymentCount = 0;
  for (let i = 0; i < 10; i++) {
    const client = dbClients[i];
    const clientPolicies = dbPolicies.filter(p => p.clientId === client.id);
    for (let month = 1; month <= 3; month++) {
      for (const policy of clientPolicies) {
        await prisma.payment.create({
          data: {
            clientId: client.id,
            policyId: policy.id,
            amount: policy.premium,
            status: 'paid',
            method: 'debit_order',
            date: daysAgo(month * 30),
            description: `Premium: ${policy.type} – ${policy.policyNumber}`,
            createdAt: daysAgo(month * 30)
          }
        });
        paymentCount++;
      }
    }
  }
  // One failed payment
  if (dbClients[7] && dbPolicies[12]) {
    await prisma.payment.create({
      data: {
        clientId: dbClients[7].id,
        policyId: dbPolicies[12].id,
        amount: dbPolicies[12].premium,
        status: 'failed',
        method: 'debit_order',
        date: daysAgo(2),
        description: 'Debit order returned – insufficient funds'
      }
    });
    paymentCount++;
  }
  console.log(`  ✓ ${paymentCount} payments created`);

  // ─── REMINDERS ────────────────────────────────────────────────────────────
  const reminderData = [
    { clientIdx: 0, title: 'Discovery Life annual premium review', daysUntilDue: 7 },
    { clientIdx: 1, title: 'Home contents policy renewal', daysUntilDue: 14 },
    { clientIdx: 7, title: 'Debit order failure – please update banking details', daysUntilDue: 1 },
    { clientIdx: 4, title: 'Annual risk profile review due', daysUntilDue: 10 },
    { clientIdx: 8, title: 'Income protection policy schedule to be uploaded', daysUntilDue: 3 },
  ];
  for (const r of reminderData) {
    if (!dbClients[r.clientIdx]) continue;
    await prisma.reminder.create({
      data: {
        clientId: dbClients[r.clientIdx].id,
        title: r.title,
        dueDate: new Date(Date.now() + r.daysUntilDue * 86_400_000),
        status: 'pending'
      }
    });
  }
  console.log(`  ✓ ${reminderData.length} reminders created`);

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const client = dbClients[i];
    const docs = [
      { name: 'ID Document', type: 'identity', status: 'verified' },
      { name: 'Proof of Address', type: 'address', status: i < 5 ? 'verified' : 'pending' },
      { name: 'Policy Schedule – Motor', type: 'policy_schedule', status: 'verified' }
    ];
    for (const d of docs) {
      await prisma.document.create({
        data: { clientId: client.id, name: d.name, type: d.type, status: d.status, createdAt: daysAgo(Math.floor(Math.random() * 60) + 10) }
      });
    }
  }
  console.log('  ✓ Documents created');

  // ─── COMMISSIONS ──────────────────────────────────────────────────────────
  const months = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  const commAmounts = [38500, 42100, 39800, 51200, 47600, 45200];
  for (let i = 0; i < months.length; i++) {
    await prisma.commission.create({
      data: {
        tenantId: tenant.id,
        adviserId: adviser1.id,
        amount: commAmounts[i] * 0.6,
        type: 'new_business',
        status: 'paid',
        month: months[i],
        createdAt: daysAgo((months.length - i) * 30)
      }
    });
    await prisma.commission.create({
      data: {
        tenantId: tenant.id,
        adviserId: adviser2.id,
        amount: commAmounts[i] * 0.4,
        type: 'renewal',
        status: 'paid',
        month: months[i],
        createdAt: daysAgo((months.length - i) * 30)
      }
    });
  }
  console.log('  ✓ 12 commission entries created');

  // ─── TEMPLATES ────────────────────────────────────────────────────────────
  const templateData = [
    { name: 'Welcome Email', type: 'onboarding', channel: 'email', subject: 'Welcome to Royal Square Financial', body: 'Dear {{firstName}}, welcome to Royal Square Financial. Your adviser {{adviserName}} will be in touch shortly.' },
    { name: 'Policy Inception', type: 'policy', channel: 'email', subject: 'Your policy is now active', body: 'Dear {{firstName}}, your {{policyType}} policy ({{policyNumber}}) with {{provider}} is now active. Monthly premium: R{{premium}}.' },
    { name: 'Claim Acknowledgement', type: 'claims', channel: 'email', subject: 'Claim {{reference}} received', body: 'Dear {{firstName}}, your claim {{reference}} has been received and is being assessed. We will update you within 3 business days.' },
    { name: 'Debit Order Failure', type: 'payment', channel: 'sms', subject: '', body: 'Hi {{firstName}}, your R{{amount}} debit order for policy {{policyNumber}} was unsuccessful. Please call us on 010 123 4567 to update your details.' },
    { name: 'Annual Review Reminder', type: 'reminder', channel: 'email', subject: 'Time for your annual policy review', body: 'Dear {{firstName}}, it\'s time for your annual financial review. Please contact {{adviserName}} to schedule your review appointment.' },
    { name: 'KYC Required', type: 'compliance', channel: 'email', subject: 'Document verification required', body: 'Dear {{firstName}}, we need to verify your identity to comply with FICA regulations. Please upload your ID document and proof of address.' },
  ];
  for (const t of templateData) {
    await prisma.template.create({ data: { ...t, format: 'communication', isGlobal: true, createdAt: daysAgo(60) } });
  }

  // Document (PDF) templates — merge client data into a branded layout.
  const documentTemplates = [
    {
      name: 'Quote Request', type: 'onboarding', company: 'Santam',
      subject: 'Quote Request — {{ client.fullName }}',
      body: `<p>Dear {{ adviser.name }},</p>
<p>Please prepare a quotation for the following client of {{ broker.name }}:</p>
<table>
  <tr><th>Full name</th><td>{{ client.fullName }}</td></tr>
  <tr><th>ID number</th><td>{{ client.idNumber }}</td></tr>
  <tr><th>Mobile</th><td>{{ client.mobile }}</td></tr>
  <tr><th>Email</th><td>{{ client.email }}</td></tr>
  <tr><th>Risk profile</th><td>{{ client.riskProfile }}</td></tr>
</table>
<h3>Existing cover</h3>
<table>
  <tr><th>Policy no.</th><th>Type</th><th>Premium</th><th>Insurer</th></tr>
  {{#each policies}}<tr><td>{{ this.policyNumber }}</td><td>{{ this.type }}</td><td>{{ this.premium }}</td><td>{{ this.insurer }}</td></tr>{{/each}}
</table>
<p>Kindly respond with your best terms. Prepared on {{ date.today }}.</p>`,
    },
    {
      name: 'Welcome Letter', type: 'onboarding', company: '',
      subject: 'Welcome to {{ broker.name }}',
      body: `<p>Dear {{ client.firstName }},</p>
<p>Welcome to {{ broker.name }}. We are delighted to have you on board.</p>
<p>Your dedicated adviser is <strong>{{ adviser.name }}</strong>, who will guide you through your financial journey and is available for any questions about your cover.</p>
<p>You can view your policies, documents and claims at any time through your client portal.</p>
<p>Warm regards,<br/>{{ adviser.name }}<br/>{{ broker.name }}</p>`,
    },
    {
      name: 'Border Letter', type: 'policy', company: 'Santam',
      subject: 'Border Letter — {{ client.fullName }}',
      body: `<p><strong>TO WHOM IT MAY CONCERN</strong></p>
<p>This letter confirms that the vehicle(s) belonging to <strong>{{ client.fullName }}</strong> (ID {{ client.idNumber }}) are insured under the following policy with {{ company }}:</p>
<table>
  <tr><th>Policy no.</th><th>Type</th><th>Insurer</th></tr>
  <tr><td>{{ policy.policyNumber }}</td><td>{{ policy.type }}</td><td>{{ policy.insurer }}</td></tr>
</table>
<p>The cover is valid for travel across Southern African Development Community (SADC) borders. This letter is issued on {{ date.today }} at the request of the insured.</p>
<p>Issued by {{ broker.name }}.</p>`,
    },
    {
      name: 'Document Checklist', type: 'compliance', company: '',
      subject: 'FICA Document Checklist — {{ client.fullName }}',
      body: `<p>Dear {{ client.firstName }},</p>
<p>To complete your onboarding and comply with FICA, please provide the following documents:</p>
<ul>
  <li>Certified copy of your ID or passport</li>
  <li>Proof of residential address (not older than 3 months)</li>
  <li>Proof of income / latest payslip</li>
  <li>Bank statement showing account details</li>
  <li>SARS tax number confirmation</li>
</ul>
<p>Your current KYC status is: <strong>{{ client.kycStatus }}</strong>.</p>
<p>Please return these to your adviser, {{ adviser.name }}. Requested on {{ date.today }}.</p>`,
    },
  ];
  for (const t of documentTemplates) {
    await prisma.template.create({ data: { ...t, format: 'document', channel: 'document', company: t.company || null, isGlobal: true, createdAt: daysAgo(60) } });
  }
  console.log(`  ✓ ${templateData.length} message + ${documentTemplates.length} document templates created`);

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { tenantId: tenant.id, title: 'New claim submitted', body: 'Lungelo Khumalo submitted a motor vehicle claim for R45,000', channel: 'in_app', status: 'unread', createdAt: daysAgo(3) },
      { tenantId: tenant.id, title: 'KYC verification complete', body: 'Thabo Motsepe\'s identity has been verified successfully', channel: 'in_app', status: 'read', createdAt: daysAgo(5) },
      { tenantId: tenant.id, title: 'Policy lapsed', body: 'Ayanda Shabalala\'s Hollard Home Owners policy has lapsed', channel: 'in_app', status: 'unread', createdAt: daysAgo(2) },
      { tenantId: tenant.id, title: 'Debit order failed', body: 'Riaan Botha\'s debit order of R2,200 was returned', channel: 'in_app', status: 'unread', createdAt: daysAgo(1) },
      { tenantId: tenant.id, title: 'New application ready to quote', body: 'Nompumelelo Dube application is ready for insurer quoting', channel: 'in_app', status: 'unread', createdAt: daysAgo(1) },
    ]
  });
  console.log('  ✓ Notifications created');

  // ─── AUDIT EVENTS ─────────────────────────────────────────────────────────
  const auditEvents = [
    { actorId: admin.id, actorRole: 'ADMIN', action: 'CREATE_CLIENT', resource: 'clients', description: 'Created client Lungelo Khumalo', daysBack: 90 },
    { actorId: adviser1.id, actorRole: 'ADVISER', action: 'CREATE_POLICY', resource: 'policies', description: 'Incepted Discovery Life policy DL-2024-001123', daysBack: 85 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'UPDATE_KYC_STATUS', resource: 'clients', description: 'KYC verified for Priya Naidoo', daysBack: 80 },
    { actorId: adviser2.id, actorRole: 'ADVISER', action: 'CREATE_LEAD', resource: 'leads', description: 'Created lead Nozipho Majola – Car Insurance', daysBack: 75 },
    { actorId: adviser1.id, actorRole: 'ADVISER', action: 'SUBMIT_CLAIM', resource: 'claims', description: 'Motor claim submitted for Johan van der Merwe', daysBack: 70 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'UPDATE_CLAIM_STATUS', resource: 'claims', description: 'Claim settled: R45,000 paid', daysBack: 65 },
    { actorId: superAdmin.id, actorRole: 'SUPER_ADMIN', action: 'CREATE_INSURER', resource: 'insurers', description: 'Added Alexander Forbes to platform', daysBack: 60 },
    { actorId: adviser2.id, actorRole: 'ADVISER', action: 'CREATE_APPLICATION', resource: 'applications', description: 'New application for Nomsa Zulu – Momentum Life Cover', daysBack: 55 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'CREATE_USER', resource: 'users', description: 'Created adviser user Ntombifikile Mthembu', daysBack: 50 },
    { actorId: adviser1.id, actorRole: 'ADVISER', action: 'UPDATE_LEAD_STATUS', resource: 'leads', description: 'Lead Jason Williams moved to Won', daysBack: 45 },
    { actorId: superAdmin.id, actorRole: 'SUPER_ADMIN', action: 'UPDATE_TENANT', resource: 'tenants', description: 'Upgraded tenant plan to professional', daysBack: 40 },
    { actorId: adviser2.id, actorRole: 'ADVISER', action: 'UPDATE_APPLICATION_STATUS', resource: 'applications', description: 'Application moved to inception stage', daysBack: 35 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'CREATE_CLIENT', resource: 'clients', description: 'Created client Lerato Sithole', daysBack: 25 },
    { actorId: adviser1.id, actorRole: 'ADVISER', action: 'CREATE_TASK', resource: 'tasks', description: 'Task created: Follow up Lungelo Khumalo renewal', daysBack: 15 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'UPDATE_CLAIM_STATUS', resource: 'claims', description: 'Johan van der Merwe claim under assessment', daysBack: 10 },
    { actorId: superAdmin.id, actorRole: 'SUPER_ADMIN', action: 'DEACTIVATE_USER', resource: 'users', description: 'Deactivated legacy user account', daysBack: 7 },
    { actorId: adviser2.id, actorRole: 'ADVISER', action: 'SUBMIT_CLAIM', resource: 'claims', description: 'Burglary claim submitted for Fatima Patel', daysBack: 5 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'UPDATE_KYC_STATUS', resource: 'clients', description: 'KYC set to in_review for Lerato Sithole', daysBack: 3 },
    { actorId: adviser1.id, actorRole: 'ADVISER', action: 'CREATE_LEAD', resource: 'leads', description: 'New lead: Siphesihle Mbatha – Disability Cover', daysBack: 1 },
    { actorId: admin.id, actorRole: 'ADMIN', action: 'CREATE_TASK', resource: 'tasks', description: 'Task: process debit order update André Pretorius', daysBack: 1 },
  ];

  for (const ae of auditEvents) {
    await prisma.auditEvent.create({
      data: {
        actorId: ae.actorId,
        actorRole: ae.actorRole,
        tenantId: tenant.id,
        action: ae.action,
        resource: ae.resource,
        description: ae.description,
        createdAt: daysAgo(ae.daysBack)
      }
    });
  }
  console.log(`  ✓ ${auditEvents.length} audit events created`);

  // ─── SYSTEM CONFIG ────────────────────────────────────────────────────────
  const configEntries = [
    { key: 'email_provider', value: 'sendgrid' },
    { key: 'sms_provider', value: 'twilio' },
    { key: 'ai_provider', value: 'openai' },
    { key: 'storage_provider', value: 'cloudflare_r2' },
    { key: 'payment_gateway', value: 'ozow' },
    { key: 'default_currency', value: 'ZAR' },
    { key: 'platform_name', value: 'Royal Square Financial' },
    { key: 'support_email', value: 'support@royalsquare.co.za' },
  ];
  for (const c of configEntries) {
    await prisma.systemConfig.upsert({ where: { key: c.key }, update: {}, create: c });
  }
  console.log('  ✓ System config entries created');

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Super Admin : super@royalsquare.co.za / Admin@12345');
  console.log('  Admin       : admin@royalsquare.co.za / Admin@12345');
  console.log('  Adviser     : sipho@royalsquare.co.za / Admin@12345');
  console.log('  Adviser     : ntombi@royalsquare.co.za / Admin@12345');
  console.log('  Partner     : partner@santam.co.za / Admin@12345');
  console.log('  Client      : lungelo@gmail.com / Client@1234');
  console.log('  Client      : priya.naidoo@outlook.com / Client@1234');
  console.log('\n  All clients use password: Client@1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
