import { NoteTypeEnum, PractitionerRoleEnum, AuditModeEnum, PreAuditCheckStatusEnum, StructureQualityEnum } from '@/constants/common';

// Form Data Types
export interface SessionMetadata {
  sessionLength: string;
  clientInitials: string;
  modelVersion: string;
  promptAgent: string;
}

export interface PractitionerDetails {
  name: string;
  credentials: string;
  role: (typeof PractitionerRoleEnum)[keyof typeof PractitionerRoleEnum];
}

export interface AuditControls {
  auditMode: (typeof AuditModeEnum)[keyof typeof AuditModeEnum];
  enableDebugMode: boolean;
  includeTokenUsageReport: boolean;
}

export interface NoteSubmissionFormData {
  noteType: (typeof NoteTypeEnum)[keyof typeof NoteTypeEnum];
  modelVersion: string;
  promptAgent: number;
  sessionMetadata: SessionMetadata;
  practitionerDetails: PractitionerDetails;
  auditControls: AuditControls;
  progressNoteContent: string;
}

// Pre-Audit Check Types
export interface PreAuditCheck {
  id: string;
  name: string;
  status: (typeof PreAuditCheckStatusEnum)[keyof typeof PreAuditCheckStatusEnum];
  description?: string;
}

export interface PreAuditCheckResult {
  overallStatus: (typeof StructureQualityEnum)[keyof typeof StructureQualityEnum];
  checks: PreAuditCheck[];
}

// API Response Types
export interface NoteSubmissionResponse {
  success: boolean;
  auditId: string;
  message: string;
  estimatedTokens: number;
  expectedAuditTime: string;
}

export interface TokenEstimation {
  estimatedTokens: number;
  expectedAuditTime: string;
}

export interface SessionReviewPayload {
  note_id: string;
  prompt_id: number;
  model_id: string;
}

export interface SessionReviewData {
  output_text?: string;
  score?: number;
  pass?: boolean;
  issues?: any[];
  scorer_version?: string;
  raw_response?: string;
  validation_result?: {
    isValid: boolean;
    status?: string;
    message?: string;
  };
  content?: unknown[];
}
