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
// import { ErrorType, IssueRelatedTo, IssueDescriptions } from '@/utils/smeConfig';

const transformApiAgentToAgent = (apiAgent: ApiAgent): Agent => {
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    model: apiAgent.model,
    temperature: apiAgent.temperature,
    top_k: apiAgent.topK,
    top_p: apiAgent.topP,
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

// ============================================================================
// SME Config API Functions
// ============================================================================
// TODO: Uncomment when APIs are ready

// Error Types API
// export const fetchSMEErrorTypes = async (): Promise<ErrorType[]> => {
//   try {
//     const response = await axios.get<{ data: ErrorType[] }>('/sme-config/error-types');
//     if (response.status) {
//       return response.data.data || [];
//     } else {
//       handleErrorMessages(response);
//       return [];
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return [];
//   }
// };

// export const createSMEErrorType = async (errorType: ErrorType): Promise<ErrorType | null> => {
//   try {
//     const response = await axios.post<{ data: ErrorType }>('/sme-config/error-types', errorType);
//     if (response.status) {
//       showToast.success('Error type created successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const updateSMEErrorType = async (value: string, errorType: ErrorType): Promise<ErrorType | null> => {
//   try {
//     const response = await axios.patch<{ data: ErrorType }>(`/sme-config/error-types/${value}`, errorType);
//     if (response.status) {
//       showToast.success('Error type updated successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const deleteSMEErrorType = async (value: string): Promise<boolean> => {
//   try {
//     const response = await axios.delete(`/sme-config/error-types/${value}`);
//     if (response.status) {
//       showToast.success('Error type deleted successfully!');
//       return true;
//     } else {
//       handleErrorMessages(response);
//       return false;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return false;
//   }
// };

// Issue Related To API
// export const fetchSMEIssueRelatedTo = async (): Promise<IssueRelatedTo[]> => {
//   try {
//     const response = await axios.get<{ data: IssueRelatedTo[] }>('/sme-config/issue-related-to');
//     if (response.status) {
//       return response.data.data || [];
//     } else {
//       handleErrorMessages(response);
//       return [];
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return [];
//   }
// };

// export const createSMEIssueRelatedTo = async (issue: IssueRelatedTo): Promise<IssueRelatedTo | null> => {
//   try {
//     const response = await axios.post<{ data: IssueRelatedTo }>('/sme-config/issue-related-to', issue);
//     if (response.status) {
//       showToast.success('Issue related to created successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const updateSMEIssueRelatedTo = async (id: string, issue: IssueRelatedTo): Promise<IssueRelatedTo | null> => {
//   try {
//     const response = await axios.patch<{ data: IssueRelatedTo }>(`/sme-config/issue-related-to/${id}`, issue);
//     if (response.status) {
//       showToast.success('Issue related to updated successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const deleteSMEIssueRelatedTo = async (id: string): Promise<boolean> => {
//   try {
//     const response = await axios.delete(`/sme-config/issue-related-to/${id}`);
//     if (response.status) {
//       showToast.success('Issue related to deleted successfully!');
//       return true;
//     } else {
//       handleErrorMessages(response);
//       return false;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return false;
//   }
// };

// Issue Descriptions API
// export const fetchSMEIssueDescriptions = async (): Promise<IssueDescriptions> => {
//   try {
//     const response = await axios.get<{ data: IssueDescriptions }>('/sme-config/issue-descriptions');
//     if (response.status) {
//       return response.data.data || { critical: [], moderate: [], minor: [] };
//     } else {
//       handleErrorMessages(response);
//       return { critical: [], moderate: [], minor: [] };
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return { critical: [], moderate: [], minor: [] };
//   }
// };

// export const createSMEIssueDescription = async (
//   type: 'critical' | 'moderate' | 'minor',
//   description: string,
// ): Promise<string | null> => {
//   try {
//     const response = await axios.post<{ data: string }>('/sme-config/issue-descriptions', { type, description });
//     if (response.status) {
//       showToast.success('Issue description created successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const updateSMEIssueDescription = async (
//   type: 'critical' | 'moderate' | 'minor',
//   index: number,
//   description: string,
// ): Promise<string | null> => {
//   try {
//     const response = await axios.patch<{ data: string }>(`/sme-config/issue-descriptions/${type}/${index}`, {
//       description,
//     });
//     if (response.status) {
//       showToast.success('Issue description updated successfully!');
//       return response.data.data;
//     } else {
//       handleErrorMessages(response);
//       return null;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return null;
//   }
// };

// export const deleteSMEIssueDescription = async (type: 'critical' | 'moderate' | 'minor', index: number): Promise<boolean> => {
//   try {
//     const response = await axios.delete(`/sme-config/issue-descriptions/${type}/${index}`);
//     if (response.status) {
//       showToast.success('Issue description deleted successfully!');
//       return true;
//     } else {
//       handleErrorMessages(response);
//       return false;
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     return false;
//   }
// };
