import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Printer, Copy, Home } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const payment = location.state?.payment || {
    id: 'PAY-892401',
    amount: 125.00,
    currency: 'USD',
    method: 'Credit Card',
    customerName: 'Guest Checkout',
    date: new Date().toISOString()
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.id);
    toast.success('Payment ID copied to clipboard.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-colors relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-20%] left-[-20%] h-[50%] w-[50%] rounded-full bg-emerald-500/10 blur-[100px]"></div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-9 w-9 animate-bounce" />
        </div>
        
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settle Success!
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Aegis transaction processing pipeline approved the charge.
        </p>

        {/* Amount Display */}
        <div className="my-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50">
          <div className="text-2xl font-extrabold tracking-tight">
            {payment.currency === 'USD' ? '$' : '€'}{Number(payment.amount).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Charged via {payment.method}</span>
        </div>

        {/* Metadata Details */}
        <div className="space-y-3.5 text-xs text-left border-b border-slate-100 pb-5 mb-5 dark:border-slate-800">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 font-medium">Gateway ID</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 dark:text-slate-200">
              <span>{payment.id}</span>
              <button onClick={handleCopy} className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Cardholder Name</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{payment.customerName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Settled Timestamp</span>
            <span className="font-semibold text-slate-400">{new Date(payment.date).toLocaleString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover shadow-lg shadow-primary/10"
          >
            Go to Merchant Portal
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <Link
              to="/user/payments"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              Pay Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentSuccess;
