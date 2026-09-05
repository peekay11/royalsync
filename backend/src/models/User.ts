export interface User {
  id: string;
  name: string;
  email: string;
}

// In-memory array for demonstration
export const users: User[] = [
  { id: '1', name: 'Admin', email: 'admin@example.com' }
];
