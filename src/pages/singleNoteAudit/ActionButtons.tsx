import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Check, ChevronsUpDown, Send } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { setSelectedAgentId } from '@/store/slices/agentsSlice';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { notifyPractitioner } from './singleNoteApiCalls';
import { showToast } from '@/lib/toast';

interface ActionButtonsProps {
  // onFlagReview: () => void;
  onReRunAudit: (isRerun: boolean) => void;
  isReRun?: boolean;
  isManagerReviewing?: boolean;
  reviewerId?: number | null;
  practitionerId?: number | null;
  noteId?: string;
  versionId?: number | null;
}

const ActionButtons = ({
  onReRunAudit,
  isReRun = false,
  isManagerReviewing = false,
  reviewerId,
  practitionerId,
  noteId,
  versionId,
}: ActionButtonsProps) => {
  const dispatch = useDispatch();
  const { agents, selectedAgentId } = useAppSelector(state => state.agents);
  const [open, setOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const selectedAgent = agents?.find(agent => agent.id === selectedAgentId);

  const handleSelectAgent = (agentId: number) => {
    dispatch(setSelectedAgentId(agentId));
    setOpen(false);
  };

  const handleSendToPractitioner = async () => {
    if (!practitionerId || !noteId || !reviewerId || !versionId) {
      showToast.error('Missing required information to send notification');
      return;
    }

    setIsNotifying(true);
    try {
      await notifyPractitioner({
        practitioner_id: practitionerId,
        note_id: noteId,
        reviewer_id: reviewerId,
        version_id: versionId,
      });
      setIsNotifyDialogOpen(false);
    } catch (error) {
      console.error('Error notifying practitioner:', error);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <>
      <Card className="p-4">
        {!isManagerReviewing ? (
          <>
            {/* Agent Selection Dropdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Agent</p>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="focus:border-primary-light h-12 w-full justify-between bg-white shadow-sm"
                  >
                    {selectedAgent ? selectedAgent.name : 'Select agent...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command className="w-full">
                    <CommandInput placeholder="Search agent..." />
                    <CommandList>
                      <CommandEmpty>No agent found.</CommandEmpty>
                      <CommandGroup>
                        {agents?.map(agent => (
                          <CommandItem key={agent.id} value={agent.name} onSelect={() => handleSelectAgent(agent.id)}>
                            <Check className={cn('mr-2 h-4 w-4', selectedAgentId === agent.id ? 'opacity-100' : 'opacity-0')} />
                            {agent.name}
                            {agent.is_default === 1 && (
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Default</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="bg-gradient-light text-primary h-12 w-full border-0 shadow-sm"
                disabled={!selectedAgentId || isReRun}
                onClick={() => onReRunAudit(true)}
              >
                <RefreshCcw className="mr-2" />
                Re-Run Audit
              </Button>
            </div>
          </>
        ) : (
          /* Manager Review Mode - Show Send to Practitioner Button */
          <div className="space-y-4">
            <Button
              variant="outline"
              className="border-orange-dark text-orange-dark h-12 w-full border-2 bg-transparent"
              disabled={!practitionerId || !noteId || !reviewerId || !versionId}
              onClick={() => setIsNotifyDialogOpen(true)}
            >
              <Send className="mr-2" />
              Send To Practitioner
            </Button>
          </div>
        )}
      </Card>

      {/* Confirmation Dialog for Send to Practitioner */}
      <ConfirmationDialog
        isOpen={isNotifyDialogOpen}
        isLoading={isNotifying}
        onOpenChange={setIsNotifyDialogOpen}
        onConfirm={handleSendToPractitioner}
        title="Send to Practitioner"
        description="Are you sure you want to send this note to the practitioner for review? This will notify them about the issues identified."
        confirmButtonText="Send"
      />
    </>
  );
};

export default ActionButtons;
