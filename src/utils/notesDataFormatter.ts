// @/utils/notesDataFormatter.ts
import { RawApiNote, FormattedNote, DataFormatterProps } from '@/types/notes';
import moment from 'moment';

export const formatApiData = ({ data }: DataFormatterProps): FormattedNote[] => {
  return data.map((item: RawApiNote) => {
    return {
      id: item.noteId,
      practitioner: item.practitioner.fullName,
      sessionTime: moment(item.sessionTime).format('MMM D, YYYY h:mm A'),
      rawData: item,
    };
  });
};
