import React from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';

export const Error500: React.FC = () => {

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <ServerCrash className="h-7 w-7" />
        </div>
        
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          500 Server Error
        </h1>
        
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The payment gateway server encountered an internal failure and was unable to complete your instruction.
        </p>

        <button
          onClick={handleRetry}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover shadow"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </button>
      </div>
    </div>
  );
};
