import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ResolutionActionEnum, ResolutionActionLabels } from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResolutionActionsCardProps {
  onApplyAction: (action: number, comment: string) => void;
  onSaveDraft: (action: number, comment: string) => void;
  onCancel: () => void;
}

const resolutionActions = [
  {
    value: ResolutionActionEnum.restore_to_notes_queue,
    label: ResolutionActionLabels[ResolutionActionEnum.restore_to_notes_queue],
    description: 'Remove from blacklist and return to normal review process.',
  },
  {
    value: ResolutionActionEnum.send_to_practitioner,
    label: ResolutionActionLabels[ResolutionActionEnum.send_to_practitioner],
    description: 'Require practitioner to address all issues before resubmission.',
  },
  {
    value: ResolutionActionEnum.unlock_note,
    label: 'Unlock Note',
    description: 'Allow manager to directly edit note content.',
  },
  {
    value: ResolutionActionEnum.permanently_lock_note,
    label: ResolutionActionLabels[ResolutionActionEnum.permanently_lock_note],
    description: 'Archive note as non-compliant (cannot be recovered).',
    showTooltip: true,
  },
  {
    value: ResolutionActionEnum.escalate_for_system_review,
    label: ResolutionActionLabels[ResolutionActionEnum.escalate_for_system_review],
    description: 'Notify external system provider about inconsistent scoring and issues.',
  },
];

export const ResolutionActionsCard = ({ onApplyAction, onSaveDraft, onCancel }: ResolutionActionsCardProps) => {
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const requiresComment =
    selectedAction === ResolutionActionEnum.escalate_for_system_review || selectedAction === ResolutionActionEnum.permanently_lock_note;

  const handleActionChange = (value: number, checked: boolean) => {
    if (checked) {
      setSelectedAction(value);
    } else {
      setSelectedAction(null);
    }
  };

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <ShieldAlert className="h-5 w-5" />
          Resolution Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          {resolutionActions.map(action => {
            const isChecked = selectedAction === action.value;
            return (
              <div key={action.value} className="flex items-start space-x-2 rounded-lg border-gray-200 py-1.5">
                <div className="relative">
                  <Checkbox
                    id={action.value.toString()}
                    checked={isChecked}
                    onCheckedChange={checked => handleActionChange(action.value, checked as boolean)}
                    className={cn(
                      'h-5 w-5 rounded-full border-2 transition-all',
                      isChecked
                        ? 'bg-primary-light border-transparent data-[state=checked]:border-transparent data-[state=checked]:bg-[#B0E490] [&>span[data-slot="checkbox-indicator"]]:hidden'
                        : 'border-primary bg-transparent',
                    )}
                  />
                  {isChecked && (
                    <div className="pointer-events-none absolute inset-0 bottom-1 flex items-center justify-center">
                      <div className="bg-primary h-2.5 w-2.5 rounded-full" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor={action.value.toString()} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none font-medium">{action.label}</span>
                      {action.showTooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 cursor-help text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>This action cannot be undone. Locked notes cannot be recovered or edited.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{action.description}</div>
                  </Label>
                </div>
              </div>
            );
          })}
        </div>

        {requiresComment && (
          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
              Add internal comment (required for escalation or lock):
            </Label>
            <Textarea
              id="comment"
              placeholder="Enter your comments here..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="mt-2 min-h-[100px]"
              required={requiresComment}
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={() => onApplyAction(selectedAction!, comment)}
            className="bg-gradient-light text-primary hover:bg-primary-light h-12 flex-[0.7]"
            disabled={!selectedAction || (requiresComment && !comment.trim())}
          >
            Apply Action
          </Button>
          <Button
            variant="outline"
            onClick={() => onSaveDraft(selectedAction!, comment)}
            disabled={!selectedAction}
            className="border-primary text-primary h-12 flex-[0.15] border-2 bg-white hover:bg-gray-50"
          >
            Save Draft
          </Button>
          <Button variant="ghost" onClick={onCancel} className="h-12 flex-[0.15] text-gray-600 hover:bg-transparent hover:text-gray-800">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
