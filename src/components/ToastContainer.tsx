import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
              case 'error':
                return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
              case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
              default:
                return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
            }
          };

          const getBgBorder = () => {
            switch (toast.type) {
              case 'success':
                return 'bg-emerald-50/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10';
              case 'error':
                return 'bg-rose-50/95 border-rose-200 text-rose-950 shadow-rose-500/10';
              case 'warning':
                return 'bg-amber-50/95 border-amber-200 text-amber-950 shadow-amber-500/10';
              default:
                return 'bg-blue-50/95 border-blue-200 text-blue-950 shadow-blue-500/10';
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${getBgBorder()}`}
            >
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
                <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-neutral-500 hover:text-neutral-800 p-0.5 rounded transition-colors"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
