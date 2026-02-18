import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import axios from 'axios';

export interface NoteDetailFromAirtable {
  [key: string]: unknown;
}

/**
 * Fetch note details from Airtable by note ID.
 * Replace the endpoint with your actual API URL when ready.
 */
export const fetchNoteFromAirtable = async (noteId: string): Promise<NoteDetailFromAirtable> => {
  try {
    const response = await axios.get<NoteDetailFromAirtable>(`/notes/airtable/${noteId}`);
    if (response?.status) {
      return response.data;
    } else {
      handleErrorMessages(response);
      throw new Error('Failed to fetch note details');
    }
  } catch (error: any) {
    handleCatchMessages(error);
    throw error;
  }
};
