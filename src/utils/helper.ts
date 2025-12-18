import axios, { AxiosError } from 'axios';
import { showToast } from '@/lib/toast';
import moment from 'moment';
import { AgentModelDisplayNames, AgentModelKeys, HumanReviewDecisionEnum, HumanReviewDecisionLabels } from '@/constants/common';

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

// Helper to safely get enum values
export const getEnumValues = (enumObj: Record<string, number>): number[] => {
  return Object.values(enumObj).filter((value): value is number => typeof value === 'number');
};

export const getModelDisplayName = (modelId: string): string => {
  const modelEntry = Object.entries(AgentModelKeys).find(([, value]) => value === modelId);
  return modelEntry ? AgentModelDisplayNames[modelEntry[0] as keyof typeof AgentModelKeys] : modelId;
};

// Utility function to get default date range
export const getDefaultDateRange = () => {
  const endDate = moment().format('YYYY-MM-DD');
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
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
export const cleanSummary = (text: string) => {
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
