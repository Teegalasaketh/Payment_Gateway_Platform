import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatSegment = (str: string) => {
    return str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 dark:text-white truncate max-w-[120px] sm:max-w-none">
                {formatSegment(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-slate-800 dark:hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {formatSegment(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
