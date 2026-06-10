export const featureFlags = {
  // Single Note Audit page
  showAuditScoreCard: true,
  showIssuesIdentifiedCard: true,
  showModelInformation: true,
  showAuditHistory: true,
  showPrompt: true,
  showPromptData: true,
  showRawResponse: true,
  showAiSummary: true,
  actionButtons: { reRunAudit: true, sendToPractitioner: true },
  createChatOnLoad: true,
  showScoreComparison: true,
} as const;
