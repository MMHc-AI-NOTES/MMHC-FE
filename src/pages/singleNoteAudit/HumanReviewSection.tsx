import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Save, UserCheck, X, CircleHelp, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHumanReviewDecisionOptions, HumanReviewResultEnum } from '@/constants/common';
import { submitHumanReview, updateHumanReview } from './singleNoteApiCalls';
import { useDispatch } from 'react-redux';
import { fetchPractitioners } from '../notesQueue/notesApiCalls';
import { setPractitioners } from '@/store/slices/filterOptionsSlice';
import { cn } from '@/lib/utils';
import { HumanReview } from '@/types/notes';
import { Textarea } from '@/components/ui/textarea';

interface HumanReviewSectionProps {
  noteId: string;
  priority: number;
  aiStatus: number;
  onSaveDraft: () => void;
  setShowHumanReview: (show: boolean) => void;
  chatId: number;
  humanReview?: HumanReview[] | null;
  isEditMode?: boolean;
}

const HumanReviewSection = ({
  noteId,
  priority,
  aiStatus,
  onSaveDraft,
  setShowHumanReview,
  chatId,
  humanReview,
  isEditMode = false,
}: HumanReviewSectionProps) => {
  const { practitioners, practitionersLoaded } = useAppSelector(state => state.filterOptions);
  const dispatch = useDispatch();

  const [decision, setDecision] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [manualScore, setManualScore] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [humanResult, setHumanResult] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = !decision || reviewerName === 'none' || reviewerName === '' || isSubmitting;

  const decisionOptions = getHumanReviewDecisionOptions();

  const handleCheckboxChange = (itemValue: string, checked: boolean | string) => {
    if (checked) {
      setDecision(itemValue);
    } else {
      setDecision('');
    }
  };

  // Pre-fill form values if in edit mode (use first review from array)
  useEffect(() => {
    if (isEditMode && humanReview && humanReview.length > 0) {
      const firstReview = humanReview[0];
      setDecision(firstReview.decision?.id?.toString() || '');
      setReviewerName(firstReview.practitionerId?.toString() || '');
      setManualScore(firstReview.manualScore?.toString() || '');
      setComments(firstReview.comment || '');
      // Pre-fill human_result if available (assuming it's stored in the review object)
      if (firstReview.humanResult) {
        setHumanResult(firstReview.humanResult.id);
      }
    }
  }, [isEditMode, humanReview]);

  useEffect(() => {
    const loadPractitioners = async () => {
      if (practitionersLoaded) return; // Skip if already loaded
      try {
        const practitionersData = await fetchPractitioners();
        dispatch(setPractitioners(practitionersData));
      } catch (error) {
        console.error('Error loading practitioners:', error);
      }
    };
    loadPractitioners();
  }, [practitionersLoaded, dispatch]);

  const handleManualScoreChange = (value: string) => {
    // Allow empty, PASS, FAIL, or numeric values 0-100
    if (value === '' || value === 'PASS' || value === 'FAIL') {
      setManualScore(value);
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      // Clamp value between 0 and 100
      const clampedValue = Math.min(100, Math.max(0, numValue));
      setManualScore(clampedValue.toString());
    }
  };

  const getNumericScore = (): number | undefined => {
    if (manualScore === '') return undefined;
    if (manualScore === 'PASS') return 100;
    if (manualScore === 'FAIL') return 0;
    return parseInt(manualScore, 10);
  };

  const handleSubmitReview = async () => {
    if (!decision || !noteId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        note_id: noteId,
        chat_id: chatId,
        priority: priority,
        ai_status: aiStatus,
        decision: parseInt(decision, 10),
        practitioner_id: reviewerName ? parseInt(reviewerName, 10) : null,
        ...(manualScore && { manual_score: getNumericScore() }),
        ...(comments && { comment: comments }),
        ...(humanResult && { human_result: humanResult }),
      };

      if (isEditMode && humanReview && humanReview.length > 0 && humanReview[0]?.id) {
        // Update existing review (use first review from array)
        await updateHumanReview(humanReview[0].id, payload);
      } else {
        // Create new review
        await submitHumanReview(payload);
      }
      // setShowHumanReview(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="gap-1 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
              <UserCheck />
              {isEditMode ? 'Edit Human Review' : 'Human Review'}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Human review allows you to accept, override, or escalate the AI's audit decision. Your decision will be logged in the
                    audit history.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowHumanReview(false)} className="h-6 w-6">
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Decision Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Decision</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Select the appropriate action based on your review of the AI audit and the clinical note.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-1">
            {decisionOptions.map(item => {
              const isChecked = decision === item.value.toString();
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
                  <label
                    htmlFor={item.value.toString()}
                    className={cn('text-primary mb-1 cursor-pointer text-sm leading-none font-medium')}
                  >
                    {item.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviewer Name Section */}
        <div className="space-y-1">
          <div className="w-full">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">
                Reviewer Name <span className="text-red-500">*</span>
              </p>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Your name is required when overriding or escalating an AI decision. This will be logged in the audit history for
                        accountability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Select value={reviewerName} onValueChange={value => setReviewerName(value)}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="Select a reviewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a reviewer</SelectItem>
                {practitioners.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Manual Score Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Manual Score (Optional)</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Enter a manual score (0-100) if you want to override the AI's evaluation. A score of 95 or higher is required to PASS.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-gray-500">PASS = score ≥ 95 • FAIL = score {'<'} 95</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={manualScore === 'PASS' || manualScore === 'FAIL' ? '' : manualScore}
                onChange={e => handleManualScoreChange(e.target.value)}
                placeholder="0-100"
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-500">Score</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={() => setHumanResult(HumanReviewResultEnum.pass)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition-all ${
                  humanResult === HumanReviewResultEnum.pass
                    ? 'bg-gradient-ai-passed text-white'
                    : 'border bg-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                PASS
              </Button>
              <Button
                size="lg"
                onClick={() => setHumanResult(HumanReviewResultEnum.fail)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  humanResult === HumanReviewResultEnum.fail
                    ? 'bg-gradient-ai-failed text-white'
                    : 'border bg-transparent text-red-600 hover:bg-gray-50'
                }`}
              >
                FAIL
              </Button>
            </div>
          </div>
        </div>

        {/* Reviewer Comments */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Reviewer Comments</p>
          <Textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Add your review comments here..."
            className="focus:border-primary focus:ring-primary min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm placeholder-gray-400 focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onSaveDraft} variant="outline" className="min-w-44" disabled={isSubmitting}>
            <Save />
            Save Draft
          </Button>
          <Button className="bg-gradient-light text-primary" onClick={handleSubmitReview} disabled={isSubmitDisabled}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />}
            {isEditMode ? 'Update Human Review' : 'Submit Human Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HumanReviewSection;
