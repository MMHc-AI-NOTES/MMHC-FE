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
      type: item.noteType?.id || 'Progress Note',
      aiScore: item.aiScore?.id || 0,
      aiStatus: item.aiStatus?.id || 4, // Default to not_reviewed
      humanReview: item.humanReview?.id || 1, // Default to not_needed
      manager: item.manager?.id || 1, // Default to not_needed
      workflow: item.workflow?.id || 1, // Default to in_queue
      priority: item.priority?.id || 1, // Default to low
      sessionTime: moment(item.sessionTime).format('MMM D, YYYY h:mm A'),
      rawData: item,
    } as FormattedNote;
  });
};
