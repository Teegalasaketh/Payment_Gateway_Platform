import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Shield, User, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: zod.boolean().optional(),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await login(data.email, role, !!data.rememberMe, data.password);
      if (response.success) {
        toast.success('Verification code sent to your email.');
        // Navigate to OTP verification page, passing the email and role
        navigate('/verify-otp', { state: { email: data.email, role, type: 'login' } });
      } else {
        setApiError(response.error || 'Login failed.');
        toast.error(response.error || 'Login failed.');
      }
    } catch (error: any) {
      const errMsg = error.message || 'An unexpected error occurred.';
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} integration is visual-only in this demo.`);
  };

  return (
    <div>
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to access your gateway console.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mt-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Console Access Role
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('User')}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === 'User'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" />
            Merchant User
          </button>
          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === 'Admin'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            Gateway Admin
          </button>
        </div>
      </div>

      {apiError && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-red-800 dark:text-red-300">
            {apiError}
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="Enter security password"
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20"
            />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Remember this browser</span>
          </label>
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
              Sign In to Console
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Social login divider */}
      <div className="relative my-6 flex items-center justify-center">
        <hr className="w-full border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Or Continue With
        </span>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSocialLogin('Google')}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Workspace
        </button>
        <button
          onClick={() => handleSocialLogin('GitHub')}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub Organization
        </button>
      </div>

      {/* Register Link */}
      <p className="mt-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Don't have an enterprise account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline">
          Request Access
        </Link>
      </p>

      {/* Helper credentials alert */}
      <div className="mt-6 rounded-xl bg-blue-50/50 p-4 border border-blue-200/50 dark:bg-blue-950/10 dark:border-blue-900/20 text-left">
        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400">Demo Logins (OTP is 123456):</h4>
        <div className="mt-1.5 space-y-1 text-[11px] text-blue-700/80 dark:text-blue-400/80 font-mono">
          <div>Admin: admin@enterprise.com (Role: Admin)</div>
          <div>User: user@enterprise.com (Role: User)</div>
        </div>
      </div>
    </div>
  );
};
