import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Save, UserCheck, X } from 'lucide-react';

interface HumanReviewSectionProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  setShowHumanReview: (show: boolean) => void;
}

const HumanReviewSection = ({ onSaveDraft, onSubmit, setShowHumanReview }: HumanReviewSectionProps) => {
  const [decision, setDecision] = useState<string>('');
  const [manualScore, setManualScore] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const isSubmitDisabled = !decision;

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
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <UserCheck />
            Human Review
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowHumanReview(false)} className="h-6 w-6">
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Decision Section */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Decision</p>
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

        {/* Manual Score Section */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Manual Score (Optional)</p>
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
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  manualScore === 'PASS' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                PASS
              </button>
              <button
                onClick={() => setManualScore('FAIL')}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  manualScore === 'FAIL' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
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
          <Button onClick={onSubmit} disabled={isSubmitDisabled}>
            <Check />
            Submit Human Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HumanReviewSection;
