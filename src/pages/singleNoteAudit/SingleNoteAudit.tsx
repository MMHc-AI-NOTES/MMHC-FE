import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  //  MessageCircleMore, Sparkles, UserRoundCog, UserRoundPen
} from 'lucide-react';

// Components
import NoteInformation from './NoteInformation';
// import NoteSections from './NoteSections';
import AuditScoreCard from './AuditScoreCard';
import IssuesIdentifiedCard from './IssuesIdentifiedCard';
import SMEReview from './SMEReview';
import ActionButtons from './ActionButtons';
// import HumanReviewSection from './HumanReviewSection';
import LoadingSkeleton from './LoadingSkeleton';
import AuditHistoryCard from './AuditHistoryCard';

// Services and Types
import { NoteDetail, ApiNoteDetail, Chat, SMEIssue } from '@/types/notes';
import { useAppSelector } from '@/store/store';
import { getNoteDetailWithChat } from './singleNoteApiCalls';
import { fetchAgents } from '../settings/settingsApiCalls';
import { setAgents, setSelectedAgentId } from '@/store/slices/agentsSlice';
// import SummaryCard from './SummaryCard';
import TherapySessionSummaryCard from './TherapySessionSummaryCard';
import PreviousSessionCard from './PreviousSessionCard';
// import ModelInformation from './ModelInformation';
// import { mapCategoryToSectionId } from '@/utils/helper';
import { SessionTypeLabels } from '@/constants/common';
import { fetchPractitioners, fetchCptCodes } from '../notesQueue/notesApiCalls';
import { setPractitioners, setCptCodes } from '@/store/slices/filterOptionsSlice';
import { fetchErrorTypes, fetchIssueRelatedTo, fetchIssueDescriptions } from '../settings/settingsApiCalls';
import { setErrorTypes, setIssueRelatedTo, setIssueDescriptions } from '@/store/slices/smeConfigSlice';
import type { Review, IssueForm } from './components/types';
import { formatDate, formatDateTime } from '@/utils/helper';

// Utility function to format API response to component expected format
const formatNoteDetail = (apiData: ApiNoteDetail, chatId: number): NoteDetail => {
  const formattedDate = formatDate(apiData.sessionTime);

  // Use actual data from the API response if available
  const latestChat = apiData.chats?.[0];
  const extractedHumanReviewChat = apiData.chats?.find(chat => chat.id === chatId);
  const bedrockResponse = latestChat?.bedrockResponse;
  const formattedDateTime = latestChat?.createdAt ? formatDateTime(latestChat.createdAt) : '';

  // Convert API issues to the expected format
  const issues = bedrockResponse?.issues?.map((issue: any) => ({
    severity: (issue.severity?.toUpperCase() as 'CRITICAL' | 'MODERATE' | 'MINOR') || 'MINOR',
    category: issue.section || 'General',
    points: issue.points_deducted || 0,
    description: issue.severity_details || 'No description provided',
    justification: issue.justification || 'No justification provided',
    sectionId: issue.section_id || '',
  })) || [
    // Fallback to default issues if no chat data
    {
      severity: 'CRITICAL' as const,
      category: 'Assessment & Therapeutic Intervention',
      points: 25,
      description:
        'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
      sectionId: 'zad8-1',
    },
    {
      severity: 'MODERATE' as const,
      category: 'Plan & Collaboration',
      points: 10,
      description:
        'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
      sectionId: 'hwh-1',
    },
  ];

  return {
    id: apiData.noteId,
    date: formattedDate,
    practitioner: apiData.practitioner.fullName,
    cptCode: apiData.cptCodeId,
    clientId: apiData.patient?.clientId || '-',
    noteType: SessionTypeLabels[apiData.type.id],
    aiReviews: apiData.chat_count || 0,
    auditScore: bedrockResponse?.score || 0,
    lastRun: formattedDateTime,
    humanReview: extractedHumanReviewChat?.humanReviews || null,
    aiSummary: bedrockResponse?.summary,
    therapySummary: apiData.session,
    bedrockResponse: bedrockResponse,
    issues: issues,
    prompt: latestChat?.prompt || '',
    reviewCycle: apiData.reviewCycle,
    promptData: latestChat?.userInput || '',
    rawResponse: bedrockResponse?.raw_response || '',
    aiStatus: apiData.aiStatus,
    priority: apiData.priority,
    modelDetail: { modelVersion: latestChat.modelId, auditRunId: latestChat.id, lastRun: formattedDateTime },
    webhookVersions: apiData.webhookVersions || [],
    previousNote: apiData.previous_note,
    noteReviewMarks: (() => {
      const arr = (apiData as any).noteReviewMarks ?? (apiData as any).note_review_marks;
      if (!Array.isArray(arr)) return undefined;
      return arr.reduce(
        (acc: Record<string, boolean>, row: { reviewerId: number; markedAsReviewed?: number }) => {
          acc[String(row.reviewerId)] = row.markedAsReviewed === 1;
          return acc;
        },
        {} as Record<string, boolean>,
      );
    })(),
    noteReviewMarksRaw: (() => {
      const arr = (apiData as any).noteReviewMarks ?? (apiData as any).note_review_marks;
      return Array.isArray(arr) ? (arr as any) : undefined;
    })(),
  };
};

