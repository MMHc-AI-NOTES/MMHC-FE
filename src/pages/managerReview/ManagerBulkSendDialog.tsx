import { useMemo, useState } from 'react';
import { Loader2, Send, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import type { ManagerBulkSendNoteItem } from './managerReviewTypes';

interface ManagerBulkSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: ManagerBulkSendNoteItem[];
  isSending: boolean;
  onConfirm: () => void;
}

const isSendableNote = (note: ManagerBulkSendNoteItem) =>
  note.practitionerId !== null && note.reviewerId !== null && note.versionId !== null;

export const ManagerBulkSendDialog = ({ open, onOpenChange, notes, isSending, onConfirm }: ManagerBulkSendDialogProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const sendableCount = useMemo(() => notes.filter(isSendableNote).length, [notes]);

  const handleSendClick = () => {
    if (sendableCount === 0) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    onConfirm();
    setIsConfirmOpen(false);
  };

  const groupedByPractitioner = useMemo(() => {
    const map = new Map<string, { practitionerName: string; practitionerEmail: string | null; notes: ManagerBulkSendNoteItem[] }>();

    notes.forEach(note => {
      const practitionerName = note.practitionerName || 'Unknown Practitioner';
      const key = `${note.practitionerId ?? 'unknown'}-${practitionerName}`;
      const existing = map.get(key) || {
        practitionerName,
        practitionerEmail: note.practitionerEmail,
        notes: [],
      };
      existing.notes.push(note);
      if (!existing.practitionerEmail && note.practitionerEmail) {
        existing.practitionerEmail = note.practitionerEmail;
      }
      map.set(key, existing);
    });

    return Array.from(map.entries()).map(([groupKey, group]) => ({
      groupKey,
      practitionerName: group.practitionerName,
      practitionerEmail: group.practitionerEmail,
      notes: group.notes,
      sendableCount: group.notes.filter(isSendableNote).length,
    }));
  }, [notes]);

  const skippedCount = notes.length - sendableCount;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          if (!isSending) {
            onOpenChange(nextOpen);
          }
        }}
      >
        <DialogContent className="p-0 sm:max-w-2xl" aria-describedby="">
          <DialogHeader className="border-b px-6 pt-6 pb-4">
            <DialogTitle className="text-primary">Send to Practitioner</DialogTitle>
            <DialogDescription className="pt-1">Review selected practitioners and notes before sending notifications.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-4">
            <div className="rounded-md border bg-gray-50 px-4 py-3 text-sm">
              <p>
                Selected notes: <span className="font-semibold">{notes.length}</span>
              </p>
              <p>
                Ready to send: <span className="font-semibold">{sendableCount}</span>
              </p>
              {skippedCount > 0 && (
                <p className="pt-1 text-orange-700">
                  <TriangleAlert className="mr-1 inline h-4 w-4" />
                  {skippedCount} note{skippedCount > 1 ? 's are' : ' is'} missing required reviewer/version data and will be skipped.
                </p>
              )}
            </div>

            {groupedByPractitioner.length > 0 ? (
              <div className="max-h-[360px] overflow-y-auto rounded-md border px-4">
                <Accordion type="multiple">
                  {groupedByPractitioner.map(group => (
                    <AccordionItem key={group.groupKey} value={group.groupKey}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-col">
                          <span className="text-primary text-sm font-semibold">{group.practitionerName}</span>
                          <span className="text-muted-foreground text-sm">{group.practitionerEmail || 'Not available'}</span>

                          <span className="text-muted-foreground text-xs">
                            {group.notes.length} note{group.notes.length > 1 ? 's' : ''} selected, {group.sendableCount} ready
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {group.notes.map(note => {
                            const sendable = isSendableNote(note);

                            return (
                              <div key={note.id} className="space-y-3 rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                  <p className="flex items-baseline gap-1 text-sm">
                                    <span className="text-muted-foreground">Note ID:</span>
                                    <span className="text-foreground font-semibold">{note.noteId}</span>
                                  </p>
                                  <span className={`text-xs font-medium ${sendable ? 'text-green-700' : 'text-orange-700'}`}>
                                    {sendable ? 'Ready' : 'Missing data'}
                                  </span>
                                </div>
                                <div className="text-muted-foreground grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                                  <p className="flex items-baseline gap-1">
                                    <span>Reviewer:</span>
                                    <span className="text-foreground font-medium">{note.reviewerName || 'Unknown'}</span>
                                  </p>
                                  <p className="flex items-baseline gap-1">
                                    <span>Date:</span>
                                    <span className="text-foreground font-medium">{note.date || 'N/A'}</span>
                                  </p>
                                  <p className="flex items-baseline gap-1">
                                    <span>AI Score:</span>
                                    <span className="text-foreground font-medium">{note.aiScore}</span>
                                  </p>
                                  <p className="flex items-baseline gap-1">
                                    <span>Human Score:</span>
                                    <span className="text-foreground font-medium">{note.humanScore ?? '—'}</span>
                                  </p>
                                  <p className="flex items-baseline gap-1 sm:col-span-2">
                                    <span>Version ID:</span>
                                    <span className="text-foreground font-medium">{note.versionId ?? 'Missing'}</span>
                                  </p>
                                </div>

                                <div className="space-y-2 border-t pt-2">
                                  <p className="text-xs font-semibold text-gray-700">Issues ({note.issues.length})</p>

                                  {note.issues.length > 0 ? (
                                    <div className="space-y-2">
                                      {note.issues.map(issue => (
                                        <div key={issue.id} className="rounded border border-gray-200 bg-gray-50 p-2.5">
                                          <p className="text-xs font-medium text-gray-900">{issue.errorType}</p>
                                          <p className="text-xs text-gray-600">Related to: {issue.relatedTo}</p>
                                          <p className="text-xs text-gray-700">{issue.description}</p>
                                          {issue.comment ? (
                                            <p className="text-xs text-gray-700">
                                              Comment: <span className="font-medium">{issue.comment}</span>
                                            </p>
                                          ) : null}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="mt-1 text-xs text-gray-500">No issues found for this note.</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-muted-foreground rounded-md border border-dashed p-5 text-center text-sm">No selected notes found.</div>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button className="bg-gradient-light text-primary" disabled={isSending || sendableCount === 0} onClick={handleSendClick}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? 'Sending...' : `Send (${sendableCount})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        isLoading={isSending}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSend}
        title="Send to Practitioner"
        description={`Are you sure you want to send ${sendableCount} note${sendableCount !== 1 ? 's' : ''} to practitioners? This will notify them about the review.`}
        confirmButtonText="Send"
      />
    </>
  );
};

export default ManagerBulkSendDialog;
