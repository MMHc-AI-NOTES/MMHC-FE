import { Square, SquareCheckBig } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ManagerNote } from './managerReviewTypes';
import {
  DisagreementLevelEnum,
  DisagreementLevelLabels,
  ManagerDecisionEnum,
  ManagerDecisionLabels,
  PriorityEnum,
  PriorityLabels,
} from '@/constants/common';
import { GradientBadge } from '@/shared/GradientBadge';

interface ManagerTableProps {
  notes: ManagerNote[];
  loading?: boolean;
  onReview: (id: string) => void;
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

export const ManagerTable = ({ notes, onReview, selectedIds, onToggleRow, onToggleAll }: ManagerTableProps) => {
  if (notes.length === 0) {
    return (
      <div className="border-y">
        <div className="text-muted-foreground p-6 text-center">No manager reviews found.</div>
      </div>
    );
  }

  const getManagerGradientDecision = (manager: number): string => {
    switch (manager) {
      case ManagerDecisionEnum.approve_with_edits:
        return 'bg-gradient-workflow-completed';
      case ManagerDecisionEnum.return_to_practitioner:
        return 'bg-gradient-workflow-returned';
      case ManagerDecisionEnum.escalate:
        return 'bg-gradient-priority-medium';
      default:
        return 'bg-gradient-neutral';
    }
  };
  const getDisagreementLevelGradient = (disagreement: number): string => {
    switch (disagreement) {
      case DisagreementLevelEnum.high:
        return 'bg-gradient-priority-high';
      case DisagreementLevelEnum.medium:
        return 'bg-gradient-priority-medium';
      case DisagreementLevelEnum.low:
        return 'bg-gradient-priority-low';
      case DisagreementLevelEnum.none:
        return 'bg-gradient-workflow-completed';
      default:
        return 'bg-gradient-neutral';
    }
  };

  const getPriorityGradient = (priority: number): string => {
    switch (priority) {
      case PriorityEnum.high:
        return 'bg-gradient-priority-high';
      case PriorityEnum.medium:
        return 'bg-gradient-priority-medium';
      case PriorityEnum.low:
        return 'bg-gradient-priority-low';
      default:
        return 'bg-gradient-neutral';
    }
  };

  if (notes.length === 0) {
    return (
      <div className="border-y">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary w-10">
                  {selectedIds.length === notes.length && notes.length > 0 ? (
                    <SquareCheckBig className="text-primary ml-[7px] h-4 w-4" onClick={onToggleAll} />
                  ) : (
                    <Square className="ml-[7px] h-4 w-4" onClick={onToggleAll} />
                  )}
                </TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
                <TableHead className="text-primary min-w-[160px] font-semibold">PRACTITIONER</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">DATE</TableHead>
                <TableHead className="text-primary min-w-[80px] font-semibold">AI SCORE</TableHead>
                <TableHead className="text-primary min-w-[110px] font-semibold">HUMAN SCORE</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
                <TableHead className="text-primary min-w-[160px] font-semibold">HUMAN DECISION</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">DISAGREEMENT</TableHead>
                <TableHead className="text-primary min-w-[110px] font-semibold">PRIORITY</TableHead>
                <TableHead className="text-primary min-w-[100px] text-center font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className="text-muted-foreground py-8 text-center">
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
                {selectedIds.length === notes.length && notes.length > 0 ? (
                  <SquareCheckBig className="text-primary ml-[7px] h-4 w-4" onClick={onToggleAll} />
                ) : (
                  <Square className="ml-[7px] h-4 w-4" onClick={onToggleAll} />
                )}
              </TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
              <TableHead className="text-primary min-w-[160px] font-semibold">PRACTITIONER</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">DATE</TableHead>
              <TableHead className="text-primary min-w-[80px] font-semibold">AI SCORE</TableHead>
              <TableHead className="text-primary min-w-[110px] font-semibold">HUMAN SCORE</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
              <TableHead className="text-primary min-w-[160px] font-semibold">HUMAN DECISION</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">DISAGREEMENT</TableHead>
              <TableHead className="text-primary min-w-[110px] font-semibold">PRIORITY</TableHead>
              <TableHead className="text-primary min-w-[100px] text-center font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => {
              const isSelected = selectedIds.includes(note.id);
              return (
                <TableRow key={note.id} className={`${isSelected ? 'bg-highlighted-row' : ''}`}>
                  <TableCell>
                    {isSelected ? (
                      <SquareCheckBig className="text-primary h-4 w-4" onClick={() => onToggleRow(note.id)} />
                    ) : (
                      <Square className="h-4 w-4 text-gray-500" onClick={() => onToggleRow(note.id)} />
                    )}
                  </TableCell>
                  <TableCell className="text-primary font-semibold">#{note.id}</TableCell>
                  <TableCell className="font-medium">{note.practitioner}</TableCell>
                  <TableCell>{note.date}</TableCell>
                  <TableCell className="font-semibold">{note.aiScore}</TableCell>
                  <TableCell className="font-semibold">{note.humanScore ?? '—'}</TableCell>
                  <TableCell>{note.reviewer}</TableCell>
                  <TableCell>
                    <GradientBadge
                      label={ManagerDecisionLabels[note.humanDecision]}
                      gradient={getManagerGradientDecision(note.humanDecision)}
                    />
                  </TableCell>
                  <TableCell>
                    <GradientBadge
                      label={DisagreementLevelLabels[note.disagreement]}
                      gradient={getDisagreementLevelGradient(note.disagreement)}
                    />
                  </TableCell>
                  <TableCell>
                    <GradientBadge label={PriorityLabels[note.priority]} gradient={getPriorityGradient(note.priority)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary h-9 gap-1 bg-transparent text-[13px] hover:text-white"
                        onClick={() => onReview(note.id)}
                      >
                        Review
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
