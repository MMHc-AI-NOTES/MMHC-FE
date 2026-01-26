import axios from 'axios';
import moment from 'moment';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { showToast } from '@/lib/toast';
import {
  ManagerNote,
  ManagerOverview,
  ManagerReviewApiItem,
  ManagerReviewListingResponse,
  ManagerReviewPayload,
  ManagerDecisionPayload,
} from './managerReviewTypes';

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  count?: number;
  total_count?: number;
  total_page_count?: number;
  page?: number;
  page_size?: number;
  errors?: any;
}

export interface ManagerNotesResponse {
  data: ManagerNote[];
  totalCount: number;
  totalPageCount: number;
  page: number;
  pageSize: number;
}

// Format raw API data to ManagerNote format
const formatManagerReviewData = (data: ManagerReviewApiItem[]): ManagerNote[] => {
  return data.map((item: ManagerReviewApiItem) => {
    // Calculate humanScore from smeIssues: sum all errorType.points and subtract from 100
    let humanScore: number | null = null;
    if (item.smeIssues && Array.isArray(item.smeIssues) && item.smeIssues.length > 0) {
      const totalPoints = item.smeIssues.reduce((sum, issue) => {
        const points = issue?.errorType?.points || 0;
        return sum + points;
      }, 0);
      humanScore = 100 - totalPoints;
    } else {
      // Fall back to manualScore if no smeIssues
      humanScore = item.manualScore || item.review?.manualScore || null;
    }

    return {
      id: item.id,
      noteId: item.noteId,
      practitioner: item.practitioner?.fullName || 'Unknown',
      date: item.createdAt ? moment(item.createdAt).format('MMM D, YYYY') : 'N/A',
      aiScore: item.aiScore || item.session?.aiScore || 0,
      humanScore,
      reviewer: item.manager?.fullName || 'Unknown',
      humanDecision: item.humanDecision?.id || null,
      disagreement: item.disagreement?.id || null,
      priority: item.priority?.id || 1,
      action: 'Review',
      rawData: item,
      smeIssues: item.smeIssues || [],
    };
  });
};

const dummyOverview: ManagerOverview = {
  totalPending: 8,
  highDisagreements: 1,
  avgReviewTime: '12.3 min',
  agreementRate: 76,
  decisionBreakdown: {
    approveWithEdits: 5,
    returnToPractitioner: 2,
    escalate: 1,
  },
};

// Fetch manager review notes from API
export const fetchManagerNotes = async (payload: ManagerReviewPayload): Promise<ManagerNotesResponse> => {
  try {
    const response = await axios.post<ApiResponse<ManagerReviewListingResponse>>('/manager-reviews/listing', payload);

    if (response?.status) {
      const responseData = response.data as unknown as ManagerReviewListingResponse;
      const notesArray = responseData?.data || [];
      const totalCount = responseData?.total_count || 0;
      const totalPageCount = responseData?.total_page_count || 1;
      const page = responseData?.page || 1;
      const pageSize = responseData?.page_size || 20;

      let formattedNotes: ManagerNote[] = [];
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        formattedNotes = formatManagerReviewData(notesArray);
      }

      return { data: formattedNotes, totalCount, totalPageCount, page, pageSize };
    } else {
      handleErrorMessages(response);
      return { data: [], totalCount: 0, totalPageCount: 1, page: 1, pageSize: 20 };
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, totalPageCount: 1, page: 1, pageSize: 20 };
  }
};

export const fetchManagerOverview = (): Promise<ManagerOverview> =>
  new Promise(resolve => {
    setTimeout(() => resolve(dummyOverview), 200);
  });

// Fetch single manager review detail
export const fetchManagerReviewDetail = async (id: string): Promise<ManagerReviewApiItem | null> => {
  try {
    const response = await axios.get(`/manager-reviews/${id}`);

    if (response?.status) {
      const responseData = response.data as unknown as ManagerReviewApiItem;
      return responseData || null;
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};

// Apply manager decision
export const applyManagerDecision = async (id: number, payload: ManagerDecisionPayload): Promise<boolean> => {
  try {
    const response = await axios.patch<ApiResponse<any>>(`/manager-reviews/${id}`, payload);

    if (response?.status) {
      showToast.success('Manager decision applied successfully');
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
