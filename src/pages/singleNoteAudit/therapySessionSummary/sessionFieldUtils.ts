import { MessageSquare, Eye, Target, Lightbulb, ListChecks, TrendingUp, Clock, Shield, Stethoscope, type LucideIcon } from 'lucide-react';
import type { NoteDetail, SMEIssue } from '@/types/notes';

const FIELD_ICON_MAP: { match: string; icon: LucideIcon }[] = [
  { match: 'subjective', icon: MessageSquare },
  { match: 'objective', icon: Eye },
  { match: 'assessment', icon: Target },
  { match: 'reaction', icon: Lightbulb },
  { match: 'plan', icon: ListChecks },
  { match: 'progress', icon: TrendingUp },
  { match: 'session duration', icon: Clock },
  { match: 'suicidality', icon: Shield },
  { match: 'homicidality', icon: Shield },
  { match: 'mental status', icon: Eye },
  { match: 'overall', icon: Stethoscope },
];

const normalizeFieldKey = (key: string): string => {
  if (!key) return '';
  return key.replace(/\s*\(optional\)/gi, '').trim();
};

export const formatSessionFieldValue = (value: unknown): string => {
  if (value === '' || value === null || value === undefined) return '-';
  return String(value);
};

export const getFieldIcon = (displayName: string, fieldKey: string): LucideIcon => {
  const normalized = `${displayName} ${fieldKey}`.toLowerCase();
  const found = FIELD_ICON_MAP.find(({ match }) => normalized.includes(match));
  return found?.icon ?? MessageSquare;
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
