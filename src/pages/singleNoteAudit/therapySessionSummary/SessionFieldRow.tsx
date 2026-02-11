import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserRoleEnum } from '@/constants/common';
import { AddIssueFromTemplateForm } from './AddIssueFromTemplateForm';

interface SessionFieldRowProps {
  fieldKey: string;
  displayName: string;
  displayValue: string;
  isChanged: boolean;
  previousValue: string | null;
  issueCount: number;
  isExpanded: boolean;
  selectedTemplateId: number | '';
  templateOptions: { value: number; label: string; descriptionId?: number }[];
  alreadyUsedDescriptionIds: number[];
  isSaving: boolean;
  hasTemplates: boolean;
  userType?: number;
  showSMEActions: boolean;
  onToggleForm: (fieldKey: string) => void;
  onTemplateChange: (value: number | '') => void;
  onSave: (fieldKey: string) => void;
  onCloseForm: () => void;
}

export function SessionFieldRow({
  fieldKey,
  displayName,
  displayValue,
  isChanged,
  previousValue,
  issueCount,
  isExpanded,
  selectedTemplateId,
  templateOptions,
  alreadyUsedDescriptionIds,
  isSaving,
  hasTemplates,
  userType,
  showSMEActions,
  onToggleForm,
  onTemplateChange,
  onSave,
  onCloseForm,
}: SessionFieldRowProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-primary font-semibold">{displayName}:</h4>
          {isChanged && <Badge className="bg-gradient-light text-primary rounded-sm text-xs font-semibold">CHANGED</Badge>}
        </div>
        {showSMEActions && (
          <div className="flex items-center gap-2">
            {issueCount > 0 && UserRoleEnum.superAdmin !== userType && (
              <Badge className="bg-gradient-light text-primary rounded-sm px-2 py-0.5 text-xs font-semibold">{issueCount}</Badge>
            )}
            {UserRoleEnum.sme_reviewer === userType && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 h-7 w-7"
                onClick={() => onToggleForm(fieldKey)}
                title="Add SME issue from template"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <AddIssueFromTemplateForm
          fieldKey={fieldKey}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={onTemplateChange}
          options={templateOptions}
          alreadyUsedDescriptionIds={alreadyUsedDescriptionIds}
          isSaving={isSaving}
          hasTemplates={hasTemplates}
          onSave={onSave}
          onClose={onCloseForm}
        />
      )}

      {isChanged && previousValue && (
        <div
          className="mt-1 ml-4 rounded-sm border-2 p-2"
          style={{ backgroundColor: 'rgba(161, 230, 129, 0.1)', borderColor: 'rgba(161, 230, 129, 0.4)' }}
        >
          <p className="text-red-dark text-xs font-semibold">PREVIOUS:</p>
          <p className="font-light text-gray-400 line-through">{previousValue}</p>
          <p className="text-green-dark-light mt-1 text-xs font-semibold">NEW:</p>
          <p className="text-primary font-medium">{displayValue}</p>
        </div>
      )}

      {!isChanged && <p className="ml-4 text-gray-700">{displayValue}</p>}
    </div>
  );
}
