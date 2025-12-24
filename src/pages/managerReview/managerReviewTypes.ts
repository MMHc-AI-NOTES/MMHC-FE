export interface ManagerNote {
  id: number;
  noteId: string;
  practitioner: string;
  date: string;
  aiScore: number;
  humanScore: number | null;
  reviewer: string;
  humanDecision: number | null;
  disagreement: number | null;
  priority: number;
  action: string;
  rawData?: ManagerReviewApiItem;
}

// API Response Types
export interface EnumField {
  id: number;
  name: string;
}

export interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  type: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewInfo {
  id: number;
  decision: EnumField;
  noteId: string;
  chatId: number;
  practitionerId: number;
  manualScore: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  aiStatus: EnumField;
  priority: EnumField;
  humanResult: EnumField;
}

export interface SessionInfo {
  id: number;
  noteId: string;
  sessionId: string;
  session: string;
  sessionTime: string;
  practitionerId: number;
  patientId: number;
  createdAt: string;
  updatedAt: string;
  type: EnumField;
  aiScore: number;
  aiStatus: EnumField;
  humanReview: EnumField;
  manager: EnumField;
  workflow: EnumField;
  priority: EnumField;
  cptCodeId: number;
  reviewCycle: EnumField;
}

export interface ChatInfo {
  id: number;
  prompt: string;
  userNote: string;
  modelId: string;
  evaluationScore: number;
  sentiment: string;
  evaluation: string;
  bedrockResponse: any;
  noteId: string;
  userId: number;
  agentId: number;
  createdAt: string;
  updatedAt: string;
  responseTime: number;
  startTime: string;
  endTime: string;
  severity: EnumField;
  triggerSource: EnumField;
  result: EnumField;
  userInput: string;
}

export interface ManagerReviewApiItem {
  id: number;
  chat_count: number;
  managerId: number;
  reviewId: number;
  noteId: string;
  chatId: number;
  decision: EnumField | null;
  practitionerId: number;
  manualScore: number;
  aiScore: number;
  disagreement: EnumField | null;
  humanDecision: EnumField | null;
  comment: string | null;
  aiStatus: EnumField;
  priority: EnumField;
  humanResult: EnumField;
  createdAt: string;
  updatedAt: string;
  manager: UserInfo;
  review: ReviewInfo;
  session: SessionInfo;
  chat: ChatInfo;
  practitioner: UserInfo;
}

export interface ManagerReviewListingResponse {
  count: number;
  total_count: number;
  total_page_count: number;
  page: number;
  page_size: number;
  data: ManagerReviewApiItem[];
}
interface FilterItem {
  columnName: string;
  type: 'exact' | 'like' | 'date_range';
  value?: any;
  startDate?: string;
  endDate?: string;
}

export interface ManagerReviewPayload {
  page: number;
  pageSize: number;
  filters: FilterItem[];
}

export interface ManagerOverview {
  totalPending: number;
  highDisagreements: number;
  avgReviewTime: string;
  agreementRate: number;
  decisionBreakdown: {
    approveWithEdits: number;
    returnToPractitioner: number;
    escalate: number;
  };
}

export interface ManagerIssue {
  severity: 'Critical' | 'Moderate' | 'Minor';
  category: string;
  description: string;
  points: number;
}

export interface ManagerNoteDetail {
  id: string;
  practitioner: string;
  date: string;
  cptCode: string;
  noteType: string;
  aiScore: number;
  aiConfidence: number;
  aiStatus: string;
  humanScore: number;
  humanDecision: string;
  reviewer: string;
  reviewAttempts: number;
  aiSummary: string;
  statusTags: string[];
  humanReviewStatus: string;
  issues: ManagerIssue[];
  subjective: string;
}

// Single Manager Review Detail API Response
export interface ManagerReviewDetailResponse {
  status: boolean;
  message: string;
  data: ManagerReviewApiItem;
}

// Manager Decision Payload
export interface ManagerDecisionPayload {
  review_id: number;
  note_id: string;
  chat_id: number;
  decision: number;
  practitioner_id: number;
  manual_score: number;
  ai_score: number;
  disagreement: number | null;
  comment: string;
  ai_status: number;
  priority: number;
  human_result: number;
}
