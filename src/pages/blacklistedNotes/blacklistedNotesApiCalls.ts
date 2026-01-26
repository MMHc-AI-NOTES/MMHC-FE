// import axios from 'axios';
import {
  // handleErrorMessages,
  handleCatchMessages,
} from '@/utils/helper';
import { BlacklistedNote, BlacklistedNotesPayload, BlacklistedNotesResponse } from '@/types/blacklistedNotes';
import { BlacklistReasonEnum, BlacklistStatusEnum, ChatSeverityEnum } from '@/constants/common';

// interface ApiResponse<T> {
//   status: boolean;
//   message?: string;
//   data?: T;
//   total_count?: number;
//   page?: number;
//   page_size?: number;
//   errors?: any;
// }

// Dummy data for development
const DUMMY_NOTES: BlacklistedNote[] = [
  {
    id: 1,
    noteId: 12443,
    practitioner: {
      id: 1,
      name: 'Jane Thompson',
    },
    client: {
      id: 8392,
      name: 'Patient #8392',
    },
    date: '2025-02-10',
    noteType: {
      id: 1,
      name: 'Progress Note',
    },
    cptCode: '90834',
    aiScore: 42,
    blacklistReason: {
      id: BlacklistReasonEnum.repeated_critical_issues,
      name: 'Repeated critical issues',
    },
    aiAttempts: {
      current: 3,
      max: 3,
    },
    severity: {
      id: ChatSeverityEnum.critical,
      name: 'Critical',
    },
    status: {
      id: BlacklistStatusEnum.blacklisted,
      name: 'Blacklisted',
    },
    assignedTo: {
      id: 1,
      name: 'Dr. Sarah Chen',
    },
    originalReviewPath: 'AI Review -> Admin Review -> Manager Review -> Blacklisted',
    currentStatus: 'Blacklisted',
    reasonDetails: {
      title: 'Repeated Critical Issues',
      description: [
        'Assessment & Therapeutic Intervention field missing diagnostic criteria',
        'SI/HI marked present with no follow-up documentation',
        'Treatment plan lacks specific, measurable goals',
        'Failed 3 consecutive AI audits with scores below 50',
      ],
      severity: {
        id: ChatSeverityEnum.critical,
        name: 'Critical',
      },
      date: '2025-02-10T16:15:00',
      autoBlacklistedBy: 'Auto-Blacklisted by AI Engine',
    },
    issues: [
      {
        id: 'zad8-1',
        severity: {
          id: ChatSeverityEnum.critical,
          name: 'Critical',
        },
        source: 'AI',
        title: 'Assessment & Therapeutic Intervention',
        description: 'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms.',
      },
      {
        id: 'kxgx-7',
        severity: {
          id: ChatSeverityEnum.critical,
          name: 'Critical',
        },
        source: 'Human',
        title: 'SI/HI',
        description: 'Suicidal ideation marked present without safety assessment or crisis plan documentation.',
      },
      {
        id: 'hnfi-1',
        severity: {
          id: ChatSeverityEnum.moderate,
          name: 'Moderate',
        },
        source: 'Manager',
        title: 'Plan & Collaboration',
        description: 'Treatment plan lacks specific, measurable, time-bound goals required for medical necessity.',
      },
    ],
    reviewHistory: [
      {
        id: '1',
        type: 'AI Audit',
        date: '2025-02-10T09:15:00',
        result: 'Failed',
        score: 38,
      },
      {
        id: '2',
        type: 'AI Audit',
        date: '2025-02-10T11:42:00',
        result: 'Failed',
        score: 42,
      },
      {
        id: '3',
        type: 'Admin Review',
        date: '2025-02-10T14:05:00',
        user: 'Mark Rodriguez',
        result: 'Rejected - Critical Issues',
      },
      {
        id: '4',
        type: 'AI Audit',
        date: '2025-02-10T15:30:00',
        result: 'Failed',
        score: 41,
      },
      {
        id: '5',
        type: 'Manager Escalation',
        date: '2025-02-10T15:55:00',
        user: 'Dr. Sarah Chen',
        result: 'Escalated to Blacklist',
      },
      {
        id: '6',
        type: 'Blacklisted',
        date: '2025-02-10T16:15:00',
        notes: 'Auto-Blacklisted by AI Engine',
      },
    ],
  },
  {
    id: 2,
    noteId: 12441,
    practitioner: {
      id: 2,
      name: 'Michael Davis',
    },
    client: {
      id: 7891,
      name: 'Patient #7891',
    },
    date: '2025-02-09',
    noteType: {
      id: 2,
      name: 'Initial Assessment',
    },
    cptCode: '90791',
    aiScore: null,
    blacklistReason: {
      id: BlacklistReasonEnum.ai_unable_to_evaluate,
      name: 'AI unable to evaluate',
    },
    aiAttempts: {
      current: 2,
      max: 3,
    },
    severity: {
      id: ChatSeverityEnum.critical,
      name: 'Critical',
    },
    status: {
      id: BlacklistStatusEnum.locked,
      name: 'Locked',
    },
    assignedTo: {
      id: 1,
      name: 'Dr. Sarah Chen',
    },
    originalReviewPath: 'AI Review -> Locked',
    currentStatus: 'Locked',
    reasonDetails: {
      title: 'AI Unable to Evaluate',
      description: [
        'AI system unable to process note content',
        'Multiple evaluation attempts failed',
        'Requires manual review and intervention',
      ],
      severity: {
        id: ChatSeverityEnum.critical,
        name: 'Critical',
      },
      date: '2025-02-09T14:30:00',
    },
    issues: [
      {
        id: 'ai-error-1',
        severity: {
          id: ChatSeverityEnum.critical,
          name: 'Critical',
        },
        source: 'AI',
        title: 'Evaluation Error',
        description: 'AI system encountered errors during evaluation process. Unable to complete assessment.',
      },
    ],
    reviewHistory: [
      {
        id: '1',
        type: 'AI Audit',
        date: '2025-02-09T10:00:00',
        result: 'Error',
      },
      {
        id: '2',
        type: 'AI Audit',
        date: '2025-02-09T12:30:00',
        result: 'Error',
      },
      {
        id: '3',
        type: 'Blacklisted',
        date: '2025-02-09T14:30:00',
        notes: 'Locked due to AI evaluation failure',
      },
    ],
  },
  {
    id: 3,
    noteId: 12438,
    practitioner: {
      id: 3,
      name: 'Emily Rodriguez',
    },
    client: {
      id: 6543,
      name: 'Patient #6543',
    },
    date: '2025-02-08',
    noteType: {
      id: 1,
      name: 'Progress Note',
    },
    cptCode: '90834',
    aiScore: 58,
    blacklistReason: {
      id: BlacklistReasonEnum.unstable_ai_scoring,
      name: 'Unstable AI scoring',
    },
    aiAttempts: {
      current: 3,
      max: 3,
    },
    severity: {
      id: ChatSeverityEnum.moderate,
      name: 'Moderate',
    },
    status: {
      id: BlacklistStatusEnum.escalated,
      name: 'Escalated',
    },
    assignedTo: {
      id: 2,
      name: 'Quality Review Team',
    },
    originalReviewPath: 'AI Review -> Escalated',
    currentStatus: 'Escalated',
    reasonDetails: {
      title: 'Unstable AI Scoring',
      description: [
        'AI scores varied significantly across multiple attempts',
        'Inconsistent evaluation results',
        'Requires quality review team assessment',
      ],
      severity: {
        id: ChatSeverityEnum.moderate,
        name: 'Moderate',
      },
      date: '2025-02-08T16:20:00',
    },
    issues: [
      {
        id: 'unstable-1',
        severity: {
          id: ChatSeverityEnum.moderate,
          name: 'Moderate',
        },
        source: 'AI',
        title: 'Scoring Inconsistency',
        description:
          'AI evaluation scores showed significant variance across multiple audit attempts, indicating potential system instability.',
      },
    ],
    reviewHistory: [
      {
        id: '1',
        type: 'AI Audit',
        date: '2025-02-08T09:00:00',
        result: 'Passed',
        score: 72,
      },
      {
        id: '2',
        type: 'AI Audit',
        date: '2025-02-08T11:30:00',
        result: 'Failed',
        score: 45,
      },
      {
        id: '3',
        type: 'AI Audit',
        date: '2025-02-08T14:00:00',
        result: 'Passed',
        score: 58,
      },
      {
        id: '4',
        type: 'Manager Escalation',
        date: '2025-02-08T16:20:00',
        user: 'Quality Review Team',
        result: 'Escalated for Review',
      },
    ],
  },
  {
    id: 4,
    noteId: 12435,
    practitioner: {
      id: 1,
      name: 'Jane Thompson',
    },
    client: {
      id: 5234,
      name: 'Patient #5234',
    },
    date: '2025-02-07',
    noteType: {
      id: 1,
      name: 'Progress Note',
    },
    cptCode: '90834',
    aiScore: 45,
    blacklistReason: {
      id: BlacklistReasonEnum.missing_required_fields,
      name: 'Missing required fields',
    },
    aiAttempts: {
      current: 2,
      max: 3,
    },
    severity: {
      id: ChatSeverityEnum.critical,
      name: 'Critical',
    },
    status: {
      id: BlacklistStatusEnum.blacklisted,
      name: 'Blacklisted',
    },
    assignedTo: {
      id: 3,
      name: 'Mark Rodriguez',
    },
    originalReviewPath: 'AI Review -> Admin Review -> Blacklisted',
    currentStatus: 'Blacklisted',
    reasonDetails: {
      title: 'Missing Required Fields',
      description: [
        'Required documentation fields are incomplete',
        'Missing critical clinical information',
        'Failed to meet documentation standards after multiple attempts',
      ],
      severity: {
        id: ChatSeverityEnum.critical,
        name: 'Critical',
      },
      date: '2025-02-07T15:45:00',
    },
    issues: [
      {
        id: 'missing-1',
        severity: {
          id: ChatSeverityEnum.critical,
          name: 'Critical',
        },
        source: 'AI',
        title: 'Missing Required Fields',
        description: 'Note is missing required documentation fields that are essential for clinical compliance and billing.',
      },
      {
        id: 'missing-2',
        severity: {
          id: ChatSeverityEnum.critical,
          name: 'Critical',
        },
        source: 'Human',
        title: 'Incomplete Documentation',
        description: 'Human reviewer identified missing critical clinical information that must be addressed.',
      },
    ],
    reviewHistory: [
      {
        id: '1',
        type: 'AI Audit',
        date: '2025-02-07T10:00:00',
        result: 'Failed',
        score: 48,
      },
      {
        id: '2',
        type: 'AI Audit',
        date: '2025-02-07T13:00:00',
        result: 'Failed',
        score: 45,
      },
      {
        id: '3',
        type: 'Admin Review',
        date: '2025-02-07T14:30:00',
        user: 'Mark Rodriguez',
        result: 'Rejected - Missing Fields',
      },
      {
        id: '4',
        type: 'Blacklisted',
        date: '2025-02-07T15:45:00',
        notes: 'Blacklisted due to missing required fields',
      },
    ],
  },
];

