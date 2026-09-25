export type UserRole = 'Admin' | 'User';

export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export type PaymentStatus = 'Success' | 'Pending' | 'Failed' | 'Refunded';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Apple Pay' | 'Google Pay';
  customerEmail: string;
  date: string;
  reference: string;
}
