import React from 'react';
import { AlertTriangle, Info, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const headerColors = {
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
    warning: 'text-warning bg-amber-50 dark:bg-amber-950/30 dark:text-warning',
    danger: 'text-danger bg-red-50 dark:bg-red-950/30 dark:text-danger',
  };

  const confirmButtonColors = {
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20',
    warning: 'bg-warning hover:bg-amber-600 focus:ring-warning/20',
    danger: 'bg-danger hover:bg-red-600 focus:ring-danger/20',
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Click outside to dismiss */}
      <div onClick={onCancel} className="absolute inset-0"></div>

      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up text-left">
        <div className="flex gap-4">
          <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${headerColors[type]}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center gap-1 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-4 ${confirmButtonColors[type]}`}
          >
            <Check className="h-3.5 w-3.5" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
