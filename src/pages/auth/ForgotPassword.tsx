import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

const forgotPasswordSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = zod.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await forgotPassword(data.email);
      toast.success('Security OTP code sent to your email.');
      // Navigate to OTP verification page, passing the email and reset flow indicator
      navigate('/verify-otp', { state: { email: data.email, type: 'reset' } });
    } catch (error: any) {
      toast.error(error.message || 'Error executing request.');
    } finally {
      setIsSubmitting(false);
    }
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
          Forgot Password?
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your email. We'll send a 6-digit OTP code to verify identity.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Registered Email
          </label>
          <input
            type="email"
            placeholder="e.g. name@enterprise.com"
            {...register('email')}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
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
              Send Code
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
