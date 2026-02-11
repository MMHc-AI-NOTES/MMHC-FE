import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/store';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { WebhookVersion } from '@/types/notes';
import ReviewCard from './components/ReviewCard';
import { useVersionIssues } from './components/useVersionIssues';
import { useReviews } from './components/useReviews';
import { Review, ActiveIssueForm } from './components/types';
import { deleteSMEReview } from './singleNoteApiCalls';
// import { UserRoleEnum } from '@/constants/common';

interface SMEReviewProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  auditScore: number;
  versionId?: number | null;
  webhookVersions?: WebhookVersion[];
  aiStatusId: number;
  priorityId: number;
  practitionerId: number;
  reviewerId?: number | null;
  isManagerReviewing?: boolean;
  onSMEIssueDeleted?: (versionId: number, smeIssueId: number) => void;
  onSMEReviewDeleted?: (versionId: number | null, reviewerId: number) => void;
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string },
  ) => void;
}

const SMEReview = ({
  reviews,
  setReviews,
  auditScore,
  versionId,
  webhookVersions = [],
  aiStatusId,
  priorityId,
  practitionerId,
  reviewerId,
  isManagerReviewing = false,
  onSMEIssueDeleted,
  onSMEReviewDeleted,
  onSMEIssueUpdated,
}: SMEReviewProps) => {
  const { id: noteId } = useParams<{ id: string }>();
  const user = useAppSelector(state => state.auth.user);
  const loggedInUserId = user?.id ?? null;
  // const isSMEReviewer = user?.type === UserRoleEnum.sme_reviewer;

  // Get current version
  const currentVersion = useMemo(() => {
    if (!versionId || !webhookVersions.length) return null;
    return webhookVersions.find(v => v.id === versionId) || null;
  }, [versionId, webhookVersions]);

  const versionNumber = useMemo(() => {
    if (!webhookVersions.length || !versionId) return null;
    const sorted = [...webhookVersions].sort((a, b) => b.id - a.id);
    const index = sorted.findIndex(v => v.id === versionId);
    if (index === 0) return 'Current';
    return sorted.length - index;
  }, [webhookVersions, versionId]);

  // State management
  const [activeIssueForms, setActiveIssueForms] = useState<ActiveIssueForm[]>([]);
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleteIssueDialogOpen, setIsDeleteIssueDialogOpen] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<{ reviewId: string; issueId: string } | null>(null);
  const [deletedReviewIds, setDeletedReviewIds] = useState<Set<string>>(new Set());

  // Filter reviews by current version when versionId changes
  // Note: We preserve all new reviews in state, only filter version reviews
  useEffect(() => {
    if (versionId !== undefined) {
      setReviews(prev => {
        // Keep all new reviews (they'll be filtered when displaying)
        // Only filter version reviews (they're managed by useVersionIssues)
        const filtered = prev.filter(review => {
          // Keep all new reviews - don't filter them out
          if (review.id.startsWith('new-review-')) {
            return true;
          }
          // Version reviews are managed by useVersionIssues, so keep them
          if (review.id.startsWith('version-review-')) {
            return true;
          }
          return true;
        });

        return filtered;
      });
    }
  }, [versionId, setReviews]);

  // Convert version issues to reviews
  useVersionIssues({
    currentVersion,
    reviews,
    setReviews,
    deletedReviewIds,
    versionId,
  });

  // Review management hooks
  const { handleSaveIssue, handleDeleteIssue, handleCancelEdit } = useReviews({
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
  });

  // Check if user already has a review in the current selected version
  // Only check when versionId exists (for version-specific reviews)
  // const hasUserReviewInVersion = useMemo(() => {
  //   if (!loggedInUserId || !versionId) return false;
  //   // Filter reviews to only check those belonging to current version
  //   const filteredReviews = reviews.filter(review => {
  //     if (review.id.startsWith('version-review-')) {
  //       return true;
  //     }
  //     if (review.id.startsWith('new-review-')) {
  //       return review._versionId === versionId;
  //     }
  //     return true;
  //   });
  //   return filteredReviews.some(review => {
  //     const reviewerIdNum = review.reviewerId ? Number(review.reviewerId) : null;
  //     return reviewerIdNum === loggedInUserId;
  //   });
  // }, [reviews, loggedInUserId, versionId]);

  // Delete handlers
  const handleDeleteReviewClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteReviewDialogOpen(true);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete || !noteId || !loggedInUserId) return;

    const review = reviews.find(r => r.id === reviewToDelete);
    if (!review || !review.reviewerId) {
      setIsDeleteReviewDialogOpen(false);
      setReviewToDelete(null);
      return;
    }

    // Check ownership - only allow deleting if it's the user's own review
    if (Number(review.reviewerId) !== loggedInUserId) {
      setIsDeleteReviewDialogOpen(false);
      setReviewToDelete(null);
      return;
    }

    setIsDeletingReview(true);

    try {
      const reviewerIdNum = review.reviewerId ? Number(review.reviewerId) : null;
      const response = await deleteSMEReview(noteId, versionId ?? null, reviewerIdNum);
      if (!response) return;

      // Track deleted review ID with version to prevent it from reappearing
      // Use a version-specific key to avoid affecting other versions
      const deletedKey = versionId ? `version-review-${review.reviewerId}-v${versionId}` : reviewToDelete;
      setDeletedReviewIds(prev => new Set([...prev, deletedKey]));

      // Remove from local state on success
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
      setActiveIssueForms(prev => prev.filter(form => form.reviewId !== reviewToDelete));

      // Sync Therapy Session Summary counts (remove this reviewer's issues from webhookVersions)
      if (reviewerIdNum != null && onSMEReviewDeleted) {
        onSMEReviewDeleted(versionId ?? null, reviewerIdNum);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      // Error is already handled by the API function (toast message)
    } finally {
      setIsDeletingReview(false);
      setIsDeleteReviewDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleRemoveReview = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    // Just remove from local state for new reviews (no API call needed)
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setActiveIssueForms(prev => prev.filter(form => form.reviewId !== reviewId));
    // Sync Therapy Session Summary counts for optimistically added issues
    if (review?.reviewerId != null && onSMEReviewDeleted && versionId != null) {
      onSMEReviewDeleted(versionId, Number(review.reviewerId));
    }
  };

  const handleDeleteIssueClick = (reviewId: string, issueId: string) => {
    setIssueToDelete({ reviewId, issueId });
    setIsDeleteIssueDialogOpen(true);
  };

  const handleConfirmDeleteIssue = async () => {
    if (!issueToDelete) return;

    const review = reviews.find(r => r.id === issueToDelete.reviewId);
    const issue = review?.issues.find(i => i.id === issueToDelete.issueId);
    const smeIssueId = issue?._smeIssueId;

    setIsDeletingIssue(true);
    await handleDeleteIssue(issueToDelete.reviewId, issueToDelete.issueId);

    // Sync Therapy Session Summary count (remove this issue from webhookVersions)
    if (smeIssueId != null && versionId != null && onSMEIssueDeleted) {
      onSMEIssueDeleted(versionId, smeIssueId);
    }

    setIsDeletingIssue(false);
    setIsDeleteIssueDialogOpen(false);
    setIssueToDelete(null);
  };

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center justify-between gap-2 text-base font-semibold">
          <div className="flex items-center gap-2">
            <Bug />
            SME Review
          </div>
          {/* {isSMEReviewer && !hasUserReviewInVersion && (
            <div className="flex items-center gap-2">
              <Button onClick={addReview} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
                <Plus className="h-4 w-4" />
                Add Review
              </Button>
            </div>
          )} */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {versionId && (
          <div>
            <span className="text-primary font-medium">Version:</span>
            <Badge className="bg-gradient-light text-primary ml-2 rounded-sm px-2 py-1 text-xs font-semibold">
              {versionNumber === 'Current' ? 'Current' : `Version ${versionNumber}`}
            </Badge>
          </div>
        )}
        {(() => {
          // Filter reviews to only show those belonging to current version
          let filteredReviews = reviews.filter(review => {
            // Always show version reviews (they're already filtered by useVersionIssues)
            if (review.id.startsWith('version-review-')) {
              return true;
            }
            // For new reviews, only show if they belong to current version
            if (review.id.startsWith('new-review-')) {
              return review._versionId === versionId;
            }
            return true;
          });

          // If manager is reviewing, filter by reviewer_id
          if (isManagerReviewing && reviewerId !== null && reviewerId !== undefined) {
            filteredReviews = filteredReviews.filter(review => {
              const reviewReviewerId = review.reviewerId ? Number(review.reviewerId) : null;
              return reviewReviewerId === reviewerId;
            });
          }

          if (filteredReviews.length === 0) {
            return <p className="py-4 text-center text-sm text-gray-500">No reviews added yet. Click "Add Review" to create one.</p>;
          }

          return filteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              auditScore={auditScore}
              activeIssueForms={activeIssueForms}
              savingIssueId={savingIssueId}
              noteId={noteId}
              versionId={versionId}
              practitionerId={practitionerId}
              priorityId={priorityId}
              onDeleteIssue={handleDeleteIssueClick}
              onSaveIssue={handleSaveIssue}
              onCancelEdit={handleCancelEdit}
              onDeleteReview={handleDeleteReviewClick}
              onRemoveReview={handleRemoveReview}
            />
          ));
        })()}
      </CardContent>

      {/* Delete Review Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteReviewDialogOpen}
        isLoading={isDeletingReview}
        onOpenChange={open => {
          setIsDeleteReviewDialogOpen(open);
          if (!open) {
            setReviewToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteReview}
        title="Delete Review"
        description={
          reviewToDelete
            ? `Are you sure you want to delete this review? This will also delete all associated issues. This action cannot be undone.`
            : 'Are you sure you want to delete this review? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />

      {/* Delete Issue Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteIssueDialogOpen}
        isLoading={isDeletingIssue}
        onOpenChange={open => {
          setIsDeleteIssueDialogOpen(open);
          if (!open) {
            setIssueToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteIssue}
        title="Delete Issue"
        description="Are you sure you want to delete this issue? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </Card>
  );
};

export default SMEReview;
