import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoteDetail } from '@/types/notes';
import { Info } from 'lucide-react';

const IssuesIdentifiedCard = ({ issues }: { issues: NoteDetail['issues'] }) => {
  return (
    <Card className="gap-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Info />
          Issues Identified
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                className={`px-3 py-1 text-xs font-semibold uppercase ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                    : issue.severity === 'MODERATE'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {issue.severity}
              </Badge>
              <span className="text-xs font-medium text-gray-500">{issue.sectionId}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{issue.category}</h3>
              <p className="mt-1 text-sm font-bold text-red-600">–{issue.points} points</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{issue.description}</p>
            </div>
            {index < issues.length - 1 && <div className="border-t border-gray-100 pt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default IssuesIdentifiedCard;