// const formatApiData = (items: any[]): BlacklistedNote[] => {
//   return items.map(item => ({
//     id: item.id || item.note_id,
//     noteId: item.note_id || item.id,
//     practitioner: {
//       id: item.practitioner?.id || item.practitioner_id,
//       name: item.practitioner?.name || item.practitioner_name || 'Unknown',
//     },
//     client: item.client
//       ? {
//           id: item.client.id || item.client_id,
//           name: item.client.name || item.client_name,
//         }
//       : undefined,
//     date: item.date || item.created_at || item.note_date,
//     noteType: {
//       id: item.note_type?.id || item.note_type_id || 1,
//       name: item.note_type?.name || item.note_type_name || 'Progress Note',
//     },
//     cptCode: item.cpt_code || item.cptCode,
//     aiScore: item.ai_score !== null && item.ai_score !== undefined ? item.ai_score : null,
//     blacklistReason: {
//       id: item.blacklist_reason?.id || item.blacklist_reason_id || 1,
//       name: item.blacklist_reason?.name || item.blacklist_reason_name || 'Unknown',
//     },
//     aiAttempts: {
//       current: item.ai_attempts?.current || item.ai_attempts_current || 0,
//       max: item.ai_attempts?.max || item.ai_attempts_max || 3,
//     },
//     severity: {
//       id: item.severity?.id || item.severity_id || 3,
//       name: item.severity?.name || item.severity_name || 'Critical',
//     },
//     status: {
//       id: item.status?.id || item.status_id || 1,
//       name: item.status?.name || item.status_name || 'Blacklisted',
//     },
//     assignedTo: item.assigned_to
//       ? {
//           id: item.assigned_to.id || item.assigned_to_id,
//           name: item.assigned_to.name || item.assigned_to_name,
//         }
//       : undefined,
//     originalReviewPath: item.original_review_path,
//     currentStatus: item.current_status,
//     reasonDetails: item.reason_details
//       ? {
//           title: item.reason_details.title || item.blacklist_reason?.name || 'Unknown',
//           description: item.reason_details.description || [],
//           severity: {
//             id: item.reason_details.severity?.id || item.severity?.id || 3,
//             name: item.reason_details.severity?.name || item.severity?.name || 'Critical',
//           },
//           date: item.reason_details.date || item.date || item.created_at,
//           autoBlacklistedBy: item.reason_details.auto_blacklisted_by,
//         }
//       : undefined,
//     issues: item.issues || [],
//     reviewHistory: item.review_history || [],
//     rawData: item,
//   }));
// };

