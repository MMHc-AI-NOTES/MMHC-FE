import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, ChevronLeft, ChevronRight, ScrollText, PencilLine, ExternalLink } from 'lucide-react';
import { WebhookVersion, PreviousNote } from '@/types/notes';
import type { IssueForm } from './components/types';
import type { NoteDetail } from '@/types/notes';
import { useTherapySessionSummary } from './therapySessionSummary/useTherapySessionSummary';
import { SessionFieldCard } from './therapySessionSummary/SessionFieldCard';
import { formatSessionFieldValue } from './therapySessionSummary/sessionFieldUtils';

interface TherapySessionSummaryCardProps {
  webhookVersions: WebhookVersion[];
  previousNote?: PreviousNote;
  aiIssues?: NoteDetail['issues'];
  onVersionChange?: (versionId: number) => void;
  noteId?: string;
  id?: number;
  versionId?: number | null;
  reviewerId?: number | null;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  scorerVersion?: string;
  sessionId?: string;
  feedbackVerdicts?: any[];
  onSMEIssueCreatedFromTemplate?: (response: { id: number }, issueForm: IssueForm, versionId: number, descriptionId?: number) => void;
  onReviewerIssuesChanged?: (reviewerId: number) => void;
  onSMEIssueDeleted?: (versionId: number, smeIssueId: number) => void;
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string; comment?: string },
  ) => void;
  handleNoteIdClick: () => void;
  handlePreviousNoteIdClick?: () => void;
  onFeedbackChanged?: () => void;
}

