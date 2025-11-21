export interface Agent {
  id: number;
  name: string;
  model: string;
  use_context: boolean;
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  previous_section: number[] | null;
  transcript: boolean;
  prompt: string;
  description: string;
  type: 1 | 2 | 3;
  agent_key?: string;
  is_active?: boolean;
  is_default?: boolean;
  ai_safety_settings?: any;
  created_at?: string;
  updated_at?: string;
}

// API Response interfaces
export interface ApiAgent {
  id: number;
  name: string;
  agentKey: string;
  model: string;
  useContext: boolean;
  temperature: number;
  frequencyPenalty: number;
  presencePenalty: number;
  previousSection: number[] | null;
  transcript: boolean;
  prompt: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  type: 1 | 2 | 3;
  aiSafetySettings: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  model: string;
  use_context: boolean;
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  previous_section: number[];
  transcript: boolean;
  prompt: string;
  description: string;
  type: 1 | 2 | 3;
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