const SingleNoteAudit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { id: noteId } = useParams<{ id: string }>();
  const { selectedAgentId, agents } = useAppSelector(state => state.agents);
  const { practitionersLoaded, cptCodesLoaded } = useAppSelector(state => state.filterOptions);
  const { errorTypesLoaded, issueRelatedToLoaded, issueDescriptionsLoaded, errorTypes, issueRelatedTo } = useAppSelector(
    state => state.smeConfig,
  );
  const user = useAppSelector(state => state.auth.user);
  // const [openSectionId, setOpenSectionId] = useState<string | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Create a ref to store the latest selectedAgentId
  const selectedAgentIdRef = useRef(selectedAgentId);
  const initialAgentIdRef = useRef(selectedAgentId); // Track initial agent ID
  const onReviewerIssuesChangedRef = useRef<((reviewerId: number) => void) | null>(null);

  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [auditHistory, setAuditHistory] = useState<Chat[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [practitionerId, setPractitionerId] = useState<number | null>(null);

  const chatId = location.state?.chatId;
  const reviewerId = location.state?.reviewerId || null;
  const isManagerReviewing = location.state?.isManagerReviewing || false;
  const [agentsLoaded, setAgentsLoaded] = useState(false);

  // Update the ref whenever selectedAgentId changes
  useEffect(() => {
    selectedAgentIdRef.current = selectedAgentId;
  }, [selectedAgentId]);

  const loadNoteDetail = useCallback(
    async (isRerun: boolean = false) => {
      if (!noteId || !selectedAgentIdRef.current) {
        console.log('Missing noteId or selectedAgentId');
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const apiNoteDetail = await getNoteDetailWithChat(noteId, selectedAgentIdRef.current, isRerun);
        const formattedNoteDetail = formatNoteDetail(apiNoteDetail, chatId);

        setNoteDetail(formattedNoteDetail);
        setPractitionerId(apiNoteDetail.practitionerId);
        // Store all chats for audit history
        setAuditHistory(apiNoteDetail.chats || []);
      } finally {
        setLoading(false);
      }
    },
    [chatId, noteId],
  );

  // Load agents and set default agent - runs on every mount
  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      const agentsData = await fetchAgents();

      if (isMounted && agentsData) {
        dispatch(setAgents(agentsData));

        // Set default agent automatically
        const defaultAgent = agentsData.find(agent => agent.is_default === 1);
        if (defaultAgent) {
          dispatch(setSelectedAgentId(defaultAgent.id));
          initialAgentIdRef.current = defaultAgent.id; // Store initial agent ID
        } else if (agentsData.length > 0) {
          // If no default agent, select the first one
          dispatch(setSelectedAgentId(agentsData[0].id));
          initialAgentIdRef.current = agentsData[0].id; // Store initial agent ID
        }

        setAgentsLoaded(true);
      }

      if (isMounted) {
        setLoading(false);
      }
    })();

    // Cleanup function
    return () => {
      isMounted = false;
      setAgentsLoaded(false);
    };
  }, [dispatch, noteId]);

  // Load note detail only on initial load, not when agent changes
  useEffect(() => {
    if (agentsLoaded && selectedAgentId && noteId && !noteDetail) {
      loadNoteDetail(false);
    }
  }, [agentsLoaded, selectedAgentId, noteId, noteDetail, loadNoteDetail]);

  useEffect(() => {
    const loadPractitioners = async () => {
      if (practitionersLoaded) return; // Skip if already loaded
      try {
        const practitionersData = await fetchPractitioners();
        dispatch(setPractitioners(practitionersData));
      } catch (error) {
        console.error('Error loading practitioners:', error);
      }
    };

    const loadCptCodes = async () => {
      if (cptCodesLoaded) return; // Skip if already loaded
      try {
        const cptCodesData = await fetchCptCodes();
        dispatch(setCptCodes(cptCodesData));
      } catch (error) {
        console.error('Error loading CPT codes:', error);
      }
    };

    loadPractitioners();
    loadCptCodes();
  }, [practitionersLoaded, cptCodesLoaded, dispatch]);

  // Load SME config data if needed
  useEffect(() => {
    const loadSMEData = async () => {
      const promises: Promise<any>[] = [];

      if (!errorTypesLoaded) {
        promises.push(
          fetchErrorTypes().then(data => {
            dispatch(setErrorTypes(data));
          }),
        );
      }

      if (!issueRelatedToLoaded) {
        promises.push(
          fetchIssueRelatedTo().then(data => {
            dispatch(setIssueRelatedTo(data));
          }),
        );
      }

      if (!issueDescriptionsLoaded) {
        promises.push(
          fetchIssueDescriptions().then(data => {
            dispatch(setIssueDescriptions(data));
          }),
        );
      }

      await Promise.all(promises);
    };
    loadSMEData();
  }, [dispatch, errorTypesLoaded, issueRelatedToLoaded, issueDescriptionsLoaded]);

  // Cleanup ref on unmount
  useEffect(() => {
    return () => {
      selectedAgentIdRef.current = null;
      initialAgentIdRef.current = null;
      setNoteDetail(null);
    };
  }, []);

  const loggedInUserId = user?.id ?? null;

  const handleSMEIssueCreatedFromTemplate = useCallback(
    (response: { id: number }, issueForm: IssueForm, versionId: number, descriptionId?: number, createdForReviewerId?: number) => {
      if (!loggedInUserId) return;
      const reviewerIdForIssue = createdForReviewerId ?? loggedInUserId;
      // Optimistically update noteDetail.webhookVersions.smeIssues (include issueDescription so dropdown disables immediately)
      setNoteDetail(prev => {
        if (!prev) return prev;

        const errorTypeOption = errorTypes.find(type => type.name === issueForm.errorType || type.displayName === issueForm.errorType);
        const issueRelatedToOption = issueRelatedTo.find(
          opt => opt.fieldId === issueForm.issueRelatedTo || opt.displayName === issueForm.issueRelatedTo,
        );

        const newSmeIssue: SMEIssue = {
          id: response.id,
          reviewerId: reviewerIdForIssue,
          versionId,
          errorType: {
            id: errorTypeOption?.id ?? 0,
            name: errorTypeOption?.name,
            displayName: errorTypeOption?.displayName,
            points: errorTypeOption?.points ?? 0,
          },
          issuesRelatedTo: {
            id: issueRelatedToOption?.id ?? 0,
            name: issueRelatedToOption?.displayName,
            displayName: issueRelatedToOption?.displayName,
          },
          description: issueForm.issueDescription,
          comment: issueForm.comment,
          issueDescription: descriptionId != null ? { id: descriptionId, description: issueForm.issueDescription ?? '' } : undefined,
          noteId: prev.id,
          status: {
            id: 1,
            name: 'Open',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedWebhookVersions = (prev.webhookVersions || []).map(version => {
          if (version.id !== versionId) return version;
          return {
            ...version,
            smeIssues: [...(version.smeIssues || []), newSmeIssue],
          };
        });

        return {
          ...prev,
          webhookVersions: updatedWebhookVersions,
        };
      });
    },
    [errorTypes, issueRelatedTo, loggedInUserId],
  );

  // Keep noteDetail.webhookVersions in sync when an SME issue or review is deleted
  const onSMEIssueDeleted = useCallback((versionId: number, smeIssueId: number) => {
    setNoteDetail(prev => {
      if (!prev?.webhookVersions?.length) return prev;
      return {
        ...prev,
        webhookVersions: prev.webhookVersions.map(v =>
          v.id === versionId ? { ...v, smeIssues: (v.smeIssues || []).filter(i => i.id !== smeIssueId) } : v,
        ),
      };
    });
  }, []);

  const onSMEReviewDeleted = useCallback((versionId: number | null, reviewerId: number) => {
    setNoteDetail(prev => {
      if (!prev?.webhookVersions?.length) return prev;
      return {
        ...prev,
        webhookVersions: prev.webhookVersions.map(v =>
          versionId === null || v.id === versionId ? { ...v, smeIssues: (v.smeIssues || []).filter(i => i.reviewerId !== reviewerId) } : v,
        ),
      };
    });
  }, []);

  // Sync noteDetail when an SME issue is updated (e.g. description changed) so Therapy Session Summary dropdown disables immediately
  const onSMEIssueUpdated = useCallback(
    (versionId: number, smeIssueId: number, payload: { issueDescriptionId?: number; issueDescriptionText?: string }) => {
      const { issueDescriptionId, issueDescriptionText } = payload;
      setNoteDetail(prev => {
        if (!prev?.webhookVersions?.length) return prev;
        return {
          ...prev,
          webhookVersions: prev.webhookVersions.map(v => {
            if (v.id !== versionId) return v;
            return {
              ...v,
              smeIssues: (v.smeIssues || []).map(issue =>
                issue.id === smeIssueId
                  ? {
                      ...issue,
                      description: issueDescriptionText ?? issue.description,
                      issueDescription:
                        issueDescriptionId != null
                          ? { id: issueDescriptionId, description: issueDescriptionText ?? issue.issueDescription?.description ?? '' }
                          : issue.issueDescription,
                    }
                  : issue,
              ),
            };
          }),
        };
      });
    },
    [],
  );

  if (loading) {
    return (
      <div>
        <LoadingSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div></div>
          {!isManagerReviewing && <ActionButtons onReRunAudit={loadNoteDetail} isReRun={loading} />}
        </div>
      </div>
    );
  }

  if (agentsLoaded && (!selectedAgentId || agents.length === 0)) {
    return (
      <div>
        <Button onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-base">No agent configured. Create an agent first, then come back to create chat.</p>
          <Button asChild>
            <Link to="/settings">Go to Settings to create an agent</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    noteDetail && (
      <div>
        <Button onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <NoteInformation noteDetail={noteDetail} />
            <TherapySessionSummaryCard
              webhookVersions={noteDetail.webhookVersions}
              onVersionChange={setSelectedVersionId}
              noteId={noteId}
              versionId={selectedVersionId}
              reviewerId={reviewerId ?? loggedInUserId}
              practitionerId={practitionerId ?? 0}
              aiStatusId={noteDetail.aiStatus?.id ?? 1}
              priorityId={noteDetail.priority?.id ?? 1}
              onSMEIssueCreatedFromTemplate={handleSMEIssueCreatedFromTemplate}
              onReviewerIssuesChanged={reviewerId => onReviewerIssuesChangedRef.current?.(reviewerId)}
            />
            <PreviousSessionCard
              webhookVersions={noteDetail.webhookVersions}
              previousNote={noteDetail.previousNote}
              onVersionChange={setSelectedVersionId}
              noteId={noteId}
              versionId={selectedVersionId}
              reviewerId={reviewerId ?? loggedInUserId}
              practitionerId={practitionerId ?? 0}
              aiStatusId={noteDetail.aiStatus?.id ?? 1}
              priorityId={noteDetail.priority?.id ?? 1}
              onSMEIssueCreatedFromTemplate={handleSMEIssueCreatedFromTemplate}
              onReviewerIssuesChanged={reviewerId => onReviewerIssuesChangedRef.current?.(reviewerId)}
            />
            {/* <NoteSections bedrockResponse={noteDetail.bedrockResponse} openSectionId={openSectionId} /> */}
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <AuditScoreCard noteDetail={noteDetail} />
            {/* <ModelInformation modelDetail={noteDetail.modelDetail} /> */}
            {/* <SummaryCard title="AI Summary" summary={noteDetail.aiSummary} icon={Sparkles} /> */}
            <IssuesIdentifiedCard issues={noteDetail.issues} onCategoryClick={() => {}} />
            <SMEReview
              reviews={reviews}
              setReviews={setReviews}
              auditScore={noteDetail?.auditScore || 0}
              versionId={selectedVersionId}
              webhookVersions={noteDetail.webhookVersions || []}
              noteReviewMarks={noteDetail.noteReviewMarks}
              noteReviewMarksRaw={noteDetail.noteReviewMarksRaw}
              aiStatusId={noteDetail.aiStatus?.id || 1}
              priorityId={noteDetail.priority?.id || 1}
              practitionerId={practitionerId || 0}
              reviewerId={reviewerId}
              isManagerReviewing={isManagerReviewing}
              onSMEIssueDeleted={onSMEIssueDeleted}
              onSMEReviewDeleted={onSMEReviewDeleted}
              onSMEIssueUpdated={onSMEIssueUpdated}
              onReviewerIssuesChangedRef={onReviewerIssuesChangedRef}
            />
            {/* Conditionally render Admin Review or Action Buttons */}
            {/* {showHumanReview && noteId ? (
              <HumanReviewSection
                noteId={noteId}
                priority={noteDetail.priority?.id || 0}
                aiStatus={noteDetail.aiStatus?.id || 0}
                onSaveDraft={handleSaveDraft}
                setShowHumanReview={setShowHumanReview}
                chatId={auditHistory[0]?.id}
                humanReview={isFromHumanReviewQueue ? noteDetail.humanReview : null}
                isEditMode={isFromHumanReviewQueue}
              />
            ) : null} */}
            <ActionButtons
              onReRunAudit={loadNoteDetail}
              isManagerReviewing={isManagerReviewing}
              reviewerId={reviewerId}
              practitionerId={practitionerId}
              noteId={noteId}
              versionId={selectedVersionId}
            />
            <AuditHistoryCard chats={auditHistory} />
            {/* <SummaryCard title="Prompt" summary={noteDetail.prompt} icon={UserRoundPen} showCopyButton={true} /> */}
            {/* <SummaryCard title="Prompt Data" summary={noteDetail.promptData} icon={UserRoundCog} showCopyButton={true} /> */}
            {/* <SummaryCard title="Raw Response" summary={noteDetail.rawResponse} icon={MessageCircleMore} showCopyButton={true} /> */}
          </div>
        </div>
      </div>
    )
  );
};

export default SingleNoteAudit;
