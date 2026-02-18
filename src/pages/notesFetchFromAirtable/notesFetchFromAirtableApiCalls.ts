import axios from 'axios';

export interface NoteDetailFromAirtable {
  [key: string]: unknown;
}

/**
 * Fetch note details from Airtable by note ID.
 * Replace the endpoint with your actual API URL when ready.
 */
export const fetchNoteFromAirtable = async (noteId: string): Promise<NoteDetailFromAirtable> => {
  const response = await axios.get<NoteDetailFromAirtable>(`/notes/airtable/${noteId}`);
  return response.data;
};
