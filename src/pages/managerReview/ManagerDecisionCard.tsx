import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Save, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getManagerDecisionOptions } from '@/constants/common';
import { ManagerReviewApiItem, ManagerDecisionPayload } from './managerReviewTypes';
import { applyManagerDecision } from './managerReviewApiCalls';
import { Textarea } from '@/components/ui/textarea';

interface ManagerDecisionCardProps {
  rawData: ManagerReviewApiItem | null;
  onReturnToQueue?: () => void;
}

const decisionOptions = getManagerDecisionOptions();

export const ManagerDecisionCard = ({ rawData, onReturnToQueue }: ManagerDecisionCardProps) => {
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCheckboxChange = (itemValue: number, checked: boolean | string) => {
    if (checked) {
      setSelectedDecision(itemValue);
    } else {
      setSelectedDecision(null);
    }
  };

  const handleSaveDraft = () => {
    // Placeholder until real API is wired
    console.log('Manager draft saved', { selectedDecision, comments });
  };

  const handleApplyDecision = async () => {
    if (!selectedDecision || !rawData) return;

    setIsSubmitting(true);

    const payload: ManagerDecisionPayload = {
      review_id: rawData.reviewId,
      note_id: rawData.noteId,
      chat_id: rawData.chatId,
      decision: selectedDecision,
      practitioner_id: rawData.practitionerId,
      manual_score: rawData.manualScore || rawData.review?.manualScore || 0,
      ai_score: rawData.chat?.bedrockResponse?.score ?? rawData.aiScore ?? rawData.chat?.evaluationScore ?? 0,
      disagreement: rawData.disagreement?.id || null,
      comment: comments,
      ai_status: rawData.aiStatus?.id || 1,
      priority: rawData.priority?.id || 1,
      human_result: rawData.humanResult?.id || rawData.review?.humanResult?.id || 1,
    };

    await applyManagerDecision(rawData.id, payload);

    setIsSubmitting(false);
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
              const isChecked = selectedDecision === item.value;
              return (
                <div key={item.value} className="flex items-center space-x-2 rounded-lg border-gray-200 py-1.5">
                  <div className="relative">
                    <Checkbox
                      id={item.value.toString()}
                      checked={isChecked}
                      onCheckedChange={checked => handleCheckboxChange(item.value, checked)}
                      className={cn(
                        'h-5 w-5 rounded-full border-2 transition-all',
                        isChecked
                          ? 'bg-primary-light border-transparent data-[state=checked]:border-transparent data-[state=checked]:bg-[#B0E490] [&>span[data-slot="checkbox-indicator"]]:hidden'
                          : 'border-primary bg-transparent',
                      )}
                    />
                    {isChecked && (
                      <div className="pointer-events-none absolute inset-0 bottom-1.5 flex items-center justify-center">
                        <div className="bg-primary h-2.5 w-2.5 rounded-full" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor={item.value.toString()}
                    className={cn('text-primary mb-1.5 cursor-pointer text-sm leading-none font-medium')}
                  >
                    {item.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Manager Comments</p>
          <Textarea
            className="focus:border-primary focus:ring-primary min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm placeholder-gray-400 focus:ring-1 focus:outline-none"
            placeholder="Add your manager review comments here..."
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            type="button"
            disabled={!selectedDecision || isSubmitting}
            onClick={handleApplyDecision}
            className="bg-gradient-light text-primary hover:bg-primary-light h-11 w-full"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span className="font-semibold">{isSubmitting ? 'Applying...' : 'Apply Decision'}</span>
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

            <Button type="button" variant="ghost" onClick={onReturnToQueue} className="text-primary hover:text-primary-light h-11 flex-1">
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
