import { useState, useCallback } from 'react';

interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  icon?: React.ReactNode;
}

interface ConfirmationState extends ConfirmationConfig {
  isOpen: boolean;
  onConfirm: (() => void) | null;
}

export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const showConfirmation = useCallback((config: ConfirmationConfig) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...config,
        isOpen: true,
        onConfirm: () => {
          resolve(true);
        },
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    hideConfirmation();
  }, [state.onConfirm, hideConfirmation]);

  const handleCancel = useCallback(() => {
    hideConfirmation();
  }, [hideConfirmation]);

  return {
    ...state,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel,
  };
};