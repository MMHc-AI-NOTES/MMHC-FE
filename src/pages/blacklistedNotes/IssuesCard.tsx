import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlacklistedNoteIssue } from '@/types/blacklistedNotes';
import { GradientBadge } from '@/shared/GradientBadge';
import { AlertTriangle, Info, OctagonAlert, ShieldAlert, User, Zap } from 'lucide-react';
import { ChatSeverityLabels } from '@/constants/common';

interface IssuesCardProps {
  issues: BlacklistedNoteIssue[];
}

export const IssuesCard = ({ issues }: IssuesCardProps) => {
  const getSeverityGradient = (severityId: number): string => {
    switch (severityId) {
      case 1: // Minor
        return 'bg-gradient-severity-minor';
      case 2: // Moderate
        return 'bg-gradient-severity-moderate';
      case 3: // Critical
        return 'bg-gradient-red';
      default:
        return 'bg-gradient-red';
    }
  };

  const getSourceIcon = (source: string) => {
    const colors = {
      AI: <Zap className="text-primary h-4 w-4" />,
      Human: <User className="text-primary h-4 w-4" />,
      Manager: <ShieldAlert className="text-primary h-4 w-4" />,
    };
    return colors[source as keyof typeof colors] || 'bg-gray-50 border-gray-600 text-gray-700';
  };
  if (!issues || issues.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Info className="h-5 w-5" />
            Issues Identified (AI + Human + Manager)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-gray-500">No issues identified</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Info className="h-5 w-5" />
          Issues Identified (AI + Human + Manager)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue, index) => (
          <div key={issue.id || index} className="rounded-lg border bg-white p-2">
            <div className="space-y-2 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GradientBadge
                    label={ChatSeverityLabels[issue.severity.id] || issue.severity.name}
                    gradient={getSeverityGradient(issue.severity.id)}
                    icon={issue.severity.id === 3 ? <OctagonAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    className="rounded-[6px]"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getSourceIcon(issue.source)}
                    <span className="text-sm text-gray-500">{issue.source}</span>
                  </div>
                  <p className="mt-0.5 text-right text-sm font-medium text-gray-500">{issue.id}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{issue.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{issue.description}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
