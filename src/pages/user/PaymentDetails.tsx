import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type Payment } from '../../mock/adminData';
import { paymentService } from '../../services/payment.service';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  User,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export const PaymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await paymentService.getPaymentDetails(id);
        setPayment(response.data);
      } catch (err) {
        console.error('Failed to load payment details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Construct generic timeline steps
  const steps = useMemo(() => {
    if (!payment) return [];
    const isSuccess = payment.status === 'Success';
    const isFailed = payment.status === 'Failed';

    const baseDate = new Date(payment.date);
    
    return [
      {
        title: 'Transaction Initiated',
        desc: 'Request received from client API wrapper.',
        time: new Date(baseDate.getTime() - 400).toLocaleTimeString(),
        status: 'done'
      },
      {
        title: 'Security Analysis',
        desc: 'Aegis Sentinel scanned IP & idempotency hashes. Anomaly level safe.',
        time: new Date(baseDate.getTime() - 300).toLocaleTimeString(),
        status: 'done'
      },
      {
        title: 'Acquirer Authorization',
        desc: `Routed charge request through merchant processor routing.`,
        time: new Date(baseDate.getTime() - 100).toLocaleTimeString(),
        status: 'done'
      },
      {
        title: isSuccess ? 'Settle Completed' : isFailed ? 'Settle Declined' : 'Audit Pending',
        desc: isSuccess
          ? 'Transaction approved by bank. Funds routed to ledger balance.'
          : isFailed
          ? 'Transaction declined by issuer. Authorization voided.'
          : 'Awaiting network confirmation stream clearance.',
        time: baseDate.toLocaleTimeString(),
        status: isSuccess ? 'done' : isFailed ? 'failed' : 'pending'
      }
    ];
  }, [payment]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-2 text-xs font-semibold text-slate-400">Loading payment details...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-400">Payment record not found.</p>
        <button onClick={() => navigate('/user/activity')} className="mt-4 text-xs font-bold text-primary hover:underline">
          Back to Activity Log
        </button>
      </div>
    );
  }



  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header bar back action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/user/activity')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Inspect Settlement</h1>
          <p className="text-[10px] text-slate-400 font-semibold font-mono">ID: {payment.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side details cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gross Authorized value</span>
                <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-800 dark:text-slate-100">
                  {payment.currency === 'USD' ? '$' : '€'}{payment.amount.toFixed(2)}
                </h2>
              </div>

              <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                payment.status === 'Success'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : payment.status === 'Failed'
                  ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                  : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400'
              }`}>
                {payment.status === 'Success' ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : payment.status === 'Failed' ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {payment.status}
              </span>
            </div>

            {/* Properties grid details */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Client Customer</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{payment.customerName}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{payment.customerEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Settlement Channel</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{payment.method}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Date Timestamp</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {new Date(payment.date).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Authorization Status</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                    {payment.status === 'Success' ? 'Settled Complete' : payment.status === 'Failed' ? 'Decline Voider' : 'Pending Operations Check'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference properties lists */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-4">
            <h3 className="text-sm font-bold border-b border-slate-100 pb-2 dark:border-slate-800">
              API metadata details
            </h3>
            
            <div className="space-y-3 text-xs leading-normal font-medium">
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 shrink-0">Client trace ID</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">trace-key-891240890124890</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 shrink-0">Idempotency SHA256 checksum</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate">sha256:71c7656ec7ab88b098defb751b7401b5f6d8976f...</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-400 shrink-0">API version payload</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">v2.0-Production-Gateway</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right side timeline stepper */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Activity className="h-4.5 w-4.5 text-primary" />
              <span>Orchestration timeline</span>
            </h3>

            <div className="relative border-l border-slate-200 pl-4 ml-2 dark:border-slate-800 space-y-6 text-xs text-left">
              {steps.map((step, idx) => {
                const isFailed = step.status === 'failed';
                const isPending = step.status === 'pending';
                
                return (
                  <div key={idx} className="relative">
                    {/* Circle icon marker */}
                    <span className={`absolute top-0.5 left-[-21px] flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${
                      isFailed
                        ? 'bg-red-500'
                        : isPending
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}></span>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{step.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{step.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PaymentDetails;
