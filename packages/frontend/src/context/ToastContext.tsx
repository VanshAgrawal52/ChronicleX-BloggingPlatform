import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const ToastContext = createContext<{
  showToast: (msg: string, type?: Toast['type'], durationMs?: number) => void;
} | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const showToast = useCallback((message: string, type: Toast['type'] = 'info', durationMs = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, type, message }]);
    // auto-dismiss
    const timer = setTimeout(() => {
      setToasts(ts => ts.filter(t => t.id !== id));
    }, durationMs);
    // best effort: won't leak in practice due to short duration
  }, []);
  const remove = (id: number) => setToasts(ts => ts.filter(t => t.id !== id));
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
  {mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed z-50 top-4 right-4 flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-2 rounded shadow-lg text-sm animate-fade-in pointer-events-auto ${t.type === 'success' ? 'bg-green-500/90 text-white' : t.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-slate-800/90 text-white'}`}
              onClick={() => remove(t.id)}
              role="alert"
              style={{ minWidth: 180 }}
            >
              {t.message}
            </div>
          ))}
        </div>, document.body)
      }
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