const TherapySessionSummaryCard = ({
  webhookVersions,
  previousNote,
  aiIssues = [],
  onVersionChange,
  noteId,
  id,
  versionId,
  reviewerId,
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  scorerVersion = '',
  sessionId = '',
  feedbackVerdicts = [],
  onSMEIssueCreatedFromTemplate,
  onReviewerIssuesChanged,
  onSMEIssueDeleted,
  onSMEIssueUpdated,
  handleNoteIdClick,
  handlePreviousNoteIdClick,
  onFeedbackChanged,
}: TherapySessionSummaryCardProps) => {
  const summary = useTherapySessionSummary({
    webhookVersions,
    previousNoteFromDetail: previousNote,
    aiIssues,
    onVersionChange,
    noteId,
    versionId,
    reviewerId,
    practitionerId,
    aiStatusId,
    priorityId,
    onSMEIssueCreatedFromTemplate,
    onReviewerIssuesChanged,
  });

  const {
    user,
    sortedVersions,
    currentVersion,
    displayableSessionFields,
    changedFields,
    hasPreviousNoteSessionData,
    selectedVersionIndex,
    isHistoricalVersion,
    isFirstVersion,
    isLastVersion,
    expandedFieldKey,
    selectedTemplateIds,
    setSelectedTemplateIds,
    isSaving,
    getFieldDisplayName,
    getIssueCountForField,
    getSmeIssuesForField,
    getAiIssuesForSessionField,
    getPreviousValueForField,
    isFieldChangedFromPreviousNote,
    getTemplatesForField,
    getAlreadyUsedDescriptionIdsForField,
    getTemplateDropdownOptions,
    handlePrevious,
    handleNext,
    toggleFieldForm,
    handleSaveFromTemplate,
    closeTemplateForm,
    formatDate,
  } = summary;

  useEffect(() => {
    if (sortedVersions.length > 0 && onVersionChange) {
      onVersionChange(sortedVersions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sortedVersions.length === 0) {
    return (
      <Card className="gap-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Stethoscope />
            Session Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-[#F0F0F0] p-4">
            <p className="text-center text-sm text-gray-500">N/A</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showSMEActions = Boolean(onSMEIssueCreatedFromTemplate && versionId && noteId);
  const previousNoteId = previousNote?.noteId;
  const changedFieldsFromPreviousNote = displayableSessionFields.map(([key]) => key).filter(key => isFieldChangedFromPreviousNote(key));

  const renderFieldCard = (key: string, value: unknown) => {
    const displayName = getFieldDisplayName(key);
    const displayValue = formatSessionFieldValue(value);
    const previousValue = hasPreviousNoteSessionData ? getPreviousValueForField(key) : null;
    const isChanged = isFieldChangedFromPreviousNote(key);
    const issueCount = getIssueCountForField(key);
    const templates = getTemplatesForField(key);

    return (
      <SessionFieldCard
        key={key}
        fieldKey={key}
        displayName={displayName}
        currentValue={displayValue}
        previousValue={previousValue}
        isChanged={isChanged}
        aiIssues={getAiIssuesForSessionField(key)}
        smeIssues={getSmeIssuesForField(key)}
        issueCount={issueCount}
        isExpanded={expandedFieldKey === key}
        selectedTemplateIds={selectedTemplateIds}
        templateOptions={getTemplateDropdownOptions(key)}
        alreadyUsedDescriptionIds={getAlreadyUsedDescriptionIdsForField(key)}
        isSaving={isSaving}
        hasTemplates={templates.length > 0}
        userType={user?.type}
        showSMEActions={showSMEActions}
        disableAddButton={isHistoricalVersion}
        noteId={noteId}
        id={id}
        versionId={versionId}
        scorerVersion={scorerVersion}
        sessionId={sessionId}
        feedbackVerdicts={feedbackVerdicts}
        practitionerId={practitionerId}
        aiStatusId={aiStatusId}
        priorityId={priorityId}
        webhookVersions={webhookVersions}
        loggedInUserId={user?.id ?? null}
        onSMEIssueDeleted={onSMEIssueDeleted}
        onSMEIssueUpdated={onSMEIssueUpdated}
        onToggleForm={toggleFieldForm}
        onTemplateChange={setSelectedTemplateIds}
        onSave={handleSaveFromTemplate}
        onCloseForm={closeTemplateForm}
        onFeedbackChanged={onFeedbackChanged}
      />
    );
  };

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Stethoscope />
          Session Summary
        </CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <p className="text-primary text-sm">Current Note ID:</p>
            {noteId ? (
              <div className="group inline cursor-pointer" onClick={handleNoteIdClick}>
                <span className="align-middle text-sm text-blue-600 transition-colors group-hover:text-blue-700">{noteId}</span>
                <ExternalLink className="ml-1 inline align-middle text-blue-600 transition-colors group-hover:text-blue-700" size={14} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">N/A</p>
            )}
          </div>
          {previousNoteId && (
            <div className="flex items-center gap-2">
              <p className="text-primary text-sm">Previous Note ID:</p>
              <div className="group inline cursor-pointer" onClick={handlePreviousNoteIdClick}>
                <span className="align-middle text-sm text-blue-600 transition-colors group-hover:text-blue-700">{previousNoteId}</span>
                <ExternalLink className="ml-1 inline align-middle text-blue-600 transition-colors group-hover:text-blue-700" size={14} />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {isHistoricalVersion && (
            <div className="bg-orange-light border-orange-dark flex w-fit items-center gap-2 rounded-md border px-5 py-2.5">
              <ScrollText className="text-orange-dark h-4 w-4" />
              <span className="text-orange-dark text-sm font-medium">Viewing Historical Version - Read Only</span>
            </div>
          )}
          {changedFields.length > 0 && (
            <div
              className="text-primary flex w-fit items-center gap-2 rounded-md border px-5 py-2.5"
              style={{ backgroundColor: 'rgba(161, 230, 129, 0.1)', borderColor: 'rgba(161, 230, 129, 0.4)' }}
            >
              <PencilLine className="h-4 w-4" />
              <span className="text-sm font-medium">
                {changedFields.length} field{changedFields.length !== 1 ? 's' : ''} changed from previous version
              </span>
            </div>
          )}
          {changedFieldsFromPreviousNote.length > 0 && (
            <div
              className="text-primary flex w-fit items-center gap-2 rounded-md border px-5 py-2.5"
              style={{ backgroundColor: 'rgba(161, 230, 129, 0.1)', borderColor: 'rgba(161, 230, 129, 0.4)' }}
            >
              <PencilLine className="h-4 w-4" />
              <span className="text-sm font-medium">
                {changedFieldsFromPreviousNote.length} field{changedFieldsFromPreviousNote.length !== 1 ? 's' : ''} changed from previous
                session
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {displayableSessionFields.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-[#F0F0F0] p-4">
              <p className="text-center text-sm text-gray-500">N/A</p>
            </div>
          ) : (
            displayableSessionFields.map(([key, value]) => renderFieldCard(key, value))
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            <p className="text-primary font-semibold">
              {isHistoricalVersion ? `Version ${sortedVersions.length - selectedVersionIndex}` : 'Current'}
            </p>
            -<p className="text-gray-600">{formatDate(currentVersion.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious} disabled={isFirstVersion}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={isLastVersion}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapySessionSummaryCard;
