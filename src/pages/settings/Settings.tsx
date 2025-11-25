import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Agent, CreateAgentRequest } from '@/types/agent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AgentAccordion from './AgentAccordion';
import AgentForm from './AgentForm';
import { createAgent, deleteAgent, fetchAgents, updateAgent } from './settingsApiCalls';
import { Skeleton } from '@/components/ui/skeleton';

const Settings: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    const agentsData = await fetchAgents();
    if (agentsData) setAgents(agentsData);
    setLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreateAgent = async (agentData: CreateAgentRequest) => {
    setIsSubmitting(true);
    const newAgent = await createAgent(agentData);

    if (newAgent) {
      // Add new agent to local state instead of reloading
      setAgents(prev => [...prev, newAgent]);
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleUpdateAgent = async (agentData: CreateAgentRequest) => {
    if (!editingAgent) return;

    setIsSubmitting(true);
    const updatedAgent = await updateAgent(editingAgent.id, agentData);

    if (updatedAgent) {
      // Update agent in local state instead of reloading
      setAgents(prev => prev.map(agent => (agent.id === editingAgent.id ? updatedAgent : agent)));
      setIsDialogOpen(false);
      setEditingAgent(undefined);
    }
    setIsSubmitting(false);
  };

  const handleDeleteAgent = async (agentId: number) => {
    const success = await deleteAgent(agentId);

    if (success) {
      // Remove agent from local state instead of reloading
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    }
    return success;
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAgent(undefined);
  };

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between px-6">
          <p className="text-lg font-semibold">Manage Agents</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus />
            Add Agent
          </Button>
        </div>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : agents.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No agents found. Create your first agent to get started.</div>
          ) : (
            <AgentAccordion agents={agents} onEdit={handleEditAgent} onDelete={handleDeleteAgent} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent aria-describedby="" className="max-h-[90vh] overflow-y-auto md:min-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
          </DialogHeader>
          <AgentForm
            agent={editingAgent}
            onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent}
            onCancel={handleCloseDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
