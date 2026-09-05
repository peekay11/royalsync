export const db = {
  users: Array.from({ length: 50 }).map((_, i) => ({
    id: `usr_${i}`,
    email: `user${i}@example.com`,
    role: i < 5 ? 'SUPER_ADMIN' : i < 15 ? 'ADVISER' : 'CLIENT'
  })),
  clients: Array.from({ length: 250 }).map((_, i) => ({
    id: `cli_${i}`,
    firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'][i % 6],
    lastName: ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 6],
    kycStatus: i % 3 === 0 ? 'pending' : 'verified',
    mobile: `082 123 ${1000 + i}`,
    riskProfile: ['Low', 'Medium', 'High'][i % 3]
  })),
  leads: Array.from({ length: 100 }).map((_, i) => ({
    id: `ld_${i}`,
    name: `Lead ${i}`,
    status: ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'][i % 6],
    interest: ['Motor', 'Life', 'Home', 'Business'][i % 4],
    source: 'Website'
  })),
  policies: Array.from({ length: 500 }).map((_, i) => ({
    id: `pol_${i}`,
    client_id: `cli_${i % 250}`,
    policyNumber: `POL-${2020 + (i % 6)}-${10000 + i}`,
    provider: ['Santam', 'Old Mutual', 'Discovery', 'Hollard'][i % 4],
    providerDomain: ['santam.co.za', 'oldmutual.co.za', 'discovery.co.za', 'hollard.co.za'][i % 4],
    status: i % 10 === 0 ? 'lapsed' : 'active',
    premium: 500 + (i * 10),
    type: ['Motor', 'Life', 'Home', 'Business'][i % 4]
  })),
  claims: Array.from({ length: 150 }).map((_, i) => ({
    id: `clm_${i}`,
    reference: `CLM-${1000 + i}`,
    incidentDate: `2026-0${1 + (i % 8)}-15`,
    status: ['submitted', 'under_assessment', 'approved', 'settled', 'closed'][i % 5],
    amount: 5000 + (i * 100)
  })),
  tasks: Array.from({ length: 80 }).map((_, i) => ({
    id: `tsk_${i}`,
    title: `Follow up on task ${i}`,
    priority: i % 4 === 0 ? 'high' : 'normal',
    status: i % 2 === 0 ? 'open' : 'completed'
  }))
};
