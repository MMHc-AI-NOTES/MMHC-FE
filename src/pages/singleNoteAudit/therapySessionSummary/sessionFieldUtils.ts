// import { MessageSquare, Eye, Target, Lightbulb, ListChecks, TrendingUp, Clock, Shield, Stethoscope, type LucideIcon } from 'lucide-react';
import { SessionJsonFieldDisplayNames } from '@/constants/common';
import type { NoteDetail, SMEIssue } from '@/types/notes';

const normalizeFieldKey = (key: string): string => {
  if (!key) return '';
  return key.replace(/\s*\(optional\)/gi, '').trim();
};

const sessionFieldKeysMatch = (a: string, b: string): boolean => {
  return a === b || normalizeFieldKey(a) === normalizeFieldKey(b);
};

export const isDisplayableSessionField = (key: string): boolean =>
  Object.keys(SessionJsonFieldDisplayNames).some(allowedKey => sessionFieldKeysMatch(allowedKey, key));

export const getSessionFieldDisplayName = (key: string): string | undefined => {
  const match = Object.entries(SessionJsonFieldDisplayNames).find(([allowedKey]) => sessionFieldKeysMatch(allowedKey, key));
  return match?.[1];
};

/**
 * Below this many matches against the progress note field list we treat the
 * note as another type. Intake, treatment plan and termination notes share at
 * most one or two field names with a progress note, so anything under this is
 * not a progress note and must not be filtered through that list.
 */
const MIN_PROGRESS_NOTE_FIELD_MATCHES = 3;

/**
 * Progress notes use the curated field list so administrative fields stay
 * hidden and the order is predictable. Other note types have no curated list,
 * so their fields are shown as stored, which is the order PracticeQ sent them.
 * Empty fields are dropped so the summary does not fill with blank rows.
 */
export const getDisplayableSessionFieldEntries = (sessionData: Record<string, unknown>): [string, unknown][] => {
  const sessionKeys = Object.keys(sessionData);

  const curatedEntries = Object.keys(SessionJsonFieldDisplayNames)
    .map(allowedKey => {
      const matchedKey = sessionKeys.find(sk => sessionFieldKeysMatch(sk, allowedKey));
      if (!matchedKey) return null;
      return [matchedKey, sessionData[matchedKey]] as [string, unknown];
    })
    .filter((entry): entry is [string, unknown] => entry != null);

  if (curatedEntries.length >= MIN_PROGRESS_NOTE_FIELD_MATCHES) {
    return curatedEntries;
  }

  return sessionKeys
    .filter(key => {
      const value = sessionData[key];
      return value !== null && value !== undefined && String(value).trim() !== '';
    })
    .map(key => [key, sessionData[key]] as [string, unknown]);
};

export const formatSessionFieldValue = (value: unknown): string => {
  if (value === '' || value === null || value === undefined) return '-';
  return String(value);
};

export const fieldsMatch = (fieldDisplayName: string, fieldKey: string, target: string): boolean => {
  const normalizedTarget = normalizeFieldKey(target).toLowerCase();
  const normalizedDisplay = normalizeFieldKey(fieldDisplayName).toLowerCase();
  const normalizedKey = normalizeFieldKey(fieldKey).toLowerCase();
  return (
    normalizedTarget === normalizedDisplay ||
    normalizedTarget === normalizedKey ||
    normalizedDisplay.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedDisplay)
  );
};

export const getAiIssuesForField = (
  fieldKey: string,
  fieldDisplayName: string,
  aiIssues: NoteDetail['issues'] = [],
): NoteDetail['issues'] => {
  if (!aiIssues.length) return [];
  return aiIssues.filter(issue => fieldsMatch(fieldDisplayName, fieldKey, issue.category));
};

export const getSmeIssueDescription = (issue: SMEIssue): string => {
  const rawDescription = issue.issueDescription?.description ?? issue.description;
  if (typeof rawDescription === 'string') return rawDescription;
  if (rawDescription && typeof rawDescription === 'object' && 'name' in rawDescription) {
    return rawDescription.name || '';
  }
  return '';
};

export const getSmeIssueTitle = (issue: SMEIssue): string => {
  return issue.errorType?.displayName || issue.errorType?.name || 'SME Issue';
};
