import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRound } from 'lucide-react';

interface ManagerHumanReviewSummaryCardProps {
  decision: string;
  reviewer: string;
  humanScore: number;
  comments: string;
}

export const ManagerHumanReviewSummaryCard = ({ decision, reviewer, humanScore, comments }: ManagerHumanReviewSummaryCardProps) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="text-primary flex items-center gap-2 text-base font-semibold">
          <UserRound className="h-5 w-5" />
          <span>Human Review Summary</span>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-1 text-xs text-gray-500">Decision</p>
            <Badge className="bg-orange-light text-orange-dark rounded-full px-3 py-1 text-xs font-semibold">{decision}</Badge>
          </div>

          <div>
            <p className="mb-1 text-xs text-gray-500">Reviewer</p>
            <p className="text-lg text-gray-800">{reviewer}</p>
          </div>

          <div>
            <p className="mb-1 text-xs text-gray-500">Human Score</p>
            <p className="text-lg font-medium text-gray-800">
              {humanScore} / 100 ({humanScore}%)
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs text-gray-500">Comments</p>
            <p className="text-sm text-gray-800">{comments}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerHumanReviewSummaryCard;
