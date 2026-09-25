import { mockClient } from './api';

export const authService = {
  login: async (email: string, roleSelection: 'Admin' | 'User', password?: string) => {
    return mockClient.post<{ email: string; otpSent: boolean }>('/auth/login', { email, roleSelection, password });
  },

  register: async (email: string, name: string, role: 'Admin' | 'User', password?: string) => {
    return mockClient.post('/auth/register', { email, name, role, password });
  },

  verifyOtp: async (email: string, code: string): Promise<any> => {
    return mockClient.post<{ token: string; user: any }>('/auth/verify-otp', { email, code });
  },

  forgotPassword: async (email: string) => {
    return mockClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (email: string, newPassword: string) => {
    return mockClient.post('/auth/reset-password', { email, resetKey: 'dummy-reset-key', newPassword });
  },
};
export default authService;
