import { mockUsers } from './users';

// TypeScript Interfaces for Admin module
export interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Apple Pay' | 'Google Pay';
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
}

export interface Transaction {
  id: string;
  paymentId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Apple Pay' | 'Google Pay';
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  type: 'Capture' | 'Authorize' | 'Refund' | 'Payout';
  reference: string;
  date: string;
  responseCode: string;
  riskScore: number;
}

export interface FraudCase {
  id: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  ipAddress: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  riskScore: number;
  status: 'Flagged' | 'Approved' | 'Rejected' | 'Blocked';
  date: string;
}

export interface WebhookLog {
  id: string;
  endpoint: string;
  status: 'Success' | 'Failed';
  responseCode: number;
  retries: number;
  timestamp: string;
  payload: string;
}

export interface IdempotencyKey {
  key: string;
  requestHash: string;
  status: 'Processing' | 'Stored';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
}

export interface KafkaEvent {
  id: string;
  eventName: 'PaymentCreatedEvent' | 'PaymentProcessedEvent' | 'FraudAlertEvent' | 'WebhookDispatchEvent';
  status: 'Success' | 'Failed' | 'Pending';
  timestamp: string;
  topic: string;
  consumer: string;
  payload: string;
}

// Programmatic Generator Helper Lists
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'enterprise.com', 'cloudsolutions.io', 'techcorp.net'];
const methods: ('Credit Card' | 'Bank Transfer' | 'PayPal' | 'Apple Pay' | 'Google Pay')[] = ['Credit Card', 'Bank Transfer', 'PayPal', 'Apple Pay', 'Google Pay'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
const ipPrefixes = ['192.168.1.', '10.0.0.', '172.16.0.', '64.233.160.', '204.79.197.'];

// Deterministic generator using index offset seeds
const getDeterministicRandom = (index: number, range: number) => {
  const x = Math.sin(index + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * range);
};

// ==================================================================
// GENERATE 200 PAYMENTS
// ==================================================================
export const generatePayments = (): Payment[] => {
  const payments: Payment[] = [];
  const statuses: ('Success' | 'Pending' | 'Failed' | 'Refunded')[] = ['Success', 'Success', 'Success', 'Pending', 'Failed', 'Refunded'];
  
  for (let i = 1; i <= 200; i++) {
    const fn = firstNames[getDeterministicRandom(i * 12, firstNames.length)];
    const ln = lastNames[getDeterministicRandom(i * 23, lastNames.length)];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domains[getDeterministicRandom(i * 34, domains.length)]}`;
    const amount = Number((getDeterministicRandom(i * 45, 9900) / 10 + 10).toFixed(2));
    const currency = currencies[getDeterministicRandom(i * 56, currencies.length)];
    const method = methods[getDeterministicRandom(i * 67, methods.length)];
    
    // Distribute status
    let status = statuses[getDeterministicRandom(i * 78, statuses.length)];
    // Make sure we have enough failures and refunds
    if (i % 15 === 0) status = 'Failed';
    if (i % 25 === 0) status = 'Refunded';
    if (i % 35 === 0) status = 'Pending';

    // Generates date from past 30 days
    const dateOffsetHours = getDeterministicRandom(i * 89, 720);
    const date = new Date(Date.now() - dateOffsetHours * 60 * 60 * 1000).toISOString();

    payments.push({
      id: `PAY-${String(i).padStart(3, '0')}`,
      customerName: name,
      customerEmail: email,
      amount,
      currency,
      method,
      status,
      date,
    });
  }
  
  return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// ==================================================================
// GENERATE 500 TRANSACTIONS
// ==================================================================
export const generateTransactions = (payments: Payment[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: ('Capture' | 'Authorize' | 'Refund' | 'Payout')[] = ['Capture', 'Capture', 'Authorize', 'Refund', 'Payout'];
  const resCodes = ['00', '00', '00', '00', '51', '91', '12', '05']; // 00=Success, 51=Insufficient Funds, 91=Issuer Down, 12=Invalid Txn, 05=Do Not Honor

  for (let i = 1; i <= 500; i++) {
    // Pick associated payment from 200 payments
    const associatedPayment = payments[getDeterministicRandom(i * 15, payments.length)];
    const id = `TXN-${String(i).padStart(3, '0')}`;
    
    const type = types[getDeterministicRandom(i * 22, types.length)];
    
    // Status maps close to payment status but with variation
    let status = associatedPayment.status;
    if (type === 'Refund') status = 'Refunded';
    if (type === 'Payout') status = 'Success';
    if (i % 18 === 0) status = 'Failed';

    const responseCode = status === 'Success' || status === 'Refunded' ? '00' : resCodes[getDeterministicRandom(i * 29, resCodes.length)];
    const riskScore = getDeterministicRandom(i * 36, 100);

    const dateOffsetMinutes = getDeterministicRandom(i * 47, 43200); // 30 days range
    const date = new Date(Date.now() - dateOffsetMinutes * 60 * 1000).toISOString();

    transactions.push({
      id,
      paymentId: associatedPayment.id,
      customerEmail: associatedPayment.customerEmail,
      amount: associatedPayment.amount,
      currency: associatedPayment.currency,
      method: associatedPayment.method,
      status,
      type,
      reference: `ref_${Math.floor(100000 + getDeterministicRandom(i * 58, 900000))}`,
      date,
      responseCode,
      riskScore,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// ==================================================================
// GENERATE 30 FRAUD CASES
// ==================================================================
export const generateFraudCases = (transactions: Transaction[], payments: Payment[]): FraudCase[] => {
  const fraudCases: FraudCase[] = [];
  const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Mobile', 'Tablet'];
  const statuses: ('Flagged' | 'Approved' | 'Rejected' | 'Blocked')[] = ['Flagged', 'Approved', 'Rejected', 'Blocked'];

  // Select high risk score transactions to map
  const highRiskTxns = transactions.filter(t => t.riskScore > 65).slice(0, 30);
  
  // Fill up if we don't have 30
  const count = Math.min(highRiskTxns.length, 30);
  
  for (let i = 0; i < 30; i++) {
    const txn = highRiskTxns[i % count] || transactions[i];
    const associatedPayment = payments.find(p => p.id === txn.paymentId) || payments[0];
    
    const id = `FRD-${String(i + 1).padStart(3, '0')}`;
    const ipAddress = `${ipPrefixes[getDeterministicRandom(i * 12, ipPrefixes.length)]}${getDeterministicRandom(i * 24, 254)}`;
    const device = devices[getDeterministicRandom(i * 36, devices.length)];
    const status = statuses[getDeterministicRandom(i * 48, statuses.length)];
    const riskScore = 70 + getDeterministicRandom(i * 54, 29); // 70 to 98

    fraudCases.push({
      id,
      transactionId: txn.id,
      customerName: associatedPayment.customerName,
      customerEmail: txn.customerEmail,
      amount: txn.amount,
      ipAddress,
      device,
      riskScore,
      status,
      date: txn.date,
    });
  }

  return fraudCases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// ==================================================================
// GENERATE 100 WEBHOOK LOGS
// ==================================================================
export const generateWebhookLogs = (): WebhookLog[] => {
  const logs: WebhookLog[] = [];
  const endpoints = [
    'https://api.merchant-shop.com/v1/webhook',
    'https://checkout.enterprise-retail.org/payments/notify',
    'https://fintech-services.io/api/callbacks/aegis',
    'https://payments.digitalgoods.co/wh/receiver'
  ];
  
  const responseCodes = [200, 200, 200, 200, 201, 400, 500, 502, 503];

  for (let i = 1; i <= 100; i++) {
    const id = `WH-${String(i).padStart(3, '0')}`;
    const endpoint = endpoints[getDeterministicRandom(i * 18, endpoints.length)];
    const code = responseCodes[getDeterministicRandom(i * 24, responseCodes.length)];
    const status = code === 200 || code === 201 ? 'Success' : 'Failed';
    const retries = status === 'Success' ? 0 : getDeterministicRandom(i * 31, 4); // 0 to 3 retries

    const minutesOffset = getDeterministicRandom(i * 39, 43200);
    const timestamp = new Date(Date.now() - minutesOffset * 60 * 1000).toISOString();

    const payload = JSON.stringify({
      event: i % 2 === 0 ? 'payment.processed' : 'payment.created',
      data: {
        id: `PAY-${String(100 + i).padStart(3, '0')}`,
        amount: Number((5 + getDeterministicRandom(i * 42, 500)).toFixed(2)),
        currency: 'USD',
        status: status === 'Success' ? 'Success' : 'Failed',
        processed_at: timestamp
      },
      attempt: retries + 1,
      gateway: 'aegis-payment-engine-v2'
    }, null, 2);

    logs.push({
      id,
      endpoint,
      status,
      responseCode: code,
      retries,
      timestamp,
      payload
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ==================================================================
// GENERATE 50 IDEMPOTENCY KEYS
// ==================================================================
export const generateIdempotencyKeys = (): IdempotencyKey[] => {
  const keys: IdempotencyKey[] = [];
  const statuses: ('Processing' | 'Stored')[] = ['Stored', 'Stored', 'Stored', 'Processing'];

  for (let i = 1; i <= 50; i++) {
    const key = `idem-key-${Math.floor(10000000 + getDeterministicRandom(i * 12, 90000000))}`;
    
    // Generate simulated SHA-256 hash
    let hash = '';
    const chars = 'abcdef0123456789';
    for (let j = 0; j < 32; j++) {
      hash += chars[getDeterministicRandom(i * 13 + j, chars.length)];
    }

    const status = statuses[getDeterministicRandom(i * 19, statuses.length)];
    const offsetHours = getDeterministicRandom(i * 27, 48);
    const createdAt = new Date(Date.now() - offsetHours * 60 * 60 * 1000).toISOString();

    keys.push({
      key,
      requestHash: hash,
      status,
      createdAt
    });
  }

  return keys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ==================================================================
// GENERATE 150 AUDIT LOGS
// ==================================================================
export const generateAuditLogs = (): AuditLog[] => {
  const logs: AuditLog[] = [];
  const adminUsers = mockUsers.filter(u => u.role === 'Admin').map(u => u.name);
  const actions = [
    { action: 'Deactivated User Account', module: 'User Management' },
    { action: 'Changed Role Permissions', module: 'User Management' },
    { action: 'Initiated Manual Refund', module: 'Payment Management' },
    { action: 'Re-routed Transaction Route', module: 'Payment Management' },
    { action: 'Approved High Risk Transaction', module: 'Fraud Center' },
    { action: 'Blocked Card Country Origin', module: 'Fraud Center' },
    { action: 'Manually Dispatched Webhook Callback', module: 'Webhook Monitor' },
    { action: 'Purged Dead Webhook Queues', module: 'Webhook Monitor' },
    { action: 'Refreshed Idempotency Storage Cache', module: 'Idempotency Desk' },
    { action: 'Generated Automated Finance Summary API', module: 'AI Insights' },
    { action: 'Updated System Security Firewall Configuration', module: 'System Settings' },
    { action: 'Re-generated Webhook Shared Sign Key', module: 'System Settings' }
  ];

  for (let i = 1; i <= 150; i++) {
    const admin = adminUsers[getDeterministicRandom(i * 14, adminUsers.length)] || 'Sarah Connor';
    const actionObj = actions[getDeterministicRandom(i * 22, actions.length)];
    
    const id = `AUD-${String(i).padStart(3, '0')}`;
    const ipAddress = `${ipPrefixes[getDeterministicRandom(i * 31, ipPrefixes.length)]}${getDeterministicRandom(i * 35, 254)}`;
    
    const offsetMinutes = getDeterministicRandom(i * 44, 43200); // 30 days
    const timestamp = new Date(Date.now() - offsetMinutes * 60 * 1000).toISOString();

    logs.push({
      id,
      user: admin,
      action: actionObj.action,
      module: actionObj.module,
      timestamp,
      ipAddress
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ==================================================================
// GENERATE STATIC HISTORIC KAFKA EVENTS (50 EVENTS)
// ==================================================================
export const generateKafkaEvents = (): KafkaEvent[] => {
  const events: KafkaEvent[] = [];
  const eventTypes: ('PaymentCreatedEvent' | 'PaymentProcessedEvent' | 'FraudAlertEvent' | 'WebhookDispatchEvent')[] = [
    'PaymentCreatedEvent',
    'PaymentProcessedEvent',
    'FraudAlertEvent',
    'WebhookDispatchEvent'
  ];
  
  const topics = {
    PaymentCreatedEvent: 'payment-events-created',
    PaymentProcessedEvent: 'payment-events-processed',
    FraudAlertEvent: 'fraud-alert-events',
    WebhookDispatchEvent: 'webhook-dispatcher-logs'
  };

  const consumers = {
    PaymentCreatedEvent: 'payment-processor-consumer',
    PaymentProcessedEvent: 'ledger-update-consumer',
    FraudAlertEvent: 'fraud-detection-engine',
    WebhookDispatchEvent: 'webhook-sender-service'
  };

  for (let i = 1; i <= 50; i++) {
    const eventName = eventTypes[getDeterministicRandom(i * 12, eventTypes.length)];
    const status = i % 15 === 0 ? 'Failed' : i % 25 === 0 ? 'Pending' : 'Success';
    const offsetMinutes = getDeterministicRandom(i * 33, 1440); // past 24 hours
    const timestamp = new Date(Date.now() - offsetMinutes * 60 * 1000).toISOString();

    events.push({
      id: `evt-${Math.floor(100000 + getDeterministicRandom(i * 44, 900000))}`,
      eventName,
      status,
      timestamp,
      topic: topics[eventName],
      consumer: consumers[eventName],
      payload: JSON.stringify({
        eventId: `evt-payload-${i}`,
        traceId: `trace-key-${10000 + i}`,
        timestamp,
        eventName,
        status,
        data: {
          paymentId: `PAY-${String(100 + i).padStart(3, '0')}`,
          gatewayChannel: 'stripe-fallback-api'
        }
      }, null, 2)
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ==================================================================
// BOOTSTRAP DATASOURCE
// ==================================================================
export const mockPayments = generatePayments();
export const mockTransactions = generateTransactions(mockPayments);
export const mockFraudCases = generateFraudCases(mockTransactions, mockPayments);
export const mockWebhookLogs = generateWebhookLogs();
export const mockIdempotencyKeys = generateIdempotencyKeys();
export const mockAuditLogs = generateAuditLogs();
export const mockKafkaEvents = generateKafkaEvents();
