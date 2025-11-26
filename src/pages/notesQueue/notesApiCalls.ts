// @/services/notesService.ts
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { formatApiData } from '@/utils/notesDataFormatter';
import axios from 'axios';
import { FormattedNote, RawApiNote } from '@/types/notes';

interface NotesListingApiResponse {
  status: boolean;
  message?: string;
  data?: {
    count: number;
    total_count: number;
    total_page_count: number;
    page: number;
    page_size: number;
    data: RawApiNote[];
  };
  errors?: any;
}

export const fetchNotes = async (): Promise<FormattedNote[]> => {
  try {
    const response = await axios.post<NotesListingApiResponse>('/notes/listing');
    // Use the API's response body (response.data) rather than the Axios response object
    if (response?.status) {
      // The API payload nests the notes array under data.data
      const notesArray = response.data?.data;

      if (Array.isArray(notesArray) && notesArray.length > 0) {
        const formattedNotes = formatApiData({ data: notesArray });
        return formattedNotes;
      }

      return [];
    } else {
      handleErrorMessages(response);
      return [];
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return []; // Return empty array on error
  }
};
