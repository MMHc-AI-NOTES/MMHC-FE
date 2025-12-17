import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Zap } from 'lucide-react';
import {
  NoteTypeEnum,
  NoteTypeLabels,
  ModelVersionEnum,
  ModelVersionLabels,
  PromptAgentEnum,
  PromptAgentLabels,
  PractitionerRoleEnum,
  AuditModeEnum,
} from '@/constants/common';
import { SessionMetadata, PractitionerDetails, AuditControls, PreAuditCheckResult } from '@/types/noteSubmission';
import { submitNoteForAudit, estimateTokens, runPreAuditChecks } from './noteSubmissionApiCalls';
import AdvancedOptionsSection from './AdvancedOptionsSection';
import PreAuditChecksSection from './PreAuditChecksSection';
import ImportantGuidelinesSection from './ImportantGuidelinesSection';

type AdvancedTab = 'session-metadata' | 'practitioner-details' | 'audit-controls';

const NoteSubmission: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [noteType, setNoteType] = useState<number>(NoteTypeEnum.progress_note);
  const [modelVersion, setModelVersion] = useState<number>(ModelVersionEnum.claude_3_5_haiku_v1);
  const [promptAgent, setPromptAgent] = useState<number>(PromptAgentEnum.clinical_documentation_auditor);
  const [progressNoteContent, setProgressNoteContent] = useState<string>('');

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
  const [preAuditExpanded, setPreAuditExpanded] = useState<boolean>(false);
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
    if (!progressNoteContent.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = {
        noteType: noteType as (typeof NoteTypeEnum)[keyof typeof NoteTypeEnum],
        modelVersion: modelVersion as (typeof ModelVersionEnum)[keyof typeof ModelVersionEnum],
        promptAgent: promptAgent as (typeof PromptAgentEnum)[keyof typeof PromptAgentEnum],
        sessionMetadata,
        practitionerDetails,
        auditControls,
        progressNoteContent,
      };

      const response = await submitNoteForAudit(formData);

      if (response.success) {
        // Navigate to AI Audit Summary or show success
        navigate(`/notes-queue/single-note-audit/${response.auditId}`);
      }
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNoteTypeDisabled = (type: number) => {
    return type !== NoteTypeEnum.progress_note;
  };

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

          {/* Note Type Select */}
          <div>
            <Label className="text-sm text-gray-700">Note Type</Label>
            <Select value={String(noteType)} onValueChange={value => setNoteType(Number(value))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NoteTypeEnum).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={String(value)}
                    disabled={isNoteTypeDisabled(value)}
                    className={isNoteTypeDisabled(value) ? 'text-gray-400' : ''}
                  >
                    {NoteTypeLabels[value]}
                    {isNoteTypeDisabled(value) && ' (Coming Soon)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Version Select */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Model Version</Label>
            <Select value={String(modelVersion)} onValueChange={value => setModelVersion(Number(value))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select model version" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ModelVersionEnum).map(([key, value]) => (
                  <SelectItem key={key} value={String(value)}>
                    {ModelVersionLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Agent Select */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Prompt Agent</Label>
            <Select value={String(promptAgent)} onValueChange={value => setPromptAgent(Number(value))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select prompt agent" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PromptAgentEnum).map(([key, value]) => (
                  <SelectItem key={key} value={String(value)}>
                    {PromptAgentLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            selectedModelLabel={ModelVersionLabels[modelVersion]}
            selectedAgentLabel={PromptAgentLabels[promptAgent]}
          />

          {/* Progress Note Content */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">Progress Note Content</Label>
            <div className="relative">
              <Textarea
                placeholder="Paste the progress note content here..."
                value={progressNoteContent}
                onChange={e => setProgressNoteContent(e.target.value)}
                className="min-h-[200px] resize-none bg-gray-50"
              />
              {progressNoteContent.length > 0 && (
                <span className="absolute right-2 bottom-2 text-xs text-gray-400">{progressNoteContent.length} characters</span>
              )}
            </div>
          </div>

          {/* Token Estimation & Info Bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <span>
              Estimated Tokens: <strong>{estimatedTokens ?? '—'}</strong>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Expected Audit Time: <strong>{expectedAuditTime}</strong>
            </span>
            <span className="ml-auto text-gray-500">
              Score Threshold: <span className="text-amber-600">Notes below 75 auto-flag for human review</span>
            </span>
          </div>

          {/* Pre-Audit Checks */}
          <PreAuditChecksSection isExpanded={preAuditExpanded} setIsExpanded={setPreAuditExpanded} preAuditResults={preAuditResults} />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" onClick={handleClear} className="min-w-[120px]">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!progressNoteContent.trim() || isSubmitting}
              className="min-w-[140px] bg-green-500 text-white hover:bg-green-600"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Run Audit'}
            </Button>
          </div>

          {/* Redirect Notice */}
          <p className="text-center text-xs text-gray-400">After auditing completes, you will be redirected to the AI Audit Summary.</p>
        </CardContent>
      </Card>

      {/* Important Guidelines Section */}
      <ImportantGuidelinesSection />
    </div>
  );
};

export default NoteSubmission;
