export const AGENT_MODEL_KEYS = {
  CLAUDE_3_5_SONNET_V2: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  CLAUDE_3_5_SONNET_V1: 'anthropic.claude-3-5-sonnet-20241022-v1:0',
  CLAUDE_3_OPUS: 'anthropic.claude-3-opus-20240229-v1:0',
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_5_HAIKU_V2: 'anthropic.claude-3-5-haiku-20241022-v2:0',
  CLAUDE_3_5_HAIKU_V1: 'anthropic.claude-3-5-haiku-20241022-v1:0',
} as const;

export const AGENT_MODEL_DISPLAY_NAMES: Record<keyof typeof AGENT_MODEL_KEYS, string> = {
  CLAUDE_3_5_SONNET_V2: 'Claude 3.5 Sonnet V2',
  CLAUDE_3_5_SONNET_V1: 'Claude 3.5 Sonnet V1',
  CLAUDE_3_OPUS: 'Claude 3 Opus',
  CLAUDE_3_SONNET: 'Claude 3 Sonnet',
  CLAUDE_3_HAIKU: 'Claude 3 Haiku',
  CLAUDE_3_5_HAIKU_V2: 'Claude 3.5 Haiku V2',
  CLAUDE_3_5_HAIKU_V1: 'Claude 3.5 Haiku V1',
};

export const AGENT_TYPES = {
  SYSTEM: 1,
  SOAP: 2,
  CUSTOM: 3,
} as const;

export const AGENT_TYPE_LABELS: Record<number, string> = {
  [AGENT_TYPES.SYSTEM]: 'System',
  [AGENT_TYPES.SOAP]: 'SOAP',
  [AGENT_TYPES.CUSTOM]: 'Custom',
};
