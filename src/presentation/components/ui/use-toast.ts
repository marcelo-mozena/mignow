'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastCount = 0;

function genId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return toastCount.toString();
}

const TOAST_REMOVE_DELAY = 5000;

type ToastInput = Omit<Toast, 'id'>;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((input: ToastInput) => {
    const id = genId();
    const newToast: Toast = { ...input, id };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_REMOVE_DELAY);

    return { id, dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)) };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev => (toastId ? prev.filter(t => t.id !== toastId) : []));
  }, []);

  return { toasts, toast, dismiss };
}
