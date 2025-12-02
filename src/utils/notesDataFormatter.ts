// @/utils/notesDataFormatter.ts
import { RawApiNote, FormattedNote, DataFormatterProps } from '@/types/notes';
import moment from 'moment';

export const formatApiData = ({ data }: DataFormatterProps): FormattedNote[] => {
  return data.map((item: RawApiNote) => {
    return {
      id: item.noteId,
      practitioner: item.practitioner.fullName,
      client: item.patient.uuid || 'N/A',
      date: moment(item.sessionTime).format('MMM D, YYYY'),
      type: item.noteType || 'Progress Note',
      aiScore: item.aiScore || 0,
      aiStatus: item.aiStatus || 4, // Default to not_reviewed
      humanReview: item.humanReview || 1, // Default to not_needed
      manager: item.manager || 1, // Default to not_needed
      workflow: item.workflow || 2, // Default to in_queue
      priority: item.priority || 1, // Default to low
      sessionTime: moment(item.sessionTime).format('MMM D, YYYY h:mm A'),
      rawData: item,
    } as FormattedNote;
  });
};
