// @/components/notes/NotesTable.tsx
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormattedNote } from '@/types/notes';
import {
  AiStatusLabels,
  HumanReviewLabels,
  ManagerLabels,
  WorkflowLabels,
  PriorityLabels,
  // ReviewCycleLabels,
  AiStatusEnum,
  HumanReviewEnum,
  ManagerEnum,
  WorkflowEnum,
  PriorityEnum,
  // ReviewCycleEnum,
} from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { GradientBadge } from '@/shared/GradientBadge';

interface NotesTableProps {
  notes: FormattedNote[];
  onViewNote: (noteId: string) => void;
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

const getHumanReviewGradient = (status: number): string => {
  switch (status) {
    case HumanReviewEnum.pending:
      return 'bg-gradient-human-pending';
    case HumanReviewEnum.completed:
      return 'bg-gradient-human-completed';
    case HumanReviewEnum.not_needed:
      return 'bg-gradient-human-not-needed';
    default:
      return 'bg-gradient-neutral';
  }
};

const getManagerGradient = (status: number): string => {
  switch (status) {
    case ManagerEnum.pending:
      return 'bg-gradient-manager-pending';
    case ManagerEnum.in_progress:
      return 'bg-gradient-manager-in-progress';
    case ManagerEnum.completed:
      return 'bg-gradient-manager-completed';
    case ManagerEnum.not_needed:
      return 'bg-gradient-manager-not-needed';
    default:
      return 'bg-gradient-neutral';
  }
};

const getWorkflowGradient = (status: number): string => {
  switch (status) {
    case WorkflowEnum.in_queue:
      return 'bg-gradient-workflow-in-queue';
    case WorkflowEnum.returned:
      return 'bg-gradient-workflow-returned';
    case WorkflowEnum.blacklisted:
      return 'bg-gradient-workflow-blacklisted';
    case WorkflowEnum.completed:
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

// REVIEW CYCLE gradients (commented out for now)
// const getReviewCycleGradient = (cycle: number): string => {
//   switch (cycle) {
//     case ReviewCycleEnum.cycle_1:
//       return 'bg-gradient-review-cycle-1';
//     case ReviewCycleEnum.cycle_2:
//       return 'bg-gradient-review-cycle-2';
//     case ReviewCycleEnum.cycle_3:
//       return 'bg-gradient-review-cycle-3';
//     case ReviewCycleEnum.blacklisted:
//       return 'bg-gradient-review-cycle-blacklisted';
//     default:
//       return 'bg-gradient-neutral';
//   }
// };

export const NotesTable = ({ notes, onViewNote }: NotesTableProps) => {
  const columnCount = 11;

  if (notes.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary min-w-[120px]">Practitioner</TableHead>
                <TableHead className="text-primary min-w-[100px]">Client</TableHead>
                <TableHead className="text-primary min-w-[100px]">Date</TableHead>
                <TableHead className="text-primary min-w-[120px]">Type</TableHead>
                <TableHead className="text-primary min-w-[100px]">AI Score</TableHead>
                <TableHead className="text-primary min-w-[120px]">AI Status</TableHead>
                <TableHead className="text-primary min-w-[140px]">Human Review</TableHead>
                <TableHead className="text-primary min-w-[120px]">Manager</TableHead>
                <TableHead className="text-primary min-w-[120px]">
                  <div className="text-primary flex items-center gap-1">
                    Workflow
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="text-muted-foreground h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current workflow status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <div className="text-primary flex items-center gap-1">
                    Priority
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="text-muted-foreground h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Review priority level</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                {/* REVIEW CYCLE Column - Commented out for now */}
                {/* <TableHead className="text-primary min-w-[140px]">
                  <div className="text-primary flex items-center gap-1">
                    Review Cycle
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="text-muted-foreground h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current review cycle status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead> */}
                <TableHead className="text-primary min-w-[100px] text-center">Action</TableHead>
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
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary min-w-[120px]">Note ID</TableHead>
              <TableHead className="text-primary min-w-[120px]">Practitioner</TableHead>
              <TableHead className="text-primary min-w-[100px]">Client</TableHead>
              <TableHead className="text-primary min-w-[100px]">Date</TableHead>
              <TableHead className="text-primary min-w-[120px]">Type</TableHead>
              <TableHead className="text-primary min-w-[100px]">AI Score</TableHead>
              <TableHead className="text-primary min-w-[120px]">AI Status</TableHead>
              <TableHead className="text-primary min-w-[140px]">Human Review</TableHead>
              <TableHead className="text-primary min-w-[120px]">Manager</TableHead>
              <TableHead className="text-primary min-w-[120px]">
                <div className="flex items-center gap-1">
                  Workflow
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="text-muted-foreground h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current workflow status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="text-primary min-w-[100px]">
                <div className="flex items-center gap-1">
                  Priority
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="text-muted-foreground h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Review priority level</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              {/* REVIEW CYCLE Column - Commented out for now */}
              {/* <TableHead className="text-primary min-w-[140px]">
                <div className="flex items-center gap-1">
                  Review Cycle
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="text-muted-foreground h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current review cycle status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead> */}
              <TableHead className="text-primary min-w-[100px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index} className="group">
                <TableCell className="text-left font-medium">#{note.id}</TableCell>
                <TableCell className="font-medium">{note.practitioner}</TableCell>
                <TableCell>{note.client}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.type}</TableCell>
                <TableCell className="font-semibold">{note.aiScore}</TableCell>
                <TableCell>
                  <GradientBadge label={AiStatusLabels[note.aiStatus]} gradient={getAiStatusGradient(note.aiStatus)} />
                </TableCell>
                <TableCell>
                  <GradientBadge label={HumanReviewLabels[note.humanReview]} gradient={getHumanReviewGradient(note.humanReview)} />
                </TableCell>
                <TableCell>
                  <GradientBadge label={ManagerLabels[note.manager]} gradient={getManagerGradient(note.manager)} />
                </TableCell>
                <TableCell>
                  <GradientBadge label={WorkflowLabels[note.workflow]} gradient={getWorkflowGradient(note.workflow)} />
                </TableCell>
                <TableCell>
                  <GradientBadge label={PriorityLabels[note.priority]} gradient={getPriorityGradient(note.priority)} />
                </TableCell>
                {/* REVIEW CYCLE Cell - Commented out for now */}
                {/* <TableCell>
                  <GradientBadge 
                    label={ReviewCycleLabels[note.reviewCycle || ReviewCycleEnum.cycle_1]} 
                    gradient={getReviewCycleGradient(note.reviewCycle || ReviewCycleEnum.cycle_1)} 
                  />
                </TableCell> */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      onClick={() => onViewNote(note.id)}
                      className="border-primary text-primary h-8 gap-1 bg-transparent py-2"
                    >
                      Open
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
