import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { paymentService, type CheckoutPayload } from '../../services/payment.service';
import {
  CreditCard,
  Smartphone,
  Wallet as WalletIcon,
  Globe,
  Building,
  Coins,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Zod schemas for validation
const cardSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string(),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),
  cardHolder: z.string().min(3, 'Cardholder name is too short'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry date must be MM/YY'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV must be exactly 3 digits'),
});

const upiSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string(),
  upiVpa: z.string().includes('@', { message: 'UPI ID must contain @ symbol' }),
});

const walletSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string(),
  walletNumber: z.string().min(10, 'Enter a valid mobile or wallet reference number'),
});

const cryptoSchema = z.object({
  amount: z.number().min(0.0001, 'Amount must be greater than 0'),
  currency: z.string(),
  cryptoWallet: z.string().min(26, 'Crypto wallet address is too short'),
});

const bankSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string(),
  bankAccount: z.string().min(8, 'Bank account number is too short'),
});

type MethodType = 'Credit Card' | 'Debit Card' | 'UPI' | 'Wallet' | 'Net Banking' | 'Bank Transfer' | 'Crypto';

export const MakePayment: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<MethodType>('Credit Card');
  const [amount, setAmount] = useState<string>('25.00');
  const [currency, setCurrency] = useState<string>('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Input Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [walletProvider, setWalletProvider] = useState('PayPal');
  const [bankProvider, setBankProvider] = useState('Chase Bank');
  const [cryptoToken, setCryptoToken] = useState('USDC');

  const handleMethodChange = (m: MethodType) => {
    setMethod(m);
    setValidationErrors({});
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const numericAmount = parseFloat(amount);
    const commonFields = { amount: numericAmount, currency };

    // Validation using Zod
    try {
      if (method === 'Credit Card' || method === 'Debit Card') {
        cardSchema.parse({
          ...commonFields,
          cardNumber,
          cardHolder,
          expiry,
          cvv,
        });
      } else if (method === 'UPI') {
        upiSchema.parse({
          ...commonFields,
          upiVpa,
        });
      } else if (method === 'Wallet') {
        walletSchema.parse({
          ...commonFields,
          walletNumber,
        });
      } else if (method === 'Crypto') {
        cryptoSchema.parse({
          ...commonFields,
          cryptoWallet,
        });
      } else if (method === 'Net Banking' || method === 'Bank Transfer') {
        bankSchema.parse({
          ...commonFields,
          bankAccount,
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setValidationErrors(errors);
        toast.error('Validation failed. Please correct form fields.');
        return;
      }
    }

    setIsProcessing(true);
    toast.info('Authorizing charge request through network servers...');

    const payload: CheckoutPayload = {
      amount: numericAmount,
      currency,
      method,
      cardNumber: cardNumber || undefined,
      cardHolder: cardHolder || undefined,
      expiry: expiry || undefined,
      cvv: cvv || undefined,
      upiVpa: upiVpa || undefined,
      walletNumber: walletNumber || undefined,
      bankAccount: bankAccount || undefined,
      cryptoWallet: cryptoWallet || undefined
    };

    try {
      await paymentService.createPayment(payload);

      const generatedId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const completedPayment = {
        id: generatedId,
        amount: numericAmount,
        currency,
        method,
        customerName: cardHolder || upiVpa || walletProvider || 'Aegis Merchant',
        date: new Date().toISOString()
      };

      // Determine outcome screen path
      if (method === 'Credit Card' && cvv === '999') {
        navigate('/payment/failed', {
          state: {
            error: 'Authorization Failure: Fraud velocity shield triggered due to CVV blacklisting rules.',
            payment: completedPayment
          }
        });
      } else if (method === 'Credit Card' && numericAmount > 50000) {
        navigate('/payment/failed', {
          state: {
            error: 'Decline [51]: Insufficient funds matching transactions constraints limits.',
            payment: completedPayment
          }
        });
      } else if (method === 'Bank Transfer') {
        navigate('/payment/pending', {
          state: { payment: completedPayment }
        });
      } else {
        navigate('/payment/success', {
          state: { payment: completedPayment }
        });
      }

    } catch (error) {
      navigate('/payment/failed', {
        state: { error: 'Acquirer endpoint timeout. Connection was lost.' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checkout Terminal</h1>
        <p className="mt-1 text-xs text-slate-500">
          Initiate standard simulated payments using one of the gateway options below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Methods Selection buttons list */}
        <div className="lg:col-span-1 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Instrument</h3>
          <div className="flex flex-col gap-2">
            {[
              { id: 'Credit Card', name: 'Credit Card', icon: CreditCard },
              { id: 'Debit Card', name: 'Debit Card', icon: CreditCard },
              { id: 'UPI', name: 'UPI VPA Address', icon: Smartphone },
              { id: 'Wallet', name: 'Mobile Wallet', icon: WalletIcon },
              { id: 'Net Banking', name: 'Net Banking Account', icon: Globe },
              { id: 'Bank Transfer', name: 'Direct Bank Wire', icon: Building },
              { id: 'Crypto', name: 'Cryptocurrency Wallet', icon: Coins }
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMethodChange(m.id as MethodType)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold border transition-all text-left ${
                    method === m.id
                      ? 'bg-primary text-white border-primary shadow'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment input form console */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold border-b border-slate-100 pb-2 dark:border-slate-800 flex items-center gap-1.5">
              <span>Checkout Details</span>
              <span className="text-[10px] text-slate-400 font-semibold italic">({method})</span>
            </h3>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Charge Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                />
                {validationErrors.amount && (
                  <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.amount}</span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Settlement Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Card Fields */}
            {(method === 'Credit Card' || method === 'Debit Card') && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Card Number (16 Digits)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="4111222233334444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                  />
                  {validationErrors.cardNumber && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.cardNumber}</span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cardholder Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  />
                  {validationErrors.cardHolder && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.cardHolder}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="12/28"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                    />
                    {validationErrors.expiry && (
                      <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.expiry}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">CVV Code</label>
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                    />
                    {validationErrors.cvv && (
                      <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.cvv}</span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start gap-1.5 text-[10px] text-slate-400 leading-normal">
                  <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sandbox testing triggers:</span> Enter CVV <strong>999</strong> to simulate fraud rule blocks, or charge amount &gt; <strong>50000</strong> to trigger standard insufficient funds.
                  </div>
                </div>
              </div>
            )}

            {/* UPI Fields */}
            {method === 'UPI' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">UPI ID / VPA Address</label>
                <input
                  type="text"
                  placeholder="name@upi"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                />
                {validationErrors.upiVpa && (
                  <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.upiVpa}</span>
                )}
              </div>
            )}

            {/* Wallet Fields */}
            {method === 'Wallet' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Wallet Provider</label>
                  <select
                    value={walletProvider}
                    onChange={(e) => setWalletProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Venmo">Venmo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Registered Wallet Account / Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +14155552671"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  />
                  {validationErrors.walletNumber && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.walletNumber}</span>
                  )}
                </div>
              </div>
            )}

            {/* Net Banking */}
            {method === 'Net Banking' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Bank Institution</label>
                  <select
                    value={bankProvider}
                    onChange={(e) => setBankProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  >
                    <option value="Chase Bank">Chase Bank</option>
                    <option value="Bank of America">Bank of America</option>
                    <option value="Wells Fargo">Wells Fargo</option>
                    <option value="HSBC Bank">HSBC Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Institutional Routing Account Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1009873420"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                  />
                  {validationErrors.bankAccount && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.bankAccount}</span>
                  )}
                </div>
              </div>
            )}

            {/* Bank Transfer direct */}
            {method === 'Bank Transfer' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Acquirer Wire Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. wire-892401824"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                  />
                  {validationErrors.bankAccount && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.bankAccount}</span>
                  )}
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start gap-1.5 text-[10px] text-slate-400 leading-normal">
                  <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    Bank Transfer settlements are processed asynchronously. Submitting will direct to the <strong>Pending Verification Screen</strong> while awaiting wire authorization.
                  </div>
                </div>
              </div>
            )}

            {/* Crypto */}
            {method === 'Crypto' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asset token</label>
                  <select
                    value={cryptoToken}
                    onChange={(e) => setCryptoToken(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  >
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Settlement Destination Wallet Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-mono focus:outline-none"
                  />
                  {validationErrors.cryptoWallet && (
                    <span className="text-[10px] text-danger font-semibold mt-1 block">{validationErrors.cryptoWallet}</span>
                  )}
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white hover:bg-primary-hover shadow transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting with Acquirer network...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Process Settle Authorization
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
export default MakePayment;
