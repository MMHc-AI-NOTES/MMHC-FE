// @/services/notesService.ts
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { formatApiData } from '@/utils/notesDataFormatter';
import axios from 'axios';
import { FormattedNote, QueueOverview, Workload, PractitionerOption, CptCodeOption } from '@/types/notes';
import moment from 'moment';

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  total_count?: number;
  page?: number;
  page_size?: number;
  errors?: any;
}

interface FilterItem {
  columnName: string;
  type: 'exact' | 'like' | 'date_range';
  value?: any;
  startDate?: string;
  endDate?: string;
}

interface NotesPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
}

interface NotesResponse {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Helper function to get date range
export const getDateRange = (range: string): { startDate: string; endDate: string } | null => {
  const today = moment();

  switch (range) {
    case 'today':
      return {
        startDate: today.format('YYYY-MM-DD'),
        endDate: today.format('YYYY-MM-DD'),
      };
    case 'last_7_days':
      return {
        startDate: today.clone().subtract(6, 'days').format('YYYY-MM-DD'),
        endDate: today.format('YYYY-MM-DD'),
      };
    case 'last_30_days':
      return {
        startDate: today.clone().subtract(29, 'days').format('YYYY-MM-DD'),
        endDate: today.format('YYYY-MM-DD'),
      };
    case 'this_month':
      return {
        startDate: today.startOf('month').format('YYYY-MM-DD'),
        endDate: today.endOf('month').format('YYYY-MM-DD'),
      };
    case 'last_month':
      return {
        startDate: today.clone().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        endDate: today.clone().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
      };
    case 'all':
    default:
      return null;
  }
};

export const fetchNotes = async (payload: NotesPayload): Promise<NotesResponse> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/notes/listing', payload);

    if (response?.status) {
      const notesArray = response.data?.data || [];
      const totalCount = response.data?.total_count || 0;
      const page = response.data?.page || 1;
      const pageSize = response.data?.page_size || 20;

      let formattedNotes: FormattedNote[] = [];
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        formattedNotes = formatApiData({ data: notesArray });
      }

      return { data: formattedNotes, totalCount, page, pageSize };
    } else {
      handleErrorMessages(response);
      return { data: [], totalCount: 0, page: 1, pageSize: 20 };
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, page: 1, pageSize: 20 };
  }
};

export const fetchQueueOverview = async (): Promise<QueueOverview | null> => {
  try {
    const response = await axios.get<QueueOverview>('/notes/queue-statistics');

    if (response?.status && response.data) {
      return response.data;
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const fetchWorkload = async (): Promise<Workload | null> => {
  try {
    const response = await axios.get<Workload>('/notes/workload-statistics');

    if (response?.status && response.data) {
      return response.data;
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

export const fetchPractitioners = async (): Promise<PractitionerOption[]> => {
  try {
    const response = await axios.post<ApiResponse<PractitionerOption[]>>('practitioners/listing');

    if (response?.status && response.data.data) {
      return response.data.data;
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};

export const fetchCptCodes = async (): Promise<CptCodeOption[]> => {
  try {
    const response = await axios.get<ApiResponse<CptCodeOption[]>>('/cpt-codes');

    if (response?.status && response.data.data) {
      return response.data.data;
    } else {
      handleErrorMessages(response.data);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return [];
  }
};
