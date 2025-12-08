import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/types/agent';
import { Trash2, Edit, Bot, Cpu, MessageSquare, Settings, Zap, Radio, Gavel } from 'lucide-react';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { getModelDisplayName } from '@/utils/helper';

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
                <AccordionTrigger className="px-4 py-4 hover:bg-gray-50/50 hover:no-underline md:px-6">
                  <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
                    <div className="flex w-full items-start gap-3 sm:items-center sm:gap-4">
                      <div className="from-primary to-primary/80 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br sm:h-12 sm:w-12">
                        <Bot className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{agent.name}</h3>
                          {agent.is_default ? (
                            <Badge className="bg-primary-light text-primary flex w-fit items-center space-x-1 border px-2 py-0.5 sm:px-3 sm:py-1">
                              <span className="text-xs sm:text-sm">Default</span>
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{agent.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 sm:gap-4">
                          <span className="flex items-center space-x-1">
                            <Cpu className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">{getModelDisplayName(agent.model)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Zap className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Temp: {agent.temperature}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Gavel className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Top P: {agent.top_p}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Radio className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Top K: {agent.top_k}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between sm:w-auto sm:justify-normal">
                      <div className="flex items-center space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700 sm:h-9 sm:w-9"
                              onClick={e => {
                                e.stopPropagation();
                                onEdit(agent);
                              }}
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Agent</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:text-red-700 sm:h-9 sm:w-9"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteClick(agent);
                              }}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Agent</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pt-2 pb-6 md:px-6">
                  <CardContent className="space-y-6 p-0">
                    {/* Configuration Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                      <div className="h-full space-y-4">
                        <div className="h-full rounded-lg bg-gray-50 p-3 sm:p-4">
                          <h4 className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-900 sm:text-base">
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Configuration</span>
                          </h4>
                          <div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                              <span className="text-gray-600">Model</span>
                              <Badge className="bg-blue-light text-blue gap-1.5 rounded-md [&>svg]:!size-3">
                                <Cpu className="h-3 w-3" />
                                {getModelDisplayName(agent.model)}
                              </Badge>
                            </div>
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                              <span className="text-gray-600">Is Default</span>
                              <Badge className="w-fit px-3 py-1 text-xs sm:text-sm" variant={agent.is_default ? 'default' : 'destructive'}>
                                {agent.is_default ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                          <h4 className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-900 sm:text-base">
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Parameters</span>
                          </h4>
                          <div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                              <span className="text-gray-600">Temperature</span>
                              <span className="text-right font-medium">{agent.temperature}</span>
                            </div>
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                              <span className="text-gray-600">Top P</span>
                              <span className="text-right font-medium">{agent.top_p}</span>
                            </div>
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0">
                              <span className="text-gray-600">Top K</span>
                              <span className="text-right font-medium">{agent.top_k}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Section */}
                    <div className="rounded-lg bg-gray-50 p-3 sm:p-4">
                      <h4 className="mb-3 flex items-center space-x-2 text-sm font-semibold text-gray-900 sm:text-base">
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Prompt</span>
                      </h4>
                      <div className="rounded-md bg-white p-3 sm:p-4">
                        <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">{agent.prompt}</p>
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
