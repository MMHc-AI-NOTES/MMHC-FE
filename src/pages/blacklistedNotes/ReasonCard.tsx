import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlacklistedNote } from '@/types/blacklistedNotes';
import { GradientBadge } from '@/shared/GradientBadge';
import { AlertTriangle, OctagonAlert } from 'lucide-react';
import { ChatSeverityLabels } from '@/constants/common';
import moment from 'moment';

interface ReasonCardProps {
  note: BlacklistedNote;
}

export const ReasonCard = ({ note }: ReasonCardProps) => {
  const reasonDetails = note.reasonDetails || {
    title: note.blacklistReason.name,
    description: [],
    severity: note.severity,
    date: note.date,
  };

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

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-red-700" />
          Reason for Blacklisting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h3 className="text-primary font-semibold">{reasonDetails.title}</h3>
          {reasonDetails.description && reasonDetails.description.length > 0 && (
            <ul className="mt-2 space-y-1 pl-0 text-sm">
              {reasonDetails.description.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 border-t pt-3">
          <GradientBadge
            label={ChatSeverityLabels[reasonDetails.severity.id] || reasonDetails.severity.name}
            gradient={getSeverityGradient(reasonDetails.severity.id)}
            icon={note.severity.id === 3 ? <OctagonAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            className="rounded-[6px]"
          />

          <p className="text-xs text-gray-500">{moment(reasonDetails.date).format('MMM D, YYYY - h:mm A')}</p>
          {reasonDetails.autoBlacklistedBy && <p className="">{reasonDetails.autoBlacklistedBy}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
