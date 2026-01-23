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
import { getState } from '@/store/store';
import { ErrorType, IssueRelatedTo, IssueDescription } from '@/store/slices/smeConfigSlice';
import type { User, UserRole } from '@/types/settings';

// Normalize SME Config API payloads (backend uses snake_case; FE uses camelCase in Redux)
const normalizeErrorType = (api: any): ErrorType => ({
  id: api?.id,
  name: api?.name ?? '',
  displayName: api?.display_name ?? api?.displayName ?? '',
  points: (api?.points ?? 0) > 0 ? -(api?.points ?? 0) : (api?.points ?? 0),
});

const normalizeIssueRelatedTo = (api: any): IssueRelatedTo => ({
  id: api?.id,
  fieldId: api?.field_id ?? api?.fieldId ?? '',
  displayName: api?.display_name ?? api?.displayName ?? '',
});

const normalizeIssueDescription = (api: any): IssueDescription => ({
  id: api?.id,
  key: api?.key ?? '',
  description: api?.description ?? '',
});

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
    const previousAgents = getState().agents.agents;
    if (previousAgents.length) return previousAgents;
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

// Error Types API
export interface ErrorTypeListingResponse {
  data: ErrorType[];
}

export interface ErrorTypeResponse {
  data: ErrorType;
}

