import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Zap } from 'lucide-react';
import { NoteTypeEnum, PractitionerRoleEnum, AuditModeEnum, AgentModelKeys } from '@/constants/common';
import { SessionMetadata, PractitionerDetails, AuditControls } from '@/types/noteSubmission';
import { submitNoteForAudit, invokeSessionReview } from './noteSubmissionApiCalls';
// import SubmissionFormSelects from './SubmissionFormSelects';
import { useAppSelector } from '@/store/store';
import { useDispatch } from 'react-redux';
import { setAgents, setSelectedAgentId } from '@/store/slices/agentsSlice';
import { fetchAgents } from '../settings/settingsApiCalls';
import { fetchErrorTypes } from '../settings/settingsApiCalls';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchClients, Client } from '../clients/clientsApiCalls';
import { fetchNoteDetail } from '../singleNoteAudit/singleNoteApiCalls';
import { formatJsonToText } from '@/utils/helper';
import { Badge } from '@/components/ui/badge';
import { calculateSMEScore } from '../singleNoteAudit/components/reviewUtils';
import { IssueForm } from '../singleNoteAudit/components/types';
import { setErrorTypes } from '@/store/slices/smeConfigSlice';

type SessionReviewResult = {
  output_text?: string;
  raw_response?: string;
  score?: number;
  pass?: boolean;
  issues?: SessionIssue[];
  scorer_version?: string;
  validation_result?: {
    isValid: boolean;
    status?: string;
    message?: string;
  };
};

type SessionIssue = {
  severity?: string;
  points_deducted?: number | string | null;
  section?: string | null;
  severity_details?: string;
  description?: string;
  justification?: string;
};

type SessionReport = {
  pass?: boolean;
  issues?: SessionIssue[];
  scorer_version?: string;
};

