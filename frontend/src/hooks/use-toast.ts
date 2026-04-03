import { toast as toastManager } from '../components/ui/toast';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const message = description ? `${title}: ${description}` : title;
    
    if (variant === 'destructive') {
      toastManager.error(message);
    } else {
      toastManager.success(message);
    }
  };

  return { toast };
};