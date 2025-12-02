import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Save, UserCheck, X, CircleHelp } from 'lucide-react';

interface HumanReviewSectionProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  setShowHumanReview: (show: boolean) => void;
}

const HumanReviewSection = ({ onSaveDraft, onSubmit, setShowHumanReview }: HumanReviewSectionProps) => {
  const [decision, setDecision] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [manualScore, setManualScore] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const isSubmitDisabled = !decision || !reviewerName;

  const decisionOptions = [
    { value: 'accept', label: 'Accept AI evaluation' },
    { value: 'override', label: 'AI is incorrect — override score' },
    { value: 'acceptable', label: 'Note is clinically acceptable despite AI issues' },
    { value: 'correction', label: 'Note needs practitioner correction' },
    { value: 'escalate', label: 'Escalate to Office Manager' },
  ];

  const handleCheckboxChange = (itemValue: string, checked: boolean | string) => {
    if (checked) {
      setDecision(itemValue);
    } else {
      setDecision('');
    }
  };

  return (
    <Card className="gap-1 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
              <UserCheck />
              Human Review
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Conduct a human review of the AI evaluation. Your decision will override or confirm the AI's assessment and help improve
                    future evaluations.
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
                  <p className="text-sm">
                    Select the appropriate action based on your review. This decision will determine the next steps in the workflow and may
                    trigger notifications to relevant parties.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-1">
            {decisionOptions.map(item => (
              <div key={item.value} className="flex items-center space-x-2 rounded-lg border-gray-200 py-1.5">
                <Checkbox
                  id={item.value}
                  checked={decision === item.value}
                  onCheckedChange={checked => handleCheckboxChange(item.value, checked)}
                  className="border-primary rounded-full border-2"
                />
                <label
                  htmlFor={item.value}
                  className="text-primary text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer Name Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">
              Reviewer Name <span className="text-red-500">*</span>
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Enter your full name as the reviewer. This is required for accountability and audit trail purposes.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <input
            type="text"
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            placeholder="Enter your full name"
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:ring-1 focus:outline-none"
          />
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
                  <p className="text-sm">
                    Override the AI score with your manual assessment. Enter a score between 0-100, or use PASS/FAIL buttons. Scores ≥95 are
                    considered passing.
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
                value={manualScore}
                onChange={e => setManualScore(e.target.value)}
                placeholder="0-100"
                className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-sm text-gray-500">Score</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setManualScore('PASS')}
                className="bg-primary-light text-primary rounded-full border px-4 py-2 text-sm font-medium"
              >
                PASS
              </button>
              <button onClick={() => setManualScore('FAIL')} className="rounded-full border px-4 py-2 text-sm font-medium text-red-700">
                FAIL
              </button>
            </div>
          </div>
        </div>

        {/* Reviewer Comments */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Reviewer Comments</p>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Add your review comments here..."
            className="focus:border-primary focus:ring-primary min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm placeholder-gray-400 focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onSaveDraft} variant="outline" className="min-w-44">
            <Save />
            Save Draft
          </Button>
          <Button className="bg-primary-light text-primary" onClick={onSubmit} disabled={isSubmitDisabled}>
            <Check />
            Submit Human Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HumanReviewSection;
