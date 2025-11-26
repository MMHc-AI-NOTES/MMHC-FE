import axios from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import {
  Agent,
  ApiAgent,
  CreateAgentRequest,
  UpdateAgentRequest,
  SingleAgentApiResponse,
  AgentListingApiResponse,
  DeleteAgentResponse,
} from '@/types/agent';
import { showToast } from '@/lib/toast';

const transformApiAgentToAgent = (apiAgent: ApiAgent): Agent => {
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    model: apiAgent.model,
    temperature: apiAgent.temperature,
    frequency_penalty: apiAgent.frequencyPenalty,
    presence_penalty: apiAgent.presencePenalty,
    previous_section: apiAgent.previousSection || [],
    prompt: apiAgent.prompt,
    description: apiAgent.description,
    is_default: apiAgent.isDefault,
    created_at: apiAgent.createdAt,
    updated_at: apiAgent.updatedAt,
  };
};

export const createAgent = async (agentData: CreateAgentRequest): Promise<Agent | null> => {
  try {
    const response = await axios.post<SingleAgentApiResponse>('/agents', agentData);

    if (response.status) {
      showToast.success('Agent Created Successfully!');
      return transformApiAgentToAgent(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const response = await axios.post<AgentListingApiResponse>('/agents/listing');

    if (response.status) {
      const agentsData = response.data?.data;

      if (Array.isArray(agentsData) && agentsData.length > 0) {
        return agentsData.map(transformApiAgentToAgent);
      } else {
        return [];
      }
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};

export const updateAgent = async (agentId: number, agentData: UpdateAgentRequest): Promise<Agent | null> => {
  try {
    const response = await axios.patch<SingleAgentApiResponse>(`/agents/${agentId}`, agentData);

    if (response.status) {
      showToast.success('Agent Updated Successfully!');
      return transformApiAgentToAgent(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const deleteAgent = async (agentId: number): Promise<boolean> => {
  try {
    const response = await axios.delete<DeleteAgentResponse>(`/agents/${agentId}`);

    if (response.status) {
      showToast.success('Agent Deleted Successfully!');
      return true;
    } else {
      handleErrorMessages(response);
      return false;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};
