import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bug } from 'lucide-react';
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

interface SMEReviewProps {
  auditScore: number;
  versionId?: number | null;
  webhookVersions?: WebhookVersion[];
}

const SMEReview = ({ auditScore, versionId, webhookVersions = [] }: SMEReviewProps) => {
  const { id: noteId } = useParams<{ id: string }>();
  const { practitioners } = useAppSelector(state => state.filterOptions);

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIssueForms, setActiveIssueForms] = useState<ActiveIssueForm[]>([]);
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleteIssueDialogOpen, setIsDeleteIssueDialogOpen] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<{ reviewId: string; issueId: string } | null>(null);

  // Convert version issues to reviews
  useVersionIssues({
    currentVersion,
    practitioners,
    reviews,
    setReviews,
  });

  // Review management hooks
  const {
    addReview,
    handleReviewerChange: handleReviewerChangeBase,
    addIssue,
    handleSaveIssue,
    handleDeleteIssue,
    handleEditIssue,
    handleCancelEdit,
  } = useReviews({
    noteId,
    versionId,
    reviews,
    setReviews,
    activeIssueForms,
    setActiveIssueForms,
    setSavingIssueId,
  });

  const handleReviewerChange = (reviewId: string, reviewerId: string) => {
    handleReviewerChangeBase(reviewId, reviewerId, practitioners);
  };

  // Delete handlers
  const handleDeleteReviewClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteReviewDialogOpen(true);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete || !noteId) return;

    const review = reviews.find(r => r.id === reviewToDelete);
    if (!review || !review.reviewerId) {
      setIsDeleteReviewDialogOpen(false);
      setReviewToDelete(null);
      return;
    }

    setIsDeletingReview(true);

    try {
      const reviewerIdNum = review.reviewerId ? Number(review.reviewerId) : null;
      const response = await deleteSMEReview(noteId, versionId ?? null, reviewerIdNum);
      if (!response) return;

      // Remove from local state on success
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
      setActiveIssueForms(prev => prev.filter(form => form.reviewId !== reviewToDelete));
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
    // Just remove from local state for new reviews (no API call needed)
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setActiveIssueForms(prev => prev.filter(form => form.reviewId !== reviewId));
  };

  const handleDeleteIssueClick = (reviewId: string, issueId: string) => {
    setIssueToDelete({ reviewId, issueId });
    setIsDeleteIssueDialogOpen(true);
  };

  const handleConfirmDeleteIssue = async () => {
    if (!issueToDelete) return;
    setIsDeletingIssue(true);
    await handleDeleteIssue(issueToDelete.reviewId, issueToDelete.issueId);
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
          <div className="flex items-center gap-2">
            <Button onClick={addReview} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </div>
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
        {reviews.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No reviews added yet. Click "Add Review" to create one.</p>
        )}

        {reviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            auditScore={auditScore}
            practitioners={practitioners}
            activeIssueForms={activeIssueForms}
            savingIssueId={savingIssueId}
            onReviewerChange={handleReviewerChange}
            onAddIssue={addIssue}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssueClick}
            onSaveIssue={handleSaveIssue}
            onCancelEdit={handleCancelEdit}
            onDeleteReview={handleDeleteReviewClick}
            onRemoveReview={handleRemoveReview}
          />
        ))}
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
