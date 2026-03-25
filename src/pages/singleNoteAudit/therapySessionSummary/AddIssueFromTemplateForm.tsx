import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDownIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateOption {
  value: number;
  label: string;
  descriptionId?: number;
}

interface AddIssueFromTemplateFormProps {
  fieldKey: string;
  selectedTemplateIds: number[];
  onTemplateChange: (value: number[]) => void;
  options: TemplateOption[];
  alreadyUsedDescriptionIds: number[];
  isSaving: boolean;
  hasTemplates: boolean;
  onSave: (fieldKey: string, commentsByTemplateId?: Record<number, string>) => void;
  onClose: () => void;
}

export function AddIssueFromTemplateForm({
  fieldKey,
  selectedTemplateIds,
  onTemplateChange,
  options,
  alreadyUsedDescriptionIds,
  isSaving,
  hasTemplates,
  onSave,
  onClose,
}: AddIssueFromTemplateFormProps) {
  const [commentsByTemplateId, setCommentsByTemplateId] = useState<Record<number, string>>({});
  const [open, setOpen] = useState(false);

  const selectedTemplates = options.filter(opt => selectedTemplateIds.includes(opt.value));

  const handleCommentChange = (templateId: number, value: string) => {
    setCommentsByTemplateId(prev => ({ ...prev, [templateId]: value }));
  };

  const getCommentForTemplate = (templateId: number): string => commentsByTemplateId[templateId] ?? '';

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="mt-1 w-full justify-between font-normal"
              >
                <span className="truncate">{selectedTemplates.length > 0
                    ? selectedTemplates.length > 2
                      ? `${selectedTemplates.slice(0, 2).map(t => t.label).join(', ')} +${selectedTemplates.length - 2}`
                      : selectedTemplates.map(t => t.label).join(', ')
                    : 'Select a description'}</span>
                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command className="w-full">
                <CommandInput placeholder="Search description..." />
                <CommandList>
                  <CommandEmpty>No description found.</CommandEmpty>
                  <CommandGroup>
                    {options.map(opt => {
                      const alreadyUsed = opt.descriptionId != null && alreadyUsedDescriptionIds.includes(opt.descriptionId);
                      return (
                        <CommandItem
                          key={opt.value}
                          value={opt.label}
                          disabled={alreadyUsed}
                          onSelect={() => {
                            if (alreadyUsed) return;
                            const isSelected = selectedTemplateIds.includes(opt.value);
                            const next = isSelected
                              ? selectedTemplateIds.filter(id => id !== opt.value)
                              : [...selectedTemplateIds, opt.value];
                            onTemplateChange(next);
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', selectedTemplateIds.includes(opt.value) ? 'opacity-100' : 'opacity-0')} />
                          {opt.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedTemplateIds.length > 0 && (
            <div className="mt-3 space-y-3">
              {selectedTemplates.map(t => (
                <div key={t.value}>
                  <Label htmlFor={`template-comment-${fieldKey}-${t.value}`}>
                    Comment (Optional) <span className="text-[12px] font-bold">({t.label})</span>
                  </Label>
                  <Textarea
                    id={`template-comment-${fieldKey}-${t.value}`}
                    className="mt-1 min-h-[80px] w-full"
                    placeholder="Add additional notes or context about this issue..."
                    value={getCommentForTemplate(t.value)}
                    onChange={e => handleCommentChange(t.value, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-light text-primary border-0"
            disabled={isSaving || selectedTemplateIds.length === 0 || !options.length}
            onClick={() => onSave(fieldKey, commentsByTemplateId)}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
