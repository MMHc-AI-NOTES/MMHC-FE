import { ERROR_TYPES, ISSUE_RELATED_TO_OPTIONS, ISSUE_DESCRIPTIONS } from '@/constants/common';

const STORAGE_KEYS = {
  ERROR_TYPES: 'sme_config_error_types',
  ISSUE_RELATED_TO: 'sme_config_issue_related_to',
  ISSUE_DESCRIPTIONS: 'sme_config_issue_descriptions',
} as const;

// Error Type type
export type ErrorType = {
  value: string;
  label: string;
  points: number;
};

// Issue Related To type
export type IssueRelatedTo = {
  id: string;
  name: string;
};

// Issue Descriptions type (simplified - just an array)
export type IssueDescriptions = string[];

// Get error types from localStorage
export const getStoredErrorTypes = (): ErrorType[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ERROR_TYPES);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing stored error types:', error);
    return [];
  }
};

// Get issues related to from localStorage
export const getStoredIssueRelatedTo = (): IssueRelatedTo[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ISSUE_RELATED_TO);
  return stored ? JSON.parse(stored) : [];
};

// Get issue descriptions from localStorage
export const getStoredIssueDescriptions = (): IssueDescriptions => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ISSUE_DESCRIPTIONS);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    // Handle migration from old object format to new array format
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If it's the old object format, return empty array (migration)
    if (typeof parsed === 'object' && parsed !== null) {
      return [];
    }
    return [];
  } catch (error) {
    console.error('Error parsing stored issue descriptions:', error);
    return [];
  }
};

// Save error types to localStorage
export const saveErrorTypes = (errorTypes: ErrorType[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ERROR_TYPES, JSON.stringify(errorTypes));
};

// Save issues related to to localStorage
export const saveIssueRelatedTo = (issues: IssueRelatedTo[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ISSUE_RELATED_TO, JSON.stringify(issues));
};

// Save issue descriptions to localStorage
export const saveIssueDescriptions = (descriptions: IssueDescriptions): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ISSUE_DESCRIPTIONS, JSON.stringify(descriptions));
};

// Get merged error types (default + stored)
export const getMergedErrorTypes = (): ErrorType[] => {
  const defaultTypes: ErrorType[] = ERROR_TYPES.map(type => ({
    value: type.value,
    label: type.label,
    points: type.points,
  }));
  const storedTypes = getStoredErrorTypes();

  // Ensure storedTypes is an array
  const storedArray = Array.isArray(storedTypes) ? storedTypes : [];

  // Start with all default types
  const merged: ErrorType[] = [...defaultTypes];

  // Add stored types: override defaults if same value, otherwise append
  storedArray.forEach(stored => {
    if (stored && typeof stored === 'object' && stored.value) {
      // Ensure required fields have defaults if missing
      const validStored: ErrorType = {
        value: stored.value,
        label: stored.label || stored.value,
        points: typeof stored.points === 'number' ? stored.points : 0,
      };

      const existingIndex = merged.findIndex(t => t.value === validStored.value);
      if (existingIndex >= 0) {
        // Override default with stored version (allows customization of default types)
        merged[existingIndex] = validStored;
      } else {
        // Append new stored type (adds new error types)
        merged.push(validStored);
      }
    }
  });

  return merged;
};

// Get merged issues related to (default + stored)
export const getMergedIssueRelatedTo = (): IssueRelatedTo[] => {
  const defaultOptions = [...ISSUE_RELATED_TO_OPTIONS];
  const storedOptions = getStoredIssueRelatedTo();
  // Merge: stored options override defaults if same id, otherwise append
  const merged = [...defaultOptions];
  storedOptions.forEach(stored => {
    const existingIndex = merged.findIndex(o => o.id === stored.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = stored;
    } else {
      merged.push(stored);
    }
  });
  return merged;
};

// Get merged issue descriptions (default + stored)
export const getMergedIssueDescriptions = (): IssueDescriptions => {
  const defaultDescriptions = [...ISSUE_DESCRIPTIONS];
  const storedDescriptions = getStoredIssueDescriptions();
  // Ensure storedDescriptions is an array (handle migration from old object format)
  const storedArray = Array.isArray(storedDescriptions) ? storedDescriptions : [];
  // Merge: stored descriptions override defaults if same text, otherwise append
  const merged: IssueDescriptions = [...defaultDescriptions];
  storedArray.forEach(stored => {
    if (typeof stored === 'string' && !merged.includes(stored)) {
      merged.push(stored);
    }
  });
  return merged;
};
