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
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { addAgent, deleteAgentFromStore, setAgents, setLoading, updateAgentInStore } from '@/store/slices/agentsSlice';

const AIModelPromptTab: React.FC = () => {
  const dispatch = useDispatch();
  const { agents, loading } = useAppSelector(state => state.agents);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      dispatch(setLoading(true));
      const agentsData = await fetchAgents();
      if (agentsData) dispatch(setAgents(agentsData));
      dispatch(setLoading(false));
    })();
  }, [dispatch]);

  const handleCreateAgent = async (agentData: CreateAgentRequest) => {
    setIsSubmitting(true);
    const newAgent = await createAgent(agentData);

    if (newAgent) {
      // If new agent is set as default, set all other agents to not default
      if (newAgent.is_default) {
        const updatedAgents = agents.map(agent => ({
          ...agent,
          is_default: 0,
        }));
        // Add the new agent to the updated list
        const finalAgents = [...updatedAgents, newAgent];
        dispatch(setAgents(finalAgents));
      } else {
        dispatch(addAgent(newAgent));
      }

      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleUpdateAgent = async (agentData: CreateAgentRequest) => {
    if (!editingAgent) return;

    setIsSubmitting(true);
    const updatedAgent = await updateAgent(editingAgent.id, agentData);

    if (updatedAgent) {
      // If updated agent is set as default, set all other agents to not default
      if (updatedAgent.is_default) {
        const updatedAgents = agents.map(agent => (agent.id === editingAgent.id ? updatedAgent : { ...agent, is_default: 0 }));
        dispatch(setAgents(updatedAgents));
      } else {
        dispatch(updateAgentInStore(updatedAgent));
      }
      setIsDialogOpen(false);
      setEditingAgent(undefined);
    }
    setIsSubmitting(false);
  };

  const handleDeleteAgent = async (agentId: number) => {
    const success = await deleteAgent(agentId);

    if (success) {
      dispatch(deleteAgentFromStore(agentId));
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
      <Card className="p-2">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-primary text-lg font-semibold">Manage Agents</h3>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-light text-primary w-32 rounded-full border-0 font-semibold shadow-sm"
            >
              <Plus />
              Add Agent
            </Button>
          </div>
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
        <DialogContent aria-describedby="" className="max-h-[90vh] overflow-y-auto p-0 md:min-w-2xl">
          <DialogHeader className="border-b p-6">
            <DialogTitle className="text-primary">{editingAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
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

export default AIModelPromptTab;
