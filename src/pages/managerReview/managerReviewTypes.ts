export interface ManagerNote {
  id: string;
  practitioner: string;
  date: string;
  aiScore: number;
  humanScore: number | null;
  reviewer: string;
  humanDecision: number;
  disagreement: number;
  priority: number;
  action: string;
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
