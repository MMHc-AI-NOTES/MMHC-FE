import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

export interface ErrorTypeOption {
  id?: number;
  name: string;
  displayName: string;
  points: number;
}

interface OverallSummaryFlagFormProps {
  errorTypes: ErrorTypeOption[];
  selectedErrorTypeId: number;
  onErrorTypeChange: (errorTypeId: number) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  /** When provided, form is in edit mode: Save calls onSaveEdit with { errorType, issueDescription } instead of onSave */
  onSaveEdit?: (values: { errorType: string; issueDescription: string }) => void;
}

export function OverallSummaryFlagForm({
  errorTypes,
  selectedErrorTypeId,
  onErrorTypeChange,
  comment,
  onCommentChange,
  isSaving,
  onSave,
  onClose,
  onSaveEdit,
}: OverallSummaryFlagFormProps) {
  const errorType = errorTypes.find(type => Number(type.id) === Number(selectedErrorTypeId));
  const isEditMode = Boolean(onSaveEdit);

  const handleSave = () => {
    if (isEditMode && onSaveEdit && errorType) {
      onSaveEdit({
        errorType: errorType.displayName || errorType.name,
        issueDescription: comment,
      });
    } else {
      onSave();
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex justify-end">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 xl:flex-row">
          <Label>Overall Summary Flag:</Label>
          <Select value={String(selectedErrorTypeId)} onValueChange={v => onErrorTypeChange(parseInt(v, 10))}>
            <SelectTrigger className="" size="sm">
              <SelectValue placeholder="Select flag" />
            </SelectTrigger>
            <SelectContent>
              {errorTypes.map(et => (
                <SelectItem key={et.id ?? et.name} value={String(et.id ?? 0)}>
                  {et.displayName || et.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div
            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white uppercase ${
              selectedErrorTypeId === 3
                ? 'bg-gradient-red'
                : selectedErrorTypeId === 2
                  ? 'bg-gradient-severity-moderate'
                  : 'bg-gradient-severity-minor'
            }`}
          >
            {errorType?.displayName}
          </div>
        </div>
        <div>
          <Label>Flag Note (optional):</Label>
          <Textarea
            className="mt-1 min-h-[80px] w-full"
            placeholder="Add context or explanation for this flag..."
            value={comment}
            onChange={e => onCommentChange(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-gradient-light text-primary border-0" disabled={isSaving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
