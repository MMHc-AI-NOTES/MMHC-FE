import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircleMore, Sparkles, UserRoundCog, UserRoundPen } from 'lucide-react';

// Components
import NoteInformation from './NoteInformation';
import NoteSections from './NoteSections';
import AuditScoreCard from './AuditScoreCard';
import IssuesIdentifiedCard from './IssuesIdentifiedCard';
import SMEReview from './SMEReview';
import ActionButtons from './ActionButtons';
import HumanReviewSection from './HumanReviewSection';
import LoadingSkeleton from './LoadingSkeleton';
import AuditHistoryCard from './AuditHistoryCard';

// Services and Types
import { NoteDetail, ApiNoteDetail, Chat } from '@/types/notes';
import { useAppSelector } from '@/store/store';
import { getNoteDetailWithChat } from './singleNoteApiCalls';
import { fetchAgents } from '../settings/settingsApiCalls';
import { setAgents, setSelectedAgentId } from '@/store/slices/agentsSlice';
import SummaryCard from './SummaryCard';
import TherapySessionSummaryCard from './TherapySessionSummaryCard';
import ModelInformation from './ModelInformation';
import { mapCategoryToSectionId } from '@/utils/helper';
import { SessionTypeLabels } from '@/constants/common';
import { fetchPractitioners } from '../notesQueue/notesApiCalls';
import { setPractitioners } from '@/store/slices/filterOptionsSlice';

// Utility function to format API response to component expected format
const formatNoteDetail = (apiData: ApiNoteDetail, chatId: number): NoteDetail => {
  // Use moment for date formatting
  const sessionDate = moment(apiData.sessionTime);
  const formattedDate = sessionDate.format('MMM D, YYYY');

  // Use actual data from the API response if available
  const latestChat = apiData.chats?.[0];
  const extractedHumanReviewChat = apiData.chats?.find(chat => chat.id === chatId);
  const bedrockResponse = latestChat?.bedrockResponse;
  const formattedDateTime = latestChat?.createdAt ? moment(latestChat.createdAt).format('MMM D, YYYY - h:mm A') : '';

  // Convert API issues to the expected format
  const issues = bedrockResponse?.issues?.map((issue: any) => ({
    severity: (issue.severity?.toUpperCase() as 'CRITICAL' | 'MODERATE' | 'MINOR') || 'MINOR',
    category: issue.section || 'General',
    points: issue.points_deducted || 0,
    description: issue.justification || 'No description provided',
    sectionId: issue.section_id || 'general',
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
  };
};

const SingleNoteAudit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { id: noteId } = useParams<{ id: string }>();
  const { selectedAgentId } = useAppSelector(state => state.agents);
  const { practitionersLoaded } = useAppSelector(state => state.filterOptions);
  const [openSectionId, setOpenSectionId] = useState<string | undefined>(undefined);

  // Create a ref to store the latest selectedAgentId
  const selectedAgentIdRef = useRef(selectedAgentId);
  const initialAgentIdRef = useRef(selectedAgentId); // Track initial agent ID

  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [auditHistory, setAuditHistory] = useState<Chat[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  // Check if coming from human-review-queue
  const isFromHumanReviewQueue = location.state?.from === 'human-review-queue';
  const chatId = location.state?.chatId;
  const [showHumanReview, setShowHumanReview] = useState(isFromHumanReviewQueue);
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
    loadPractitioners();
  }, [practitionersLoaded, dispatch]);

  // Cleanup ref on unmount
  useEffect(() => {
    return () => {
      selectedAgentIdRef.current = null;
      initialAgentIdRef.current = null;
      setNoteDetail(null);
    };
  }, []);

  const handleSaveDraft = () => {
    console.log('Saving draft...');
    setShowHumanReview(false);
  };

  const handleFlagReview = () => {
    setShowHumanReview(true);
  };

  if (loading) {
    return (
      <div>
        <LoadingSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div></div>
          <ActionButtons onFlagReview={handleFlagReview} onReRunAudit={loadNoteDetail} isReRun={loading} />
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
            <TherapySessionSummaryCard webhookVersions={noteDetail.webhookVersions} onVersionChange={setSelectedVersionId} />
            <NoteSections bedrockResponse={noteDetail.bedrockResponse} openSectionId={openSectionId} />
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <AuditScoreCard noteDetail={noteDetail} />
            <ModelInformation modelDetail={noteDetail.modelDetail} />
            <SummaryCard title="AI Summary" summary={noteDetail.aiSummary} icon={Sparkles} />
            <IssuesIdentifiedCard
              issues={noteDetail.issues}
              onCategoryClick={category => {
                const sectionId = mapCategoryToSectionId(category);
                setOpenSectionId(sectionId);
              }}
            />
            <SMEReview
              auditScore={noteDetail?.auditScore || 0}
              versionId={selectedVersionId}
              webhookVersions={noteDetail.webhookVersions || []}
            />
            {/* Conditionally render Human Review or Action Buttons */}
            {showHumanReview && noteId ? (
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
            ) : null}
            <ActionButtons onFlagReview={handleFlagReview} onReRunAudit={loadNoteDetail} />
            <AuditHistoryCard chats={auditHistory} />
            <SummaryCard title="Prompt" summary={noteDetail.prompt} icon={UserRoundPen} showCopyButton={true} />
            <SummaryCard title="Prompt Data" summary={noteDetail.promptData} icon={UserRoundCog} showCopyButton={true} />
            <SummaryCard title="Raw Response" summary={noteDetail.rawResponse} icon={MessageCircleMore} showCopyButton={true} />
          </div>
        </div>
      </div>
    )
  );
};

export default SingleNoteAudit;
