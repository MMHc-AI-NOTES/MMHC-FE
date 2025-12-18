import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GradientBadge } from '@/shared/GradientBadge';
import { BlacklistedNote } from '@/types/blacklistedNotes';
import moment from 'moment';
import { AlertTriangle, OctagonAlert, Square, SquareCheckBig, ArrowRight } from 'lucide-react';
import { ChatSeverityLabels, BlacklistStatusLabels } from '@/constants/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getStatusBadgeStyles,
  getStatusIcon,
  // getStatusIconColor
} from './SharedComponents';

interface BlacklistedNotesTableProps {
  notes: BlacklistedNote[];
  selectedNoteIds: number[];
  onToggleNoteSelection: (noteId: number) => void;
  onToggleAll: () => void;
  onReview: (note: BlacklistedNote) => void;
}

const getSeverityGradient = (severityId: number): string => {
  switch (severityId) {
    case 1: // Minor
      return 'bg-gradient-severity-minor';
    case 2: // Moderate
      return 'bg-gradient-severity-moderate';
    case 3: // Critical
      return 'bg-gradient-severity-critical';
    default:
      return 'bg-gradient-red';
  }
};

export const BlacklistedNotesTable = ({
  notes,
  selectedNoteIds,
  onToggleNoteSelection,
  onToggleAll,
  onReview,
}: BlacklistedNotesTableProps) => {
  if (notes.length === 0) {
    return (
      <div className="border-y">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary w-10">
                  {selectedNoteIds.length === notes.length && notes.length > 0 ? (
                    <SquareCheckBig className="text-primary ml-[7px] h-4 w-4" onClick={onToggleAll} />
                  ) : (
                    <Square className="ml-[7px] h-4 w-4" onClick={onToggleAll} />
                  )}
                </TableHead>
                <TableHead className="text-primary min-w-[100px] text-left font-semibold">NOTE ID</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">PRACTITIONER</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">DATE</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">NOTE TYPE</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">AI SCORE</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">BLACKLIST REASON</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">AI ATTEMPTS</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">SEVERITY</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">STATUS</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">ASSIGNED TO</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} className="text-muted-foreground py-8 text-center">
                  No data found matching your filters.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="border-y">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary w-10">
                {selectedNoteIds.length === notes.length && notes.length > 0 ? (
                  <SquareCheckBig className="text-primary ml-[7px] h-4 w-4" onClick={onToggleAll} />
                ) : (
                  <Square className="ml-[7px] h-4 w-4" onClick={onToggleAll} />
                )}
              </TableHead>
              <TableHead className="text-primary min-w-[100px] text-left font-semibold">NOTE ID</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">PRACTITIONER</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">DATE</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">NOTE TYPE</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">AI SCORE</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">BLACKLIST REASON</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">AI ATTEMPTS</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">SEVERITY</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">STATUS</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">ASSIGNED TO</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => {
              const isSelected = selectedNoteIds.includes(note.id);

              return (
                <TableRow key={note.id} className={`${isSelected ? 'bg-highlighted-row' : ''}`}>
                  <TableCell>
                    {isSelected ? (
                      <SquareCheckBig className="text-primary h-4 w-4" onClick={() => onToggleNoteSelection(note.id)} />
                    ) : (
                      <Square className="h-4 w-4 text-gray-500" onClick={() => onToggleNoteSelection(note.id)} />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {/* <span className={getStatusIconColor(note.status.id)}>{getStatusIcon(note.status.id)}</span> */}
                      <span className="text-primary font-semibold">{note.noteId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{note.practitioner.name}</TableCell>
                  <TableCell>{moment(note.date).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{note.noteType.name}</TableCell>
                  <TableCell className="font-semibold">{note.aiScore !== null ? note.aiScore : 'N/A'}</TableCell>
                  <TableCell>{note.blacklistReason.name}</TableCell>
                  <TableCell>
                    {note.aiAttempts.current}/{note.aiAttempts.max}
                  </TableCell>
                  <TableCell>
                    <GradientBadge
                      label={ChatSeverityLabels[note.severity.id] || note.severity.name}
                      gradient={getSeverityGradient(note.severity.id)}
                      icon={note.severity.id === 3 ? <OctagonAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      className="rounded-[6px]"
                    />
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{note.assignedTo?.name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button variant="ghost" className="text-primary" onClick={() => onReview(note)}>
                        Review
                        <ArrowRight />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
