import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlacklistedNote } from '@/types/blacklistedNotes';
import { FileText } from 'lucide-react';
import { BlacklistStatusLabels } from '@/constants/common';
import { GradientBadge } from '@/shared/GradientBadge';
import { getStatusIcon } from './SharedComponents';
import { cn } from '@/lib/utils';
import { getStatusBadgeStyles } from './SharedComponents';
import { formatDate } from '@/utils/helper';

interface NoteMetadataCardProps {
  note: BlacklistedNote;
}

export const NoteMetadataCard = ({ note }: NoteMetadataCardProps) => {
  // Parse the original review path into workflow steps
  const parseReviewPath = (path: string | undefined): string[] => {
    if (!path) return [];
    return path.split('->').map(step => step.trim());
  };

  const reviewPathSteps = parseReviewPath(note.originalReviewPath);

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <FileText className="h-5 w-5" />
          Note Metadata
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Key-Value Pairs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Note ID:</span>
            <span className="text-sm font-semibold text-gray-900">{note.noteId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Practitioner:</span>
            <span className="text-sm font-semibold text-gray-900">{note.practitioner.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Client:</span>
            <span className="text-sm font-semibold text-gray-900">{note.client?.name || `Patient #${note.client?.id || 'N/A'}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Date:</span>
            <span className="text-sm text-gray-500">{formatDate(note.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Note Type:</span>
            <span className="text-sm font-semibold text-gray-900">{note.noteType.name}</span>
          </div>
          {note.cptCode && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">CPT Code:</span>
              <span className="text-sm font-semibold text-gray-900">{note.cptCode}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">AI Attempts:</span>
            <span className="text-sm font-semibold text-gray-900">
              {note.aiAttempts.current}/{note.aiAttempts.max}
            </span>
          </div>
        </div>

        {/* Original Review Path */}
        {reviewPathSteps.length > 0 && (
          <div className="my-2 space-y-2 border-t border-b py-4">
            <p className="text-xs font-medium text-gray-500">Original Review Path:</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {reviewPathSteps.map((step, index) => (
                <span key={index} className="text-sm text-gray-700">
                  {step}
                  {index < reviewPathSteps.length - 1 && <span className="mx-1.5 text-gray-400">→</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Current Status:</p>

          {note.status.id === 1 ? (
            <GradientBadge
              label={BlacklistStatusLabels[note.status.id] || note.status.name}
              gradient="bg-gradient-workflow-blacklisted"
              icon={getStatusIcon(note.status.id)}
              className="rounded-[6px]"
            />
          ) : (
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border bg-transparent px-3 py-1.5 text-xs font-semibold',
                getStatusBadgeStyles(note.status.id).border,
                getStatusBadgeStyles(note.status.id).text,
              )}
            >
              <span className={getStatusBadgeStyles(note.status.id).text}>{getStatusIcon(note.status.id)}</span>
              <span>{BlacklistStatusLabels[note.status.id] || note.status.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
