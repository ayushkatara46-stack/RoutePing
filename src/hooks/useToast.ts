'use client';

// =============================================
// useToast Hook
// =============================================

import { useToastContext } from '@/components/ui/Toast';

export function useToast() {
  const { addToast } = useToastContext();

  return {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
    warning: (msg: string) => addToast('warning', msg),
  };
}

export default useToast;
