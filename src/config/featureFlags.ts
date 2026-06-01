export const featureFlags = {
  // Single Note Audit page
  showAuditScoreCard: false,
  showIssuesIdentifiedCard: false,
  showModelInformation: false,
  showAuditHistory: true,
  showPrompt: false,
  showPromptData: false,
  showRawResponse: false,
  showAiSummary: true,
  actionButtons: { reRunAudit: false, sendToPractitioner: true },
  createChatOnLoad: false,
  showScoreComparison: false,
} as const;
