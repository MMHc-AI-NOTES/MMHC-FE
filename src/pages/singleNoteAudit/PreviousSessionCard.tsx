import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { WebhookVersion } from '@/types/notes';
import type { IssueForm } from './components/types';
import { useTherapySessionSummary } from './therapySessionSummary/useTherapySessionSummary';
import { SessionFieldRow } from './therapySessionSummary/SessionFieldRow';
import { OverallSummaryFlagForm } from './therapySessionSummary/OverallSummaryFlagForm';

interface TherapySessionSummaryCardProps {
  webhookVersions: WebhookVersion[];
  onVersionChange?: (versionId: number) => void;
  noteId?: string;
  versionId?: number | null;
  reviewerId?: number | null;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  onSMEIssueCreatedFromTemplate?: (response: { id: number }, issueForm: IssueForm, versionId: number, descriptionId?: number) => void;
  onReviewerIssuesChanged?: (reviewerId: number) => void;
}

const PreviousSessionCard = ({
  webhookVersions,
  onVersionChange,
  noteId,
  versionId,
  reviewerId,
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  onSMEIssueCreatedFromTemplate,
  onReviewerIssuesChanged,
}: TherapySessionSummaryCardProps) => {
  const summary = useTherapySessionSummary({
    webhookVersions,
    onVersionChange,
    noteId,
    versionId,
    reviewerId,
    practitionerId,
    aiStatusId,
    priorityId,
    onSMEIssueCreatedFromTemplate,
    onReviewerIssuesChanged,
    initialVersionIndex: 1,
  });

  const {
    user,
    sortedVersions,
    currentSessionData,
    expandedFieldKey,
    selectedTemplateId,
    setSelectedTemplateId,
    isSaving,
    getFieldDisplayName,
    getIssueCountForField,
    getTemplatesForField,
    getAlreadyUsedDescriptionIdsForField,
    getTemplateDropdownOptions,
    toggleFieldForm,
    handleSaveFromTemplate,
    closeTemplateForm,
    isOverallFormOpen,
    closeOverallForm,
    overallErrorTypeId,
    setOverallErrorTypeId,
    overallComment,
    setOverallComment,
    isSavingOverall,
    handleSaveOverallIssue,
    errorTypes,
  } = summary;

  const showSMEActions = Boolean(onSMEIssueCreatedFromTemplate && versionId && noteId);
  const hasPreviousSession = sortedVersions.length >= 2;

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center justify-between xl:flex-row">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Stethoscope />
            Previous Session
          </CardTitle>
          {/* <div className="flex items-center gap-2">
            {Number(user?.type) === UserRoleEnum.sme_reviewer && overallIssueRelatedToId != null && (
              <>
                {getIssueCountForOverall() > 0 && Number(user?.type) !== UserRoleEnum.superAdmin && (
                  <Badge className="bg-gradient-light text-primary rounded-sm px-2 py-0.5 text-xs font-semibold">
                    {getIssueCountForOverall()}
                  </Badge>
                )}
                {getIssueCountForOverall() === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary flex items-center gap-2 border"
                    onClick={openOverallForm}
                    title="Overall Summary Flag"
                  >
                    <Flag className="h-4 w-4" />
                    Overall Summary Flag
                  </Button>
                )}
              </>
            )}
            <VersionHistoryPopover
              versions={sortedVersions}
              selectedVersionIndex={selectedVersionIndex}
              isOpen={isVersionHistoryOpen}
              onOpenChange={setIsVersionHistoryOpen}
              onVersionSelect={handleVersionSelect}
              formatDate={formatDate}
            />
          </div> */}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isOverallFormOpen && (
          <OverallSummaryFlagForm
            errorTypes={errorTypes ?? []}
            selectedErrorTypeId={overallErrorTypeId}
            onErrorTypeChange={setOverallErrorTypeId}
            comment={overallComment}
            onCommentChange={setOverallComment}
            isSaving={isSavingOverall}
            onSave={handleSaveOverallIssue}
            onClose={closeOverallForm}
          />
        )}
        {!hasPreviousSession ? (
          <div className="rounded-lg bg-[#F0F0F0] p-4">
            <p className="text-center text-sm text-gray-500">N/A</p>
          </div>
        ) : (
          <div className="rounded-lg bg-[#F0F0F0] p-4">
            <div className="space-y-3 text-sm leading-relaxed text-gray-700">
              {Object.entries(currentSessionData).map(([key, value]) => {
                const displayName = getFieldDisplayName(key);
                const displayValue = value === '' || value === null || value === undefined ? '-' : String(value);
                const issueCount = getIssueCountForField(key);
                const templates = getTemplatesForField(key);

                return (
                  <SessionFieldRow
                    key={key}
                    fieldKey={key}
                    displayName={displayName}
                    displayValue={displayValue}
                    isChanged={false}
                    previousValue={null}
                    issueCount={issueCount}
                    isExpanded={expandedFieldKey === key}
                    selectedTemplateId={selectedTemplateId}
                    templateOptions={getTemplateDropdownOptions(key)}
                    alreadyUsedDescriptionIds={getAlreadyUsedDescriptionIdsForField(key)}
                    isSaving={isSaving}
                    hasTemplates={templates.length > 0}
                    userType={user?.type}
                    showSMEActions={showSMEActions}
                    onToggleForm={toggleFieldForm}
                    onTemplateChange={setSelectedTemplateId}
                    onSave={handleSaveFromTemplate}
                    onCloseForm={closeTemplateForm}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* <div className="flex items-center justify-between border-t pt-3">
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
        </div> */}
      </CardContent>
    </Card>
  );
};

export default PreviousSessionCard;
