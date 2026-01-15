// @/types/notes.ts
export interface RawApiNote {
  id: number;
  cptCodeId: number;
  reviewCycle?: { id: number; name: string };
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
    clientId: string;
  };
}

export interface FormattedNote {
  id: string;
  cptCode: number;
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
  reviewCycle?: { id: number; name: string };
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

export interface HumanReview {
  id?: number;
  chatId?: number;
  comment?: string;
  decision?: { id: number; name: string };
  manualScore?: number;
  noteId?: string;
  practitionerId?: number;
  humanResult?: { id: number; name: string };
}
export interface NoteDetail {
  id: string;
  aiStatus: { id: number; name: string };
  priority: { id: number; name: string };
  humanReview: HumanReview[] | null;
  date: string;
  practitioner: string;
  cptCode: number;
  reviewCycle: { id: number; name: string };
  clientId: string;
  noteType: string;
  aiReviews: number;
  auditScore: number;
  lastRun: string;
  aiSummary: string;
  therapySummary: string;
  bedrockResponse: object;
  prompt: string;
  promptData: string;
  rawResponse: string;
  modelDetail: ModelDetail;
  issues: {
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    category: string;
    points: number;
    description: string;
    sectionId: string;
  }[];
  webhookVersions: WebhookVersion[];
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
  userInput: string;
  modelId: string;
  evaluationScore: number;
  humanReviews: HumanReview[] | null;
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

export interface SMEIssue {
  id: number;
  reviewerId: number;
  versionId: number;
  errorType: {
    id: number;
    displayName: string;
    points: number;
  };
  issuesRelatedTo: {
    id: number;
    displayName: string;
  };
  issueDescription: {
    id: number;
    description: string;
  };
  noteId: string;
  status: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebhookVersion {
  id: number;
  noteId: string;
  sessionJson: string;
  createdAt: string;
  updatedAt: string;
  smeIssues: SMEIssue[];
}

export interface ApiNoteDetail {
  id: number;
  chat_count: number;
  type: { id: number; name: string };
  aiStatus: { id: number; name: string };
  priority: { id: number; name: string };
  noteId: string;
  chatId: string;
  sessionId: string;
  session: string;
  sessionTime: string;
  practitionerId: number;
  patient: { clientId: string };
  cptCodeId: number;
  reviewCycle: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  practitioner: Practitioner; // Object type
  chats: Chat[];
  humanReview: HumanReview[] | null;
  webhookVersions: WebhookVersion[];
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
  code: string;
}

// Human Review Queue Types
export interface HumanReviewNote {
  id: string;
  chatId: number;
  practitioner: string;
  date: string;
  score: number;
  aiStatus: number;
  reviewStatus: number;
  reviewer?: string;
  priority: number;
  rawData?: any;
}

export interface ReviewerOverview {
  total_assigned: number;
  awaiting_reassignment: number;
  avg_review_time: string;
  ai_disagreement_rate: string;
}

export interface QueueStatus {
  pending: number;
  in_progress: number;
  returned: number;
}
