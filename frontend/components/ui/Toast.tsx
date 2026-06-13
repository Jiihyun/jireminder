'use client';

import { useToastStore } from '@/store/toastStore';

const TYPE_STYLES = {
  error: { bg: '#ff3b30', icon: '✕' },
  success: { bg: '#34c759', icon: '✓' },
  info: { bg: '#007aff', icon: 'ℹ' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const style = TYPE_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm
              pointer-events-auto animate-slide-down"
            style={{ backgroundColor: style.bg, minWidth: '220px', maxWidth: '360px' }}
          >
            <span className="text-base">{style.icon}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity text-xs"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
