import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { UserRoleEnum } from '@/constants/common';
import type { NoteDetail, SMEIssue, WebhookVersion } from '@/types/notes';
import { AddIssueFromTemplateForm } from './AddIssueFromTemplateForm';
import { SessionFieldReviewFindings } from './SessionFieldReviewFindings';

interface SessionFieldCardProps {
  fieldKey: string;
  displayName: string;
  currentValue: string;
  previousValue: string | null;
  isChanged: boolean;
  aiIssues: NoteDetail['issues'];
  smeIssues: SMEIssue[];
  issueCount: number;
  isExpanded: boolean;
  selectedTemplateIds: number[];
  templateOptions: { value: number; label: string; descriptionId?: number }[];
  alreadyUsedDescriptionIds: number[];
  isSaving: boolean;
  hasTemplates: boolean;
  userType?: number;
  showSMEActions: boolean;
  disableAddButton?: boolean;
  noteId?: string;
  versionId?: number | null;
  scorerVersion?: string;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  webhookVersions?: WebhookVersion[];
  loggedInUserId?: number | null;
  onSMEIssueDeleted?: (versionId: number, smeIssueId: number) => void;
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string; comment?: string },
  ) => void;
  onToggleForm: (fieldKey: string) => void;
  onTemplateChange: (value: number[]) => void;
  onSave: (fieldKey: string, commentsByTemplateId?: Record<number, string>) => void;
  onCloseForm: () => void;
}

export function SessionFieldCard({
  fieldKey,
  displayName,
  currentValue,
  previousValue,
  isChanged,
  aiIssues,
  smeIssues,
  issueCount,
  isExpanded,
  selectedTemplateIds,
  templateOptions,
  alreadyUsedDescriptionIds,
  isSaving,
  hasTemplates,
  userType,
  showSMEActions,
  disableAddButton = false,
  noteId,
  versionId,
  scorerVersion = '',
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  webhookVersions = [],
  loggedInUserId = null,
  onSMEIssueDeleted,
  onSMEIssueUpdated,
  onToggleForm,
  onTemplateChange,
  onSave,
  onCloseForm,
}: SessionFieldCardProps) {
  const previousDisplayValue = previousValue ?? '-';

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-[#F7F8F7] px-4 py-3">
        <div className="flex items-center gap-2">
          <h4 className="text-primary text-sm font-bold tracking-wide uppercase">
            {displayName}
            {fieldKey === 'overall' ? '' : ''}
          </h4>
          {isChanged && <Badge className="bg-gradient-light text-primary rounded-sm text-xs font-semibold">CHANGED</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {/* <FieldIcon className="text-primary h-4 w-4" /> */}
          {showSMEActions && (
            <>
              {issueCount > 0 && UserRoleEnum.superAdmin !== userType && (
                <Badge className="bg-gradient-light text-primary rounded-sm px-2 py-0.5 text-xs font-semibold">{issueCount}</Badge>
              )}
              {(UserRoleEnum.sme_reviewer === userType || UserRoleEnum.superAdmin === userType) && (
                <Popover
                  open={isExpanded}
                  onOpenChange={open => {
                    if (!open) onCloseForm();
                  }}
                >
                  <PopoverAnchor asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={disableAddButton}
                      className="text-primary hover:bg-primary/10 h-7 w-7"
                      onClick={() => onToggleForm(fieldKey)}
                      title="Add SME issue from template"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverAnchor>
                  <PopoverContent
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    collisionPadding={16}
                    className="w-[min(calc(100vw-2rem),40rem)] border-gray-200 p-0 shadow-lg"
                  >
                    <AddIssueFromTemplateForm
                      fieldKey={fieldKey}
                      selectedTemplateIds={selectedTemplateIds}
                      onTemplateChange={onTemplateChange}
                      options={templateOptions}
                      alreadyUsedDescriptionIds={alreadyUsedDescriptionIds}
                      isSaving={isSaving}
                      hasTemplates={hasTemplates}
                      onSave={onSave}
                      onClose={onCloseForm}
                      className="mt-0 border-0 shadow-none"
                    />
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-gray-200 px-4 py-4 md:border-r">
          <p className="text-sm leading-relaxed text-gray-800">{currentValue}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-4 md:border-t-0">
          <p className="text-sm leading-relaxed font-light text-gray-400 italic">{previousDisplayValue}</p>
        </div>
      </div>

      <SessionFieldReviewFindings
        fieldKey={fieldKey}
        aiIssues={aiIssues}
        smeIssues={smeIssues}
        noteId={noteId}
        versionId={versionId}
        scorerVersion={scorerVersion}
        practitionerId={practitionerId}
        aiStatusId={aiStatusId}
        priorityId={priorityId}
        webhookVersions={webhookVersions}
        readOnly={disableAddButton}
        loggedInUserId={loggedInUserId}
        alreadyUsedDescriptionIds={alreadyUsedDescriptionIds}
        onSMEIssueDeleted={onSMEIssueDeleted}
        onSMEIssueUpdated={onSMEIssueUpdated}
      />
    </div>
  );
}
