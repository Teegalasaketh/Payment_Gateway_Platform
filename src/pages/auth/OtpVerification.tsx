import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Key, ArrowLeft, RefreshCw } from 'lucide-react';

const otpSchema = zod.object({
  code: zod
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain digits only'),
});

type OtpFormValues = zod.infer<typeof otpSchema>;

export const OtpVerification: React.FC = () => {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<any>(null);

  const email = location.state?.email || '';
  const type = location.state?.type || 'login'; // 'login' | 'register' | 'reset'

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please sign in again.');
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: OtpFormValues) => {
    setIsSubmitting(true);
    try {
      if (type === 'reset') {
        // Just simulate verification and navigate to Reset Password page
        if (data.code !== '123456' && data.code !== '000000') {
          throw new Error('Invalid OTP verification code. Enter 123456 to bypass.');
        }
        toast.success('Identity verified.');
        navigate('/reset-password', { state: { email } });
      } else {
        // Complete login or register verify step
        const response = await verifyOtp(email, data.code);
        if (response.success) {
          toast.success(`Welcome back, ${response.user.name}!`);
          if (response.user.role === 'Admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/user/dashboard', { replace: true });
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    toast.success('A new verification code has been dispatched to your email.');
  };

  // Helper to instantly fill bypass code
  const handleBypassClick = () => {
    setValue('code', '123456');
    toast.info('Bypass code filled. Press Verify to proceed.');
  };

  return (
    <div>
      <div className="text-left">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verify Identity
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Enter the 2FA verification code dispatched to <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Verification Code (6 Digits)
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 123456"
              {...register('code')}
              className={`w-full tracking-[0.5em] text-center text-lg font-bold rounded-xl border px-4 py-3 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                errors.code
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
              }`}
            />
          </div>
          {errors.code && (
            <p className="mt-1 text-xs text-red-500 font-medium text-left">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-primary-hover shadow-lg shadow-primary/10 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Verify & Complete
              <Key className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend actions */}
      <div className="mt-6 text-center text-xs font-semibold text-slate-400">
        Didn't receive the code?{' '}
        {countdown > 0 ? (
          <span className="text-slate-500">Resend code in {countdown}s</span>
        ) : (
          <button
            onClick={handleResend}
            className="inline-flex items-center gap-1 text-primary hover:underline hover:text-primary-hover font-bold transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            Resend OTP
          </button>
        )}
      </div>

      {/* Bypass Helper Button */}
      <div className="mt-8 rounded-xl bg-amber-50/50 p-4 border border-amber-200/50 dark:bg-amber-950/10 dark:border-amber-900/20 text-left">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
          Demo Hint:
        </h4>
        <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
          Use the code <code className="font-bold bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">123456</code> to bypass simulated OTP verification.
        </p>
        <button
          type="button"
          onClick={handleBypassClick}
          className="mt-2.5 inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700 transition-colors duration-150"
        >
          Auto-fill Bypass Code
        </button>
      </div>
    </div>
  );
};
