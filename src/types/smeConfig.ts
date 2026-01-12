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

// Issue Descriptions type
export type IssueDescriptions = {
  critical: string[];
  moderate: string[];
  minor: string[];
};

// Get error types from localStorage
export const getStoredErrorTypes = (): ErrorType[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ERROR_TYPES);
  return stored ? JSON.parse(stored) : [];
};

// Get issues related to from localStorage
export const getStoredIssueRelatedTo = (): IssueRelatedTo[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ISSUE_RELATED_TO);
  return stored ? JSON.parse(stored) : [];
};

// Get issue descriptions from localStorage
export const getStoredIssueDescriptions = (): IssueDescriptions => {
  if (typeof window === 'undefined') return { critical: [], moderate: [], minor: [] };
  const stored = localStorage.getItem(STORAGE_KEYS.ISSUE_DESCRIPTIONS);
  return stored ? JSON.parse(stored) : { critical: [], moderate: [], minor: [] };
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
  // Merge: stored types override defaults if same value, otherwise append
  const merged: ErrorType[] = [...defaultTypes];
  storedTypes.forEach(stored => {
    const existingIndex = merged.findIndex(t => t.value === stored.value);
    if (existingIndex >= 0) {
      merged[existingIndex] = stored;
    } else {
      merged.push(stored);
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
  const defaultDescriptions = { ...ISSUE_DESCRIPTIONS };
  const storedDescriptions = getStoredIssueDescriptions();
  return {
    critical: [...defaultDescriptions.critical, ...(storedDescriptions.critical || [])],
    moderate: [...defaultDescriptions.moderate, ...(storedDescriptions.moderate || [])],
    minor: [...defaultDescriptions.minor, ...(storedDescriptions.minor || [])],
  };
};
