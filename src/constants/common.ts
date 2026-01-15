export const SLIDER_CONFIGS = {
  TEMPERATURE: { min: 0, max: 1, step: 0.1 },
  TOP_P: { min: 0, max: 1, step: 0.1 },
  TOP_K: { min: 0, max: 1000, step: 100 },
} as const;

export const HumanReviewDecisionEnum = {
  accept_ai_evaluation: 1,
  ai_incorrect_override_score: 2,
  clinically_acceptable_despite_ai_issues: 3,
  needs_practitioner_correction: 4,
  escalate_to_office_manager: 5,
} as const;

export const HumanReviewDecisionLabels: Record<number, string> = {
  [HumanReviewDecisionEnum.accept_ai_evaluation]: 'Accept AI evaluation',
  [HumanReviewDecisionEnum.ai_incorrect_override_score]: 'AI is incorrect — override score',
  [HumanReviewDecisionEnum.clinically_acceptable_despite_ai_issues]: 'Note is clinically acceptable despite AI issues',
  [HumanReviewDecisionEnum.needs_practitioner_correction]: 'Note needs practitioner correction',
  [HumanReviewDecisionEnum.escalate_to_office_manager]: 'Escalate to Office Manager',
};

// Manager Decision Enum
export const ManagerDecisionEnum = {
  approve_note_valid_and_compliant: 1,
  reject_send_back_to_practitioner: 2,
  reject_requires_correction_cycle: 3,
  ai_evaluation_incorrect_escalate: 4,
  require_sme_review: 5,
  unlock_note_for_manual_editing: 6,
  add_internal_audit_note_only: 7,
} as const;

export const ManagerDecisionLabels: Record<number, string> = {
  [ManagerDecisionEnum.approve_note_valid_and_compliant]: 'Approve note (valid and compliant)',
  [ManagerDecisionEnum.reject_send_back_to_practitioner]: 'Reject note — send back to practitioner',
  [ManagerDecisionEnum.reject_requires_correction_cycle]: 'Reject note — requires practitioner correction cycle',
  [ManagerDecisionEnum.ai_evaluation_incorrect_escalate]: 'AI evaluation incorrect — escalate to AI team',
  [ManagerDecisionEnum.require_sme_review]: 'Require SME review',
  [ManagerDecisionEnum.unlock_note_for_manual_editing]: 'Unlock the note for manual editing',
  [ManagerDecisionEnum.add_internal_audit_note_only]: 'Add internal audit note only (no workflow action)',
};

// Helper function to get manager decision options
export const getManagerDecisionOptions = () =>
  Object.values(ManagerDecisionEnum).map(value => ({
    value,
    label: ManagerDecisionLabels[value],
  }));

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

export const DisagreementLevelLabels: Record<string, string> = {
  [DisagreementLevelEnum.high]: 'High',
  [DisagreementLevelEnum.medium]: 'Medium',
  [DisagreementLevelEnum.low]: 'Low',
  [DisagreementLevelEnum.none]: 'None',
};

