import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import { Review, ActiveIssueForm, type IssueForm } from './components/types';
import { deleteSMEReview, markNoteForReview } from './singleNoteApiCalls';
// import { UserRoleEnum } from '@/constants/common';

const MARKED_FOR_REVIEW_STORAGE_PREFIX = 'mmhc_note_review_marked';

function getMarkedForReviewStorageKey(noteId: string, reviewerId: string): string {
  return `${MARKED_FOR_REVIEW_STORAGE_PREFIX}_${noteId}_${reviewerId}`;
}

/** Returns true/false from storage; undefined when key not set (use API then). */
function getMarkedFromStorage(noteId: string, reviewerId: string): boolean | undefined {
  if (typeof window === 'undefined' || !window.localStorage) return undefined;
  try {
    const raw = window.localStorage.getItem(getMarkedForReviewStorageKey(noteId, reviewerId));
    if (raw === null) return undefined;
    return raw === '1';
  } catch {
    return undefined;
  }
}

function setMarkedInStorage(noteId: string, reviewerId: string, marked: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = getMarkedForReviewStorageKey(noteId, reviewerId);
    window.localStorage.setItem(key, marked ? '1' : '0');
  } catch {
    // ignore
  }
}

export type ReviewMarkState = {
  marked: boolean;
  issuesChangedSinceMark?: boolean;
  /** Snapshot when we marked or first loaded (fetchNoteDetail) */ issuesBaseline?: string;
};

interface SMEReviewProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  auditScore: number;
  versionId?: number | null;
  webhookVersions?: WebhookVersion[];
  /** Reviewer id -> marked (from note detail); used to seed mark state on load */
  noteReviewMarks?: Record<string, boolean>;
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
  /** Ref SingleNoteAudit sets so we can notify when an issue is created from summary cards */
  onReviewerIssuesChangedRef?: React.MutableRefObject<((reviewerId: number) => void) | null>;
}

const SMEReview = ({
  reviews,
  setReviews,
  auditScore,
  versionId,
  webhookVersions = [],
  noteReviewMarks,
  aiStatusId,
  priorityId,
  practitionerId,
  reviewerId,
  isManagerReviewing = false,
  onSMEIssueDeleted,
  onSMEReviewDeleted,
  onSMEIssueUpdated,
  onReviewerIssuesChangedRef,
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
  const [reviewMarkState, setReviewMarkState] = useState<Record<string, ReviewMarkState>>({});
  const [markingReviewId, setMarkingReviewId] = useState<string | null>(null);
  const lastSeededNoteIdRef = useRef<string | null>(null);

  // Stable signature for comparing issues (new/updated/removed)
  const getIssuesSignature = useCallback((issues: IssueForm[]): string => {
    const normalized = [...issues]
      .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
      .map(i => `${i.id}|${i.errorType}|${i.issueRelatedTo}|${i.issueDescription ?? ''}|${i.comment ?? ''}|${i._smeIssueId ?? ''}`)
      .join(';');
    return normalized;
  }, []);

  // Seed once per note: button state comes from localStorage only (persisted). Use API only when storage has no value.
  useEffect(() => {
    if (!noteId) return;
    const ownReviews = reviews.filter(r => r.reviewerId && Number(r.reviewerId) === loggedInUserId);
    if (ownReviews.length === 0) return;
    if (lastSeededNoteIdRef.current === noteId) return;
    lastSeededNoteIdRef.current = noteId;
    setReviewMarkState(prev => {
      const next = { ...prev };
      for (const review of ownReviews) {
        const fromStorage = getMarkedFromStorage(noteId, review.reviewerId);
        const marked = fromStorage !== undefined ? fromStorage : (noteReviewMarks?.[review.reviewerId] ?? false);
        const baseline = getIssuesSignature(review.issues);
        next[review.id] = {
          ...(prev[review.id] ?? { marked: false }),
          marked,
          issuesBaseline: baseline,
        };
        if (fromStorage === undefined && marked) setMarkedInStorage(noteId, review.reviewerId, true);
      }
      return next;
    });
  }, [noteId, noteReviewMarks, reviews, loggedInUserId, getIssuesSignature]);

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

  const handleMarkForReview = useCallback(
    async (reviewId: string) => {
      const review = reviews.find(r => r.id === reviewId);
      if (!noteId || !review?.reviewerId) return;
      setMarkingReviewId(reviewId);
      try {
        const result = await markNoteForReview({ note_id: noteId, reviewer_id: review.reviewerId, marked: true });
        if (result) {
          const baseline = getIssuesSignature(review.issues);
          setReviewMarkState(prev => ({
            ...prev,
            [reviewId]: { ...(prev[reviewId] ?? { marked: false }), marked: true, issuesBaseline: baseline },
          }));
          setMarkedInStorage(noteId, review.reviewerId, true);
        }
      } finally {
        setMarkingReviewId(null);
      }
    },
    [noteId, reviews, getIssuesSignature],
  );

  // Derive "issues changed" from baseline: any new issue or updated issue enables the button (higher priority than id matched)
  const getHasIssuesChangedSinceMark = useCallback(
    (review: Review): boolean => {
      const state = reviewMarkState[review.id];
      const baseline = state?.issuesBaseline;
      if (baseline == null) return false;
      return getIssuesSignature(review.issues) !== baseline;
    },
    [reviewMarkState, getIssuesSignature],
  );

  // When any issue is created/updated/deleted: set persisted state to false (button enabled) and update baseline so we don't re-trigger (avoids infinite loop)
  useEffect(() => {
    if (!noteId) return;
    const toClear: { id: string; baseline: string }[] = [];
    for (const review of reviews) {
      if (review.reviewerId && Number(review.reviewerId) !== loggedInUserId) continue;
      const changed = getHasIssuesChangedSinceMark(review);
      if (changed) {
        setMarkedInStorage(noteId, review.reviewerId, false);
        toClear.push({ id: review.id, baseline: getIssuesSignature(review.issues) });
      }
    }
    if (toClear.length > 0) {
      setReviewMarkState(prev => {
        const next = { ...prev };
        for (const { id, baseline } of toClear) {
          next[id] = { ...(next[id] ?? { marked: false }), marked: false, issuesBaseline: baseline };
        }
        return next;
      });
    }
  }, [noteId, reviews, loggedInUserId, getHasIssuesChangedSinceMark, getIssuesSignature]);

  // Register callback so parent can notify when an issue is created from summary cards (no-op now; we derive from baseline)
  useEffect(() => {
    if (!onReviewerIssuesChangedRef) return;
    onReviewerIssuesChangedRef.current = () => {};
    return () => {
      onReviewerIssuesChangedRef.current = null;
    };
  }, [onReviewerIssuesChangedRef]);

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
              isMarkedForReview={reviewMarkState[review.id]?.marked ?? false}
              hasIssuesChangedSinceMark={getHasIssuesChangedSinceMark(review)}
              onMarkForReview={() => handleMarkForReview(review.id)}
              isMarkingForReview={markingReviewId === review.id}
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
