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
  showToast.error(message);

  console.error('API Error:', message);
};

export const handleErrorMessages = (errors?: ErrorMessage[] | any): void => {
  let errorMessages: ErrorMessage[] = [];

  if (!errors) {
    showToast.error('Oops! Something went wrong.');
    return;
  }

  // Case 1: Already an array of ErrorMessage
  if (Array.isArray(errors) && errors.every(error => error && error.message)) {
    errorMessages = errors;
  }
  // Case 2: Axios response object
  else if (errors.response?.data) {
    errorMessages = extractErrorsFromResponse(errors.response.data);
  }
  // Case 3: Direct API response
  else if (errors.data || errors.errors) {
    errorMessages = extractErrorsFromResponse(errors);
  }
  // Case 4: Simple error object with message
  else if (errors.message) {
    errorMessages = [{ message: errors.message }];
  }
  // Case 5: Fallback
  else {
    errorMessages = [{ message: 'Oops! Something went wrong.' }];
  }

  if (errorMessages.length > 0) {
    const message = errorMessages.map(e => e.message).join('\n');
    showToast.error(message);
  }
};

// Helper function to extract errors
const extractErrorsFromResponse = (responseData: any): ErrorMessage[] => {
  // Priority order for error extraction
  if (Array.isArray(responseData.errors)) {
    return responseData.errors;
  }

  if (responseData.errors && typeof responseData.errors === 'object') {
    return Object.entries(responseData.errors).flatMap(([field, messages]) =>
      Array.isArray(messages) ? messages.map(message => ({ field, message: String(message) })) : [{ field, message: String(messages) }],
    );
  }

  if (responseData.message) {
    return [{ message: responseData.message }];
  }

  return [{ message: 'Operation failed' }];
};