// Helper function to filter dummy data based on payload filters
const filterDummyNotes = (notes: BlacklistedNote[], filters: BlacklistedNotesPayload['filters']): BlacklistedNote[] => {
  let filtered = [...notes];

  filters.forEach(filter => {
    switch (filter.columnName) {
      case 'severity_id':
        filtered = filtered.filter(note => note.severity.id === filter.value);
        break;
      case 'blacklist_reason_id':
        filtered = filtered.filter(note => note.blacklistReason.id === filter.value);
        break;
      case 'practitioner_id':
        filtered = filtered.filter(note => note.practitioner.id === filter.value);
        break;
      case 'status_id':
        filtered = filtered.filter(note => note.status.id === filter.value);
        break;
    }
  });

  return filtered;
};

export const fetchBlacklistedNotes = async (payload: BlacklistedNotesPayload): Promise<BlacklistedNotesResponse> => {
  // TODO: Replace with actual API call when available
  // For now, return dummy data
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredNotes = DUMMY_NOTES;

    // Apply filters if any
    if (payload.filters && payload.filters.length > 0) {
      filteredNotes = filterDummyNotes(DUMMY_NOTES, payload.filters);
    }

    // Apply pagination
    const startIndex = (payload.page - 1) * payload.pageSize;
    const endIndex = startIndex + payload.pageSize;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

    return {
      data: paginatedNotes,
      totalCount: filteredNotes.length,
      page: payload.page,
      pageSize: payload.pageSize,
    };

    // Uncomment below when API is available
    /*
    const response = await axios.post<ApiResponse<any>>('/blacklisted-notes/listing', payload);

    if (response?.status) {
      const notesArray = response.data?.data || [];
      const totalCount = response.data?.total_count || 0;
      const page = response.data?.page || 1;
      const pageSize = response.data?.page_size || 20;

      let formattedNotes: BlacklistedNote[] = [];
      if (Array.isArray(notesArray) && notesArray.length > 0) {
        formattedNotes = formatApiData(notesArray);
      }

      return { data: formattedNotes, totalCount, page, pageSize };
    } else {
      handleErrorMessages(response);
      return { data: [], totalCount: 0, page: 1, pageSize: 20 };
    }
    */
  } catch (error: any) {
    handleCatchMessages(error);
    return { data: [], totalCount: 0, page: 1, pageSize: 20 };
  }
};
