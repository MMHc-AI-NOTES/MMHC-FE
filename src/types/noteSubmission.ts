import {
  NoteTypeEnum,
  ModelVersionEnum,
  PromptAgentEnum,
  PractitionerRoleEnum,
  AuditModeEnum,
  PreAuditCheckStatusEnum,
  StructureQualityEnum,
} from '@/constants/common';

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
  modelVersion: (typeof ModelVersionEnum)[keyof typeof ModelVersionEnum];
  promptAgent: (typeof PromptAgentEnum)[keyof typeof PromptAgentEnum];
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
