import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/types/agent';
import { Trash2, Edit, Bot, Cpu, MessageSquare, Settings, Zap, Radio, Gavel } from 'lucide-react';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';

interface AgentAccordionProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: number) => void;
}

const AgentAccordion: React.FC<AgentAccordionProps> = ({ agents, onEdit, onDelete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Function to get display name from model value
  const getModelDisplayName = (modelValue: string): string => {
    const modelEntry = Object.entries(AGENT_MODEL_KEYS).find(([, value]) => value === modelValue);
    return modelEntry ? AGENT_MODEL_DISPLAY_NAMES[modelEntry[0] as keyof typeof AGENT_MODEL_KEYS] : modelValue;
  };

  const handleDeleteClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgent) return;

    setIsLoading(true);
    await onDelete(selectedAgent.id);
    setIsLoading(false);
    setIsDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedAgent(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {agents.map(agent => (
          <Card key={agent.id} className="border-l-primary overflow-hidden border-l-4 shadow-sm transition-all hover:shadow-md">
            <Accordion type="single" collapsible>
              <AccordionItem value={agent.id.toString()} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50/50 hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="from-primary to-primary/80 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-gray-900">{agent.name}</h3>
                          {agent.is_default ? (
                            <Badge className="bg-primary-light flex items-center space-x-1 border px-3 py-1">
                              <span>Default</span>
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{agent.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Cpu className="text-primary h-4 w-4" />
                            <span>{getModelDisplayName(agent.model)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Zap className="text-primary h-4 w-4" />
                            <span>Temp: {agent.temperature}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Radio className="text-primary h-4 w-4" />
                            <span>Freq: {agent.temperature}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Gavel className="text-primary h-4 w-4" />
                            <span>Pres: {agent.temperature}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
                            onClick={e => {
                              e.stopPropagation();
                              onEdit(agent);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Agent</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(agent);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pt-2 pb-6">
                  <CardContent className="space-y-6 p-0">
                    {/* Configuration Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="h-full space-y-4">
                        <div className="h-full rounded-lg bg-gray-50 p-4">
                          <h4 className="mb-3 flex items-center space-x-2 font-semibold text-gray-900">
                            <Settings className="h-4 w-4" />
                            <span>Configuration</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Model</span>
                              <span className="font-medium">{getModelDisplayName(agent.model)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Is Default</span>
                              <Badge className="text-md px-4 py-1" variant={agent.is_default ? 'default' : 'destructive'}>
                                {agent.is_default ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="mb-3 flex items-center space-x-2 font-semibold text-gray-900">
                            <Zap className="h-4 w-4" />
                            <span>Parameters</span>
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Temperature</span>
                              <span className="font-medium">{agent.temperature}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Frequency Penalty</span>
                              <span className="font-medium">{agent.frequency_penalty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Presence Penalty</span>
                              <span className="font-medium">{agent.presence_penalty}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Section */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 flex items-center space-x-2 font-semibold text-gray-900">
                        <MessageSquare className="h-4 w-4" />
                        <span>Prompt</span>
                      </h4>
                      <div className="rounded-md bg-white p-4">
                        <p className="text-sm leading-relaxed text-gray-700">{agent.prompt}</p>
                      </div>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        isLoading={isLoading}
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        description={`Are you sure you want to delete "${selectedAgent?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </TooltipProvider>
  );
};

export default AgentAccordion;
