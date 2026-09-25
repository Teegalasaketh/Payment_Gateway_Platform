import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Clock, ArrowRight, HelpCircle } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const payment = location.state?.payment || {
    id: 'PAY-892403',
    amount: 720.00,
    currency: 'USD',
    method: 'Bank Transfer'
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-colors relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[-20%] left-[-20%] h-[50%] w-[50%] rounded-full bg-amber-500/10 blur-[100px]"></div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <Clock className="h-9 w-9 animate-pulse" />
        </div>
        
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Verification Pending
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          The payment request is currently undergoing manual operational audit check.
        </p>

        {/* Pending Card */}
        <div className="my-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/50 text-left space-y-3">
          <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-2 dark:border-slate-800/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Authorized Value</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {payment.currency === 'USD' ? '$' : '€'}{Number(payment.amount).toFixed(2)}
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            We are awaiting acquiring networks confirmation. Usually, processing bank wires takes between 2 to 24 hours. A callback notification will be dispatched to your endpoint.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/user/dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover shadow"
          >
            Portal Dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/user/activity"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Activity Logs
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
export default PaymentPending;
