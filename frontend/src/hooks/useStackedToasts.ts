import { useCallback, useRef, useState } from 'react';

export interface ToastItem {
  id: string;
  message: string;
}

export const useStackedToasts = (duration = 2200) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss, duration],
  );

  const clearToasts = useCallback(() => {
    Object.values(timers.current).forEach((timer) => clearTimeout(timer));
    timers.current = {};
    setToasts([]);
  }, []);

  return { toasts, showToast, dismiss, clearToasts };
};
