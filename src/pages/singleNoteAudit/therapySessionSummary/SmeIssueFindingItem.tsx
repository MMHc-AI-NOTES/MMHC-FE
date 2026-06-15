import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Pencil, Save, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import type { SMEIssue, WebhookVersion } from '@/types/notes';
import { deleteSMEIssue, updateSMEIssue, type UpdateSMEIssuePayload } from '../singleNoteApiCalls';
import { getErrorTypeId, getIssuesRelatedToId } from '../components/reviewUtils';
import { getSmeIssueDescription, getSmeIssueTitle } from './sessionFieldUtils';

interface SmeIssueFindingItemProps {
  issue: SMEIssue;
  fieldKey: string;
  noteId: string;
  versionId: number;
  practitionerId: number;
  aiStatusId: number;
  priorityId: number;
  webhookVersions: WebhookVersion[];
  readOnly?: boolean;
  loggedInUserId: number | null;
  alreadyUsedDescriptionIds: number[];
  onSMEIssueDeleted?: (versionId: number, smeIssueId: number) => void;
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string; comment?: string },
  ) => void;
}

export function SmeIssueFindingItem({
  issue,
  fieldKey,
  noteId,
  versionId,
  practitionerId,
  aiStatusId,
  priorityId,
  webhookVersions,
  readOnly = false,
  loggedInUserId,
  alreadyUsedDescriptionIds,
  onSMEIssueDeleted,
  onSMEIssueUpdated,
}: SmeIssueFindingItemProps) {
  const { errorTypes, issueRelatedTo, issueDescriptions, smeTemplates } = useAppSelector(state => state.smeConfig);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<number | ''>('');
  const [editingComment, setEditingComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnIssue = loggedInUserId != null && Number(issue.reviewerId) === loggedInUserId;
  const canManage = isOwnIssue && !readOnly;

  const issueRelatedToFieldId = useMemo(() => {
    const match = issueRelatedTo.find(opt => opt.id === issue.issuesRelatedTo?.id);
    return match?.fieldId ?? fieldKey;
  }, [issue.issuesRelatedTo?.id, issueRelatedTo, fieldKey]);

  const descriptionOptions = useMemo(() => {
    const issueRelatedToId = issue.issuesRelatedTo?.id;
    if (!issueRelatedToId) return [];

    const templates = smeTemplates.filter(t => t.issues_related_to_id === issueRelatedToId);
    if (!templates.length || !issueDescriptions?.length) return [];

    const uniqueDescriptionIds = [...new Set(templates.map(t => t.issue_description_id).filter(id => id != null))];
    return issueDescriptions
      .filter(desc => desc.id != null && uniqueDescriptionIds.includes(desc.id))
      .map(desc => ({
        value: desc.id!,
        label: desc.description ?? `Description ${desc.id}`,
      }));
  }, [issue.issuesRelatedTo?.id, smeTemplates, issueDescriptions]);

  const alreadyUsedByOthers = useMemo(() => {
    const currentDescriptionId = issue.issueDescription?.id;
    return alreadyUsedDescriptionIds.filter(id => id !== currentDescriptionId);
  }, [alreadyUsedDescriptionIds, issue.issueDescription?.id]);

  const startEditing = () => {
    setSelectedDescriptionId(issue.issueDescription?.id ?? '');
    setEditingComment(issue.comment ?? '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedDescriptionId('');
    setEditingComment('');
  };

  const handleSave = async () => {
    if (!loggedInUserId || selectedDescriptionId === '' || typeof selectedDescriptionId !== 'number') return;

    const selectedDescription = issueDescriptions.find(d => d.id === selectedDescriptionId);
    if (!selectedDescription) return;

    const errorTypeName = errorTypes.find(t => t.id === issue.errorType?.id)?.name ?? issue.errorType?.name ?? '';

    setIsSaving(true);
    try {
      const isCurrentVersion = (() => {
        if (!versionId || !webhookVersions.length) return false;
        const sorted = [...webhookVersions].sort((a, b) => b.id - a.id);
        return sorted[0]?.id === versionId;
      })();

      const payload: UpdateSMEIssuePayload = {
        note_id: noteId,
        reviewer_id: loggedInUserId,
        error_type_id: getErrorTypeId(errorTypeName, errorTypes) || issue.errorType?.id || 0,
        issues_related_to_id: getIssuesRelatedToId(issueRelatedToFieldId, issueRelatedTo) || issue.issuesRelatedTo?.id || 0,
        version_id: versionId,
        issue_description_id: selectedDescriptionId,
        ai_status: aiStatusId,
        priority: priorityId,
        practitioner_id: practitionerId,
        is_current_version: isCurrentVersion,
        comment: editingComment.trim(),
      };

      const response = await updateSMEIssue(issue.id, payload);
      if (!response?.id) return;

      onSMEIssueUpdated?.(versionId, issue.id, {
        issueDescriptionId: selectedDescriptionId,
        issueDescriptionText: selectedDescription.description,
        comment: editingComment.trim(),
      });
      cancelEditing();
    } catch (error) {
      console.error('Error updating SME issue:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!loggedInUserId) return;

    setIsDeleting(true);
    try {
      await deleteSMEIssue(issue.id);
      onSMEIssueDeleted?.(versionId, issue.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting SME issue:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative rounded-lg border border-green-200 bg-green-50/30 p-3">
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {canManage && !isEditing && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEditing} title="Edit issue">
                <Pencil className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
                title="Delete issue"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {!canManage && <Check className="h-4 w-4 text-green-700" />}
        </div>

        <div className="flex items-start gap-2 pr-16">
          <Badge className="bg-primary shrink-0 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">SME Action</Badge>
          <div className="min-w-0 flex-1 space-y-1">
            {!isEditing ? (
              <>
                <p className="text-sm font-semibold text-gray-900">{getSmeIssueTitle(issue)}</p>
                <p className="text-xs leading-relaxed text-gray-600">{getSmeIssueDescription(issue)}</p>
                {issue.comment?.trim() && (
                  <div className="mt-2 rounded-md border-l-2 border-green-600 bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">Practitioner Reply</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700 italic">&ldquo;{issue.comment.trim()}&rdquo;</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3 rounded-lg border bg-white p-3">
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
                      {descriptionOptions.map(opt => (
                        <SelectItem key={opt.value} value={String(opt.value)} disabled={alreadyUsedByOthers.includes(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Comment (Optional)</Label>
                  <Textarea
                    className="mt-1 min-h-[80px] w-full"
                    placeholder="Add additional notes or context about this issue..."
                    value={editingComment}
                    onChange={e => setEditingComment(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-light text-primary border-0"
                    disabled={isSaving || selectedDescriptionId === ''}
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isLoading={isDeleting}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Issue"
        description="Are you sure you want to delete this issue? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </>
  );
}
