// @/types/notes.ts
export interface RawApiNote {
  id: number;
  noteId: string;
  sessionId: string;
  sessionTime: string;
  practitionerId: number;
  client?: string;
  clientId?: string;
  type?: number;
  noteType?: { id: number; name: string };
  aiScore?: { id: number; name: string };
  aiStatus?: { id: number; name: string };
  humanReview?: { id: number; name: string };
  manager?: { id: number; name: string };
  workflow?: { id: number; name: string };
  priority?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  practitioner: {
    id: number;
    fullName: string;
    email: string;
    type: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  patient: {
    uuid: string;
  };
}

export interface FormattedNote {
  id: string;
  practitioner: string;
  client: string;
  date: string;
  type: string;
  aiScore: number;
  aiStatus: number;
  humanReview: number;
  manager: number;
  workflow: number;
  priority: number;
  sessionTime?: string;
  rawData?: RawApiNote;
}

export interface DataFormatterProps {
  data: RawApiNote[];
}

export interface ModelDetail {
  modelVersion: string;
  lastRun: string;
  promptVersion?: string;
  auditRunId: number | string;
}

export interface NoteDetail {
  id: string;
  aiStatus: { id: number; name: string };
  date: string;
  practitioner: string;
  cptCode: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
  aiSummary: string;
  therapySummary: string;
  bedrockResponse: object;
  prompt: string;
  rawResponse: string;
  modelDetail: ModelDetail;
  issues: {
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    category: string;
    points: number;
    description: string;
    sectionId: string;
  }[];
}

export interface NoteSection {
  id: string;
  title: string;
  code: string;
  icon: any;
  content: string;
  highlight?: boolean;
}

// Unified API types
export interface Chat {
  id: number;
  prompt: string;
  userNote: string;
  modelId: string;
  evaluationScore: number;
  sentiment: string;
  evaluation: string;
  bedrockResponse: {
    score: number;
    pass: boolean;
    createdAt: string;
    issues: Array<{
      severity: string;
      points_deducted: number;
      section_id: string;
      section: string;
      justification: string;
    }>;
    summary: string;
    sentiment: string;
    evaluation: string;
    '6tx9-1_subjective': string;
    'rb2f-1_objective': string;
    'zad8-1_asment_&_therapeutic_intervention': string;
    'ugq6-1_reaction_to_intervention': string;
    'hnfi-1_plan_and_collaboration': string;
    '9z5t-1_therapist_reflection': string;
    'gm4p-1_progress': string;
    'kxgx-7_&_kxgx-8_suicidality/homicidality': string;
    raw_response: string;
  };
  noteId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Practitioner {
  id: number;
  fullName: string;
  email: string;
  type: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNoteDetail {
  id: number;
  aiStatus: { id: number; name: string };
  noteId: string;
  chatId: string;
  sessionId: string;
  session: string;
  sessionTime: string;
  practitionerId: number;
  patient: { uuid: string };
  createdAt: string;
  updatedAt: string;
  practitioner: Practitioner; // Object type
  chats: Chat[];
}

// Queue Overview Data
export interface QueueOverview {
  total_notes: number;
  ai_passed: number;
  ai_failed: number;
  pending_human_review: number;
  pending_manager_review: number;
  blacklist: number;
}

// Workload Data
export interface Workload {
  assign_notes: number;
  avg_review_time: string;
  return_rate: string;
  ai_disagreement_rate: string;
}

// Filter Options
export interface FilterOption {
  value: string | number;
  label: string;
}

export interface PractitionerOption {
  id: number;
  fullName: string;
}

export interface CptCodeOption {
  id: number;
  uuid: string;
}
