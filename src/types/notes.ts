// @/types/notes.ts
export interface RawApiNote {
  id: number;
  noteId: string;
  sessionId: string;
  sessionTime: string;
  practitionerId: number;
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
}

export interface FormattedNote {
  id: string;
  practitioner: string;
  sessionTime: string;
  rawData?: RawApiNote;
}

export interface DataFormatterProps {
  data: RawApiNote[];
}

export interface NoteDetail {
  id: string;
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
  noteId: string;
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

export interface FormattedNote {
  id: string;
  date: string;
  practitioner: string; // String type for formatted note
  cptCode: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
}

export interface NoteDetail {
  id: string;
  date: string;
  practitioner: string; // String type for component
  cptCode: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
  aiSummary: string;
  therapySummary: string;
  bedrockResponse: object;
  issues: {
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    category: string;
    points: number;
    description: string;
    sectionId: string;
  }[];
}
