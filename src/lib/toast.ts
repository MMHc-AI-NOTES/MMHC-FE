import { dispatch } from '@/store/store';
import { setToastObj } from '@/store/slices/alertsSlice';

const createToast = (toast: ToastObj) => {
  dispatch(setToastObj(toast));
};

export const showToast = {
  success: (message: string, duration?: number, position?: ToastObj['position']) => {
    createToast({ severity: 'success', message, autoHideDuration: duration, position });
  },

  error: (message: string, duration?: number, position?: ToastObj['position']) => {
    createToast({ severity: 'error', message, autoHideDuration: duration, position });
  },

  warning: (message: string, duration?: number, position?: ToastObj['position']) => {
    createToast({ severity: 'warning', message, autoHideDuration: duration, position });
  },

  info: (message: string, duration?: number, position?: ToastObj['position']) => {
    createToast({ severity: 'info', message, autoHideDuration: duration, position });
  },
};

export interface ToastObj {
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoHideDuration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}
