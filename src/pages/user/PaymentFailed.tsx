import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCw, AlertOctagon, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const details = location.state?.error || 'Acquirer bank authorization decline';
  const payment = location.state?.payment || {
    amount: 125.00,
    currency: 'USD'
  };

  const handleRetry = () => {
    toast.info('Redirecting to checkout console...');
    navigate('/user/payments');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-colors relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-20%] left-[-20%] h-[50%] w-[50%] rounded-full bg-red-500/10 blur-[100px]"></div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <XCircle className="h-9 w-9 animate-pulse" />
        </div>
        
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settle Declined
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          The transaction request was rejected by the acquiring gateway.
        </p>

        {/* Failed Details Card */}
        <div className="my-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 text-left space-y-3">
          <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-2 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Attempt Value</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {payment.currency === 'USD' ? '$' : '€'}{Number(payment.amount).toFixed(2)}
            </span>
          </div>

          <div className="flex items-start gap-2 text-xs">
            <AlertOctagon className="h-4.5 w-4.5 text-danger shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200 block">Decline Reason:</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                {details}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover shadow"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Transaction
          </button>
          
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/user/dashboard"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Portal Home
            </Link>
            <Link
              to="/user/support"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentFailed;
