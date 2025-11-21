import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/types/agent';
import { Trash2, Edit } from 'lucide-react';

interface AgentAccordionProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void; // Change to number
}

const AgentAccordion: React.FC<AgentAccordionProps> = ({ agents, onEdit, onDelete }) => {
  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'System';
      case 2:
        return 'SOAP';
      case 3:
        return 'Custom';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: number) => {
    switch (type) {
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {agents.map(agent => (
        <AccordionItem key={agent.id} value={agent.id.toString()}>
          {' '}
          {/* Convert number to string for value */}
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex w-full justify-between pr-4">
              <div>
                <div className="flex items-center space-x-4">
                  <h3 className="text-primary text-left text-lg font-semibold">{agent.name}</h3>
                  <Badge className={getTypeColor(agent.type)}>{getTypeLabel(agent.type)}</Badge>
                </div>
                <p className="text-left text-sm text-gray-600">{agent.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(agent);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(agent.id); // Pass number ID
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Model:</strong> {agent.model}
                </p>
                <p>
                  <strong>Temperature:</strong> {agent.temperature}
                </p>
                <p>
                  <strong>Use Context:</strong> {agent.use_context ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Frequency Penalty:</strong> {agent.frequency_penalty}
                </p>
                <p>
                  <strong>Presence Penalty:</strong> {agent.presence_penalty}
                </p>
                <p>
                  <strong>Transcript:</strong> {agent.transcript ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="col-span-2">
                <p>
                  <strong>Prompt:</strong>
                </p>
                <p className="mt-1 rounded bg-gray-50 p-2 text-xs">{agent.prompt}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AgentAccordion;
