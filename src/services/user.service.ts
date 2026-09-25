import { mockClient } from './api';

export const userService = {
  updateProfile: async (name: string, email: string, avatarUrl?: string) => {
    return mockClient.put('/users/profile', { name, email, avatarUrl });
  },

  changePassword: async (email: string, passwordKey: string) => {
    return mockClient.post('/users/change-password', { email, password: passwordKey });
  },

  getUsers: async () => {
    return mockClient.get<any[]>('/users/list');
  },

  toggleSuspend: async (userId: string | number, status: string) => {
    return mockClient.post(`/users/${userId}/suspend`, { status });
  },

  deleteUser: async (userId: string | number) => {
    return mockClient.delete(`/users/${userId}`);
  },

  getSessions: async () => {
    return mockClient.get<any[]>('/users/sessions');
  },

  terminateSession: async (sessionId: string) => {
    return mockClient.delete(`/users/sessions/${sessionId}`);
  },

  createSupportTicket: async (subject: string, message: string) => {
    return mockClient.post('/merchants/support/tickets', { subject, message });
  },

  getSupportTickets: async () => {
    return mockClient.get<any[]>('/merchants/support/tickets');
  },
};
export default userService;
