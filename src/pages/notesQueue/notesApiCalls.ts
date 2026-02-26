// @/services/notesService.ts
import { getDefaultDateRange, handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import axios from 'axios';
import { RawApiNote, FormattedNote, DataFormatterProps, QueueOverview, Workload, PractitionerOption, CptCodeOption } from '@/types/notes';
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

export interface SortItem {
  columnName: string;
  orderBy: 'asc' | 'desc';
}

export interface NotesPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
  sorts?: SortItem[];
}

const DEFAULT_NOTES_SORTS: SortItem[] = [
  { columnName: 'session_time', orderBy: 'desc' },
  { columnName: 'id', orderBy: 'desc' },
];

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

const formatApiData = ({ data }: DataFormatterProps): FormattedNote[] => {
  return data.map((item: RawApiNote) => {
    return {
      id: item.id?.toString() || item.noteId,
      noteId: item.noteId,
      cptCode: item.cptCodeId,
      reviewCycle: item.reviewCycle,
      practitioner: item.practitioner.fullName,
      client: item.patient.clientId || '-',
      date: moment(item.sessionTime).format('MMM D, YYYY'),
      type: item.noteType?.name || 'Progress Note',
      aiScore: item.aiScore || 0,
      aiStatus: item.aiStatus?.id || 4, // Default to not_reviewed
      humanReview: item.humanReview?.id || 1, // Default to not_needed
      manager: item.manager?.id || 1, // Default to not_needed
      workflow: item.workflow?.id || 1, // Default to in_queue
      priority: item.priority?.id || 1, // Default to low
      smeReview: item.smeReview?.id || 1, // Default to pending
      smeReviewers: (item.humanReviews || []).map(rev => rev.reviewer?.fullName || 'Unknown'),
      sessionTime: moment(item.sessionTime).format('MMM D, YYYY h:mm A'),
      rawData: item,
    } as FormattedNote;
  });
};

export const fetchNotes = async (payload: NotesPayload): Promise<NotesResponse> => {
  try {
    const body = { ...payload, sorts: DEFAULT_NOTES_SORTS };
    const response = await axios.post<ApiResponse<any>>('/notes/listing', body);

    if (response?.status) {
      const notesArray = response.data?.data || [];
      const totalCount = response.data?.total_count || 0;
      const page = response.data?.page || 1;
      const pageSize = response.data?.page_size || 60;

      let formattedNotes: FormattedNote[] = [];
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        formattedNotes = formatApiData({ data: notesArray });
      }

      return { data: formattedNotes, totalCount, page, pageSize };
    } else {
      handleErrorMessages(response);
      return { data: [], totalCount: 0, page: 1, pageSize: 60 };
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, page: 1, pageSize: 60 };
  }
};
export const fetchQueueOverview = async (startDate?: string, endDate?: string): Promise<QueueOverview | null> => {
  try {
    // Use provided dates or default to last 30 days
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const finalStartDate = startDate || defaultStart;
    const finalEndDate = endDate || defaultEnd;

    const response = await axios.get<QueueOverview>('/notes/queue-statistics', {
      params: { start_date: finalStartDate, end_date: finalEndDate },
    });

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

export const fetchWorkload = async (startDate?: string, endDate?: string): Promise<Workload | null> => {
  try {
    // Use provided dates or default to last 30 days
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const finalStartDate = startDate || defaultStart;
    const finalEndDate = endDate || defaultEnd;

    const response = await axios.get<Workload>('/notes/workload-statistics', {
      params: { start_date: finalStartDate, end_date: finalEndDate },
    });

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
