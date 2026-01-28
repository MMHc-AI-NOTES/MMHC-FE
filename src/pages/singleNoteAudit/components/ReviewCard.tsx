import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, X, User, Save } from 'lucide-react';
import IssueFormCard, { IssueFormValues as LocalIssueFormValues } from '../IssueFormCard';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { Review, IssueForm, ActiveIssueForm } from './types';
import ScoreComparison from './ScoreComparison';
import { UserRoleEnum } from '@/constants/common';
import { fetchUsersListingThunk, type UsersQuery } from '@/store/slices/usersSlice';
import { assignToManager } from '../singleNoteApiCalls';

interface ReviewCardProps {
  review: Review;
  auditScore: number;
  activeIssueForms: ActiveIssueForm[];
  savingIssueId: string | null;
  noteId?: string;
  versionId?: number | null;
  practitionerId?: number;
  priorityId?: number;
  onDeleteIssue: (reviewId: string, issueId: string) => void;
  onSaveIssue: (reviewId: string, issueId: string, values: Omit<LocalIssueFormValues, 'reviewerName'>) => void;
  onCancelEdit: (reviewId: string, issueId: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onRemoveReview?: (reviewId: string) => void;
}

const ReviewCard = ({
  review,
  auditScore,
  activeIssueForms,
  savingIssueId,
  noteId,
  versionId,
  practitionerId,
  priorityId,
  onDeleteIssue,
  onSaveIssue,
  onCancelEdit,
  onDeleteReview,
  onRemoveReview,
}: ReviewCardProps) => {
  const dispatch = useAppDispatch();
  const { errorTypes, issueRelatedTo, issueDescriptions, smeTemplates } = useAppSelector(state => state.smeConfig);
  const user = useAppSelector(state => state.auth.user);
  const loggedInUserId = user?.id ?? null;
  const userEntities = useAppSelector(state => state.users.entities);

  // State for assign to manager form
  const [showAssignManagerForm, setShowAssignManagerForm] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // State for inline edit form
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<number | ''>('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  // Get all users from entities
  const users = useMemo(() => {
    return Object.values(userEntities).filter(Boolean);
  }, [userEntities]);

  // Filter users to only include superAdmin
  const managers = useMemo(() => {
    return users.filter(user => user.type === UserRoleEnum.superAdmin);
  }, [users]);

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

  // Fetch users listing when users array is empty (e.g., on mount or after reload)
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsersListingThunk(usersQuery));
    }
  }, [users.length, dispatch, usersQuery]);
  // Helper to check if review is from backend (saved) or new (unsaved)
  const isSavedReview = review.id.startsWith('version-review-');
  const isNewReview = review.id.startsWith('new-review-');

  // Check if review has any saved issues (issues with _smeIssueId means they're saved to backend)
  const hasSavedIssues = review.issues.some(issue => issue._smeIssueId);

  // A review is considered "saved" if:
  // 1. It's from backend (version-review-), OR
  // 2. It's a new review but has at least one saved issue
  const isReviewSaved = isSavedReview || (isNewReview && hasSavedIssues);

  // Check if the logged-in user owns this review
  const reviewerIdNum = review.reviewerId ? Number(review.reviewerId) : null;
  const isOwnReview = loggedInUserId !== null && (reviewerIdNum === loggedInUserId || (isNewReview && reviewerIdNum === null));

  // Separate saved issues from editing issues
  const savedIssues = review.issues.filter(
    issue => !activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  );
  const editingIssues = review.issues.filter(issue =>
    activeIssueForms.some(form => form.reviewId === review.id && form.issueId === issue.id),
  );

  // For score calculation, include all issues (use original values for editing issues)
  // This ensures the score doesn't change until after saving
  const issuesForScore = review.issues;

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

  // Get issueRelatedTo ID from fieldId
  const getIssueRelatedToIdFromFieldId = (fieldId: string): number | null => {
    const irt = issueRelatedTo.find(opt => opt.fieldId === fieldId);
    return irt?.id ?? null;
  };

  // Get templates for a specific issueRelatedTo ID
  const getTemplatesForIssueRelatedToId = (issueRelatedToId: number): typeof smeTemplates => {
    if (!smeTemplates || !Array.isArray(smeTemplates)) return [];
    return smeTemplates.filter(t => t.issues_related_to_id === issueRelatedToId);
  };

  // Get description options for an issue based on its issueRelatedTo
  const getDescriptionOptionsForIssue = (issue: IssueForm) => {
    const issueRelatedToId = getIssueRelatedToIdFromFieldId(issue.issueRelatedTo);
    if (!issueRelatedToId) return [];

    const templates = getTemplatesForIssueRelatedToId(issueRelatedToId);
    if (!templates || templates.length === 0) return [];
    if (!issueDescriptions || !Array.isArray(issueDescriptions)) return [];

    // Get all unique issue_description_id from templates
    const uniqueDescriptionIds = [...new Set(templates.map(t => t.issue_description_id).filter(id => id != null))];

    // Find all descriptions matching those IDs
    const matchingDescriptions = issueDescriptions.filter(desc => desc.id != null && uniqueDescriptionIds.includes(desc.id));

    // Return descriptions as options
    return matchingDescriptions.map(desc => ({
      value: desc.id!,
      label: desc.description ?? `Description ${desc.id}`,
    }));
  };

  const handleEditIssueInline = (issue: IssueForm) => {
    setEditingIssueId(issue.id);
    // Find current description ID if it exists
    const currentDesc = issueDescriptions.find(d => d.description === issue.issueDescription);
    setSelectedDescriptionId(currentDesc?.id ?? '');
  };

  const handleCancelEditInline = () => {
    setEditingIssueId(null);
    setSelectedDescriptionId('');
  };

  const handleSaveDescription = async (issue: IssueForm) => {
    if (!selectedDescriptionId || typeof selectedDescriptionId !== 'number') return;

    setIsSavingDescription(true);
    try {
      const selectedDescription = issueDescriptions.find(d => d.id === selectedDescriptionId);
      if (!selectedDescription) {
        setIsSavingDescription(false);
        return;
      }

      // Update the issue with new description
      const updatedIssue: IssueForm = {
        ...issue,
        issueDescription: selectedDescription.description,
      };

      // Call onSaveIssue with updated values
      onSaveIssue(review.id, issue.id, {
        errorType: updatedIssue.errorType,
        issueRelatedTo: updatedIssue.issueRelatedTo,
        issueDescription: updatedIssue.issueDescription,
      });

      setEditingIssueId(null);
      setSelectedDescriptionId('');
    } catch (error) {
      console.error('Error saving description:', error);
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleRemoveOrDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOwnReview) return;

    // If it's a saved review (from backend or has saved issues), delete it via API
    if (isReviewSaved) {
      onDeleteReview(review.id);
    }
    // If it's a new review with no saved issues, just remove it from local state
    else if (isNewReview && onRemoveReview) {
      onRemoveReview(review.id);
    }
  };

  const handleAssignToManager = () => {
    setShowAssignManagerForm(true);
  };

  const handleCancelAssign = () => {
    setShowAssignManagerForm(false);
    setSelectedManagerId('');
  };

  const handleAssign = async () => {
    if (!selectedManagerId || !noteId || versionId === null || versionId === undefined) {
      return;
    }

    setIsAssigning(true);
    try {
      // Get reviewer_id from the review
      const reviewerId = review.reviewerId ? Number(review.reviewerId) : null;

      if (!reviewerId || !practitionerId || !priorityId) {
        console.error('Missing required fields for assignment');
        return;
      }

      await assignToManager({
        note_id: noteId,
        version_id: versionId,
        practitioner_id: practitionerId,
        ai_score: auditScore,
        reviewer_id: reviewerId,
        priority: priorityId,
      });

      // Reset form after successful assignment
      setShowAssignManagerForm(false);
      setSelectedManagerId('');
    } catch (error) {
      console.error('Error assigning to manager:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card className="relative gap-0 pt-1 pb-4">
      {isOwnReview && (
        <div className="flex items-center justify-end gap-2 p-2">
          <Button onClick={handleAssignToManager} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
            <User />
            Assign to Manager
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveOrDelete}
            className={` ${isReviewSaved ? 'text-red-600' : 'text-gray-600'}`}
            title={isReviewSaved ? 'Delete review' : 'Remove review'}
            type="button"
          >
            {isReviewSaved ? <Trash2 /> : <X />}
          </Button>
        </div>
      )}
      <CardContent className="space-y-3">
        {/* Assign to Manager Form */}
        {showAssignManagerForm && (
          <div className="mb-4 rounded-lg border p-4">
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Select Manager</label>
                <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map(manager => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelAssign} disabled={isAssigning}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={!selectedManagerId || isAssigning}>
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reviewer Info */}
        {review.reviewerName && (
          <div className="my-2 text-sm text-gray-600">
            <span className="font-medium">Reviewer:</span>
            <span className="text-primary ml-1 font-semibold">{review.reviewerName}</span>
          </div>
        )}

        {/* Score Display - Show if there are any issues (saved or being edited) */}
        {issuesForScore.length > 0 && (
          <div className="mt-2 rounded-lg bg-gray-100 px-4 py-2">
            <ScoreComparison issues={issuesForScore} auditScore={auditScore} />
          </div>
        )}

        {/* Saved Issues List */}
        {savedIssues.length > 0 && (
          <div className="space-y-1">
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
                      {isOwnReview && (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditIssueInline(savedIssue)}
                            title="Edit issue description"
                            disabled={editingIssueId === savedIssue.id}
                          >
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
                      )}
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
                    {/* Inline edit form for description */}
                    {editingIssueId === savedIssue.id && isOwnReview && (
                      <div className="mt-3 rounded-lg border bg-gray-50 p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Issue Description</Label>
                            <Select
                              value={selectedDescriptionId === '' ? '' : String(selectedDescriptionId)}
                              onValueChange={v => setSelectedDescriptionId(v ? parseInt(v, 10) : '')}
                            >
                              <SelectTrigger className="mt-1 w-full">
                                <SelectValue placeholder="Select a description" />
                              </SelectTrigger>
                              <SelectContent>
                                {getDescriptionOptionsForIssue(savedIssue).map(opt => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleCancelEditInline} disabled={isSavingDescription}>
                              Cancel
                            </Button>
                            <Button
                              className="bg-gradient-light text-primary border-0"
                              disabled={isSavingDescription || selectedDescriptionId === ''}
                              onClick={() => handleSaveDescription(savedIssue)}
                            >
                              <Save className="h-4 w-4" />
                              {isSavingDescription ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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

        {savedIssues.length === 0 && editingIssues.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No issues added yet. Click "Add Issue" to create one.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
