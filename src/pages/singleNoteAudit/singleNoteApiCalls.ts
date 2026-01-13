import axios from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { ApiNoteDetail } from '@/types/notes';
import { showToast } from '@/lib/toast';

export interface HumanReviewPayload {
  note_id: string;
  decision: number;
  manual_score?: number;
  comment?: string;
}

/**
 * Submit human review for a note
 */
export const submitHumanReview = async (payload: HumanReviewPayload): Promise<any> => {
  try {
    const response = await axios.post('/human-reviews', payload);

    if (response?.status) {
      showToast.success('Human review submitted successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

/**
 * Update existing human review
 */
export const updateHumanReview = async (reviewId: number, payload: HumanReviewPayload): Promise<any> => {
  try {
    const response = await axios.patch(`/human-reviews/${reviewId}`, payload);

    if (response?.status) {
      showToast.success('Human review updated successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

/**
 * Fetch note detail by noteId
 */
export const fetchNoteDetail = async (noteId?: string): Promise<ApiNoteDetail> => {
  try {
    const response = await axios.get(`/notes/${noteId}`);
    // Check HTTP status and if data exists
    if (response?.status) {
      return response.data;
    } else {
      handleErrorMessages(response);
      throw new Error('Failed to fetch note detail - invalid response');
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

/**
 * Create chat for a note
 */
export const createChat = async (payload: { note_id?: string; prompt_id?: number }): Promise<any> => {
  try {
    const response = await axios.post('/chats', payload);

    // Check HTTP status
    if (response?.status) {
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

/**
 * Enhanced function to get note detail with chat creation if needed
 */
export const getNoteDetailWithChat = async (noteId?: string, promptId?: any, isRerun?: boolean): Promise<ApiNoteDetail> => {
  // First attempt to get note detail
  let noteDetail = null;
  if (!isRerun) {
    noteDetail = await fetchNoteDetail(noteId);
  }

  // If no chats exist, create a new chat
  if (!noteDetail?.chats || noteDetail?.chats.length === 0 || isRerun) {
    await createChat({ note_id: noteId, prompt_id: promptId });

    noteDetail = await fetchNoteDetail(noteId);
  }

  return noteDetail;
};

export interface SMEIssuePayload {
  note_id: string;
  error_type: string;
  issue_related_to: string;
  issue_description: string;
  points: number;
}

/**
 * Submit SME issue for a note
 */
export const submitSMEIssue = async (payload: SMEIssuePayload): Promise<any> => {
  try {
    const response = await axios.post('/sme-issues', payload);

    if (response?.status) {
      showToast.success('SME issue saved successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

export interface SMEIssue {
  error_type: string;
  issue_related_to: string;
  issue_description: string;
  points: number;
}

export interface SMEReviewPayload {
  note_id: string;
  reviewer_id: string;
  reviewer_name: string;
  issues: SMEIssue[];
}

export interface SMEReviewsPayload {
  note_id: string;
  reviews: SMEReviewPayload[];
}

/**
 * Submit all SME reviews with their issues for a note
 * TODO: Uncomment when API is ready
 */
// export const submitSMEReviews = async (payload: SMEReviewsPayload): Promise<any> => {
//   try {
//     const response = await axios.post('/sme-reviews', payload);
//
//     if (response?.status) {
//       showToast.success('SME reviews saved successfully');
//       return response.data;
//     } else {
//       handleErrorMessages(response);
//     }
//   } catch (error: any) {
//     handleCatchMessages(error);
//     throw error;
//   }
// };
