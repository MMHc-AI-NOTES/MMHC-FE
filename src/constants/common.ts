export const SLIDER_CONFIGS = {
  TEMPERATURE: { min: 0, max: 1, step: 0.1 },
  TOP_P: { min: 0, max: 1, step: 0.2 },
  TOP_K: { min: 0, max: 1000, step: 100 },
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

// Date Range Labels
export const DateRangeLabels: Record<string, string> = {
  all: 'All',
  this_week: 'This Week',
  this_month: 'This Month',
  this_year: 'This Year',
};
