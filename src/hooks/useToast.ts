import { useMemo } from 'react';
import { useToastContext } from '@/components/ui/Toast';

export function useToast() {
  const { addToast } = useToastContext();

  return useMemo(
    () => ({
      success: (msg: string) => addToast('success', msg),
      error: (msg: string) => addToast('error', msg),
      info: (msg: string) => addToast('info', msg),
      warning: (msg: string) => addToast('warning', msg),
    }),
    [addToast]
  );
}

export default useToast;
