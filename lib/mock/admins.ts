// Prototype mock data, copied from the Claude Design project's lib/mock-data*.js.
import type { Admin } from '@/lib/types';

export const ADMINS: Admin[] = [
  { id: 'a1', name: 'John Doe', email: 'johndoe@thechoicesapp.com', role: 'super' },
  { id: 'a2', name: 'Ahmad Karimi', email: 'ahmad@thechoicesapp.com', role: 'super' },
  { id: 'a3', name: 'Sara Al Mansoori', email: 'sara@thechoicesapp.com', role: 'admin' },
  { id: 'a4', name: 'Rami Haddad', email: 'rami@thechoicesapp.com', role: 'moderator' },
  { id: 'a5', name: 'Noura Khalifa', email: 'noura@thechoicesapp.com', role: 'moderator' },
];
