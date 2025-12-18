import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Zap } from 'lucide-react';
import { NoteTypeEnum, PractitionerRoleEnum, AuditModeEnum, AgentModelKeys, AgentModelDisplayNames } from '@/constants/common';
import { SessionMetadata, PractitionerDetails, AuditControls, PreAuditCheckResult } from '@/types/noteSubmission';
import { submitNoteForAudit, estimateTokens, runPreAuditChecks } from './noteSubmissionApiCalls';
import AdvancedOptionsSection from './AdvancedOptionsSection';
import PreAuditChecksSection from './PreAuditChecksSection';
import ImportantGuidelinesSection from './ImportantGuidelinesSection';
import SubmissionFormSelects from './SubmissionFormSelects';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { setAgents, setSelectedAgentId } from '@/store/slices/agentsSlice';
import { fetchAgents } from '../settings/settingsApiCalls';

type AdvancedTab = 'session-metadata' | 'practitioner-details' | 'audit-controls';

const NoteSubmission: React.FC = () => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  const { agents, selectedAgentId } = useAppSelector(state => state.agents);

  // Form state
  const [noteType, setNoteType] = useState<number>(NoteTypeEnum.progress_note);
  const [modelVersion, setModelVersion] = useState<string>(AgentModelKeys.CLAUDE_3_5_HAIKU_V1);
  const [progressNoteContent, setProgressNoteContent] = useState<string>('');
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  // Advanced options state
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>('session-metadata');
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata>({
    sessionLength: '',
    clientInitials: '',
    modelVersion: '',
    promptAgent: '',
  });
  const [practitionerDetails, setPractitionerDetails] = useState<PractitionerDetails>({
    name: '',
    credentials: '',
    role: PractitionerRoleEnum.therapist,
  });
  const [auditControls, setAuditControls] = useState<AuditControls>({
    auditMode: AuditModeEnum.default,
    enableDebugMode: false,
    includeTokenUsageReport: false,
  });

  // UI state
  const [preAuditResults, setPreAuditResults] = useState<PreAuditCheckResult | null>(null);
  const [estimatedTokens, setEstimatedTokens] = useState<number | null>(null);
  const [expectedAuditTime, setExpectedAuditTime] = useState<string>('~2-4 seconds');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Debounced content analysis
  const analyzeContent = useCallback(async (content: string) => {
    if (content.length > 0) {
      const [tokenResult, checkResult] = await Promise.all([estimateTokens(content), runPreAuditChecks(content)]);
      setEstimatedTokens(tokenResult.estimatedTokens);
      setExpectedAuditTime(tokenResult.expectedAuditTime);
      setPreAuditResults(checkResult);
    } else {
      setEstimatedTokens(null);
      setPreAuditResults(null);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      analyzeContent(progressNoteContent);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [progressNoteContent, analyzeContent]);

  const handleClear = () => {
    setProgressNoteContent('');
    setSessionMetadata({
      sessionLength: '',
      clientInitials: '',
      modelVersion: '',
      promptAgent: '',
    });
    setPractitionerDetails({
      name: '',
      credentials: '',
      role: PractitionerRoleEnum.therapist,
    });
    setAuditControls({
      auditMode: AuditModeEnum.default,
      enableDebugMode: false,
      includeTokenUsageReport: false,
    });
    setPreAuditResults(null);
    setEstimatedTokens(null);
  };

  const handleSubmit = async () => {
    if (!progressNoteContent.trim() || !selectedAgentId) return;

    setIsSubmitting(true);
    try {
      const formData = {
        noteType: noteType as (typeof NoteTypeEnum)[keyof typeof NoteTypeEnum],
        modelVersion: modelVersion,
        promptAgent: selectedAgentId,
        sessionMetadata,
        practitionerDetails,
        auditControls,
        progressNoteContent,
      };

      const response = await submitNoteForAudit(formData);

      if (response.success) {
        // Navigate to AI Audit Summary or show success
        // navigate(`/notes-queue/single-note-audit/${response.auditId}`);
      }
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      const agentsData = await fetchAgents();

      if (agentsData) {
        dispatch(setAgents(agentsData));

        // Set default agent automatically
        const defaultAgent = agentsData.find(agent => agent.is_default === 1);
        if (defaultAgent) {
          dispatch(setSelectedAgentId(defaultAgent.id));
        } else if (agentsData.length > 0) {
          // If no default agent, select the first one
          dispatch(setSelectedAgentId(agentsData[0].id));
        }
      }
    })();
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      {/* Main Form Card */}
      <Card>
        <CardContent className="space-y-6 px-8 py-4">
          {/* Header */}
          <div>
            <h1 className="text-primary text-3xl font-semibold">Submit a New Progress Note</h1>
            <p className="mt-2 w-[90%] text-sm text-gray-500">
              Paste a de-identified progress note below to run an AI audit. The note will be scored for quality, compliance, and session
              specificity.
            </p>
          </div>

          {/* Form Selects */}
          <SubmissionFormSelects
            noteType={noteType}
            onNoteTypeChange={setNoteType}
            modelVersion={modelVersion}
            onModelVersionChange={setModelVersion}
            selectedAgentId={selectedAgentId}
            onAgentChange={value => dispatch(setSelectedAgentId(value))}
            agents={agents}
          />

          {/* Advanced Options */}
          <AdvancedOptionsSection
            activeTab={advancedTab}
            setActiveTab={setAdvancedTab}
            sessionMetadata={sessionMetadata}
            setSessionMetadata={setSessionMetadata}
            practitionerDetails={practitionerDetails}
            setPractitionerDetails={setPractitionerDetails}
            auditControls={auditControls}
            setAuditControls={setAuditControls}
            selectedModelLabel={AgentModelDisplayNames[modelVersion as keyof typeof AgentModelDisplayNames]}
            selectedAgentLabel={selectedAgent?.name || ''}
          />

          {/* Progress Note Content */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Progress Note Content</Label>
            <div className="relative">
              <Textarea
                placeholder="Paste the progress note content here..."
                value={progressNoteContent}
                onChange={e => setProgressNoteContent(e.target.value)}
                className="min-h-52 bg-white shadow"
              />
              {progressNoteContent.length > 0 && (
                <span className="absolute right-2 bottom-2 text-xs text-gray-400">{progressNoteContent.length} characters</span>
              )}
            </div>
          </div>

          {/* Token Estimation & Info Bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-xs text-gray-400">
            <span>
              Estimated Tokens: <span className="text-gray-700">{estimatedTokens ?? '—'}</span>
            </span>
            <span>|</span>
            <span>
              Expected Audit Time: <span className="text-gray-700">{expectedAuditTime}</span>
            </span>
            <span className="ml-auto">
              Score Threshold: <span className="text-gray-700">Notes below 75 auto-flag for human review</span>
            </span>
          </div>

          {/* Pre-Audit Checks */}
          <PreAuditChecksSection preAuditResults={preAuditResults} />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Button variant="outline" onClick={handleClear} className="border-primary text-primary h-12 w-28 border-2">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!progressNoteContent.trim() || !selectedAgentId || isSubmitting}
              className="bg-gradient-light text-primary h-12 w-32"
            >
              <Zap className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Run Audit'}
            </Button>
          </div>

          {/* Redirect Notice */}
          <p className="text-center text-xs text-gray-500">After auditing completes, you will be redirected to the AI Audit Summary.</p>
        </CardContent>
      </Card>

      {/* Important Guidelines Section */}
      <ImportantGuidelinesSection />
    </div>
  );
};

export default NoteSubmission;
