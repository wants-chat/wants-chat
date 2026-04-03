import * as React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ValidationToastProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onDismiss?: () => void;
}

export const ValidationToast: React.FC<ValidationToastProps> = ({
  message,
  type = 'error',
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!isVisible) return null;

  const styles = {
    error: {
      bg: 'bg-red-500',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle,
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info,
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: AlertCircle,
    },
  };

  const { bg, icon: Icon } = styles[type];

  return (
    <div
      className={`fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md animate-in slide-in-from-bottom-2`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="ml-2 text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ValidationToast;
