import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartColumn } from 'lucide-react';
import { NoteDetail } from '@/types/notes';

interface AuditScoreCardProps {
  noteDetail: NoteDetail;
}

const AuditScoreCard = ({ noteDetail }: AuditScoreCardProps) => {
  const isGoodAuditScore = noteDetail.auditScore >= 95;

  return (
    <Card className={`overflow-hidden shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="text-primary">
            <div className="mb-3 flex items-center gap-2 text-base font-medium">
              <ChartColumn />
              <span>Audit Score</span>
            </div>
            <div className="flex items-baseline gap-2 font-bold md:text-4xl lg:text-6xl">
              <span>{noteDetail.auditScore}</span>
              <span>/ 100</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Passing Threshold: ≥95</p>
            <p className="text-muted-foreground text-sm">Goal: 100</p>
            <p className="mt-3 text-sm">Last AI Run: {noteDetail.lastRun}</p>
          </div>
          <Badge
            className={`text-md rounded-lg border-none px-4 py-1.5 shadow-lg ${isGoodAuditScore ? 'text-primary bg-green-200' : 'bg-red-200 text-red-700'}`}
          >
            {isGoodAuditScore ? 'Pass' : 'Failed'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditScoreCard;
