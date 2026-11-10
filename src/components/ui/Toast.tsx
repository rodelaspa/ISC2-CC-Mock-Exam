/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.durationMs ?? 4000;
    if (duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  };

  const borders = {
    info: 'border-blue-500/40 bg-blue-50/95 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100',
    success: 'border-emerald-500/40 bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100',
    warning: 'border-amber-500/40 bg-amber-50/95 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100',
    error: 'border-rose-500/40 bg-rose-50/95 dark:bg-rose-950/80 text-rose-950 dark:text-rose-100',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss notification"
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus-ring"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
