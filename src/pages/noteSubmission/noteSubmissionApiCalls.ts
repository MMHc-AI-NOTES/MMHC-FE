import axios from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import {
  NoteSubmissionFormData,
  NoteSubmissionResponse,
  PreAuditCheckResult,
  TokenEstimation,
  SessionReviewPayload,
  SessionReviewData,
} from '@/types/noteSubmission';
import { PreAuditCheckStatusEnum, StructureQualityEnum } from '@/constants/common';

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export const invokeSessionReview = async (payload: SessionReviewPayload): Promise<SessionReviewData | null> => {
  try {
    const response = await axios.post<ApiResponse<SessionReviewData>>('/mcp/session-reviews/invoke', payload);
    const responsePayload = response?.data?.status ? response.data.data : response.data;

    if (!responsePayload || typeof responsePayload !== 'object') {
      handleErrorMessages(response.data);
      return null;
    }

    // Check for new MCP response format
    const targetObj = responsePayload as any;
    const mcpResponse =
      targetObj.mcp_response ||
      (targetObj.data && typeof targetObj.data === 'object' && targetObj.data.mcp_response) ||
      (response as any).mcp_response ||
      ((response as any).data && typeof (response as any).data === 'object' && (response as any).data.mcp_response);

    if (mcpResponse && typeof mcpResponse === 'object') {
      const issues = Array.isArray(mcpResponse.ai_issues)
        ? mcpResponse.ai_issues.map((issue: any) => ({
            severity: issue.error_type || 'minor',
            section: issue.section || 'Overall',
            description: issue.description || '',
            justification: issue.justification || '',
            severity_details: issue.justification || issue.description || '',
            points_deducted: issue.points_deducted ?? null,
          }))
        : [];

      return {
        score: mcpResponse.score,
        pass: mcpResponse.verdict === 'PASS',
        issues,
        raw_response: JSON.stringify(responsePayload, null, 2),
        output_text: JSON.stringify({
          pass: mcpResponse.verdict === 'PASS',
          score: mcpResponse.score,
          issues,
        }),
      };
    }

    // New backend shape: { ..., bedrockResponse: { ... , validation_result? } }
    if ('bedrockResponse' in responsePayload && responsePayload.bedrockResponse && typeof responsePayload.bedrockResponse === 'object') {
      const bedrockResponse = responsePayload.bedrockResponse as SessionReviewData;
      return {
        ...bedrockResponse,
        output_text: bedrockResponse.output_text ?? bedrockResponse.raw_response,
        validation_result:
          bedrockResponse.validation_result ??
          (responsePayload as { validation_result?: SessionReviewData['validation_result'] }).validation_result ??
          undefined,
      };
    }

    // Legacy shape returned directly
    if ('output_text' in responsePayload || 'issues' in responsePayload) {
      return responsePayload as SessionReviewData;
    }

    handleErrorMessages(responsePayload);
    return null;
  } catch (error) {
    handleCatchMessages(error);
    return null;
  }
};

// Dummy API call to submit note for audit
export const submitNoteForAudit = async (formData: NoteSubmissionFormData): Promise<NoteSubmissionResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate successful response
  return {
    success: true,
    auditId: `AUDIT-${Date.now()}`,
    message: 'Note submitted successfully for audit.',
    estimatedTokens: Math.floor(formData.progressNoteContent.length / 4),
    expectedAuditTime: '2-4 seconds',
  };
};

// Dummy API call to estimate tokens
export const estimateTokens = async (content: string): Promise<TokenEstimation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const estimatedTokens = Math.floor(content.length / 4);

  return {
    estimatedTokens,
    expectedAuditTime: estimatedTokens > 500 ? '4-6 seconds' : '2-4 seconds',
  };
};

// Dummy API call to run pre-audit checks
export const runPreAuditChecks = async (content: string): Promise<PreAuditCheckResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // PHI patterns to check
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{3}\s\d{2}\s\d{4}\b/, // SSN with spaces
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{10}\b/, // Phone number
    /\b\(\d{3}\)\s?\d{3}-\d{4}\b/, // Phone with formatting
  ];

  const hasPHI = phiPatterns.some(pattern => pattern.test(content));

  // Key sections to look for in progress notes
  const keySections = [
    'subjective',
    'objective',
    'assessment',
    'plan',
    'treatment',
    'diagnosis',
    'intervention',
    'goals',
    'progress',
    'symptoms',
  ];

  const contentLower = content.toLowerCase();
  const foundSections = keySections.filter(section => contentLower.includes(section));

  // Determine structure quality
  let structureQuality: (typeof StructureQualityEnum)[keyof typeof StructureQualityEnum];
  if (foundSections.length >= 5) {
    structureQuality = StructureQualityEnum.strong;
  } else if (foundSections.length >= 3) {
    structureQuality = StructureQualityEnum.moderate;
  } else {
    structureQuality = StructureQualityEnum.weak;
  }

  const checks = [
    {
      id: 'phi',
      name: hasPHI ? 'PHI Detected' : 'No PHI Detected',
      status: hasPHI ? PreAuditCheckStatusEnum.failed : PreAuditCheckStatusEnum.passed,
      description: hasPHI ? 'Potential PHI detected. Please remove before submission.' : undefined,
    },
    {
      id: 'length',
      name: content.length > 50 ? 'Length Check Passed' : 'Length Check Warning',
      status: content.length > 50 ? PreAuditCheckStatusEnum.passed : PreAuditCheckStatusEnum.warning,
      description: content.length > 50 ? `Length adequate (${content.length} characters)` : 'No content to analyze',
    },
    {
      id: 'structure',
      name: foundSections.length >= 3 ? 'Structure Check Passed' : 'Structure Needs Improvement',
      status: foundSections.length >= 3 ? PreAuditCheckStatusEnum.passed : PreAuditCheckStatusEnum.warning,
      description:
        foundSections.length >= 3
          ? `Found ${foundSections.length} key sections`
          : `Weak structure: Only ${foundSections.length} key sections found (need 3+)`,
    },
  ];

  return {
    overallStatus: structureQuality,
    checks,
  };
};
