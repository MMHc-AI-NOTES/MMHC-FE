// @/services/aiLogsService.ts
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import axios from 'axios';
import { AILog } from '@/types/aiLogs';
import moment from 'moment';

interface ApiResponse {
  status: boolean;
  message?: string;
  count?: number;
  total_count?: number;
  total_page_count?: number;
  page?: number;
  page_size?: number;
  data?: AILog[];
  errors?: any;
}

interface FilterItem {
  columnName: string;
  type: 'exact' | 'like' | 'date_range';
  value?: any;
  startDate?: string;
  endDate?: string;
}

interface AILogsPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
}

interface AILogsApiResponse {
  data: AILog[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Helper function to get date range
export const getDateRange = (range: string): { startDate: string; endDate: string } | null => {
  const today = moment();

  switch (range) {
    case 'this_week':
      return {
        startDate: today.startOf('week').format('YYYY-MM-DD'),
        endDate: today.endOf('week').format('YYYY-MM-DD'),
      };
    case 'this_month':
      return {
        startDate: today.startOf('month').format('YYYY-MM-DD'),
        endDate: today.endOf('month').format('YYYY-MM-DD'),
      };
    case 'this_year':
      return {
        startDate: today.startOf('year').format('YYYY-MM-DD'),
        endDate: today.endOf('year').format('YYYY-MM-DD'),
      };
    case 'all':
    default:
      return null;
  }
};

export const fetchAILogs = async (payload: AILogsPayload): Promise<AILogsApiResponse> => {
  try {
    const response = await axios.post<ApiResponse>('/mcp/chats/listing', payload);

    if (response?.status) {
      const responseData = response.data;
      const totalCount = responseData?.total_count || 0;
      const page = responseData?.page || 1;
      const pageSize = responseData?.page_size || 20;

      return { data: responseData.data || [], totalCount, page, pageSize };
    } else {
      handleErrorMessages(response);
      return { data: [], totalCount: 0, page: 1, pageSize: 20 };
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, page: 1, pageSize: 20 };
  }
};

// Extract unique model versions from logs for filtering
export const getModelVersions = (logs: AILog[]): string[] => {
  const versions = new Set<string>();
  logs.forEach(log => {
    if (log.modelId) {
      versions.add(log.modelId);
    }
  });
  return Array.from(versions);
};

// Get result status based on evaluation score
export const getResultStatus = (score: number): 'pass' | 'fail' | 'error' => {
  if (score >= 95) return 'pass';
  if (score < 95) return 'fail';
  return 'error';
};

export const triggerRerunAudit = async (noteId: string): Promise<any> => {
  try {
    const response = await axios.post('/mcp/chats', { note_id: noteId });
    if (response?.status) {
      return response.data;
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error) {
    handleCatchMessages(error);
    return null;
  }
};
