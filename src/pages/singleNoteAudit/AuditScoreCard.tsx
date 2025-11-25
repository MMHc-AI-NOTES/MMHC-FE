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
    <Card
      className={`overflow-hidden bg-gradient-to-br from-gray-100 ${isGoodAuditScore ? 'to-primary-light' : 'via-red-200 to-red-700'} shadow-sm`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="text-primary">
            <div className="mb-3 flex items-center gap-2 text-base font-medium">
              <ChartColumn />
              <span>Audit Score</span>
            </div>
            <div className="flex items-baseline gap-2 text-6xl font-bold">
              <span>{noteDetail.auditScore}</span>
              <span>/ 100</span>
            </div>
            <p className="mt-3 text-sm">Last AI run: {noteDetail.lastRun}</p>
          </div>
          <Badge
            className={`text-primary text-md rounded-full border-gray-50 bg-gradient-to-br from-gray-50 px-8 py-2 font-semibold shadow-sm ${isGoodAuditScore ? 'to-primary-light' : 'via-red-300 to-red-700'}`}
          >
            {isGoodAuditScore ? 'PASS' : 'FAILED'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditScoreCard;
