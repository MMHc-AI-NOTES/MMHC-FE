import { useMemo, useRef, useEffect } from 'react';
import { WebhookVersion, SMEIssue } from '@/types/notes';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { IssueForm, Review } from './types';
import { fetchUsersListingThunk, type UsersQuery, selectUsersListingLoading } from '@/store/slices/usersSlice';

interface UseVersionIssuesProps {
  currentVersion: WebhookVersion | null;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  deletedReviewIds?: Set<string>;
  versionId?: number | null;
}

export const useVersionIssues = ({ currentVersion, setReviews, deletedReviewIds = new Set(), versionId }: UseVersionIssuesProps) => {
  const dispatch = useAppDispatch();
  const { errorTypes, issueRelatedTo } = useAppSelector(state => state.smeConfig);
  const userEntities = useAppSelector(state => state.users.entities);

  // Get all users from entities
  const users = useMemo(() => {
    return Object.values(userEntities).filter(Boolean);
  }, [userEntities]);

  // Query for fetching users
  const usersQuery: UsersQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      search: '',
      role: 'all',
    }),
    [],
  );

  // Check if users are loading
  const usersLoading = useAppSelector(state => selectUsersListingLoading(state, usersQuery));

  // Fetch users listing when users array is empty (e.g., on mount or after reload)
  useEffect(() => {
    if (users.length === 0 && !usersLoading) {
      dispatch(fetchUsersListingThunk(usersQuery));
    }
  }, [users.length, usersLoading, dispatch, usersQuery]);

  // Convert version issues to review format and group by reviewer
  const versionIssuesData = useMemo(() => {
    const versionIssues = currentVersion?.smeIssues ?? (currentVersion as any)?.sme_issues ?? [];
    if (!versionIssues || versionIssues.length === 0) {
      return { grouped: {}, reviewerNameById: {} as Record<number, string> };
    }

    const errorTypeIdToValue: Record<number, string> = {
      1: 'minor',
      2: 'moderate',
      3: 'critical',
    };

    const grouped: Record<number, IssueForm[]> = {};
    const reviewerNameById: Record<number, string> = {};

    // Convert Redux data to format expected by components
    const issueRelatedToOptions = issueRelatedTo.map(opt => ({
      id: opt.fieldId,
      name: opt.displayName,
    }));

    versionIssues.forEach((issue: SMEIssue) => {
      const reviewerId = issue.reviewerId;
      if (!grouped[reviewerId]) {
        grouped[reviewerId] = [];
      }

      const reviewerName = (issue as any)?.reviewer?.fullName || (issue as any)?.reviewer?.email || '';
      if (reviewerName && !reviewerNameById[reviewerId]) {
        reviewerNameById[reviewerId] = reviewerName;
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

      const comment: string = (issue as any)?.comment ?? '';

      grouped[reviewerId].push({
        id: `version-issue-${issue.id}`,
        errorType: errorTypeValue,
        issueRelatedTo: issuesRelatedToId,
        issueDescription: descriptionText,
        comment,
        _smeIssueId: issue.id,
        _isVersionIssue: true,
      });
    });

    return { grouped, reviewerNameById };
  }, [currentVersion, errorTypes, issueRelatedTo]);

  // Use ref to track previous versionIssuesByReviewer to prevent infinite loops
  const prevVersionIssuesRef = useRef<string>('');

  // Update reviews when version issues change, but only after users are loaded
  useEffect(() => {
    // Don't process reviews if users haven't been loaded yet or are still loading
    const hasReviewerNames = Object.keys(versionIssuesData.reviewerNameById).length > 0;
    if ((users.length === 0 && usersLoading) || (users.length === 0 && !hasReviewerNames)) {
      return;
    }

    const currentVersionIssuesKey = JSON.stringify(
      Object.entries(versionIssuesData.grouped).map(([reviewerId, issues]) => [
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

    if (Object.keys(versionIssuesData.grouped).length > 0) {
      const versionReviews = Object.entries(versionIssuesData.grouped)
        .map(([reviewerId, issues]) => {
          const reviewId = `version-review-${reviewerId}`;
          const versionSpecificKey = versionId ? `version-review-${reviewerId}-v${versionId}` : reviewId;
          const wasDeleted = deletedReviewIds.has(reviewId) || deletedReviewIds.has(versionSpecificKey);
          // Re-include review when API has issues again for this reviewer (e.g. after delete then create from template)
          if (wasDeleted && (!issues || issues.length === 0)) {
            return null;
          }
          const reviewer = users.find(u => u.id === Number(reviewerId));
          const fallbackName = versionIssuesData.reviewerNameById[Number(reviewerId)] || '';
          return {
            id: reviewId,
            reviewerId: reviewerId,
            reviewerName: reviewer?.fullName || fallbackName,
            issues: issues,
          };
        })
        .filter((review): review is NonNullable<typeof review> => review !== null);

      setReviews(prevReviews => {
        const nonVersionReviews = prevReviews.filter(r => !r.id.startsWith('version-review-'));
        return [...versionReviews, ...nonVersionReviews];
      });
    } else {
      setReviews(prevReviews => prevReviews.filter(r => !r.id.startsWith('version-review-')));
    }
  }, [versionIssuesData, users, usersLoading, setReviews, deletedReviewIds, versionId]);

  return versionIssuesData.grouped;
};
