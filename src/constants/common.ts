export const SLIDER_CONFIGS = {
  TEMPERATURE: { min: 0, max: 1, step: 0.1 },
  TOP_P: { min: 0, max: 1, step: 0.2 },
  TOP_K: { min: 0, max: 1000, step: 100 },
} as const;

export const HumanReviewDecisionEnum = {
  accept_ai_evaluation: 1,
  ai_incorrect_override_score: 2,
  clinically_acceptable_despite_ai_issues: 3,
  needs_practitioner_correction: 4,
  escalate_to_office_manager: 5,
} as const;

// Session Type Enum
export const SessionTypeEnum = {
  progress_note: 1,
  intake: 2,
  treatment_plan: 3,
  termination: 4,
} as const;

// AI Status Enum
export const AiStatusEnum = {
  passed: 1,
  failed: 2,
  warning: 3,
  not_reviewed: 4,
  needs_review: 5,
} as const;

// Human Review Enum
export const HumanReviewEnum = {
  not_needed: 1,
  completed: 2,
  pending: 3,
} as const;

// Manager Enum
export const ManagerEnum = {
  not_needed: 1,
  pending: 2,
  in_progress: 3,
  completed: 4,
} as const;

export const ManagerDecisionEnum = {
  approve_with_edits: 1,
  return_to_practitioner: 2,
  escalate: 3,
} as const;

export const DisagreementLevelEnum = {
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
} as const;

// Workflow Enum
export const WorkflowEnum = {
  completed: 1,
  in_queue: 2,
  returned: 3,
  blacklisted: 4,
} as const;

// Priority Enum
export const PriorityEnum = {
  low: 1,
  medium: 2,
  high: 3,
} as const;

// Review Cycle Enum
export const ReviewCycleEnum = {
  cycle_1: 1,
  cycle_2: 2,
  cycle_3: 3,
  blacklisted: 4,
} as const;

// Review Status Enum (for Human Review Queue)
export const ReviewStatusEnum = {
  pending: 1,
  in_progress: 2,
  returned: 3,
} as const;

// Review Stage Enum
export const ReviewStageEnum = {
  all: 0,
} as const;

// Date Range Options
export const DateRangeEnum = {
  all: 'all',
  this_week: 'this_week',
  this_month: 'this_month',
  this_year: 'this_year',
} as const;

// Label mappings for display
export const SessionTypeLabels: Record<number, string> = {
  [SessionTypeEnum.progress_note]: 'Progress Note',
  [SessionTypeEnum.intake]: 'Intake',
  [SessionTypeEnum.treatment_plan]: 'Treatment Plan',
  [SessionTypeEnum.termination]: 'Termination',
};

export const AiStatusLabels: Record<number, string> = {
  [AiStatusEnum.passed]: 'Passed',
  [AiStatusEnum.failed]: 'Failed',
  [AiStatusEnum.warning]: 'Warning',
  [AiStatusEnum.not_reviewed]: 'Not Reviewed',
  [AiStatusEnum.needs_review]: 'Needs Review',
};

export const HumanReviewLabels: Record<number, string> = {
  [HumanReviewEnum.not_needed]: 'Not Needed',
  [HumanReviewEnum.completed]: 'Completed',
  [HumanReviewEnum.pending]: 'Pending',
};

export const ManagerLabels: Record<number, string> = {
  [ManagerEnum.not_needed]: 'Not Needed',
  [ManagerEnum.pending]: 'Pending',
  [ManagerEnum.in_progress]: 'In Progress',
  [ManagerEnum.completed]: 'Completed',
};

export const WorkflowLabels: Record<number, string> = {
  [WorkflowEnum.completed]: 'Completed',
  [WorkflowEnum.in_queue]: 'In Queue',
  [WorkflowEnum.returned]: 'Returned',
  [WorkflowEnum.blacklisted]: 'Blacklisted',
};

export const PriorityLabels: Record<number, string> = {
  [PriorityEnum.low]: 'Low',
  [PriorityEnum.medium]: 'Medium',
  [PriorityEnum.high]: 'High',
};

