import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NoteDetail } from '@/types/notes';
import { Info, CircleHelp } from 'lucide-react';

interface IssuesIdentifiedCardProps {
  issues: NoteDetail['issues'];
  onCategoryClick?: (category: string) => void;
}

const IssuesIdentifiedCard = ({ issues, onCategoryClick }: IssuesIdentifiedCardProps) => {
  const getSeverityTooltip = (severity: 'CRITICAL' | 'MODERATE' | 'MINOR') => {
    switch (severity) {
      case 'CRITICAL':
        return 'Critical issues require immediate attention and may significantly impact the quality or compliance of the note. These issues could lead to serious consequences if not addressed.';
      case 'MODERATE':
        return 'Moderate issues should be addressed to improve the quality of documentation. These issues may affect clarity or completeness but are not immediately critical.';
      case 'MINOR':
        return 'Minor issues are suggestions for improvement. While not critical, addressing these can enhance the overall quality and professionalism of the documentation.';
      default:
        return '';
    }
  };

  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Info />
          Issues Identified
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.length ? (
          issues.map((issue, index) => (
            <div key={index}>
              <div
                key={index}
                onClick={() => onCategoryClick?.(issue.category)}
                className={`cursor-pointer space-y-2 rounded-lg p-4 transition-colors ${onCategoryClick ? 'hover:border hover:border-green-300' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`px-3 py-1 text-xs font-semibold text-white uppercase ${
                        issue.severity === 'CRITICAL'
                          ? 'bg-gradient-red'
                          : issue.severity === 'MODERATE'
                            ? 'bg-gradient-severity-moderate'
                            : 'bg-gradient-severity-minor'
                      }`}
                    >
                      {issue.severity}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{getSeverityTooltip(issue.severity)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{issue.sectionId}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{issue.category}</h3>

                  <p className="mt-1 text-sm font-bold text-red-600">–{issue.points} points</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">{issue.description}</p>
                </div>
              </div>
              {index < issues.length - 1 && <Separator />}
            </div>
          ))
        ) : (
          <p className="text-center font-medium">No Issues Yet </p>
        )}
      </CardContent>
    </Card>
  );
};

export default IssuesIdentifiedCard;
