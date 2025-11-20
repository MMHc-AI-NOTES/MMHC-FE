import axios, { AxiosError } from 'axios';
import { showToast } from '@/lib/toast';

export interface ErrorMessage {
  message: string;
  field?: string;
  code?: string;
}

export const handleLogout = (): void => {
  localStorage.clear();
  window.location.reload();
};

export const getLocalStorageItem = <T>(key: string, defaultValue: T | null = null): T | string | null => {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) return defaultValue;

    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

export const handleCatchMessages = (error: unknown): void => {
  if (axios.isCancel(error)) return;
  const axiosError = error as AxiosError<{ message?: string }>;

  const message = axiosError.response?.data?.message || axiosError.message || 'Oops! Something went wrong.';

  console.error('API Error:', message);
};

export const handleErrorMessages = (errors?: ErrorMessage[]): void => {
  if (errors && errors.length > 0) {
    const message = errors.map(e => e.message).join('\n') || 'Oops! Something went wrong.';
    showToast.error(message);
  }
};
