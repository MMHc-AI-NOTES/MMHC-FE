import { IssueForm } from './types';

/**
 * Calculate SME score from issues
 * Note: This function should receive errorTypes from Redux state
 */
export const calculateSMEScore = (issues: IssueForm[], errorTypes: Array<{ name: string; points: number }>): number => {
  const totalPoints = issues.reduce((sum, issue) => {
    const issuePoints = errorTypes.find(type => type.name === issue.errorType)?.points || 0;
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
 * Map error type value to backend ID
 * Note: This function should receive errorTypes from Redux state
 */
export const getErrorTypeId = (errorTypeValue: string, errorTypes: Array<{ name: string; id?: number }>): number => {
  const option = errorTypes.find(type => type.name === errorTypeValue);
  return option?.id || 0;
};

/**
 * Map issues related to ID to backend ID
 * Note: This function should receive issueRelatedTo from Redux state
 */
export const getIssuesRelatedToId = (issueRelatedToId: string, issueRelatedTo: Array<{ fieldId: string; id?: number }>): number => {
  const option = issueRelatedTo.find(opt => opt.fieldId === issueRelatedToId);
  return option?.id || 0;
};

/**
 * Map issue description to backend ID
 * Note: This function should receive issueDescriptions from Redux state
 */
export const getDescriptionId = (description: string, issueDescriptions: Array<{ description: string; id?: number }>): number => {
  const option = issueDescriptions.find(desc => desc.description === description);
  return option?.id || 0;
};
