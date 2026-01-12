import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bug, User, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import IssueFormCard, { IssueFormValues } from './IssueFormCard';
// import { submitSMEIssue, SMEIssuePayload } from './singleNoteApiCalls';
import { useParams } from 'react-router-dom';
import { showToast } from '@/lib/toast';
import { useAppSelector } from '@/store/store';
import { getMergedErrorTypes, getMergedIssueRelatedTo } from '@/constants/common';

interface IssueForm extends IssueFormValues {
  id: string;
}

const SMEManagement = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const { practitioners } = useAppSelector(state => state.filterOptions);
  const [issues, setIssues] = useState<IssueForm[]>([]);
  const [savingIssueId, setSavingIssueId] = useState<string | null>(null);
  // State to store saved issues (dummy data for now - can be used to display saved issues list)
  const [savedIssues, setSavedIssues] = useState<IssueForm[]>([]);

  const addIssue = () => {
    const newIssue: IssueForm = {
      id: `issue-${Date.now()}`,

      reviewerName: '',
      errorType: '',
      issueRelatedTo: '',
      issueDescription: '',
    };
    setIssues([...issues, newIssue]);
  };

  const removeIssue = (id: string) => {
    setIssues(issues.filter(issue => issue.id !== id));
  };

  const handleEditIssue = (savedIssue: IssueForm) => {
    // Check if this issue is already being edited
    const isAlreadyEditing = issues.some(issue => issue.id === savedIssue.id);
    if (isAlreadyEditing) {
      return; // Don't add duplicate edit forms
    }

    // Add the saved issue as an editable form
    setIssues([...issues, savedIssue]);
  };

  const handleSave = async (issueId: string, values: IssueFormValues) => {
    if (!noteId) {
      showToast.error('Note ID is missing. Cannot save issue.');
      return;
    }

    try {
      setSavingIssueId(issueId);

      const mergedErrorTypes = getMergedErrorTypes();
      // Prepare data to send to backend
      const issueData = {
        id: issueId,
        ...values,
        points: mergedErrorTypes.find(type => type.value === values.errorType)?.points || 0,
      };

      // TODO: Uncomment when API is ready
      // const payload: SMEIssuePayload = {
      //   note_id: noteId,
      //   issue_name: values.issueName,
      //   reviewer_name: values.reviewerName,
      //   error_type: values.errorType,
      //   issue_related_to: values.issueRelatedTo,
      //   issue_description: values.issueDescription,
      //   points: ERROR_TYPES.find(type => type.value === values.errorType)?.points || 0,
      // };
      // await submitSMEIssue(payload);

      // Dummy data storage for now (remove when API is ready)
      setSavedIssues(prev => {
        const existingIndex = prev.findIndex(issue => issue.id === issueId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = issueData;
          // Log saved issues for debugging (can be removed when API is ready)
          console.log('Saved issues (dummy data):', updated);
          return updated;
        }
        const newIssues = [...prev, issueData];
        // Log saved issues for debugging (can be removed when API is ready)
        console.log('Saved issues (dummy data):', newIssues);
        return newIssues;
      });

      // Remove the form after successful save (close the form)
      setIssues(issues.filter(issue => issue.id !== issueId));

      showToast.success('Issue saved successfully!');
    } catch (error) {
      console.error('Error saving issue:', error);
      showToast.error('Failed to save issue. Please try again.');
    } finally {
      setSavingIssueId(null);
    }
  };

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center justify-between gap-2 text-base font-semibold">
          <div className="flex items-center gap-2">
            <Bug />
            SME Management
          </div>
          <Button onClick={addIssue} size="sm" className="bg-gradient-light text-primary border-0 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Issue
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Issues List */}
        {savedIssues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Saved Issues</h3>
            {(() => {
              const mergedErrorTypes = getMergedErrorTypes();
              const mergedIssueRelatedTo = getMergedIssueRelatedTo();
              return savedIssues.map((savedIssue, index) => {
                const errorTypeLabel = mergedErrorTypes.find(type => type.value === savedIssue.errorType)?.label || '';
                const issueRelatedToLabel = mergedIssueRelatedTo.find(opt => opt.id === savedIssue.issueRelatedTo)?.name || '';
                const reviewer = practitioners.find(p => p.id.toString() === savedIssue.reviewerName);

                // Check if this issue is currently being edited
                const isEditing = issues.some(issue => issue.id === savedIssue.id);

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
                          {reviewer && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{reviewer.fullName}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">{savedIssue.issueRelatedTo}</span>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIssue(savedIssue)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              title="Edit issue"
                            >
                              <Pencil className="h-4 w-4 text-gray-600" />
                            </Button>
                          )}
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
                    {index < savedIssues.length - 1 && <Separator />}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Stacked Issue Forms */}
        {issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {issues.some(issue => savedIssues.some(saved => saved.id === issue.id)) ? 'Editing Issues' : 'New Issues'}
            </h3>
            {issues.map((issue, index) => {
              const isEditMode = savedIssues.some(saved => saved.id === issue.id);
              return (
                <IssueFormCard
                  key={issue.id}
                  issue={issue}
                  index={index}
                  onSave={values => handleSave(issue.id, values)}
                  onRemove={() => removeIssue(issue.id)}
                  isSaving={savingIssueId === issue.id}
                  isEditMode={isEditMode}
                />
              );
            })}
          </div>
        )}

        {issues.length === 0 && savedIssues.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No issues added yet. Click "Add Issue" to create one.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SMEManagement;