export const ReviewCycleLabels: Record<number, string> = {
  [ReviewCycleEnum.cycle_1]: 'Cycle 1 of 3',
  [ReviewCycleEnum.cycle_2]: 'Cycle 2 of 3 – Therapist Revision',
  [ReviewCycleEnum.cycle_3]: 'Cycle 3 of 3 – Final Review',
  [ReviewCycleEnum.blacklisted]: 'Auto-Blacklisted – Max Cycles Exceeded',
};

export const ReviewStatusLabels: Record<number, string> = {
  [ReviewStatusEnum.pending]: 'Pending',
  [ReviewStatusEnum.in_progress]: 'In Progress',
  [ReviewStatusEnum.returned]: 'Returned',
};

// Date Range Labels
export const DateRangeLabels: Record<string, string> = {
  all: 'All',
  this_week: 'This Week',
  this_month: 'This Month',
  this_year: 'This Year',
};

export const ChatSeverityEnum = {
  minor: 1,
  moderate: 2,
  critical: 3,
} as const;

export const ChatSeverityLabels: Record<number, string> = {
  [ChatSeverityEnum.minor]: 'Minor',
  [ChatSeverityEnum.moderate]: 'Moderate',
  [ChatSeverityEnum.critical]: 'Critical',
};

export const ChatTriggerSourceEnum = {
  webhook: 1,
  rerun: 2,
} as const;

export const ChatResultEnum = {
  pass: 1,
  fail: 2,
  error: 3,
} as const;

export const ChatResultLabels: Record<number, string> = {
  [ChatResultEnum.pass]: 'Pass',
  [ChatResultEnum.fail]: 'Fail',
  [ChatResultEnum.error]: 'Error',
};

export const HumanReviewResultEnum = {
  pass: 1,
  fail: 2,
} as const;

export const HumanReviewResultLabels: Record<number, string> = {
  [HumanReviewResultEnum.pass]: 'Pass',
  [HumanReviewResultEnum.fail]: 'Fail',
};

export const ManagerDecisionLabels: Record<number, string> = {
  [ManagerDecisionEnum.approve_with_edits]: 'Approve with Edits',
  [ManagerDecisionEnum.return_to_practitioner]: 'Return to Practitioner',
  [ManagerDecisionEnum.escalate]: 'Escalate',
};

export const DisagreementLevelLabels: Record<string, string> = {
  [DisagreementLevelEnum.high]: 'High',
  [DisagreementLevelEnum.medium]: 'Medium',
  [DisagreementLevelEnum.low]: 'Low',
  [DisagreementLevelEnum.none]: 'None',
};

export const EvaluationPromptKeys = {
  currentNote: 'CURRENT_NOTE',
  previousSessions: 'PREVIOUS_SESSIONS',
} as const;

// Blacklist Reason Enum
export const BlacklistReasonEnum = {
  repeated_critical_issues: 1,
  unstable_ai_scoring: 2,
  ai_unable_to_evaluate: 3,
  missing_required_fields: 4,
} as const;

// Blacklist Status Enum
export const BlacklistStatusEnum = {
  blacklisted: 1,
  locked: 2,
  escalated: 3,
  pending: 4,
} as const;

// Blacklist Reason Labels
export const BlacklistReasonLabels: Record<number, string> = {
  [BlacklistReasonEnum.repeated_critical_issues]: 'Repeated critical issues',
  [BlacklistReasonEnum.unstable_ai_scoring]: 'Unstable AI scoring',
  [BlacklistReasonEnum.ai_unable_to_evaluate]: 'AI unable to evaluate',
  [BlacklistReasonEnum.missing_required_fields]: 'Missing required fields',
};

// Blacklist Status Labels
export const BlacklistStatusLabels: Record<number, string> = {
  [BlacklistStatusEnum.blacklisted]: 'Blacklisted',
  [BlacklistStatusEnum.locked]: 'Locked',
  [BlacklistStatusEnum.escalated]: 'Escalated',
  [BlacklistStatusEnum.pending]: 'Pending',
};

// Resolution Action Enum
export const ResolutionActionEnum = {
  restore_to_notes_queue: 1,
  send_to_practitioner: 2,
  unlock_note: 3,
  permanently_lock_note: 4,
  escalate_for_system_review: 5,
} as const;

