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
  reviewer_id: number;
  error_type_id: number;
  issues_related_to_id: number;
  version_id: number | null;
  issue_description_id: number;
  ai_status: number;
  priority: number;
  practitioner_id: number;
  is_current_version: boolean;
}

/** Update payload: issue_description_id omitted for "overall" issues (they use comment) */
export type UpdateSMEIssuePayload = Omit<SMEIssuePayload, 'issue_description_id'> & { issue_description_id?: number };

/** Create SME issue from a description-mapping template (no error_type_id, issues_related_to_id, issue_description_id) */
export interface CreateSMEIssueFromTemplatePayload {
  note_id: string;
  reviewer_id: number;
  practitioner_id: number;
  is_current_version: number;
  version_id: number;
  template_id: number;
  ai_status: number;
  priority: number;
}

/** Create "overall" SME issue (error_type_id, issues_related_to_id for overall, comment; no template_id) */
export interface CreateSMEIssueOverallPayload {
  note_id: string;
  reviewer_id: number;
  practitioner_id: number;
  is_current_version: number;
  version_id: number;
  error_type_id: number;
  issues_related_to_id: number;
  comment: string;
  ai_status: number;
  priority: number;
}

/**
 * Create SME issue for a note
 */
export const createSMEIssue = async (payload: SMEIssuePayload): Promise<any> => {
  try {
    const response = await axios.post('/sme-issues', payload);

    if (response?.status) {
      showToast.success('SME issue created successfully');
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
 * Create SME issue from a description-mapping template (template_id only; no error_type_id, issues_related_to_id, issue_description_id)
 */
export const createSMEIssueFromTemplate = async (payload: CreateSMEIssueFromTemplatePayload): Promise<any> => {
  try {
    const response = await axios.post('/sme-issues', payload);

    if (response?.status) {
      showToast.success('SME issue created successfully');
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
 * Create "overall" SME issue (error_type_id, issues_related_to_id, comment; no template_id)
 */
export const createSMEIssueOverall = async (payload: CreateSMEIssueOverallPayload): Promise<any> => {
  try {
    const response = await axios.post('/sme-issues', payload);

    if (response?.status) {
      showToast.success('SME issue created successfully');
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
 * Update SME issue.
 * Use UpdateSMEIssuePayload and omit issue_description_id for "overall" issues (they use comment).
 */
export const updateSMEIssue = async (issueId: number, payload: UpdateSMEIssuePayload): Promise<any> => {
  try {
    const response = await axios.patch(`/sme-issues/${issueId}`, payload);

    if (response?.status) {
      showToast.success('SME issue updated successfully');
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
 * Delete SME issue
 */
export const deleteSMEIssue = async (issueId: number): Promise<any> => {
  try {
    const response = await axios.delete(`/sme-issues/${issueId}`);

    if (response?.status) {
      showToast.success('SME issue deleted successfully');
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
 * Delete SME review (all issues for a reviewer)
 */
export const deleteSMEReview = async (noteId: string, versionId: number | null, reviewerId: number | null): Promise<any> => {
  try {
    const response = await axios.delete(`/sme-issues/${noteId}/${versionId}/${reviewerId}`);

    if (response?.status) {
      showToast.success('Review deleted successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

export interface AssignToManagerPayload {
  note_id: string;
  version_id: number;
  practitioner_id: number;
  ai_score: number;
  reviewer_id: number;
  human_decision?: number;
  disagreement?: number;
  priority: number;
}

/**
 * Assign review to manager
 */
export const assignToManager = async (payload: AssignToManagerPayload): Promise<any> => {
  try {
    const response = await axios.post('/sme-issues/assign-to-manager', payload);

    if (response?.status) {
      showToast.success('Assigned to manager successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};

export interface NotifyPractitionerPayload {
  practitioner_id: number;
  note_id: string;
  reviewer_id: number;
  version_id: number;
}

/**
 * Notify practitioner about review
 */
export const notifyPractitioner = async (payload: NotifyPractitionerPayload): Promise<any> => {
  try {
    const response = await axios.post('/manager-reviews/notify-practitioner', payload);

    if (response?.status) {
      showToast.success('Email sent to practitioner successfully');
      return response.data;
    } else {
      handleErrorMessages(response);
      return null;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};
