import axios from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { ApiNoteDetail } from '@/types/notes';

/**
 * Fetch note detail by noteId
 */
export const fetchNoteDetail = async (noteId: string): Promise<ApiNoteDetail> => {
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
export const createChat = async (payload: { note_id: string; prompt_id: number }): Promise<any> => {
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
export const getNoteDetailWithChat = async (noteId: string, promptId: number, isRerun: boolean): Promise<ApiNoteDetail> => {
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
