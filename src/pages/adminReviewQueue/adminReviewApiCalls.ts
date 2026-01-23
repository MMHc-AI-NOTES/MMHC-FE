// @/pages/adminReviewQueue/adminReviewApiCalls.ts
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import axios from 'axios';
import { HumanReviewNote, ReviewerOverview, QueueStatus } from '@/types/notes';
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
    chatId: item.chatId || 0,
    practitioner: item.practitioner?.fullName || 'Unknown',
    date: item.createdAt ? moment(item.createdAt).format('MMM D, YYYY') : 'N/A',
    score: item.note?.aiScore || 0,
    aiStatus: item.aiStatus?.id || 1,
    reviewStatus: item.note?.humanReview?.id || 1,
    reviewer: item.reviewer?.fullName || undefined,
    priority: item.priority?.id || 1,
    rawData: item,
  }));
};

// Fetch human review notes
export const fetchHumanReviewNotes = async (payload: HumanReviewPayload): Promise<HumanReviewResponse> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/human-reviews/listing', payload);

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
  // TODO: replace with real API once available
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        total_assigned: 42,
        awaiting_reassignment: 3,
        avg_review_time: '12m',
        ai_disagreement_rate: '8%',
      });
    }, 600);
  });

  // try {
  // const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
  // const finalStartDate = startDate || defaultStart;
  // const finalEndDate = endDate || defaultEnd;
  //   const response = await axios.get<ReviewerOverview>('/human-review/reviewer-statistics',{params:{start_date: finalStartDate, end_date: finalEndDate}});
  //
  //   if (response?.status && response.data) {
  //      return response.data;
  //   } else {
  //     handleErrorMessages(response);
  //     return null;
  //   }
  // } catch (error: any) {
  //   handleCatchMessages(error);
  //   return null;
  // }
};

// Fetch queue status statistics
export const fetchQueueStatus = async (): Promise<QueueStatus | null> => {
  // TODO: replace with real API once available
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        pending: 18,
        in_progress: 7,
        returned: 2,
      });
    }, 600);
  });

  // try {
  // const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
  // const finalStartDate = startDate || defaultStart;
  // const finalEndDate = endDate || defaultEnd;
  //   const response = await axios.get<QueueStatus>('/human-review/queue-status',{params:{start_date: finalStartDate, end_date: finalEndDate}});
  //
  //   if (response?.status && response.data) {
  //     return response.data;
  //   } else {
  //     handleErrorMessages(response);
  //     return null;
  //   }
  // } catch (error: any) {
  //   handleCatchMessages(error);
  //   return null;
  // }
};
