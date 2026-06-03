import axios, { AxiosError } from 'axios';
import { showToast } from '@/lib/toast';
import moment from 'moment';
import {
  AgentModelDisplayNames,
  AgentModelKeys,
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  HumanReviewDecisionEnum,
  HumanReviewDecisionLabels,
  TIME_FORMAT,
} from '@/constants/common';

export interface ErrorMessage {
  message: string;
  field?: string;
  code?: string;
}

export const handleLogout = (): void => {
  localStorage.clear();
  window.location.href = '/login';
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

const base64UrlDecode = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
};

export const getLoggedInUserId = (): number | null => {
  try {
    const token = getLocalStorageItem<string>('authentication_token', null) as string | null;
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payloadRaw = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadRaw) as any;

    const candidate = payload?.id ?? payload?.userId ?? payload?.user_id ?? payload?.sub;
    const asNumber = typeof candidate === 'number' ? candidate : Number(candidate);
    return Number.isFinite(asNumber) ? asNumber : null;
  } catch {
    return null;
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

// Helper to safely get enum values
export const getEnumValues = (enumObj: Record<string, number>): number[] => {
  return Object.values(enumObj).filter((value): value is number => typeof value === 'number');
};

export const getModelDisplayName = (modelId: string): string => {
  const modelEntry = Object.entries(AgentModelKeys).find(([, value]) => value === modelId);
  return modelEntry ? AgentModelDisplayNames[modelEntry[0] as keyof typeof AgentModelKeys] : modelId;
};

type DateLike = string | number | Date | null | undefined;

export const formatDate = (value: DateLike): string => {
  if (!value) return '';
  return moment(value).format(DATE_FORMAT);
};

export const formatTime = (value: DateLike): string => {
  if (!value) return '';
  return moment(value).format(TIME_FORMAT);
};

export const formatDateTime = (value: DateLike): string => {
  if (!value) return '';
  return moment(value).format(DATE_TIME_FORMAT);
};

// Utility function to get default date range
export const getDefaultDateRange = () => {
  const endDate = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  return { startDate, endDate };
};

export const getDefaultDateRangeNotesQueue = () => {
  const endDate = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(20, 'years').format('YYYY-MM-DD');
  return { startDate, endDate };
};

// Map issue category to NoteSections accordion ID
export const mapCategoryToSectionId = (category: string): string => {
  const categoryMap: Record<string, string> = {
    Subjective: 'subjective',
    Objective: 'objective',
    'Assessment & Therapeutic Intervention': 'assessment',
    'Reaction to Intervention': 'reaction',
    'Plan & Collaboration': 'plan',
    Progress: 'progress',
    'SI / HI': 'si-hi',
  };
  return categoryMap[category] || 'subjective';
};

// Clean and structure the summary
export const cleanSummary = (text?: string | null) => {
  if (!text) return '';

  // Remove the JSON structure markers
  let cleaned = text.replace(/\\n/g, '\n').replace(/ {2}\n\n/g, '\n\n');

  // Remove any remaining quotes and braces
  cleaned = cleaned.replace(/["{}]/g, '');

  return cleaned.trim();
};

// Convert agentModelKeys to an array for easier iteration
export const getAgentModelOptions = () =>
  Object.entries(AgentModelKeys).map(([key, value]) => ({
    key: key as keyof typeof AgentModelKeys,
    value,
    displayName: AgentModelDisplayNames[key as keyof typeof AgentModelKeys],
  }));

export const getHumanReviewDecisionOptions = () =>
  Object.values(HumanReviewDecisionEnum).map(value => ({
    value,
    label: HumanReviewDecisionLabels[value],
  }));

export const formatJsonToText = (jsonString: string | undefined): string => {
  if (!jsonString) return '';
  try {
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed)
        .map(([key, value]) => {
          const strValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return `${formattedKey}:\n${strValue}`;
        })
        .join('\n\n');
    }
    return String(jsonString);
  } catch {
    return String(jsonString);
  }
};
