import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Send, Flag, Check, ChevronsUpDown } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { setSelectedAgentId } from '@/store/slices/agentsSlice';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onFlagReview: () => void;
  onReRunAudit: (isRerun: boolean) => void;
  isReRun?: boolean;
}

const ActionButtons = ({ onFlagReview, onReRunAudit, isReRun = false }: ActionButtonsProps) => {
  const dispatch = useDispatch();
  const { agents, selectedAgentId } = useAppSelector(state => state.agents);
  const [open, setOpen] = useState(false);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  const handleSelectAgent = (agentId: number) => {
    dispatch(setSelectedAgentId(agentId));
    setOpen(false);
  };

  return (
    <Card className="p-4">
      {/* Agent Selection Dropdown */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Select Agent</p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between bg-white shadow-sm">
              {selectedAgent ? selectedAgent.name : 'Select agent...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-xl p-0">
            <Command className="w-full">
              <CommandInput placeholder="Search agent..." />
              <CommandList>
                <CommandEmpty>No agent found.</CommandEmpty>
                <CommandGroup>
                  {agents.map(agent => (
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
      <div className="space-y-2">
        <Button
          className="bg-primary-light text-primary h-12 w-full border-0 shadow-sm"
          disabled={!selectedAgentId || isReRun}
          onClick={() => onReRunAudit(true)}
        >
          <RefreshCcw className="mr-2" />
          Re-Run Audit
        </Button>
        <Button variant="outline" className="border-primary text-primary h-12 w-full border-2 bg-transparent" disabled={!selectedAgentId}>
          <Send className="mr-2" />
          Send to Practitioner
        </Button>
        <Button
          variant="outline"
          className="h-12 w-full border-2 border-red-700 bg-transparent text-red-700"
          onClick={onFlagReview}
          disabled={!selectedAgentId}
        >
          <Flag className="mr-2" />
          Flag for Manager Review
        </Button>
      </div>
    </Card>
  );
};

export default ActionButtons;
