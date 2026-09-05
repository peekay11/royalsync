export interface UserRecord {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ADVISER' | 'CLIENT' | 'PARTNER';
  clientId?: string;
  idNumber?: string;
  passwordHash: string;
}

export interface ClientRecord {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  kycStatus: string;
  riskProfile: string;
}

export interface Database {
  users: UserRecord[];
  clients: ClientRecord[];
  leads: Array<Record<string, unknown>>;
  policies: Array<Record<string, unknown>>;
  claims: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  goals: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  applications: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  auditLog: Array<Record<string, unknown>>;
  tenants: Array<Record<string, unknown>>;
  insurers: Array<Record<string, unknown>>;
  templates: Array<Record<string, unknown>>;
  integrations: Array<Record<string, unknown>>;
  settings: Array<Record<string, unknown>>;
  kyc: Array<Record<string, unknown>>;
}

export const db: Database = {
  users: [],
  clients: [],
  leads: [],
  policies: [],
  claims: [],
  tasks: [],
  goals: [],
  documents: [],
  payments: [],
  applications: [],
  notifications: [],
  auditLog: [],
  tenants: [],
  insurers: [],
  templates: [],
  integrations: [],
  settings: [],
  kyc: []
};

export const saveDb = () => undefined;
