import React from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useZeroTrust();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'error' ? <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" /> :
          toast.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" /> :
          toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> :
          <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        const borderClass =
          toast.type === 'error' ? 'border-rose-900/60 bg-slate-900/95' :
          toast.type === 'warning' ? 'border-amber-900/60 bg-slate-900/95' :
          toast.type === 'success' ? 'border-emerald-900/60 bg-slate-900/95' :
          'border-blue-900/60 bg-slate-900/95';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border ${borderClass} shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-100 tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
