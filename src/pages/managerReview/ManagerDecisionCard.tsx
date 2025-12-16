import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Save, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManagerDecisionCardProps {
  onReturnToQueue?: () => void;
}

const decisionOptions = [
  { value: 1, label: 'Approve note (valid and compliant)' },
  { value: 2, label: 'Reject note — send back to practitioner' },
  { value: 3, label: 'Reject note — requires practitioner correction cycle' },
  { value: 4, label: 'AI evaluation incorrect — escalate to AI team' },
  { value: 5, label: 'Require SME review' },
  { value: 6, label: 'Unlock the note for manual editing' },
  { value: 7, label: 'Add internal audit note only (no workflow action)' },
];

export const ManagerDecisionCard = ({ onReturnToQueue }: ManagerDecisionCardProps) => {
  const [selectedDecision, setSelectedDecision] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const handleCheckboxChange = (itemValue: string, checked: boolean | string) => {
    if (checked) {
      setSelectedDecision(itemValue);
    } else {
      setSelectedDecision('');
    }
  };

  const handleSaveDraft = () => {
    // Placeholder until real API is wired
    console.log('Manager draft saved', { selectedDecision, comments });
  };

  const handleApplyDecision = () => {
    // Placeholder until real API is wired
    if (!selectedDecision) return;
    console.log('Manager decision applied', { selectedDecision, comments });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="h-5 w-5" />
          Manager Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Decision</p>
          <div className="space-y-1">
            {decisionOptions.map(item => {
              const isChecked = selectedDecision === item.value.toString();
              return (
                <div key={item.value} className="flex items-center space-x-2 rounded-lg border-gray-200 py-1.5">
                  <div className="relative">
                    <Checkbox
                      id={item.value.toString()}
                      checked={isChecked}
                      onCheckedChange={checked => handleCheckboxChange(item.value.toString(), checked)}
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
                  <label htmlFor={item.value.toString()} className={cn('text-primary cursor-pointer text-sm leading-none font-medium')}>
                    {item.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Manager Comments</p>
          <textarea
            className="border-input bg-background text-muted-foreground min-h-[120px] w-full rounded-md border px-3 py-3 text-sm focus-visible:outline-none"
            placeholder="Add your manager review comments here..."
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            type="button"
            disabled={!selectedDecision}
            onClick={handleApplyDecision}
            className="bg-gradient-light text-primary hover:bg-primary-light h-11 w-full"
          >
            <Check className="h-4 w-4" />
            <span className="font-semibold">Apply Decision</span>
          </Button>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="border-primary text-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            <Button type="button" variant="ghost" onClick={onReturnToQueue} className="text-primary h-11 flex-1">
              <ArrowLeft className="h-4 w-4" />
              Return to Queue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerDecisionCard;
