import { useMemo, useRef, useEffect } from 'react';
import { WebhookVersion, SMEIssue } from '@/types/notes';
import { getMergedIssueRelatedTo } from '@/constants/common';
import { ErrorTypeDisplayNames } from '@/constants/common';
import { errorTypeValueToId } from './reviewUtils';
import { IssueForm, Review } from './types';

interface UseVersionIssuesProps {
  currentVersion: WebhookVersion | null;
  practitioners: Array<{ id: number; fullName: string }>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const useVersionIssues = ({ currentVersion, practitioners, setReviews }: UseVersionIssuesProps) => {
  // Convert version issues to review format and group by reviewer
  const versionIssuesByReviewer = useMemo(() => {
    if (!currentVersion?.smeIssues || currentVersion.smeIssues.length === 0) return {};

    const grouped: Record<number, IssueForm[]> = {};
    const mergedIssueRelatedTo = getMergedIssueRelatedTo();

    currentVersion.smeIssues.forEach((issue: SMEIssue) => {
      const reviewerId = issue.reviewerId;
      if (!grouped[reviewerId]) {
        grouped[reviewerId] = [];
      }

      // Convert SMEIssue to IssueForm format
      const errorTypeValue =
        Object.keys(errorTypeValueToId).find(key => ErrorTypeDisplayNames[errorTypeValueToId[key]] === issue.errorType?.displayName) || '';

      const issuesRelatedToName = issue.issuesRelatedTo?.displayName;
      const issuesRelatedToOption = mergedIssueRelatedTo.find(opt => opt.name === issuesRelatedToName);
      const issuesRelatedToId = issuesRelatedToOption?.id || '';

      const descriptionText = issue.issueDescription?.description;

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
  }, [currentVersion]);

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
