import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import IssueFormCard, { IssueFormValues as LocalIssueFormValues } from '../IssueFormCard';
import { useAppSelector } from '@/store/store';
import { Review, IssueForm, ActiveIssueForm } from './types';
import ScoreComparison from './ScoreComparison';

interface ReviewCardProps {
  review: Review;
  auditScore: number;
  practitioners: Array<{ id: number; fullName: string }>;
  activeIssueForms: ActiveIssueForm[];
  savingIssueId: string | null;
  onReviewerChange: (reviewId: string, reviewerId: string) => void;
  onAddIssue: (reviewId: string) => void;
  onEditIssue: (reviewId: string, issue: IssueForm) => void;
  onDeleteIssue: (reviewId: string, issueId: string) => void;
  onSaveIssue: (reviewId: string, issueId: string, values: Omit<LocalIssueFormValues, 'reviewerName'>) => void;
  onCancelEdit: (reviewId: string, issueId: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onRemoveReview?: (reviewId: string) => void;
}

const ReviewCard = ({
  review,
  auditScore,
  practitioners,
  activeIssueForms,
  savingIssueId,
  onReviewerChange,
  onAddIssue,
  onEditIssue,
  onDeleteIssue,
  onSaveIssue,
  onCancelEdit,
  onDeleteReview,
  onRemoveReview,
}: ReviewCardProps) => {
  const { errorTypes, issueRelatedTo } = useAppSelector(state => state.smeConfig);

  const savedIssues = review.issues.filter(
    issue => !activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  );
  const editingIssues = review.issues.filter(issue =>
    activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  );

  // Convert Redux data to format expected by components
  const errorTypeOptions = errorTypes.map(type => ({
    value: type.name,
    label: type.displayName,
    points: type.points,
  }));
  const issueRelatedToOptions = issueRelatedTo.map(opt => ({
    id: opt.fieldId,
    name: opt.displayName,
  }));

  // Check if review is from backend (version review) or new
  const isVersionReview = review.id.startsWith('version-review-');
  const handleRemoveOrDelete = () => {
    if (isVersionReview) {
      onDeleteReview(review.id);
    } else if (onRemoveReview) {
      onRemoveReview(review.id);
    }
  };

  return (
    <Card className="gap-0 pt-1 pb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveOrDelete}
        className={`mr-2 self-end ${isVersionReview ? 'text-red-600' : 'text-gray-600'}`}
        title={isVersionReview ? 'Delete review' : 'Remove review'}
      >
        {isVersionReview ? <Trash2 /> : <X />}
      </Button>

      <CardContent className="space-y-3">
        {/* Reviewer Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Select a reviewer <span className="text-red-500">*</span>
          </Label>
          <Select value={review.reviewerId} onValueChange={value => onReviewerChange(review.id, value)}>
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
          <div className="flex items-center justify-end">
            <Button onClick={() => onAddIssue(review.id)} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Issue
            </Button>
          </div>
        )}

        {/* Saved Issues List */}
        {savedIssues.length > 0 && (
          <div className="space-y-1">
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <ScoreComparison issues={savedIssues} auditScore={auditScore} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Issues:</h3>
            {savedIssues.map((savedIssue, index) => {
              const errorTypeLabel = errorTypeOptions.find(type => type.value === savedIssue.errorType)?.label || '';
              const issueRelatedToLabel = issueRelatedToOptions.find(opt => opt.id === savedIssue.issueRelatedTo)?.name || '';

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
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => onEditIssue(review.id, savedIssue)} title="Edit issue">
                          <Pencil className="text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteIssue(review.id, savedIssue.id)}
                          className="text-red-600"
                          title="Delete issue"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="mt-1 text-sm font-bold text-red-600">
                        {errorTypeOptions.find(type => type.value === savedIssue.errorType)?.points || 0} points
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
            })}
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
                    reviewerName: review.reviewerId,
                  }}
                  index={0}
                  onSave={values =>
                    onSaveIssue(review.id, issue.id, {
                      errorType: values.errorType,
                      issueRelatedTo: values.issueRelatedTo,
                      issueDescription: values.issueDescription,
                    })
                  }
                  onCancelEdit={() => onCancelEdit(review.id, issue.id)}
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
};

export default ReviewCard;
