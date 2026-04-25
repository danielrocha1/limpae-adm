import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-xl border bg-card shadow-2xl duration-200 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-slate-950 p-6 text-white dark:bg-white/[0.04]">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={onClose}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <X className="w-5 h-5" />
            Fechar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t bg-slate-50 p-6 dark:bg-white/[0.03]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
