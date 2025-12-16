import { Card, CardContent } from '@/components/ui/card';
import { ChartColumn, CircleHelp } from 'lucide-react';
import { NoteDetail } from '@/types/notes';
import { AiStatusEnum } from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AuditScoreCardProps {
  noteDetail: NoteDetail;
}

const AuditScoreCard = ({ noteDetail }: AuditScoreCardProps) => {
  const isPassed = noteDetail.aiStatus.id === AiStatusEnum.passed;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="text-primary">
            <div className="mb-3 flex items-center gap-2 text-base font-medium">
              <ChartColumn />
              <span>Audit Score</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      The audit score is calculated based on four categories: Diagnostic Specificity (25 pts), Treatment Measurability (20
                      pts), Clinical Coherence (15 pts), and Safety Documentation (10 pts). A score of 95 or higher is required to PASS.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline gap-2 font-bold md:text-4xl lg:text-6xl">
              <span>{noteDetail.auditScore}</span>
              <span>/ 100</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Passing Threshold: ≥95</p>
            <p className="text-muted-foreground text-sm">Goal: 100</p>
            <p className="mt-3 text-sm">Last AI Run: {noteDetail.lastRun}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-6 py-3 text-lg font-medium text-white ${isPassed ? 'bg-gradient-ai-passed' : 'bg-gradient-ai-failed'}`}
          >
            {isPassed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditScoreCard;
