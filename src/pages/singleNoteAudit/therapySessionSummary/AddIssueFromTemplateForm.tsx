import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface TemplateOption {
  value: number;
  label: string;
  descriptionId?: number;
}

interface AddIssueFromTemplateFormProps {
  fieldKey: string;
  selectedTemplateId: number | '';
  onTemplateChange: (value: number | '') => void;
  options: TemplateOption[];
  alreadyUsedDescriptionIds: number[];
  isSaving: boolean;
  hasTemplates: boolean;
  onSave: (fieldKey: string, comment?: string) => void;
  onClose: () => void;
}

export function AddIssueFromTemplateForm({
  fieldKey,
  selectedTemplateId,
  onTemplateChange,
  options,
  alreadyUsedDescriptionIds,
  isSaving,
  hasTemplates,
  onSave,
  onClose,
}: AddIssueFromTemplateFormProps) {
  const [comment, setComment] = useState('');
  if (!hasTemplates) {
    return (
      <div className="mt-3 rounded-lg border bg-white p-4">
        <div className="text-muted-foreground py-4 text-center">
          <p>No templates available for this field.</p>
          <p className="mt-2 text-sm">Please configure templates in Settings first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border bg-white px-4 py-2">
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-primary text-lg font-bold">New Issue</p>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>
          <p className="text-primary mb-1 font-semibold">
            Issue description <span className="text-red-600">*</span>
          </p>
          <Select
            value={selectedTemplateId === '' ? '' : String(selectedTemplateId)}
            onValueChange={v => onTemplateChange(v ? parseInt(v, 10) : '')}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a description" />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => {
                const alreadyUsed = opt.descriptionId != null && alreadyUsedDescriptionIds.includes(opt.descriptionId);
                return (
                  <SelectItem key={opt.value} value={String(opt.value)} disabled={alreadyUsed}>
                    {opt.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedTemplateId !== '' && (
            <div className="mt-3">
              <Label htmlFor={`template-comment-${fieldKey}`} className="text-sm font-medium">
                Comment (Optional)
              </Label>
              <Textarea
                id={`template-comment-${fieldKey}`}
                className="mt-1 min-h-[80px] w-full"
                placeholder="Add additional notes or context about this issue..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-light text-primary border-0"
            disabled={isSaving || selectedTemplateId === '' || !options.length}
            onClick={() => onSave(fieldKey, comment.trim())}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
