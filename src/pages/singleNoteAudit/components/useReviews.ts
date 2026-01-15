import { useCallback } from 'react';
import { Review, IssueForm, ActiveIssueForm } from './types';
import { createSMEIssue, updateSMEIssue, deleteSMEIssue, SMEIssuePayload } from '../singleNoteApiCalls';
import { getErrorTypeId, getIssuesRelatedToId, getDescriptionId } from './reviewUtils';

interface UseReviewsProps {
  noteId: string | undefined;
  versionId: number | null | undefined;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  activeIssueForms: ActiveIssueForm[];
  setActiveIssueForms: React.Dispatch<React.SetStateAction<ActiveIssueForm[]>>;
  setSavingIssueId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useReviews = ({
  noteId,
  versionId,
  reviews,
  setReviews,
  activeIssueForms,
  setActiveIssueForms,
  setSavingIssueId,
}: UseReviewsProps) => {
  const addReview = useCallback(() => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      reviewerId: '',
      reviewerName: '',
      issues: [],
    };
    setReviews(prev => [...prev, newReview]);
  }, [setReviews]);

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
      // Mark as version issue if versionId exists (regardless of review type)
      const isVersionReview = review?.id?.startsWith('version-review-') || !!versionId;
      const newIssue: IssueForm = {
        id: `issue-${Date.now()}`,
        errorType: '',
        issueRelatedTo: '',
        issueDescription: '',
        _isVersionIssue: isVersionReview,
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
      if (!review || !noteId) return;

      try {
        setSavingIssueId(issueId);

        const issue = review?.issues?.find(i => i.id === issueId);
        const smeIssueId = issue?._smeIssueId;

        // If versionId exists, treat as version issue (create/update via API)
        if (versionId && smeIssueId) {
          // Update existing version issue
          const errorTypeId = getErrorTypeId(values.errorType);
          const issuesRelatedToId = getIssuesRelatedToId(values.issueRelatedTo);
          const descriptionId = getDescriptionId(values.issueDescription);

          const payload: SMEIssuePayload = {
            note_id: noteId,
            reviewer_id: Number(review?.reviewerId || ''),
            error_type: errorTypeId,
            issues_related_to: issuesRelatedToId,
            version_id: versionId,
            description: descriptionId,
          };

          await updateSMEIssue(smeIssueId, payload);

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
        } else if (versionId && !smeIssueId) {
          // Create new version issue (when versionId exists and no smeIssueId)
          const errorTypeId = getErrorTypeId(values.errorType);
          const issuesRelatedToId = getIssuesRelatedToId(values.issueRelatedTo);
          const descriptionId = getDescriptionId(values.issueDescription);

          const payload: SMEIssuePayload = {
            note_id: noteId,
            reviewer_id: Number(review?.reviewerId || ''),
            error_type: errorTypeId,
            issues_related_to: issuesRelatedToId,
            version_id: versionId ?? 0,
            description: descriptionId,
          };

          const response = await createSMEIssue(payload);

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
    [reviews, noteId, versionId, setReviews, setActiveIssueForms, setSavingIssueId],
  );

  const handleDeleteIssue = useCallback(
    async (reviewId: string, issueId: string) => {
      const review = reviews.find(r => r.id === reviewId);
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
    [reviews, setReviews, setActiveIssueForms],
  );

  const handleEditIssue = useCallback(
    (reviewId: string, savedIssue: IssueForm) => {
      const isAlreadyEditing = activeIssueForms.some(form => form.reviewId === reviewId && form.issueId === savedIssue.id);
      if (isAlreadyEditing) return;
      setActiveIssueForms(prev => [...prev, { reviewId, issueId: savedIssue.id }]);
    },
    [activeIssueForms, setActiveIssueForms],
  );

  const handleCancelEdit = useCallback(
    (reviewId: string, issueId: string) => {
      setActiveIssueForms(prev => prev.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));
    },
    [setActiveIssueForms],
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
