import { getMergedErrorTypes, getMergedIssueRelatedTo, getMergedIssueDescriptions, IssuesRelatedToDisplayName } from '@/constants/common';
import { IssueForm } from './types';

export const errorTypeValueToId: Record<string, number> = {
  minor: 1,
  moderate: 2,
  critical: 3,
};

/**
 * Calculate SME score from issues
 */
export const calculateSMEScore = (issues: IssueForm[]): number => {
  const mergedErrorTypes = getMergedErrorTypes();
  const totalPoints = issues.reduce((sum, issue) => {
    const issuePoints = mergedErrorTypes.find(type => type.value === issue.errorType)?.points || 0;
    return sum + issuePoints;
  }, 0);
  return 100 + totalPoints; // Points are negative, so we add them
};

/**
 * Calculate percentage match between SME score and AI score
 */
export const calculatePercentageMatch = (smeScore: number, auditScore: number, minScore = -100, maxScore = 100): number => {
  const range = maxScore - minScore;
  const difference = Math.abs(smeScore - auditScore);

  const match = 100 - (difference / range) * 100;
  return Math.max(0, Math.round(match));
};

/**
 * Map error type value to numeric ID
 */
export const getErrorTypeId = (errorTypeValue: string): number => {
  return errorTypeValueToId[errorTypeValue] || 0;
};

/**
 * Map issues related to name to numeric ID
 */
export const getIssuesRelatedToId = (issueRelatedToId: string): number => {
  const mergedIssueRelatedTo = getMergedIssueRelatedTo();
  const option = mergedIssueRelatedTo.find(opt => opt.id === issueRelatedToId);
  if (!option) return 0;

  const nameToNumericId: Record<string, number> = {};
  Object.entries(IssuesRelatedToDisplayName).forEach(([id, name]) => {
    nameToNumericId[name] = Number(id);
  });
  return nameToNumericId[option.name] || 0;
};

/**
 * Map issue description to numeric ID
 */
export const getDescriptionId = (description: string): number => {
  const mergedIssueDescriptions = getMergedIssueDescriptions();
  return mergedIssueDescriptions.findIndex(desc => desc === description) + 1;
};
