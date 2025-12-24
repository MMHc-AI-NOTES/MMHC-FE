import { Card, CardContent } from '@/components/ui/card';
import { NoteDetail } from '@/types/notes';
import { Badge } from '@/components/ui/badge';
import { ChartColumn, Info } from 'lucide-react';
import { EvaluationPromptKeys } from '@/constants/common';

interface ManagerAuditScoreCardProps {
  noteDetail: NoteDetail;
}

// Function to highlight EvaluationPromptKeys in text
const highlightPromptKeys = (text: string) => {
  const keys = Object.values(EvaluationPromptKeys);
  let highlightedText = text;

  keys.forEach(key => {
    const regex = new RegExp(`(${key})`, 'gi');
    highlightedText = highlightedText.replace(regex, match => {
      return `<span class="font-bold text-primary">${match}</span>`;
    });
  });

  return highlightedText;
};

export const ManagerAuditScoreCard = ({ noteDetail }: ManagerAuditScoreCardProps) => {
  const score = noteDetail.auditScore ?? 0;
  const highlightedSummary = highlightPromptKeys(noteDetail.aiSummary || '');

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="text-primary mb-2 flex items-center gap-2 font-semibold">
          <ChartColumn className="h-4 w-4" />
          <span>AI Audit Summary</span>
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-primary flex items-baseline gap-2 font-bold md:text-4xl lg:text-5xl">
              <span>{score}</span>
              <span>/ 100</span>
              <span>({score}%)</span>
            </div>
            <Badge className="text-orange-dark border-orange-dark bg-orange-light rounded-lg border-2 px-5 py-3 text-xs font-bold tracking-wide uppercase">
              NEEDS CORRECTION
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">Pass threshold ≥95%</p>
        </div>
        <div>
          <p className="text-muted-foreground mt-1 text-xs">{noteDetail.lastRun}</p>
        </div>
        <div className="text-orange-dark bg-orange-light border-orange-dark inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold">
          <Info className="h-4 w-4" />
          <span>Score discrepancy detected</span>
        </div>

        <p className="w-[90%] text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: highlightedSummary }} />
      </CardContent>
    </Card>
  );
};

export default ManagerAuditScoreCard;
