import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';

const resetPasswordSchema = zod.object({
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: zod.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = zod.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error('Invalid session. Please restart forgot password flow.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await resetPassword(email, data.password);
      if (response.success) {
        toast.success('Password successfully reset. Please log in with your new credentials.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create a strong, unique security password for <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            placeholder="Min. 8 characters"
            {...register('password')}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.password
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            {...register('confirmPassword')}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.confirmPassword
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
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
              Reset Password
              <KeyRound className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
