import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info, CheckCircle, XCircle } from 'lucide-react';

export type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: Omit<ConfirmOptions, 'cancelText'>) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
  isAlert?: boolean;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ReactNode; actionClass: string }> = {
  default: {
    icon: <Info className="h-6 w-6 text-[#0D9488]" />,
    actionClass: 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-white border-0',
  },
  destructive: {
    icon: <Trash2 className="h-6 w-6 text-red-400" />,
    actionClass: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
    actionClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0',
  },
  success: {
    icon: <CheckCircle className="h-6 w-6 text-[#0D9488]" />,
    actionClass: 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-white border-0',
  },
  info: {
    icon: <Info className="h-6 w-6 text-[#0D9488]" />,
    actionClass: 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-white border-0',
  },
};

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    resolve: null,
    isAlert: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || 'Confirm',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        resolve,
        isAlert: false,
      });
    });
  }, []);

  const alert = useCallback((options: Omit<ConfirmOptions, 'cancelText'>): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title || 'Alert',
        message: options.message,
        confirmText: options.confirmText || 'OK',
        cancelText: '',
        variant: options.variant || 'info',
        resolve: () => resolve(),
        isAlert: true,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const config = variantConfig[state.variant || 'default'];

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                {config.icon}
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl">{state.title}</AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-white/70">
                  {state.message}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            {!state.isAlert && (
              <AlertDialogCancel onClick={handleCancel}>
                {state.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={handleConfirm} className={config.actionClass}>
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = (): ConfirmDialogContextType => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};
