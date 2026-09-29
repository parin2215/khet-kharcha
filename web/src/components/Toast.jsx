import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    error: 'bg-red-50 border-red-100 text-red-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
    info: 'bg-blue-50 border-blue-100 text-blue-800'
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = Icons[type] || Icons.info;

  return (
    <div className="fixed bottom-6 right-6 z-55 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-in slide-in-from-bottom duration-300 bg-white/95 backdrop-blur">
      <div className={`p-1.5 rounded-lg border ${styles[type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      
      <p className="text-xs font-semibold text-stone-700 flex-1">{message}</p>
      
      <button 
        onClick={onClose}
        className="p-0.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
