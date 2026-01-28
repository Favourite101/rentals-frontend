import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toast: Toast) => void)[] = [];

export const showToast = (message: string, type: Toast['type'] = 'info') => {
  const toast: Toast = {
    id: Math.random().toString(36).substring(7),
    message,
    type,
  };
  
  toastListeners.forEach((listener) => listener(toast));
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    
    // Error toasts stay for 5 seconds, success/info for 3 seconds
    const duration = toast.type === 'error' ? 5000 : 3000;
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register listener using useEffect
  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  return { toasts, removeToast };
};
