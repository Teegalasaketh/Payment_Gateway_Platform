import { mockClient } from './api';

export interface CheckoutPayload {
  amount: number;
  currency: string;
  method: 'Credit Card' | 'Debit Card' | 'UPI' | 'Wallet' | 'Net Banking' | 'Bank Transfer' | 'Crypto';
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  upiVpa?: string;
  walletNumber?: string;
  bankAccount?: string;
  cryptoWallet?: string;
}

export const formatPaymentMethod = (method: string): any => {
  if (!method) return '';
  const m = method.toUpperCase();
  if (m === 'CREDIT_CARD') return 'Credit Card';
  if (m === 'DEBIT_CARD') return 'Debit Card';
  if (m === 'NET_BANKING') return 'Net Banking';
  if (m === 'BANK_TRANSFER') return 'Bank Transfer';
  if (m === 'CRYPTO') return 'Crypto';
  if (m === 'WALLET') return 'Wallet';
  if (m === 'UPI') return 'UPI';
  return method;
};

export const paymentService = {
  createPayment: async (payload: CheckoutPayload) => {
    return mockClient.post<any>('/payments/create', payload);
  },

  refundPayment: async (paymentId: string) => {
    const res = await mockClient.post<any>(`/payments/${paymentId}/refund`, {});
    if (res.data) {
      res.data.method = formatPaymentMethod(res.data.method);
    }
    return res;
  },

  retryPayment: async (paymentId: string) => {
    const res = await mockClient.post<any>(`/payments/${paymentId}/retry`, {});
    if (res.data) {
      res.data.method = formatPaymentMethod(res.data.method);
    }
    return res;
  },

  getPaymentDetails: async (paymentId: string) => {
    const res = await mockClient.get<any>(`/payments/${paymentId}`);
    if (res.data) {
      res.data.method = formatPaymentMethod(res.data.method);
    }
    return res;
  },

  getPayments: async () => {
    const res = await mockClient.get<any[]>('/payments/list');
    if (res.data) {
      res.data = res.data.map(p => ({
        ...p,
        method: formatPaymentMethod(p.method)
      }));
    }
    return res;
  },

  getTransactions: async () => {
    const res = await mockClient.get<any[]>('/transactions/list');
    if (res.data) {
      res.data = res.data.map(t => ({
        ...t,
        method: formatPaymentMethod(t.method || 'Credit Card'),
        status: t.status === 'Success' ? 'Success' : t.status === 'Failed' ? 'Failed' : 'Pending'
      }));
    }
    return res;
  },

  getFraudCases: async () => {
    return mockClient.get<any[]>('/fraud/list');
  },

  updateFraudStatus: async (caseId: string, status: string) => {
    return mockClient.post<any>(`/fraud/${caseId}/action`, { status });
  },

  getWebhooks: async () => {
    return mockClient.get<any[]>('/webhooks/list');
  },

  retryWebhook: async (logId: string) => {
    return mockClient.post<any>(`/webhooks/${logId}/retry`, {});
  },

  getIdempotencyKeys: async () => {
    return mockClient.get<any[]>('/idempotency/list');
  },

  getAuditLogs: async () => {
    return mockClient.get<any[]>('/audit-logs/list');
  },

  getAiChatResponse: async (message: string) => {
    return mockClient.post<{ reply: string }>('/ai/chat', { message });
  },

  getAiReport: async () => {
    return mockClient.get<{ report: string }>('/ai/report');
  },
};
export default paymentService;
