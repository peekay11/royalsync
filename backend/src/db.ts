import fs from 'node:fs';
import path from 'node:path';

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
}

export const db: Database = {
  users: [],
  clients: [],
  leads: [],
  policies: [],
  claims: [],
  tasks: []
};

const dataPath = path.join(process.cwd(), 'data', 'db.json');

if (fs.existsSync(dataPath)) {
  Object.assign(db, JSON.parse(fs.readFileSync(dataPath, 'utf8')));
}

export const saveDb = () => {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  const temporaryPath = `${dataPath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(db, null, 2));
  fs.renameSync(temporaryPath, dataPath);
};
