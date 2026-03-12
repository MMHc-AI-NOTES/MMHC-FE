import { Square, SquareCheckBig } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ManagerNote } from './managerReviewTypes';
// import {
//   DisagreementLevelEnum,
//   DisagreementLevelLabels,
//   HumanReviewDecisionEnum,
//   HumanReviewDecisionLabels,
//   PriorityEnum,
//   PriorityLabels,
// } from '@/constants/common';
// import { GradientBadge } from '@/shared/GradientBadge';
interface ManagerTableProps {
  notes: ManagerNote[];
  loading?: boolean;
  onReview: (note: ManagerNote) => void;
  selectedIds: string[];
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

// const getManagerGradientDecision = (manager: number): string => {
//   switch (manager) {
//     case HumanReviewDecisionEnum.accept_ai_evaluation:
//       return 'bg-gradient-workflow-completed';
//     case HumanReviewDecisionEnum.ai_incorrect_override_score:
//       return 'bg-gradient-workflow-returned';
//     case HumanReviewDecisionEnum.clinically_acceptable_despite_ai_issues:
//       return 'bg-gradient-priority-medium';
//     case HumanReviewDecisionEnum.needs_practitioner_correction:
//       return 'bg-gradient-priority-low';
//     case HumanReviewDecisionEnum.escalate_to_office_manager:
//       return 'bg-gradient-neutral';
//     default:
//       return 'bg-gradient-neutral';
//   }
// };
// const getDisagreementLevelGradient = (disagreement: number): string => {
//   switch (disagreement) {
//     case DisagreementLevelEnum.high:
//       return 'bg-gradient-priority-high';
//     case DisagreementLevelEnum.medium:
//       return 'bg-gradient-priority-medium';
//     case DisagreementLevelEnum.low:
//       return 'bg-gradient-priority-low';
//     case DisagreementLevelEnum.none:
//       return 'bg-gradient-workflow-completed';
//     default:
//       return 'bg-gradient-neutral';
//   }
// };

// const getPriorityGradient = (priority: number): string => {
//   switch (priority) {
//     case PriorityEnum.high:
//       return 'bg-gradient-priority-high';
//     case PriorityEnum.medium:
//       return 'bg-gradient-priority-medium';
//     case PriorityEnum.low:
//       return 'bg-gradient-priority-low';
//     default:
//       return 'bg-gradient-neutral';
//   }
// };

export const ManagerTable = ({ notes, onReview, selectedIds, onToggleRow, onToggleAll }: ManagerTableProps) => {
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
                <TableHead className="text-primary min-w-[120px] font-semibold">ASSIGN DATE</TableHead>
                {/* <TableHead className="text-primary min-w-[80px] font-semibold">AI SCORE</TableHead> */}
                <TableHead className="text-primary min-w-[110px] font-semibold">ADMIN SCORE</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
                {/* <TableHead className="text-primary min-w-[160px] font-semibold">HUMAN DECISION</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">DISAGREEMENT</TableHead>
                <TableHead className="text-primary min-w-[110px] font-semibold">PRIORITY</TableHead> */}
                <TableHead className="text-primary min-w-[160px] font-semibold">EMAIL SENT</TableHead>
                {/* <TableHead className="text-primary min-w-[160px] font-semibold">REVIEWER VERSION</TableHead> */}
                <TableHead className="text-primary min-w-[160px] font-semibold">NOTE VERSION</TableHead>
                <TableHead className="text-primary min-w-[100px] text-center font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
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
              <TableHead className="text-primary min-w-[120px] font-semibold">ASSIGN DATE</TableHead>
              {/* <TableHead className="text-primary min-w-[80px] font-semibold">AI SCORE</TableHead> */}
              <TableHead className="text-primary min-w-[110px] font-semibold">ADMIN SCORE</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">REVIEWER</TableHead>
              {/* <TableHead className="text-primary min-w-[160px] font-semibold">HUMAN DECISION</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">DISAGREEMENT</TableHead>
                <TableHead className="text-primary min-w-[110px] font-semibold">PRIORITY</TableHead> */}
              <TableHead className="text-primary min-w-[160px] font-semibold">EMAIL SENT</TableHead>
              {/* <TableHead className="text-primary min-w-[160px] font-semibold">REVIEWER VERSION</TableHead> */}
              <TableHead className="text-primary min-w-[160px] font-semibold">NOTE VERSION</TableHead>
              <TableHead className="text-primary min-w-[100px] text-center font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map(note => {
              const isSelected = selectedIds.includes(note.id.toString());
              return (
                <TableRow key={note.id} className={`${isSelected ? 'bg-highlighted-row' : ''}`}>
                  <TableCell>
                    {isSelected ? (
                      <SquareCheckBig className="text-primary h-4 w-4" onClick={() => onToggleRow(note.id.toString())} />
                    ) : (
                      <Square className="h-4 w-4 text-gray-500" onClick={() => onToggleRow(note.id.toString())} />
                    )}
                  </TableCell>
                  <TableCell className="text-primary font-semibold">{note.noteId}</TableCell>
                  <TableCell className="font-medium">{note.practitioner}</TableCell>
                  <TableCell>{note.date}</TableCell>
                  {/* <TableCell className="font-semibold">{note.aiScore}</TableCell> */}
                  <TableCell className="font-semibold">{note.humanScore ?? '—'}</TableCell>
                  <TableCell>{note.reviewer}</TableCell>
                  {/* <TableCell>
                    {note.humanDecision ? (
                      <GradientBadge
                        label={HumanReviewDecisionLabels[note.humanDecision] || 'Unknown'}
                        gradient={getManagerGradientDecision(note.humanDecision)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {note.disagreement ? (
                      <GradientBadge
                        label={DisagreementLevelLabels[note.disagreement]}
                        gradient={getDisagreementLevelGradient(note.disagreement)}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <GradientBadge label={PriorityLabels[note.priority]} gradient={getPriorityGradient(note.priority)} />
                  </TableCell> */}
                  <TableCell>{note.emailSendDate || '-'}</TableCell>
                  {/* <TableCell>{note.reviewerVersion || '-'}</TableCell> */}
                  <TableCell>{note.noteVersion || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary h-9 gap-1 bg-transparent text-[13px] hover:text-white"
                        onClick={event => {
                          const reviewerId = note.rawData?.smeIssues?.[0]?.reviewerId || note.rawData?.smeIssues?.[0]?.reviewer?.id || null;

                          const url = `/manager-review/single-note-audit/${note.noteId}`;
                          const params = new URLSearchParams();
                          if (reviewerId != null) {
                            params.set('reviewerId', String(reviewerId));
                          }
                          params.set('isManagerReviewing', 'true');
                          params.set('from', 'manager-review-queue');
                          const fullUrl = `${url}?${params.toString()}`;

                          if (event.metaKey || event.ctrlKey || event.button === 1) {
                            window.open(fullUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            onReview(note);
                          }
                        }}
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
