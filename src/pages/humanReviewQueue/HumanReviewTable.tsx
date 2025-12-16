// @/pages/humanReviewQueue/HumanReviewTable.tsx
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HumanReviewNote } from '@/types/notes';
import { AiStatusLabels, ReviewStatusLabels, PriorityLabels, AiStatusEnum, ReviewStatusEnum, PriorityEnum } from '@/constants/common';
import { GradientBadge } from '@/shared/GradientBadge';

interface HumanReviewTableProps {
  notes: HumanReviewNote[];
  onReviewNote: (noteId: string) => void;
}

// Helper functions to get gradient CSS classes for badges
const getAiStatusGradient = (status: number): string => {
  switch (status) {
    case AiStatusEnum.passed:
      return 'bg-gradient-ai-passed';
    case AiStatusEnum.failed:
      return 'bg-gradient-ai-failed';
    case AiStatusEnum.warning:
      return 'bg-gradient-ai-warning';
    case AiStatusEnum.needs_review:
      return 'bg-gradient-ai-needs-review';
    case AiStatusEnum.not_reviewed:
      return 'bg-gradient-ai-not-reviewed';
    default:
      return 'bg-gradient-neutral';
  }
};

const getReviewStatusGradient = (status: number): string => {
  switch (status) {
    case ReviewStatusEnum.pending:
      return 'bg-gradient-human-pending';
    case ReviewStatusEnum.in_progress:
      return 'bg-gradient-manager-in-progress';
    case ReviewStatusEnum.returned:
      return 'bg-gradient-human-returned';
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

export const HumanReviewTable = ({ notes, onReviewNote }: HumanReviewTableProps) => {
  const columnCount = 9;

  if (notes.length === 0) {
    return (
      <div className="border-y">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
                <TableHead className="text-primary min-w-[140px] font-semibold">PRACTITIONER</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">DATE</TableHead>
                <TableHead className="text-primary min-w-[80px] font-semibold">SCORE</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">AI STATUS</TableHead>
                <TableHead className="text-primary min-w-[140px] font-semibold">REVIEW STATUS</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">PRIORITY</TableHead>
                <TableHead className="text-primary min-w-[140px] text-center font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columnCount} className="text-muted-foreground py-8 text-center">
                  No notes found matching your filters.
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
              <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
              <TableHead className="text-primary min-w-[140px] font-semibold">PRACTITIONER</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">DATE</TableHead>
              <TableHead className="text-primary min-w-[80px] font-semibold">SCORE</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">AI STATUS</TableHead>
              <TableHead className="text-primary min-w-[140px] font-semibold">REVIEW STATUS</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">PRIORITY</TableHead>
              <TableHead className="text-primary min-w-[140px] text-center font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index} className="group">
                <TableCell className="text-left font-medium">#{note.id}</TableCell>
                <TableCell className="font-medium">{note.practitioner}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell className="font-semibold">{note.score}</TableCell>
                <TableCell>
                  <GradientBadge label={AiStatusLabels[note.aiStatus]} gradient={getAiStatusGradient(note.aiStatus)} />
                </TableCell>
                <TableCell>
                  <GradientBadge label={ReviewStatusLabels[note.reviewStatus]} gradient={getReviewStatusGradient(note.reviewStatus)} />
                </TableCell>
                <TableCell>{note.reviewer || 'Unassigned'}</TableCell>
                <TableCell>
                  <GradientBadge label={PriorityLabels[note.priority]} gradient={getPriorityGradient(note.priority)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => onReviewNote(note.id)}
                      className="border-primary text-primary hover:bg-primary h-9 gap-1 bg-transparent text-[13px] hover:text-white"
                    >
                      Review Note
                      <ArrowRight className="ml-1" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
