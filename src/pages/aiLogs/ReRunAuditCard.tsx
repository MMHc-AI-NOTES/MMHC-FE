import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AILog } from '@/types/aiLogs';
import { Agent } from '@/types/agent';
import { RefreshCw, Sparkles, Clock } from 'lucide-react';
import moment from 'moment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getModelDisplayName } from '@/utils/helper';
import { Separator } from '@/components/ui/separator';

interface ReRunAuditCardProps {
  log: AILog;
  agents: Agent[];
  onReRunAudit?: (samePrompt: boolean, agentId?: number) => void;
}

const ReRunAuditCard = ({ log, agents, onReRunAudit }: ReRunAuditCardProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const modelDisplayName = getModelDisplayName(log.modelId);
  const defaultAgent = agents.find(a => a.is_default === 1) || agents[0];
  const selectedAgent = selectedAgentId ? agents.find(a => a.id.toString() === selectedAgentId) : defaultAgent;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-primary mb-6 flex items-center gap-2 border-b pb-4 text-lg font-semibold">
          <RefreshCw className="h-5 w-5" />
          Re-run AI Audit
        </h3>

        <div className="space-y-4">
          <Button size="lg" onClick={() => onReRunAudit?.(true)} className="bg-gradient-light text-primary h-12 w-full">
            <RefreshCw />
            Re-run with Same Prompt
          </Button>
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-400">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            size="lg"
            onClick={() => onReRunAudit?.(false)}
            variant="outline"
            className="text-primary border-primary h-12 w-full border-2 bg-transparent"
          >
            <Sparkles />
            Re-run with Default Prompt
          </Button>
          <Separator className="my-4" />
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium">Select Agent:</p>
            <div className="flex gap-2">
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={defaultAgent?.name || 'Select Agent'}>
                    {selectedAgent?.name || defaultAgent?.name || 'Select Agent'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                disabled={!selectedAgentId && !defaultAgent}
                onClick={() => onReRunAudit?.(false, selectedAgent?.id || defaultAgent?.id)}
              >
                Run
              </Button>
            </div>
            <Separator className="my-4" />
            <p className="mt-3 text-xs text-gray-400">
              <Clock className="mr-1 inline h-3 w-3" />
              Last re-run: {moment(log.endTime || log.createdAt).format('MMM D, YYYY – h:mm A')} • {modelDisplayName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReRunAuditCard;