export const EvaluationPromptKeys = {
  currentSession: 'CURRENT_SESSION',
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

export const AgentModelKeys = {
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_5_HAIKU_V1: 'us.anthropic.claude-3-5-haiku-20241022-v1:0', // Inference profile format
  CLAUDE_4_5_HAIKU_V1: 'us.anthropic.claude-haiku-4-5-20251001-v1:0', // Inference profile format
  CLAUDE_4_5_SONNET_V1: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0', // Claude Sonnet 4.5 (inference profile format)
} as const;

export const AgentModelDisplayNames: Record<keyof typeof AgentModelKeys, string> = {
  CLAUDE_3_HAIKU: 'Claude 3 Haiku',
  CLAUDE_3_5_HAIKU_V1: 'Claude 3.5 Haiku',
  CLAUDE_4_5_HAIKU_V1: 'Claude 4.5 Haiku',
  CLAUDE_4_5_SONNET_V1: 'Claude 4.5 Sonnet',
};

export const AgentTypes = {
  SYSTEM: 1,
  SOAP: 2,
  CUSTOM: 3,
} as const;

export const AgentTypeLabels: Record<number, string> = {
  [AgentTypes.SYSTEM]: 'System',
  [AgentTypes.SOAP]: 'SOAP',
  [AgentTypes.CUSTOM]: 'Custom',
};

// Error type options
export const ERROR_TYPES = [
  { value: 'critical', label: 'Critical (-25 pts)', points: -25 },
  { value: 'moderate', label: 'Moderate (-15 pts)', points: -15 },
  { value: 'minor', label: 'Minor (-5 pts)', points: -5 },
] as const;

// Issue related to options (section IDs with names)
export const ISSUE_RELATED_TO_OPTIONS = [
  { id: 'p9m9-1', name: 'Session Duration' },
  { id: '1hye-1', name: 'Mental Status' },
  { id: '6tx9-1', name: 'Subjective' },
  { id: 'rb2f-1', name: 'Objective' },
  { id: 'zad8-1', name: 'Assessment & Therapeutic Intervention' },
  { id: 'ugq6-1', name: 'Reaction to Intervention' },
  { id: 'hnfi-1', name: 'Plan and Collaboration' },
  { id: '9z5t-1', name: 'Therapist Reflection and Insight' },
  { id: 'gm4p-1', name: 'Progress' },
  { id: 'kxgx-7', name: 'Suicidality' },
  { id: 'kxgx-8', name: 'Homicidality' },
  { id: '4lbp-1', name: 'Therapist Initials' },
];

// Issue description options (simplified - no categories)
export const ISSUE_DESCRIPTIONS = [
  'No clinical interpretation',
  'No modality or intervention explanation',
  'Vague or non-specific language',
  'Templated or boilerplate language',
  'Repetitive content within the note',
  'Not specific to date of service',
  'Progress marked but not supported by note content',
  'Transcription-style documentation',
  'Missing required field',
  'Identical or duplicate content from previous note',
  'One field copied from previous note',
  'Repetitive field across multiple notes',
  'Plan is generic or continuity-only',
];

// Display name mappings for numeric IDs (for API responses)
export const ErrorTypeDisplayNames: Record<number, string> = {
  1: 'Minor (-5 pts)',
  2: 'Moderate (-15 pts)',
  3: 'Critical (-25 pts)',
};

export const IssuesRelatedToDisplayName: Record<number, string> = {
  1: 'Session Duration',
  2: 'Mental Status',
  3: 'Subjective',
  4: 'Objective',
  5: 'Assessment & Therapeutic Intervention',
  6: 'Reaction to Intervention',
  7: 'Plan and Collaboration',
  8: 'Therapist Reflection and Insight',
  9: 'Progress',
  10: 'Suicidality',
  11: 'Homicidality',
  12: 'Therapist Initials',
  13: 'General',
};

export const IssueDescriptionDisplayNames: Record<number, string> = {
  1: 'No clinical interpretation',
  2: 'No modality or intervention explanation',
  3: 'Vague or non-specific language',
  4: 'Templated or boilerplate language',
  5: 'Repetitive content within the note',
  6: 'Not specific to date of service',
  7: 'Progress marked but not supported by note content',
  8: 'Transcription-style documentation',
  9: 'Missing required field',
  10: 'Identical or duplicate content from previous note',
  11: 'One field copied from previous note',
  12: 'Repetitive field across multiple notes',
  13: 'Plan is generic or continuity-only',
};

// Session JSON field display names mapping
export const SessionJsonFieldDisplayNames: Record<string, string> = {
  'Session Duration': 'Session Duration',
  'Mental Status (optional)': 'Mental Status',
  Suicidality: 'Suicidality',
  Homicidality: 'Homicidality',
  Subjective: 'Subjective',
  Objective: 'Objective',
  'Assessment & Therapeutic Intervention': 'Assessment & Therapeutic Intervention',
  'Reaction to Intervention': 'Reaction to Intervention',
  'Plan and Collaboration': 'Plan and Collaboration',
  'Therapist Reflection and Insight (optional)': 'Therapist Reflection and Insight',
  Progress: 'Progress',
  'Therapist Initials': 'Therapist Initials',
};

// Export merged data functions (combines default constants with localStorage customizations)
export { getMergedErrorTypes, getMergedIssueRelatedTo, getMergedIssueDescriptions } from '@/types/smeConfig';