const NoteSubmission: React.FC = () => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  const { agents, selectedAgentId } = useAppSelector(state => state.agents);
  const { errorTypes, errorTypesLoaded } = useAppSelector(state => state.smeConfig);

  // Client autofill state
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true);
  const [isFetchingClientData, setIsFetchingClientData] = useState<boolean>(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  // Form state
  const [modelVersion] = useState<string>(AgentModelKeys.CLAUDE_3_5_HAIKU_V1);
  const [progressNoteContent, setProgressNoteContent] = useState<string>('');
  const [progressNoteId, setProgressNoteId] = useState<string>('');
  const [previousSessionContent, setPreviousSessionContent] = useState<string>('');
  const [previousSessionId, setPreviousSessionId] = useState<string>('');
  const [rawResponseText, setRawResponseText] = useState<string>('');
  const [sessionReport, setSessionReport] = useState<SessionReport | string | null>(null);
  const [noteId, setNoteId] = useState<string>('');
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  // Advanced options state
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const tryParseSessionJson = (input?: string): SessionReport | null => {
    if (!input || typeof input !== 'string') return null;

    const trimmed = input.trim();
    if (!trimmed) return null;

    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const textToParse = codeBlockMatch?.[1]?.trim() || trimmed;

    const candidates = [textToParse];
    const firstBrace = textToParse.indexOf('{');
    const lastBrace = textToParse.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      candidates.push(textToParse.substring(firstBrace, lastBrace + 1));
    }

    for (const candidate of candidates) {
      try {
        return JSON.parse(candidate) as SessionReport;
      } catch {
        // Keep trying other candidates.
      }
    }

    return null;
  };

  const handleClear = () => {
    setProgressNoteContent('');
    setProgressNoteId('');
    setPreviousSessionContent('');
    setPreviousSessionId('');
    setRawResponseText('');
    setSessionReport(null);
    setNoteId('');
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
    setSelectedClientId('');
  };

  const handleClientSelect = async (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.clientId === clientId);
    if (!client || !client.sessions || client.sessions.length === 0) return;

    try {
      setIsFetchingClientData(true);
      const latestSession = client.sessions[0];
      const noteDetail = await fetchNoteDetail(latestSession.noteId);

      if (noteDetail) {
        setNoteId(latestSession.noteId);
        setProgressNoteContent(formatJsonToText(noteDetail.session));
        setProgressNoteId(noteDetail.noteId);
        if (noteDetail.previous_note && noteDetail.previous_note.session) {
          setPreviousSessionContent(formatJsonToText(noteDetail.previous_note.session));
          setPreviousSessionId(noteDetail.previous_note.noteId);
        } else if (client.sessions.length > 1) {
          const prevNoteDetail = await fetchNoteDetail(client.sessions[1].noteId);
          setPreviousSessionContent(formatJsonToText(prevNoteDetail.session));
        } else {
          setPreviousSessionContent('');
        }
      }
    } catch (e) {
      console.error('Failed to fetch client notes:', e);
    } finally {
      setIsFetchingClientData(false);
    }
  };

  const handleSubmit = async () => {
    if (!progressNoteContent.trim() || !selectedAgentId) return;

    setIsSubmitting(true);
    setSessionReport(null);
    setRawResponseText('');
    try {
      const payload = {
        note_id: noteId,
        prompt_id: selectedAgent?.id || 0,
        model_id: modelVersion,
      };

      const data = (await invokeSessionReview(payload)) as SessionReviewResult | null;

      if (data) {
        setRawResponseText(data.raw_response || '');
        const parsedFromOutput = tryParseSessionJson(data.output_text);
        const parsedFromRawResponse = tryParseSessionJson(data.raw_response);
        const parsedObj = parsedFromOutput || parsedFromRawResponse;

        if (parsedObj && typeof parsedObj === 'object') {
          const parsedIssues = data.issues;
          parsedObj.issues = parsedIssues || parsedObj.issues || [];
          parsedObj.scorer_version = data.scorer_version || parsedObj.scorer_version;
          setSessionReport(parsedObj);
        } else {
          setSessionReport({
            pass: data.pass,
            issues: data.issues || [],
            scorer_version: data.scorer_version,
          });
        }
      }

      // Keep existing flow for audit submission if needed later
      const formData = {
        noteType: NoteTypeEnum.progress_note as (typeof NoteTypeEnum)[keyof typeof NoteTypeEnum],
        modelVersion: modelVersion,
        promptAgent: selectedAgentId,
        sessionMetadata,
        practitionerDetails,
        auditControls,
        progressNoteContent,
      };

      await submitNoteForAudit(formData);
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

  const sessionReportObject = typeof sessionReport === 'object' && sessionReport ? sessionReport : null;

  const mappedSessionIssues: IssueForm[] = Array.isArray(sessionReportObject?.issues)
    ? sessionReportObject.issues.map((issue: SessionIssue, index: number) => ({
        id: `ai-issue-${index}`,
        reviewerName: 'AI Audit',
        errorType: String(issue?.severity || '').toLowerCase(),
        issueRelatedTo: String(issue?.section || 'overall'),
        issueDescription: String(issue?.justification || issue?.description || ''),
      }))
    : [];
  const calculatedScoreByUs = sessionReportObject ? calculateSMEScore(mappedSessionIssues, errorTypes || []) : '-';

  const getIssueDeductionPoints = (issue: SessionIssue): number => {
    const rawBackendPoints = Number(issue?.points_deducted);
    if (Number.isFinite(rawBackendPoints) && rawBackendPoints !== 0) {
      return Math.abs(rawBackendPoints);
    }

    const severityKey = String(issue?.severity || '').toLowerCase();
    const manualPoints = errorTypes?.find(type => type.name === severityKey)?.points || 0;
    return Math.abs(manualPoints);
  };

  useEffect(() => {
    const loadErrorTypes = async () => {
      if (errorTypesLoaded) return;
      try {
        const errorTypesData = await fetchErrorTypes();
        dispatch(setErrorTypes(errorTypesData));
      } catch (error) {
        console.error('Error loading error types:', error);
      }
    };

    void loadErrorTypes();
  }, [dispatch, errorTypesLoaded]);

  // Fetch clients for the dropdown
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingClients(true);
        const { data } = await fetchClients({ page: 1, pageSize: 10000, filters: [] });
        const filteredClients = data.filter(c => c.notesCount > 0);
        setClients(filteredClients);
      } catch (err) {
        console.error('Error fetching clients for dropdown:', err);
      } finally {
        setIsLoadingClients(false);
      }
    })();
  }, []);

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

          {/* Client Select for Autofill */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">
              Select Client (Autofill Notes) {isLoadingClients && <span className="ml-2 text-xs text-blue-500">Loading clients...</span>}
              {isFetchingClientData && <span className="ml-2 text-xs text-blue-500">Loading notes...</span>}
            </Label>
            <Popover open={clientDropdownOpen} onOpenChange={setClientDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientDropdownOpen}
                  className="w-full justify-between bg-white font-normal"
                >
                  <span className="truncate">
                    {selectedClientId
                      ? `${selectedClientId} (${clients.find(c => c.clientId === selectedClientId)?.notesCount} notes)`
                      : isLoadingClients
                        ? 'Loading clients...'
                        : 'Select a client to autofill previous and current sessions'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command
                  className="w-full"
                  filter={(value, search) => {
                    return value.toLowerCase().startsWith(search.toLowerCase()) ? 1 : 0;
                  }}
                >
                  <CommandInput placeholder={isLoadingClients ? 'Loading clients...' : 'Search client...'} disabled={isLoadingClients} />
                  <CommandList>
                    <CommandEmpty>{isLoadingClients ? 'Loading clients...' : 'No client found.'}</CommandEmpty>
                    {!isLoadingClients && (
                      <CommandGroup>
                        {clients.map(client => (
                          <CommandItem
                            key={client.id}
                            value={client.clientId}
                            onSelect={() => {
                              handleClientSelect(client.clientId);
                              setClientDropdownOpen(false);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', selectedClientId === client.clientId ? 'opacity-100' : 'opacity-0')} />
                            {client.clientId} ({client.notesCount} notes)
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Form Selects */}
          {/* <SubmissionFormSelects
            modelVersion={modelVersion}
            onModelVersionChange={setModelVersion}
            selectedAgentId={selectedAgentId}
            onAgentChange={value => dispatch(setSelectedAgentId(value))}
            agents={agents}
          /> */}

          {/* Current Session */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Current Session {progressNoteId ? `(${progressNoteId})` : ''}</Label>
            <div className="relative">
              <Textarea
                placeholder="Paste the current session content here..."
                value={progressNoteContent}
                onChange={e => setProgressNoteContent(e.target.value)}
                className="h-52 resize-none overflow-y-auto bg-white shadow"
              />
              {progressNoteContent.length > 0 && (
                <span className="absolute right-2 bottom-2 text-xs text-gray-400">{progressNoteContent.length} characters</span>
              )}
            </div>
          </div>

          {/* Previous Session */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Previous Session {previousSessionId ? `(${previousSessionId})` : ''}</Label>
            <div className="relative">
              <Textarea
                placeholder="Paste the previous session content here..."
                value={previousSessionContent}
                onChange={e => setPreviousSessionContent(e.target.value)}
                className="h-52 resize-none overflow-y-auto bg-white shadow"
              />
              {previousSessionContent.length > 0 && (
                <span className="absolute right-2 bottom-2 text-xs text-gray-400">{previousSessionContent.length} characters</span>
              )}
            </div>
          </div>

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

          {/* Session Report */}
          <div className="space-y-1">
            <Label className="text-sm text-gray-700">Session Report</Label>
            {!sessionReport ? (
              <Textarea
                placeholder="Session report will appear here..."
                value=""
                readOnly
                className="h-40 resize-none overflow-y-auto bg-gray-50 shadow"
              />
            ) : typeof sessionReport === 'object' ? (
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">Reviewer:</span>
                  <span className="text-primary ml-1 font-semibold">AI Audit</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-700">Calculated Score:</span>{' '}
                    <span className="font-bold text-gray-900">{calculatedScoreByUs}</span>
                  </div>
                  {sessionReportObject?.scorer_version && (
                    <div className="text-gray-700">
                      <span className="font-medium">Scorer Version:</span>{' '}
                      <span className="font-semibold text-gray-700">{sessionReportObject.scorer_version}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Issues:</h3>
                  {sessionReport?.issues?.length ? (
                    sessionReport.issues.map((issue: SessionIssue, index: number) => {
                      const severityUpper = (issue.severity || '').toUpperCase();
                      const deductionPoints = getIssueDeductionPoints(issue);
                      const badgeClass =
                        severityUpper === 'CRITICAL'
                          ? 'bg-gradient-red'
                          : severityUpper === 'MODERATE'
                            ? 'bg-gradient-severity-moderate'
                            : 'bg-gradient-severity-minor';

                      return (
                        <div key={index} className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex items-center">
                            <Badge className={`px-3 py-1 text-xs font-semibold text-white uppercase ${badgeClass}`}>
                              {severityUpper} ({deductionPoints === 0 ? '0' : `-${deductionPoints}`} PTS)
                            </Badge>
                          </div>
                          <div>
                            <p className="mt-1 text-sm font-bold text-red-600">
                              {deductionPoints === 0 ? '0 points' : `-${deductionPoints} points`}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-gray-600">
                              <span className="font-medium">Related to:</span> {issue.section || 'Overall'}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-gray-600">
                              <span className="font-medium">Description:</span> {issue.description || '-'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border bg-gray-50 p-4 text-center text-sm text-gray-500">
                      {sessionReport.pass === true ? 'No issues found. Perfect score!' : 'No parsed issues returned from AI response.'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Textarea value={sessionReport as string} readOnly className="min-h-40 overflow-y-auto bg-gray-50 shadow" />
            )}
          </div>
          {/* Raw Response */}
          <div className="height-[220px] space-y-1">
            <Label className="text-sm text-gray-700">Raw Response</Label>
            <Textarea value={rawResponseText} readOnly className="h-40 resize-none overflow-y-auto bg-gray-50 shadow" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteSubmission;
