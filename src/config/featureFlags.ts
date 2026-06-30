export const featureFlags = {
  // Single Note Audit page
  showAuditScoreCard: true,
  showIssuesIdentifiedCard: true,
  showModelInformation: true,
  showAuditHistory: true,
  showPrompt: false,
  showPromptData: false,
  showRawResponse: false,
  showAiSummary: false,
  actionButtons: { reRunAudit: true, sendToPractitioner: true },
  createChatOnLoad: true,
  showScoreComparison: true,
} as const;
