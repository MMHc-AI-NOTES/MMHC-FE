// @/components/notes/NotesTable.tsx
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FormattedNote } from '@/types/notes';
import {
  AiStatusLabels,
  HumanReviewLabels,
  ManagerLabels,
  WorkflowLabels,
  PriorityLabels,
  AiStatusEnum,
  HumanReviewEnum,
  ManagerEnum,
  WorkflowEnum,
  PriorityEnum,
} from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface NotesTableProps {
  notes: FormattedNote[];
  onViewNote: (noteId: string) => void;
}

// Helper function to get badge variant based on status
const getAiStatusVariant = (status: number): 'default' | 'destructive' | 'warning' | 'secondary' | 'outline' => {
  switch (status) {
    case AiStatusEnum.passed:
      return 'default'; // green
    case AiStatusEnum.failed:
      return 'destructive'; // red
    case AiStatusEnum.warning:
      return 'warning'; // yellow/orange
    case AiStatusEnum.not_reviewed:
      return 'secondary'; // gray
    case AiStatusEnum.needs_review:
      return 'warning'; // yellow/orange
    default:
      return 'outline';
  }
};

const getHumanReviewVariant = (status: number): 'default' | 'destructive' | 'secondary' => {
  switch (status) {
    case HumanReviewEnum.not_needed:
      return 'secondary'; // gray
    case HumanReviewEnum.completed:
      return 'default'; // green
    case HumanReviewEnum.pending:
      return 'secondary'; // yellow
    default:
      return 'outline' as any;
  }
};

const getManagerVariant = (status: number): 'default' | 'destructive' | 'secondary' => {
  switch (status) {
    case ManagerEnum.not_needed:
      return 'secondary';
    case ManagerEnum.pending:
      return 'secondary';
    case ManagerEnum.in_progress:
      return 'warning' as any;
    default:
      return 'outline' as any;
  }
};

const getWorkflowVariant = (status: number): 'default' | 'destructive' | 'secondary' | 'warning' => {
  switch (status) {
    case WorkflowEnum.completed:
      return 'default';
    case WorkflowEnum.in_queue:
      return 'secondary';
    case WorkflowEnum.returned:
      return 'warning' as any;
    case WorkflowEnum.blacklisted:
      return 'destructive';
    default:
      return 'outline' as any;
  }
};

const getPriorityVariant = (priority: number): 'default' | 'destructive' | 'secondary' | 'warning' => {
  switch (priority) {
    case PriorityEnum.low:
      return 'default';
    case PriorityEnum.medium:
      return 'warning' as any;
    case PriorityEnum.high:
      return 'destructive';
    default:
      return 'outline' as any;
  }
};

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
              <TableHead className="text-primary min-w-[100px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={index} className="group">
                <TableCell className="font-medium">{note.practitioner}</TableCell>
                <TableCell>{note.client}</TableCell>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.type}</TableCell>
                <TableCell className="font-semibold">{note.aiScore}</TableCell>
                <TableCell>
                  <Badge variant={getAiStatusVariant(note.aiStatus)}>{AiStatusLabels[note.aiStatus]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getHumanReviewVariant(note.humanReview)}>{HumanReviewLabels[note.humanReview]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getManagerVariant(note.manager)}>{ManagerLabels[note.manager]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getWorkflowVariant(note.workflow)}>{WorkflowLabels[note.workflow]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(note.priority)}>{PriorityLabels[note.priority]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      onClick={() => onViewNote(note.id)}
                      className="border-primary text-primary h-8 gap-1 bg-transparent py-2"
                    >
                      Open
                      <ChevronRight className="h-4 w-4" />
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
