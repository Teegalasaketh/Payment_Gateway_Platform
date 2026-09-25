import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          </div>
          <div className="mt-4 h-8 w-36 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex border-b border-slate-200 p-4 dark:border-slate-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800 mx-2"></div>
        ))}
      </div>
      <div className="p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex p-4 border-b border-slate-100 last:border-b-0 dark:border-slate-800/50">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-800 mx-2"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>
      <div className="mt-6 flex h-64 items-end gap-4 px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const heights = ['h-24', 'h-36', 'h-48', 'h-16', 'h-52', 'h-32', 'h-40', 'h-28', 'h-56', 'h-20', 'h-44', 'h-36'];
          return (
            <div key={i} className={`flex-1 rounded-t bg-slate-200 dark:bg-slate-800 ${heights[i % heights.length]}`}></div>
          );
        })}
      </div>
    </div>
  );
};
