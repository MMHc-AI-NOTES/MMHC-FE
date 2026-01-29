import { useCallback, useEffect, useMemo } from 'react';
import { Review, IssueForm, ActiveIssueForm } from './types';
import { createSMEIssue, updateSMEIssue, deleteSMEIssue, SMEIssuePayload } from '../singleNoteApiCalls';
import { getErrorTypeId, getIssuesRelatedToId, getDescriptionId } from './reviewUtils';
import { getState, useAppSelector, useAppDispatch } from '@/store/store';
import { WebhookVersion } from '@/types/notes';
import { fetchUsersListingThunk, type UsersQuery } from '@/store/slices/usersSlice';

interface UseReviewsProps {
  noteId: string | undefined;
  versionId: number | null | undefined;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  activeIssueForms: ActiveIssueForm[];
  setActiveIssueForms: React.Dispatch<React.SetStateAction<ActiveIssueForm[]>>;
  setSavingIssueId: React.Dispatch<React.SetStateAction<string | null>>;
  aiStatusId: number;
  priorityId: number;
  practitionerId: number;
  webhookVersions: WebhookVersion[];
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string },
  ) => void;
}

export const useReviews = ({
  noteId,
  versionId,
  reviews,
  setReviews,
  activeIssueForms,
  setActiveIssueForms,
  setSavingIssueId,
  aiStatusId,
  priorityId,
  practitionerId,
  webhookVersions,
  onSMEIssueUpdated,
}: UseReviewsProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const userEntities = useAppSelector(state => state.users.entities);
  const loggedInUserId = user?.id ?? null;

  // Get all users from entities
  const users = useMemo(() => {
    return Object.values(userEntities).filter(Boolean);
  }, [userEntities]);

  // Fetch users listing when users array is empty (e.g., on mount or after reload)
  useEffect(() => {
    if (users.length === 0) {
      const query: UsersQuery = {
        page: 1,
        pageSize: 100,
        search: '',
        role: 'all',
      };
      dispatch(fetchUsersListingThunk(query));
    }
  }, [users.length, dispatch]);

  const addReview = useCallback(() => {
    if (!loggedInUserId || !user) return;

    // Try to get reviewer name from multiple sources
    // 1. Check user.fullName (trim to handle empty strings)
    // 2. Check users list from entities (in case user is in the list)
    // 3. Fall back to email
    // 4. Last resort: use a default
    let reviewerName = '';
    if (user.fullName?.trim()) {
      reviewerName = user.fullName.trim();
    } else {
      const foundUser = users.find(u => u.id === loggedInUserId);
      reviewerName = foundUser?.fullName || user.email || 'Unknown Reviewer';
    }

    const newReview: Review = {
      id: `new-review-${loggedInUserId}`,
      reviewerId: loggedInUserId.toString(),
      reviewerName: reviewerName,
      issues: [],
      _versionId: versionId || null, // Associate review with current version
    };
    setReviews(prev => [newReview, ...prev]);
  }, [setReviews, loggedInUserId, user, users, versionId]);

  const handleReviewerChange = useCallback(
    (reviewId: string, reviewerId: string, practitioners: Array<{ id: number; fullName: string }>) => {
      const reviewer = practitioners.find(p => p.id.toString() === reviewerId);
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? {
                ...review,
                reviewerId,
                reviewerName: reviewer?.fullName || '',
              }
            : review,
        ),
      );
    },
    [setReviews],
  );

  const addIssue = useCallback(
    (reviewId: string) => {
      const review = reviews.find(r => r.id === reviewId);
      // Mark as version issue if versionId exists or if review is from backend
      const isSavedReview = review?.id?.startsWith('version-review-');
      const isVersionIssue = isSavedReview || !!versionId;
      const newIssue: IssueForm = {
        id: `issue-${Date.now()}`,
        errorType: '',
        issueRelatedTo: '',
        issueDescription: '',
        _isVersionIssue: isVersionIssue,
      };

      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? {
                ...r,
                issues: [...r.issues, newIssue],
              }
            : r,
        ),
      );
      setActiveIssueForms(prev => [...prev, { reviewId, issueId: newIssue.id }]);
    },
    [reviews, versionId, setReviews, setActiveIssueForms],
  );

  const handleSaveIssue = useCallback(
    async (reviewId: string, issueId: string, values: { errorType: string; issueRelatedTo: string; issueDescription: string }) => {
      const review = reviews.find(r => r.id === reviewId);
      if (!review || !noteId || !loggedInUserId) return;

      // Check ownership - only allow saving if it's the user's own review
      if (Number(review.reviewerId) !== loggedInUserId) {
        return;
      }

      try {
        setSavingIssueId(issueId);

        const issue = review?.issues?.find(i => i.id === issueId);
        const smeIssueId = issue?._smeIssueId;
        const { errorTypes, issueRelatedTo, issueDescriptions } = getState().smeConfig;
        const errorTypeId = getErrorTypeId(values.errorType, errorTypes);
        const issuesRelatedToId = getIssuesRelatedToId(values.issueRelatedTo, issueRelatedTo);
        const descriptionId = getDescriptionId(values.issueDescription, issueDescriptions);

        // Determine if the version is current (latest version)
        const isCurrentVersion = (() => {
          if (!versionId || !webhookVersions.length) return false;
          const sorted = [...webhookVersions].sort((a, b) => b.id - a.id);
          return sorted[0]?.id === versionId;
        })();

        const payload: SMEIssuePayload = {
          note_id: noteId,
          reviewer_id: loggedInUserId,
          error_type_id: errorTypeId,
          issues_related_to_id: issuesRelatedToId,
          version_id: versionId || null,
          issue_description_id: descriptionId,
          ai_status: aiStatusId,
          priority: priorityId,
          practitioner_id: practitionerId,
          is_current_version: isCurrentVersion,
        };
        // If versionId exists, treat as version issue (create/update via API)
        if (versionId && smeIssueId) {
          const response = await updateSMEIssue(smeIssueId, payload);
          if (!response?.id) return;

          const issueData: IssueForm = {
            id: issueId,
            ...values,
            _smeIssueId: smeIssueId,
            _isVersionIssue: true,
          };

          setReviews(prev =>
            prev.map(r =>
              r.id === reviewId
                ? {
                    ...r,
                    issues: r.issues.map(i => (i.id === issueId ? issueData : i)),
                  }
                : r,
            ),
          );
          setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));

          // Sync noteDetail so Therapy Session Summary dropdown disables the new option immediately
          if (onSMEIssueUpdated && versionId) {
            onSMEIssueUpdated(versionId, smeIssueId, {
              issueDescriptionId: descriptionId ?? undefined,
              issueDescriptionText: values.issueDescription,
            });
          }
        } else if (versionId && !smeIssueId) {
          const response = await createSMEIssue(payload);
          if (!response?.id) return;

          const issueData: IssueForm = {
            id: issueId,
            ...values,
            _smeIssueId: response?.id || issueId,
            _isVersionIssue: true,
          };

          setReviews(prev =>
            prev.map(r =>
              r.id === reviewId
                ? {
                    ...r,
                    issues: r.issues.some(i => i.id === issueId)
                      ? r.issues.map(i => (i.id === issueId ? issueData : i))
                      : [...r.issues, issueData],
                  }
                : r,
            ),
          );
          setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));
        } else {
          // Local issue - save to state only
          const issueData: IssueForm = {
            id: issueId,
            ...values,
          };

          setReviews(prev =>
            prev.map(r =>
              r.id === reviewId
                ? {
                    ...r,
                    issues: r.issues.some(i => i.id === issueId)
                      ? r.issues.map(i => (i.id === issueId ? issueData : i))
                      : [...r.issues, issueData],
                  }
                : r,
            ),
          );
          setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));
        }
      } finally {
        setSavingIssueId(null);
      }
    },
    [
      reviews,
      noteId,
      loggedInUserId,
      setSavingIssueId,
      versionId,
      aiStatusId,
      priorityId,
      practitionerId,
      webhookVersions,
      setReviews,
      setActiveIssueForms,
      onSMEIssueUpdated,
    ],
  );

  const handleDeleteIssue = useCallback(
    async (reviewId: string, issueId: string) => {
      if (!loggedInUserId) return;

      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      // Check ownership - only allow deleting if it's the user's own review
      if (Number(review.reviewerId) !== loggedInUserId) {
        return;
      }

      const issue = review?.issues.find(i => i.id === issueId);
      const isVersionIssue = issue?._isVersionIssue || false;
      const smeIssueId = issue?._smeIssueId;

      if (isVersionIssue && smeIssueId) {
        await deleteSMEIssue(smeIssueId);
      }

      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? {
                ...r,
                issues: r.issues.filter(i => i.id !== issueId),
              }
            : r,
        ),
      );
      setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));
    },
    [reviews, setReviews, setActiveIssueForms, loggedInUserId],
  );

  const handleEditIssue = useCallback(
    (reviewId: string, savedIssue: IssueForm) => {
      if (!loggedInUserId) return;

      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      // Check ownership - only allow editing if it's the user's own review
      if (Number(review.reviewerId) !== loggedInUserId) {
        return;
      }

      const isAlreadyEditing = activeIssueForms.some(form => form.reviewId === reviewId && form.issueId === savedIssue.id);
      if (isAlreadyEditing) return;
      setActiveIssueForms(prev => [...prev, { reviewId, issueId: savedIssue.id }]);
    },
    [activeIssueForms, setActiveIssueForms, reviews, loggedInUserId],
  );

  const handleCancelEdit = useCallback(
    (reviewId: string, issueId: string) => {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return;

      const issue = review.issues.find(i => i.id === issueId);
      if (!issue) {
        // Issue not found, just remove from active forms
        setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));
        return;
      }

      // Check if it's a new issue (not saved to backend yet)
      // A new issue has no _smeIssueId (hasn't been saved to backend)
      // If _smeIssueId exists, it means the issue was saved to the backend and we should keep it
      const isNewIssue = !issue._smeIssueId;

      // Remove from active issue forms first
      setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));

      // If it's a new issue (not saved yet), remove it from the issues array completely
      if (isNewIssue) {
        setReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? {
                  ...r,
                  issues: r.issues.filter(i => i.id !== issueId),
                }
              : r,
          ),
        );
      }
      // If it's an existing issue being edited, it will automatically be restored to savedIssues
      // because it's removed from activeIssueForms, so no action needed
    },
    [reviews, setActiveIssueForms, setReviews],
  );

  return {
    addReview,
    handleReviewerChange,
    addIssue,
    handleSaveIssue,
    handleDeleteIssue,
    handleEditIssue,
    handleCancelEdit,
  };
};
