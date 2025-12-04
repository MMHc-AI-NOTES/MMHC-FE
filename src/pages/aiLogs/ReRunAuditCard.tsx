import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AILog } from '@/types/aiLogs';
import { Agent } from '@/types/agent';
import { RefreshCw, Sparkles, Clock } from 'lucide-react';
import moment from 'moment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';

interface ReRunAuditCardProps {
  log: AILog;
  agents: Agent[];
  onReRunAudit?: (samePrompt: boolean, agentId?: number) => void;
}

const ReRunAuditCard = ({ log, agents, onReRunAudit }: ReRunAuditCardProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const getModelDisplayName = (modelId: string): string => {
    const modelEntry = Object.entries(AGENT_MODEL_KEYS).find(([, value]) => value === modelId);
    return modelEntry ? AGENT_MODEL_DISPLAY_NAMES[modelEntry[0] as keyof typeof AGENT_MODEL_KEYS] : modelId;
  };

  const modelDisplayName = getModelDisplayName(log.modelId);
  const defaultAgent = agents.find(a => a.is_default === 1) || agents[0];
  const selectedAgent = selectedAgentId ? agents.find(a => a.id.toString() === selectedAgentId) : defaultAgent;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <RefreshCw className="h-5 w-5 text-green-600" />
          Re-run AI Audit
        </h3>

        <div className="space-y-4">
          <Button onClick={() => onReRunAudit?.(true)} className="w-full bg-green-600 hover:bg-green-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-run with Same Prompt
          </Button>

          <div className="text-center text-sm text-gray-400">or</div>

          <Button onClick={() => onReRunAudit?.(false)} variant="outline" className="w-full border-gray-300">
            <Sparkles className="mr-2 h-4 w-4" />
            Re-run with Default Prompt
            <div className="ml-2 flex gap-1">
              <Badge className="border-pink-300 bg-pink-100 px-1.5 py-0 text-[10px] text-pink-700">T</Badge>
              <Badge className="border-yellow-300 bg-yellow-100 px-1.5 py-0 text-[10px] text-yellow-700">C</Badge>
            </div>
          </Button>

          <div className="pt-2">
            <p className="mb-2 text-xs text-gray-500">Select Agent:</p>
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
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedAgentId && !defaultAgent}
                onClick={() => onReRunAudit?.(false, selectedAgent?.id || defaultAgent?.id)}
              >
                Run
              </Button>
            </div>
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
