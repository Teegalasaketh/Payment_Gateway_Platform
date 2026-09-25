import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Shield, User, Loader2, ArrowRight, Check, X } from 'lucide-react';

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
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

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: 'None', color: 'bg-slate-200' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score, label: 'Weak', color: 'bg-red-500' };
    }
  };

  const strength = checkPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await registerAuth(data.email, data.name, role, data.password);
      if (response.success) {
        toast.success('Registration code sent to your email.');
        navigate('/verify-otp', { state: { email: data.email, role, type: 'register' } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Request access to the payment gateway environment.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mt-6">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select Account Role
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('User')}
            className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
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
            className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
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

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            {...register('name')}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.name
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. name@enterprise.com"
            {...register('email')}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Security Password
          </label>
          <input
            type="password"
            placeholder="Min. 8 characters"
            {...register('password')}
            onChange={(e) => {
              register('password').onChange(e);
              setPasswordValue(e.target.value);
            }}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.password
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-primary'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Strength:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] text-white ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                ></div>
              </div>
              
              {/* Requirements validation list */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  {passwordValue.length >= 8 ? (
                    <Check className="h-3 w-3 text-success shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-danger shrink-0" />
                  )}
                  8+ characters
                </div>
                <div className="flex items-center gap-1.5">
                  {/[A-Z]/.test(passwordValue) ? (
                    <Check className="h-3 w-3 text-success shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-danger shrink-0" />
                  )}
                  Uppercase letter
                </div>
                <div className="flex items-center gap-1.5">
                  {/[0-9]/.test(passwordValue) ? (
                    <Check className="h-3 w-3 text-success shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-danger shrink-0" />
                  )}
                  Number
                </div>
                <div className="flex items-center gap-1.5">
                  {/[^A-Za-z0-9]/.test(passwordValue) ? (
                    <Check className="h-3 w-3 text-success shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-danger shrink-0" />
                  )}
                  Special character
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm security password"
            {...register('confirmPassword')}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-primary-hover shadow-lg shadow-primary/10 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Submit Request
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Already have a credential?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-hover hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