export const fetchErrorTypes = async (): Promise<ErrorType[]> => {
  const previousErrorTypes = getState().smeConfig.errorTypes;
  if (previousErrorTypes.length) return previousErrorTypes;
  try {
    const response = await axios.post<ErrorTypeListingResponse>('/error-types/listing');

    if (response.status) {
      const data = response.data.data || [];
      return data.map(item => normalizeErrorType(item));
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};

export const createErrorType = async (payload: { name: string; display_name: string; points: number }): Promise<ErrorType | null> => {
  try {
    // Convert negative points to positive for backend
    const backendPayload = {
      ...payload,
      points: payload.points < 0 ? Math.abs(payload.points) : payload.points,
    };

    const response = await axios.post<ErrorTypeResponse>('/error-types', backendPayload);

    if (response.status) {
      showToast.success('Error type created successfully!');
      return normalizeErrorType(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const updateErrorType = async (
  id: number,
  payload: { name: string; display_name: string; points: number },
): Promise<ErrorType | null> => {
  try {
    // Convert negative points to positive for backend
    const backendPayload = {
      ...payload,
      points: payload.points < 0 ? Math.abs(payload.points) : payload.points,
    };

    const response = await axios.patch<ErrorTypeResponse>(`/error-types/${id}`, backendPayload);

    if (response.status) {
      showToast.success('Error type updated successfully!');
      return normalizeErrorType(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const deleteErrorType = async (id: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`/error-types/${id}`);

    if (response.status) {
      showToast.success('Error type deleted successfully!');
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

// Issue Related To API
export interface IssueRelatedToListingResponse {
  data: IssueRelatedTo[];
}

export interface IssueRelatedToResponse {
  data: IssueRelatedTo;
}

export const fetchIssueRelatedTo = async (): Promise<IssueRelatedTo[]> => {
  const previousIssueRelatedTo = getState().smeConfig.issueRelatedTo;
  if (previousIssueRelatedTo.length) return previousIssueRelatedTo;
  try {
    const response = await axios.post<IssueRelatedToListingResponse>('/issues-related-to/listing');

    if (response.status) {
      const data = response.data.data || [];
      return data.map(item => normalizeIssueRelatedTo(item));
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};

export const createIssueRelatedTo = async (payload: { field_id: string; display_name: string }): Promise<IssueRelatedTo | null> => {
  try {
    const response = await axios.post<IssueRelatedToResponse>('/issues-related-to', payload);

    if (response.status) {
      showToast.success('Issue related to created successfully!');
      return normalizeIssueRelatedTo(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const updateIssueRelatedTo = async (
  id: number,
  payload: { field_id: string; display_name: string },
): Promise<IssueRelatedTo | null> => {
  try {
    const response = await axios.patch<IssueRelatedToResponse>(`/issues-related-to/${id}`, payload);

    if (response.status) {
      showToast.success('Issue related to updated successfully!');
      return normalizeIssueRelatedTo(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const deleteIssueRelatedTo = async (id: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`/issues-related-to/${id}`);

    if (response.status) {
      showToast.success('Issue related to deleted successfully!');
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

// Issue Descriptions API
export interface IssueDescriptionListingResponse {
  data: IssueDescription[];
}

export interface IssueDescriptionResponse {
  data: IssueDescription;
}

export const fetchIssueDescriptions = async (): Promise<IssueDescription[]> => {
  const previousIssueDescriptions = getState().smeConfig.issueDescriptions;
  if (previousIssueDescriptions.length) return previousIssueDescriptions;
  try {
    const response = await axios.post<IssueDescriptionListingResponse>('/issue-descriptions/listing');

    if (response.status) {
      const data = response.data.data || [];
      return data.map(item => normalizeIssueDescription(item));
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};

export const createIssueDescription = async (payload: { key: string; description: string }): Promise<IssueDescription | null> => {
  try {
    const response = await axios.post<IssueDescriptionResponse>('/issue-descriptions', payload);

    if (response.status) {
      showToast.success('Issue description created successfully!');
      return normalizeIssueDescription(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const updateIssueDescription = async (
  id: number,
  payload: { key: string; description: string },
): Promise<IssueDescription | null> => {
  try {
    const response = await axios.patch<IssueDescriptionResponse>(`/issue-descriptions/${id}`, payload);

    if (response.status) {
      showToast.success('Issue description updated successfully!');
      return normalizeIssueDescription(response.data);
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const deleteIssueDescription = async (id: number): Promise<boolean> => {
  try {
    const response = await axios.delete(`/issue-descriptions/${id}`);

    if (response.status) {
      showToast.success('Issue description deleted successfully!');
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
// Users API Functions
// ============================================================================

interface UsersApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface UsersFilterItem {
  columnName: string;
  type: 'exact' | 'like' | 'date_range';
  value?: any;
  startDate?: string;
  endDate?: string;
}

export interface UsersListingPayload {
  page: number;
  pageSize: number;
  filters: UsersFilterItem[];
}

export interface UsersListingMeta {
  count: number;
  total_count: number;
  total_page_count: number;
  page: number;
  page_size: number;
}

interface UsersListingApiData extends UsersListingMeta {
  data: Array<{
    id: number;
    fullName: string;
    email: string;
    type: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface UsersListingResponse {
  users: User[];
  meta: UsersListingMeta;
}

const mapApiUserToUser = (u: UsersListingApiData['data'][number]): User => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  type: u.type,
  isActive: u.isActive,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const fetchUsersListing = async (payload: UsersListingPayload): Promise<UsersListingResponse> => {
  try {
    const response = await axios.post<UsersApiResponse<UsersListingApiData>>('/users/listing', payload);

    if (response?.status) {
      const apiData = response.data as unknown as UsersListingApiData | undefined;
      const usersArray = Array.isArray(apiData?.data) ? apiData!.data : [];
      const meta: UsersListingMeta = {
        count: apiData?.count || 0,
        total_count: apiData?.total_count || 0,
        total_page_count: apiData?.total_page_count || 0,
        page: apiData?.page || payload.page,
        page_size: apiData?.page_size || payload.pageSize,
      };

      return {
        users: usersArray.map(mapApiUserToUser),
        meta,
      };
    }

    handleErrorMessages(response);
    return { users: [], meta: { count: 0, total_count: 0, total_page_count: 0, page: payload.page, page_size: payload.pageSize } };
  } catch (error: any) {
    handleCatchMessages(error);
    return { users: [], meta: { count: 0, total_count: 0, total_page_count: 0, page: payload.page, page_size: payload.pageSize } };
  }
};

export interface CreateOrUpdateUserPayload {
  full_name: string;
  email: string;
  type: UserRole;
  is_active: boolean;
}

interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  type: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const mapApiUser = (u: ApiUser): User => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  type: u.type,
  isActive: u.isActive,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const createUserApi = async (payload: CreateOrUpdateUserPayload): Promise<User | null> => {
  try {
    const response = await axios.post<UsersApiResponse<ApiUser>>('/users', payload);

    if (response?.status) {
      const inner = response.data as any;
      const userObj: ApiUser | undefined = (inner?.data ?? inner) as any;
      showToast.success('User created successfully!');
      if (userObj?.id != null) return mapApiUser(userObj);
    }
    handleErrorMessages(response);
    return null;
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const updateUserApi = async (id: number, payload: Partial<CreateOrUpdateUserPayload>): Promise<User | null> => {
  try {
    const response = await axios.patch<UsersApiResponse<ApiUser>>(`/users/${id}`, payload);

    if (response?.status) {
      const inner = response.data as any;
      const userObj: ApiUser | undefined = (inner?.data ?? inner) as any;
      showToast.success('User updated successfully!');
      if (userObj?.id != null) return mapApiUser(userObj);
    }
    handleErrorMessages(response);
    return null;
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const resendOnboardingInvite = async (userId: number): Promise<boolean> => {
  try {
    const response = (await axios.get(`/users/resend-onboarding/${userId}`)) as unknown as { status: boolean; message?: string };

    if (response?.status) {
      showToast.success(response?.message || 'Invite sent successfully!');
      return true;
    }

    handleErrorMessages(response);
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};

export const updateUserPassword = async (payload: {
  user_id: number;
  password: string;
  password_confirmation: string;
}): Promise<boolean> => {
  try {
    const response = (await axios.patch('/users/update-password', payload)) as unknown as { status: boolean; message?: string };

    if (response?.status) {
      showToast.success(response?.message || 'Password updated successfully!');
      return true;
    }

    handleErrorMessages(response);
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};
