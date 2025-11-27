export interface Agent {
  id: number;
  name: string;
  model: string;
  temperature: number;
  top_k: number;
  top_p: number;
  previous_section: number[] | null;
  prompt: string;
  description: string;
  is_default?: number;
  created_at?: string;
  updated_at?: string;
}

// API Response interfaces
export interface ApiAgent {
  id: number;
  name: string;
  model: string;
  temperature: number;
  topK: number;
  topP: number;
  previousSection: number[] | null;
  prompt: string;
  description: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  model: string;
  temperature: number;
  top_k: number;
  top_p: number;
  previous_section: number[];
  prompt: string;
  description: string;
  is_default: number;
}

export type UpdateAgentRequest = Partial<CreateAgentRequest>;

// These interfaces match your exact API responses
export interface SingleAgentApiResponse extends ApiAgent {
  status: boolean;
  message?: string;
  errors?: any;
}

export interface AgentListingApiResponse {
  status: boolean;
  message?: string;
  data?: ApiAgent[];
  count?: number;
  total_count?: number;
  total_page_count?: number;
  page?: number;
  page_size?: number;
  errors?: any;
}

// For delete response
export interface DeleteAgentResponse {
  status: boolean;
  message?: string;
  errors?: any;
}
