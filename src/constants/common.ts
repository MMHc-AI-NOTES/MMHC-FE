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
