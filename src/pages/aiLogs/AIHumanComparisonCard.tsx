import { Card, CardContent } from '@/components/ui/card';
import { AILog } from '@/types/aiLogs';
import { BarChart3, Zap as Lightning, User, CircleCheckBig, CircleX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AIHumanComparisonCardProps {
  log: AILog;
}

const AIHumanComparisonCard = ({ log }: AIHumanComparisonCardProps) => {
  const humanReview = log.humanReviews?.[0];
  const reviewerName = humanReview?.practitioner?.fullName || '-';
  const aiScore = log.evaluationScore;
  const humanScore = humanReview?.manualScore;
  const aiIssueCount = log.bedrockResponse?.issues?.length || 0;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-primary mb-6 flex items-center gap-2 border-b pb-4 text-lg font-semibold">
          <BarChart3 className="h-5 w-5" />
          AI vs Human Review Comparison
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* AI Evaluation */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow">
            <div className="mb-4 flex items-center gap-2">
              <Lightning className="h-4 w-4 text-green-500" />
              <h4 className="text-primary font-medium">AI Evaluation</h4>
            </div>
            <div className="mb-4">
              <p className="mb-1 text-sm text-gray-500">Score</p>
              <p className="text-primary text-5xl font-bold">{aiScore}</p>
            </div>
            <Separator className="my-4" />
            <div className="mb-4">
              <p className="mb-1 text-xs text-gray-500">Result</p>
              <div className="ml-1 flex items-center gap-2">
                {aiScore >= 95 ? <CircleCheckBig className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
                <p className="text-sm font-medium">{aiScore >= 95 ? 'Pass' : 'Fail'}</p>
              </div>
            </div>
            <Separator className="my-4" />

            <div>
              <p className="mb-1 text-xs text-gray-500">Issues Found</p>
              <p className="text-sm font-medium">{aiIssueCount} issues</p>
            </div>
          </div>

          {/* Human Evaluation */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              <h4 className="text-primary font-medium">Human Evaluation</h4>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-xs text-gray-500">Reviewer</p>
              <p className="text-sm font-bold text-gray-900">{reviewerName || '-'}</p>
            </div>
            <Separator className="my-4" />
            <div className="mb-4">
              <p className="mb-1 text-xs text-gray-500">Score</p>
              {humanScore ? <p className="text-primary text-5xl font-bold">{humanScore}</p> : <p>-</p>}
            </div>
            <Separator className="my-4" />
            <div className="mb-4">
              <p className="mb-1 text-xs text-gray-500">Result</p>
              <div className="ml-1 flex items-center gap-2">
                {humanScore && humanScore >= 95 ? <CircleCheckBig className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}
                <p className="text-sm font-medium">{humanScore && humanScore >= 95 ? 'Pass' : 'Fail'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewer Comments */}

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-900">Reviewer Comments</h4>
          </div>
          <p className="text-sm text-gray-600">{humanReview?.comment ? humanReview.comment : 'No comments yet'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIHumanComparisonCard;
