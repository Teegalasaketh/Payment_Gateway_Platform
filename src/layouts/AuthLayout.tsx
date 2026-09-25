import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ShieldCheck, Cpu, RefreshCw, Lock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Theme toggle button in top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5 text-slate-600" /> : <Sun className="h-5 w-5 text-amber-400" />}
      </button>

      {/* Left side: Form content */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[45%] lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              AegisPay
            </span>
          </div>

          {/* Form wrapper */}
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right side: Decorative Promo Graphic (visible on lg screens) */}
      <div className="hidden lg:relative lg:flex lg:w-[55%] items-center justify-center overflow-hidden bg-slate-900 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
        {/* Glow effects */}
        <div className="absolute top-[-20%] left-[-20%] h-[70%] w-[70%] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] h-[70%] w-[70%] rounded-full bg-emerald-500/10 blur-[120px]"></div>

        <div className="relative z-10 max-w-lg px-8 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Next-Gen Payment Infrastructure for <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Global Enterprises</span>
          </h2>
          <p className="mt-4 text-base text-slate-400">
            AegisPay provides developers and finance operations with resilient, low-latency transaction processing, automated routing, and built-in fraud prevention.
          </p>

          {/* Features cards */}
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
                <Cpu className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-white">Smart Routing</h4>
              <p className="mt-1.5 text-xs text-slate-400">Dynamically routes payments to optimize processing success rates.</p>
            </div>
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-white">Advanced Fraud Guard</h4>
              <p className="mt-1.5 text-xs text-slate-400">AI-driven fraud analytics check transactions before dispatch.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-white">Idempotent Pipeline</h4>
              <p className="mt-1.5 text-xs text-slate-400">Guarantee absolute consistency without duplicated collections.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-semibold text-white">PCI-DSS Level 1</h4>
              <p className="mt-1.5 text-xs text-slate-400">Enterprise security safeguards for sensitive customer data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