// Resolution Action Labels
export const ResolutionActionLabels: Record<number, string> = {
  [ResolutionActionEnum.restore_to_notes_queue]: 'Restore to Notes Queue',
  [ResolutionActionEnum.send_to_practitioner]: 'Send to Practitioner for Forced Correction',
  [ResolutionActionEnum.unlock_note]: 'Unlock Note',
  [ResolutionActionEnum.permanently_lock_note]: 'Permanently Lock Note',
  [ResolutionActionEnum.escalate_for_system_review]: 'Escalate for System Review',
};

// User Role Enum
export const UserRoleEnum = {
  super_admin: 1,
  practitioner: 2,
  manager: 3,
} as const;

// User Role Labels (for consistency, though values are the same as enum)
export const UserRoleLabels: Record<string, string> = {
  [UserRoleEnum.super_admin]: 'Super Admin',
  [UserRoleEnum.practitioner]: 'Practitioner',
  [UserRoleEnum.manager]: 'Manager',
};

// Note Submission Enums

// Note Type Enum (for submission form)
export const NoteTypeEnum = {
  progress_note: 1,
  intake_note: 2,
  treatment_plan: 3,
  termination_note: 4,
} as const;

export const NoteTypeLabels: Record<number, string> = {
  [NoteTypeEnum.progress_note]: 'Progress Note',
  [NoteTypeEnum.intake_note]: 'Intake Note',
  [NoteTypeEnum.treatment_plan]: 'Treatment Plan',
  [NoteTypeEnum.termination_note]: 'Termination Note',
};

// Model Version Enum
export const ModelVersionEnum = {
  claude_3_5_haiku_v1: 1,
  claude_3_haiku: 2,
  claude_3_5_haiku_v2: 3,
} as const;

export const ModelVersionLabels: Record<number, string> = {
  [ModelVersionEnum.claude_3_5_haiku_v1]: 'Claude 3.5 Haiku V1',
  [ModelVersionEnum.claude_3_haiku]: 'Claude 3 Haiku',
  [ModelVersionEnum.claude_3_5_haiku_v2]: 'Claude 3.5 Haiku V2',
};

// Prompt Agent Enum
export const PromptAgentEnum = {
  clinical_documentation_auditor: 1,
  technical_support_agent: 2,
} as const;

export const PromptAgentLabels: Record<number, string> = {
  [PromptAgentEnum.clinical_documentation_auditor]: 'Clinical Documentation Auditor',
  [PromptAgentEnum.technical_support_agent]: 'Technical Support Agent',
};

// Practitioner Role Enum
export const PractitionerRoleEnum = {
  therapist: 1,
  psychologist: 2,
  psychiatrist: 3,
  counselor: 4,
  social_worker: 5,
} as const;

export const PractitionerRoleLabels: Record<number, string> = {
  [PractitionerRoleEnum.therapist]: 'Therapist',
  [PractitionerRoleEnum.psychologist]: 'Psychologist',
  [PractitionerRoleEnum.psychiatrist]: 'Psychiatrist',
  [PractitionerRoleEnum.counselor]: 'Counselor',
  [PractitionerRoleEnum.social_worker]: 'Social Worker',
};

// Audit Mode Enum
export const AuditModeEnum = {
  default: 1,
  strict: 2,
  experimental: 3,
} as const;

export const AuditModeLabels: Record<number, string> = {
  [AuditModeEnum.default]: 'Default',
  [AuditModeEnum.strict]: 'Strict',
  [AuditModeEnum.experimental]: 'Experimental',
};

// Pre-Audit Check Status Enum
export const PreAuditCheckStatusEnum = {
  passed: 1,
  warning: 2,
  failed: 3,
} as const;

export const PreAuditCheckStatusLabels: Record<number, string> = {
  [PreAuditCheckStatusEnum.passed]: 'Passed',
  [PreAuditCheckStatusEnum.warning]: 'Warning',
  [PreAuditCheckStatusEnum.failed]: 'Needs Improvement',
};

// Structure Quality Enum
export const StructureQualityEnum = {
  strong: 1,
  moderate: 2,
  weak: 3,
} as const;

export const StructureQualityLabels: Record<number, string> = {
  [StructureQualityEnum.strong]: 'Strong Structure',
  [StructureQualityEnum.moderate]: 'Moderate Structure',
  [StructureQualityEnum.weak]: 'Weak Structure',
};
