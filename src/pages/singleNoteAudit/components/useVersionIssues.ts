import { useMemo, useRef, useEffect } from 'react';
import { WebhookVersion, SMEIssue } from '@/types/notes';
import { useAppSelector } from '@/store/store';
import { IssueForm, Review } from './types';

interface UseVersionIssuesProps {
  currentVersion: WebhookVersion | null;
  practitioners: Array<{ id: number; fullName: string }>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const useVersionIssues = ({ currentVersion, practitioners, setReviews }: UseVersionIssuesProps) => {
  const { errorTypes, issueRelatedTo } = useAppSelector(state => state.smeConfig);

  // Convert version issues to review format and group by reviewer
  const versionIssuesByReviewer = useMemo(() => {
    if (!currentVersion?.smeIssues || currentVersion.smeIssues.length === 0) return {};

    const errorTypeIdToValue: Record<number, string> = {
      1: 'minor',
      2: 'moderate',
      3: 'critical',
    };

    const grouped: Record<number, IssueForm[]> = {};

    // Convert Redux data to format expected by components
    const issueRelatedToOptions = issueRelatedTo.map(opt => ({
      id: opt.fieldId,
      name: opt.displayName,
    }));

    currentVersion.smeIssues.forEach((issue: SMEIssue) => {
      const reviewerId = issue.reviewerId;
      if (!grouped[reviewerId]) {
        grouped[reviewerId] = [];
      }

      // Convert SMEIssue to IssueForm format
      // Match error type by backend `errorType.name` OR by id fallback (1/2/3 -> minor/moderate/critical)
      const backendErrorTypeName = (issue as any)?.errorType?.name || (issue as any)?.errorType?.displayName || '';
      const errorTypeOption = errorTypes.find(type => type.displayName === backendErrorTypeName || type.id === issue.errorType?.id);
      const errorTypeValue = errorTypeOption?.name || errorTypeIdToValue[issue.errorType?.id || 0] || '';

      const issuesRelatedToName = (issue as any)?.issuesRelatedTo?.name || (issue as any)?.issuesRelatedTo?.displayName || '';
      const issuesRelatedToOption = issueRelatedToOptions.find(opt => opt.name === issuesRelatedToName);
      const issuesRelatedToId = issuesRelatedToOption?.id || '';

      const rawDescription = (issue as any)?.description ?? (issue as any)?.issueDescription?.description ?? '';
      const descriptionText =
        typeof rawDescription === 'string' ? rawDescription : (rawDescription as { id: string; name: string })?.name || '';

      grouped[reviewerId].push({
        id: `version-issue-${issue.id}`,
        errorType: errorTypeValue,
        issueRelatedTo: issuesRelatedToId,
        issueDescription: descriptionText,
        _smeIssueId: issue.id,
        _isVersionIssue: true,
      });
    });

    return grouped;
  }, [currentVersion, errorTypes, issueRelatedTo]);

  // Use ref to track previous versionIssuesByReviewer to prevent infinite loops
  const prevVersionIssuesRef = useRef<string>('');

  // Update reviews when version issues change
  useEffect(() => {
    const currentVersionIssuesKey = JSON.stringify(
      Object.entries(versionIssuesByReviewer).map(([reviewerId, issues]) => [
        reviewerId,
        issues.map(issue => ({
          id: issue.id,
          errorType: issue.errorType,
          issueRelatedTo: issue.issueRelatedTo,
          issueDescription: issue.issueDescription,
          _smeIssueId: issue._smeIssueId,
        })),
      ]),
    );

    if (prevVersionIssuesRef.current === currentVersionIssuesKey) {
      return;
    }

    prevVersionIssuesRef.current = currentVersionIssuesKey;

    if (Object.keys(versionIssuesByReviewer).length > 0) {
      const versionReviews = Object.entries(versionIssuesByReviewer).map(([reviewerId, issues]) => {
        const reviewer = practitioners.find(p => p.id === Number(reviewerId));
        return {
          id: `version-review-${reviewerId}`,
          reviewerId: reviewerId,
          reviewerName: reviewer?.fullName || '',
          issues: issues,
        };
      });

      setReviews(prevReviews => {
        const nonVersionReviews = prevReviews.filter(r => !r.id.startsWith('version-review-'));
        return [...versionReviews, ...nonVersionReviews];
      });
    } else {
      setReviews(prevReviews => prevReviews.filter(r => !r.id.startsWith('version-review-')));
    }
  }, [versionIssuesByReviewer, practitioners, setReviews]);

  return versionIssuesByReviewer;
};
