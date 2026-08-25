import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle2 size={18} color="#34d399" />}
          {t.type === 'error' && <AlertTriangle size={18} color="#f43f5e" />}
          {t.type === 'info' && <Info size={18} color="#60a5fa" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
