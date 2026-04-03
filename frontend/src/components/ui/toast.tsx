import * as React from "react";
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Simple toast implementation
interface ToastOptions {
  duration?: number;
}

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

class ToastManager {
  private toasts: ToastState[] = [];
  private listeners: Array<(toasts: ToastState[]) => void> = [];

  subscribe(listener: (toasts: ToastState[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  private addToast(message: string, type: 'success' | 'error' | 'info', options: ToastOptions = {}) {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = options.duration || (type === 'error' ? 5000 : 3000);
    
    const toast: ToastState = {
      id,
      message,
      type,
      duration
    };

    this.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.removeToast(id);
    }, duration);

    return id;
  }

  private removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(message: string, options?: ToastOptions) {
    return this.addToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.addToast(message, 'error', options);
  }

  info(message: string, options?: ToastOptions) {
    return this.addToast(message, 'info', options);
  }

  dismiss(id: string) {
    this.removeToast(id);
  }
}

const toastManager = new ToastManager();

export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => toastManager.error(message, options),
  info: (message: string, options?: ToastOptions) => toastManager.info(message, options),
  dismiss: (id: string) => toastManager.dismiss(id),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  React.useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => toastManager.dismiss(toast.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Toast component for inline usage
interface ToastComponentProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastComponentProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    error: { bg: 'bg-red-500', icon: AlertCircle },
    success: { bg: 'bg-green-500', icon: CheckCircle },
    info: { bg: 'bg-blue-500', icon: Info },
    warning: { bg: 'bg-yellow-500', icon: AlertCircle },
  };

  const { bg, icon: Icon } = styles[type];

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div
      className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-2`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={handleClose}
        className="text-white/80 hover:text-white ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};