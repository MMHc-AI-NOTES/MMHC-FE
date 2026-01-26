export interface BlacklistedNote {
  id: number;
  noteId: number;
  practitioner: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name?: string;
  };
  date: string;
  noteType: {
    id: number;
    name: string;
  };
  cptCode?: string;
  aiScore: number | null;
  blacklistReason: {
    id: number;
    name: string;
  };
  aiAttempts: {
    current: number;
    max: number;
  };
  severity: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  assignedTo?: {
    id: number;
    name: string;
  };
  originalReviewPath?: string;
  currentStatus?: string;
  reasonDetails?: {
    title: string;
    description: string[];
    severity: {
      id: number;
      name: string;
    };
    date: string;
    autoBlacklistedBy?: string;
  };
  issues?: BlacklistedNoteIssue[];
  reviewHistory?: ReviewHistoryItem[];
  rawData?: any;
}

export interface BlacklistedNoteIssue {
  id: string;
  severity: {
    id: number;
    name: string;
  };
  source: 'AI' | 'Human' | 'Manager';
  title: string;
  description: string;
}

export interface ReviewHistoryItem {
  id: string;
  type: 'AI Audit' | 'Admin Review' | 'Manager Escalation' | 'Blacklisted';
  date: string;
  user?: string;
  result?: string;
  score?: number;
  notes?: string;
}

export interface BlacklistedNotesPayload {
  page: number;
  pageSize: number;
  filters: Array<{
    columnName: string;
    type: 'exact' | 'like';
    value: any;
  }>;
}

export interface BlacklistedNotesResponse {
  data: BlacklistedNote[];
  totalCount: number;
  page: number;
  pageSize: number;
}
