// @/pages/humanReviewQueue/humanReviewApiCalls.ts
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import axios from 'axios';
import { HumanReviewNote, ReviewerOverview, QueueStatus, ReviewerOption } from '@/types/notes';
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
  type: 'exact' | 'like';
  value?: any;
}

interface HumanReviewPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
}

interface HumanReviewResponse {
  data: HumanReviewNote[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Format raw API data to HumanReviewNote format
const formatHumanReviewData = (data: any[]): HumanReviewNote[] => {
  return data.map((item: any) => ({
    id: item.noteId || item.id?.toString(),
    practitioner: item.practitioner?.fullName || 'Unknown',
    date: item.sessionTime ? moment(item.sessionTime).format('MMM D, YYYY') : 'N/A',
    score: item.aiScore?.id || 0,
    aiStatus: item.aiStatus?.id || 1,
    reviewStatus: item.reviewStatus?.id || 1,
    reviewer: item.reviewer?.fullName || undefined,
    priority: item.priority?.id || 1,
    rawData: item,
  }));
};

// Fetch human review notes
export const fetchHumanReviewNotes = async (payload: HumanReviewPayload): Promise<HumanReviewResponse> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/human-review/listing', payload);

    if (response?.status) {
      const notesArray = response.data?.data || [];
      const totalCount = response.data?.total_count || 0;
      const page = response.data?.page || 1;
      const pageSize = response.data?.page_size || 20;

      let formattedNotes: HumanReviewNote[] = [];
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        formattedNotes = formatHumanReviewData(notesArray);
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

// Fetch reviewer overview statistics
export const fetchReviewerOverview = async (): Promise<ReviewerOverview | null> => {
  try {
    const response = await axios.get<ReviewerOverview>('/human-review/reviewer-statistics');

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

// Fetch queue status statistics
export const fetchQueueStatus = async (): Promise<QueueStatus | null> => {
  try {
    const response = await axios.get<QueueStatus>('/human-review/queue-status');

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

// Fetch reviewers for filter dropdown
export const fetchReviewers = async (): Promise<ReviewerOption[]> => {
  try {
    const response = await axios.post<ApiResponse<ReviewerOption[]>>('/reviewers/listing');

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
