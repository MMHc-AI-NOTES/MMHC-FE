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
 * Some PracticeQ questions carry no label text. Those fall back to the raw
 * question id, for example "425q-1", which is meaningless as a heading and
 * should not be shown to a reviewer.
 */
const RAW_QUESTION_ID = /^[a-z0-9]{4}-\d+(\s\(\d+\))?$/i;

export const isRawQuestionId = (key: string): boolean => RAW_QUESTION_ID.test(key.trim());

/**
 * Progress notes use the curated field list so administrative fields stay
 * hidden and the order is predictable. Other note types have no curated list,
 * so their fields are shown as stored, which is the order PracticeQ sent them.
 * Empty values and unlabelled questions are dropped so the summary stays
 * readable.
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
      if (isRawQuestionId(key)) return false;
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

  // Matching below is substring based in both directions, and every string
  // contains the empty string. Without this guard a finding that arrives with
  // no section matches every field on the note and is drawn under all of them,
  // which reads as the same finding duplicated across the whole note. It
  // belongs in the unmatched set instead, where it appears once.
  if (!normalizedTarget || (!normalizedDisplay && !normalizedKey)) return false;

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

/**
 * AI findings that no displayed field will claim.
 *
 * Findings are only ever rendered against a field, so a finding whose section
 * matches nothing was silently dropped. That is how it went unnoticed that
 * intake, treatment plan and termination notes show no annotations: the scorer
 * returns those against the section "Overall", which is a real category but
 * not a field on any note.
 *
 * Deliberately the exact inverse of getAiIssuesForField over every displayed
 * field, so each finding lands in exactly one place: under a field, or here.
 */
export const getUnmatchedAiIssues = (
  aiIssues: NoteDetail['issues'] = [],
  displayedFields: [string, unknown][] = [],
  getDisplayName: (fieldKey: string) => string,
): NoteDetail['issues'] => {
  if (!aiIssues.length) return [];

  return aiIssues.filter(issue => !displayedFields.some(([fieldKey]) => fieldsMatch(getDisplayName(fieldKey), fieldKey, issue.category)));
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
