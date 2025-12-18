// AI Log Types for chats/listing endpoint
export interface AILogHumanReview {
  id: number;
  practitioner: {
    id: number;
    fullName: string;
  };
  decision: {
    id: number;
    name: string;
  };
  noteId: string;
  practitionerId: number;
  manualScore: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AILogUser {
  id: number;
  fullName: string;
  email: string;
  type: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AILogBedrockResponse {
  score: number;
  pass: boolean;
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
  user_input: string;
}

export interface AILog {
  id: number;
  triggerSource: { id: number; name: string };
  agent: { id: number; name: string };
  severity: { id: number; name: string };
  prompt: string;
  userNote: string;
  modelId: string;
  evaluationScore: number;
  sentiment: string;
  evaluation: string;
  bedrockResponse: AILogBedrockResponse;
  noteId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  responseTime: number;
  startTime: string;
  endTime: string;
  user: AILogUser;
  humanReviews: AILogHumanReview[];
}
