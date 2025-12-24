import { AvailableVariable } from '@/types/settings';

export const AVAILABLE_VARIABLES: AvailableVariable[] = [
  { id: 'practitioner_name', name: '{{practitioner_name}}', displayName: 'Practitioner Name' },
  { id: 'note_id', name: '{{note_id}}', displayName: 'Note ID' },
  { id: 'ai_score', name: '{{ai_score}}', displayName: 'AI Score' },
  { id: 'issues_list', name: '{{issues_list}}', displayName: 'Issues List' },
  { id: 'date', name: '{{date}}', displayName: 'Date' },
  { id: 'client_name', name: '{{client_name}}', displayName: 'Client Name' },
];
