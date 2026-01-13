import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bug, Pencil, X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import IssueFormCard, { IssueFormValues } from './IssueFormCard';
// import { submitSMEIssue, SMEIssuePayload, submitSMEReviews, SMEReviewsPayload } from './singleNoteApiCalls';
import { useParams } from 'react-router-dom';
import { showToast } from '@/lib/toast';
import { useAppSelector } from '@/store/store';
import { getMergedErrorTypes, getMergedIssueRelatedTo } from '@/constants/common';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/shared/ConfirmationDialog';

interface IssueForm extends Omit<IssueFormValues, 'reviewerName'> {
  id: string;
}

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  issues: IssueForm[];
}

const SMEReview = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const { practitioners } = useAppSelector(state => state.filterOptions);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIssueForms, setActiveIssueForms] = useState<{ reviewId: string; issueId: string }[]>([]);
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleteIssueDialogOpen, setIsDeleteIssueDialogOpen] = useState(false);
  const [isDeletingIssue, setIsDeletingIssue] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<{ reviewId: string; issueId: string } | null>(null);

  const addReview = () => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      reviewerId: '',
      reviewerName: '',
      issues: [],
    };
    setReviews([...reviews, newReview]);
  };

  const handleDeleteReviewClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteReviewDialogOpen(true);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    setIsDeletingReview(true);
    try {
      setReviews(reviews.filter(review => review.id !== reviewToDelete));
      setActiveIssueForms(activeIssueForms.filter(form => form.reviewId !== reviewToDelete));
      setIsDeletingReview(false);
      setIsDeleteReviewDialogOpen(false);
      setReviewToDelete(null);
      showToast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast.error('Failed to delete review');
      setIsDeletingReview(false);
    }
  };

  const handleReviewerChange = (reviewId: string, reviewerId: string) => {
    const reviewer = practitioners.find(p => p.id.toString() === reviewerId);
    setReviews(
      reviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              reviewerId,
              reviewerName: reviewer?.fullName || '',
            }
          : review,
      ),
    );
  };

  const addIssue = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review || !review.reviewerId) {
      showToast.error('Please select a reviewer first');
      return;
    }

    const newIssue: IssueForm = {
      id: `issue-${Date.now()}`,
      errorType: '',
      issueRelatedTo: '',
      issueDescription: '',
    };

    setReviews(
      reviews.map(r =>
        r.id === reviewId
          ? {
              ...r,
              issues: [...r.issues, newIssue],
            }
          : r,
      ),
    );
    setActiveIssueForms([...activeIssueForms, { reviewId, issueId: newIssue.id }]);
  };

  const handleDeleteIssueClick = (reviewId: string, issueId: string) => {
    setIssueToDelete({ reviewId, issueId });
    setIsDeleteIssueDialogOpen(true);
  };

  const handleConfirmDeleteIssue = async () => {
    if (!issueToDelete) return;

    setIsDeletingIssue(true);
    try {
      setReviews(
        reviews.map(review =>
          review.id === issueToDelete.reviewId
            ? {
                ...review,
                issues: review.issues.filter(issue => issue.id !== issueToDelete.issueId),
              }
            : review,
        ),
      );
      setActiveIssueForms(
        activeIssueForms.filter(form => !(form.reviewId === issueToDelete.reviewId && form.issueId === issueToDelete.issueId)),
      );
      setIsDeletingIssue(false);
      setIsDeleteIssueDialogOpen(false);
      setIssueToDelete(null);
      showToast.success('Issue deleted successfully');
    } catch (error) {
      console.error('Error deleting issue:', error);
      showToast.error('Failed to delete issue');
      setIsDeletingIssue(false);
    }
  };

  const handleEditIssue = (reviewId: string, savedIssue: IssueForm) => {
    const isAlreadyEditing = activeIssueForms.some(form => form.reviewId === reviewId && form.issueId === savedIssue.id);
    if (isAlreadyEditing) {
      return;
    }

    setActiveIssueForms([...activeIssueForms, { reviewId, issueId: savedIssue.id }]);
  };

  const handleSaveIssue = async (reviewId: string, issueId: string, values: Omit<IssueFormValues, 'reviewerName'>) => {
    if (!noteId) {
      showToast.error('Note ID is missing. Cannot save issue.');
      return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (!review || !review.reviewerId) {
      showToast.error('Reviewer is not selected');
      return;
    }

    try {
      setSavingIssueId(issueId);

      const issueData: IssueForm = {
        id: issueId,
        ...values,
      };

      // TODO: Uncomment when API is ready
      // const payload: SMEIssuePayload = {
      //   note_id: noteId,
      //   reviewer_name: review.reviewerId,
      //   error_type: values.errorType,
      //   issue_related_to: values.issueRelatedTo,
      //   issue_description: values.issueDescription,
      //   points: mergedErrorTypes.find(type => type.value === values.errorType)?.points || 0,
      // };
      // await submitSMEIssue(payload);

      // Update the review with saved issue
      setReviews(
        reviews.map(r =>
          r.id === reviewId
            ? {
                ...r,
                issues: r.issues.some(issue => issue.id === issueId)
                  ? r.issues.map(issue => (issue.id === issueId ? issueData : issue))
                  : [...r.issues, issueData],
              }
            : r,
        ),
      );

      // Remove from active forms
      setActiveIssueForms(activeIssueForms.filter(form => !(form.reviewId === reviewId && form.issueId === issueId)));

      showToast.success('Issue saved successfully!');
    } catch (error) {
      console.error('Error saving issue:', error);
      showToast.error('Failed to save issue. Please try again.');
    } finally {
      setSavingIssueId(null);
    }
  };

  // const handleSaveReviews = async () => {
  //   if (!noteId) {
  //     showToast.error('Note ID is missing. Cannot save reviews.');
  //     return;
  //   }

  //   // Validate that all reviews have a reviewer selected
  //   const incompleteReviews = reviews.filter(review => !review.reviewerId);
  //   if (incompleteReviews.length > 0) {
  //     showToast.error('Please select a reviewer for all reviews before saving.');
  //     return;
  //   }

  //   // Validate that all reviews have at least one saved issue
  //   const reviewsWithoutIssues = reviews.filter(review => {
  //     const savedIssues = review.issues.filter(
  //       issue => !activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  //     );
  //     return savedIssues.length === 0;
  //   });

  //   if (reviewsWithoutIssues.length > 0) {
  //     showToast.error('Please add and save at least one issue for each review before saving.');
  //     return;
  //   }

  //   // Check if there are any active (unsaved) issue forms
  //   if (activeIssueForms.length > 0) {
  //     showToast.error('Please save all issues before saving reviews.');
  //     return;
  //   }

  //   try {
  //     setIsSavingReviews(true);

  //     const mergedErrorTypes = getMergedErrorTypes();

  //     // Prepare payload with all reviews and their issues
  //     const reviewsPayload = reviews.map(review => {
  //       const savedIssues = review.issues.filter(
  //         issue => !activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  //       );

  //       return {
  //         reviewer_id: review.reviewerId,
  //         reviewer_name: review.reviewerName,
  //         issues: savedIssues.map(issue => ({
  //           error_type: issue.errorType,
  //           issue_related_to: issue.issueRelatedTo,
  //           issue_description: issue.issueDescription,
  //           points: mergedErrorTypes.find(type => type.value === issue.errorType)?.points || 0,
  //         })),
  //       };
  //     });

  //     // TODO: Uncomment when API is ready
  //     // const payload = {
  //     //   note_id: noteId,
  //     //   reviews: reviewsPayload,
  //     // };
  //     // await submitSMEReviews(payload);

  //     // For now, log the payload structure
  //     console.log('SME Reviews Payload:', {
  //       note_id: noteId,
  //       reviews: reviewsPayload,
  //     });

  //     showToast.success('Reviews saved successfully!');
  //   } catch (error) {
  //     console.error('Error saving reviews:', error);
  //     showToast.error('Failed to save reviews. Please try again.');
  //   } finally {
  //     setIsSavingReviews(false);
  //   }
  // };

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
        {reviews.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No reviews added yet. Click "Add Review" to create one.</p>
        )}

        {reviews.map((review, reviewIndex) => {
          const savedIssues = review.issues.filter(
            issue => !activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
          );
          const editingIssues = review.issues.filter(issue =>
            activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
          );

          return (
            <Card key={review.id} className="gap-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary text-base font-semibold">Review {reviewIndex + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReviewClick(review.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reviewer Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Select a reviewer <span className="text-red-500">*</span>
                  </Label>
                  <Select value={review.reviewerId} onValueChange={value => handleReviewerChange(review.id, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {practitioners.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Issue Button */}
                {review.reviewerId && (
                  <div className="flex justify-end">
                    <Button onClick={() => addIssue(review.id)} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
                      <Plus className="h-4 w-4" />
                      Add Issue
                    </Button>
                  </div>
                )}

                {/* Saved Issues List */}
                {savedIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Issues</h3>
                    {(() => {
                      const mergedErrorTypes = getMergedErrorTypes();
                      const mergedIssueRelatedTo = getMergedIssueRelatedTo();
                      return savedIssues.map((savedIssue, index) => {
                        const errorTypeLabel = mergedErrorTypes.find(type => type.value === savedIssue.errorType)?.label || '';
                        const issueRelatedToLabel = mergedIssueRelatedTo.find(opt => opt.id === savedIssue.issueRelatedTo)?.name || '';

                        return (
                          <div key={savedIssue.id}>
                            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`px-3 py-1 text-xs font-semibold text-white uppercase ${
                                      savedIssue.errorType === 'critical'
                                        ? 'bg-gradient-red'
                                        : savedIssue.errorType === 'moderate'
                                          ? 'bg-gradient-severity-moderate'
                                          : 'bg-gradient-severity-minor'
                                    }`}
                                  >
                                    {errorTypeLabel}
                                  </Badge>
                                  <Badge className="bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">SME</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">{savedIssue.issueRelatedTo}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditIssue(review.id, savedIssue)}
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                    title="Edit issue"
                                  >
                                    <Pencil className="h-4 w-4 text-gray-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteIssueClick(review.id, savedIssue.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    title="Delete issue"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <p className="mt-1 text-sm font-bold text-red-600">
                                  {mergedErrorTypes.find(type => type.value === savedIssue.errorType)?.points || 0} pts
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                                  <span className="font-medium">Related to:</span> {issueRelatedToLabel}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                                  <span className="font-medium">Description:</span> {savedIssue.issueDescription}
                                </p>
                              </div>
                            </div>
                            {index < savedIssues.length - 1 && <Separator className="my-3" />}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* Active Issue Forms */}
                {editingIssues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {editingIssues.some(issue => savedIssues.some(saved => saved.id === issue.id)) ? 'Editing Issues' : 'New Issues'}
                    </h3>
                    {editingIssues.map(issue => {
                      const isEditMode = savedIssues.some(saved => saved.id === issue.id);
                      return (
                        <IssueFormCard
                          key={issue.id}
                          issue={{
                            ...issue,
                            reviewerName: review.reviewerId, // Pass reviewer ID but don't show the field
                          }}
                          index={0}
                          onSave={values =>
                            handleSaveIssue(review.id, issue.id, {
                              errorType: values.errorType,
                              issueRelatedTo: values.issueRelatedTo,
                              issueDescription: values.issueDescription,
                            })
                          }
                          onRemove={() => handleDeleteIssueClick(review.id, issue.id)}
                          isSaving={savingIssueId === issue.id}
                          isEditMode={isEditMode}
                          hideReviewerField={true}
                        />
                      );
                    })}
                  </div>
                )}

                {savedIssues.length === 0 && editingIssues.length === 0 && review.reviewerId && (
                  <p className="py-4 text-center text-sm text-gray-500">No issues added yet. Click "Add Issue" to create one.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
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
        description={
          issueToDelete
            ? `Are you sure you want to delete this issue? This action cannot be undone.`
            : 'Are you sure you want to delete this issue? This action cannot be undone.'
        }
        confirmButtonText="Delete"
      />
    </Card>
  );
};

export default SMEReview;
