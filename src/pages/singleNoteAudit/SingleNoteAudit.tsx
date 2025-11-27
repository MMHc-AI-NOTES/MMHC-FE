import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Components
import NoteInformation from './NoteInformation';
import NoteSections from './NoteSections';
import AuditScoreCard from './AuditScoreCard';
import AISummaryCard from './AISummaryCard';
import IssuesIdentifiedCard from './IssuesIdentifiedCard';
import ActionButtons from './ActionButtons';
import HumanReviewSection from './HumanReviewSection';
import LoadingSkeleton from './LoadingSkeleton';

// Services and Types
import { NoteDetail, ApiNoteDetail } from '@/types/notes';
import { RootState } from '@/store/store';
import { getNoteDetailWithChat } from './singleNoteApiCalls';
import TherapySessionCard from './TherapySessionCard';
import { fetchAgents } from '../settings/settingsApiCalls';
import { setAgents, setSelectedAgentId } from '@/store/slices/agentsSlice';

// Utility function to format API response to component expected format
const formatNoteDetail = (apiData: ApiNoteDetail): NoteDetail => {
  // Use moment for date formatting
  const sessionDate = moment(apiData.sessionTime);
  const formattedDate = sessionDate.format('MMM D, YYYY');

  // Use actual data from the API response if available
  const latestChat = apiData.chats?.[0];
  const bedrockResponse = latestChat?.bedrockResponse;
  const formattedDateTime = latestChat?.createdAt ? moment(bedrockResponse.createdAt).format('MMM D, YYYY h:mm A') : '';

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
    cptCode: '90791', // You'll need to get this from your API
    noteType: 'Progress Note', // You'll need to get this from your API
    aiReviews: apiData.chats?.length || 0,
    auditScore: bedrockResponse?.score || 0, // Use actual score from chat or fallback
    lastRun: formattedDateTime,
    aiSummary: bedrockResponse?.summary, // Use chat summary or fallback to session
    therapySummary: apiData.session, // Use chat summary or fallback to session
    bedrockResponse: bedrockResponse,
    issues: issues,
  };
};

const SingleNoteAudit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { id: noteId } = useParams<{ id: string }>();
  const { selectedAgentId } = useSelector((state: RootState) => state.agents);

  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [showHumanReview, setShowHumanReview] = useState(false);

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

  const loadNoteDetail = useCallback(
    async (isRerun: boolean = false) => {
      setLoading(true);
      if (noteId && selectedAgentId) {
        const apiNoteDetail = await getNoteDetailWithChat(noteId, selectedAgentId, isRerun);
        const formattedNoteDetail = formatNoteDetail(apiNoteDetail);

        setNoteDetail(formattedNoteDetail);
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noteId],
  );

  useEffect(() => {
    loadNoteDetail();
  }, [loadNoteDetail]);

  const handleSaveDraft = () => {
    console.log('Saving draft...');
    // Implement save draft logic
    setShowHumanReview(false);
  };

  const handleSubmitReview = () => {
    console.log('Submitting review...');
    // Implement submit logic
    setShowHumanReview(false);
  };

  const handleFlagReview = () => {
    setShowHumanReview(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    noteDetail && (
      <div>
        <Button onClick={() => navigate('/notes-queue')} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <NoteInformation noteDetail={noteDetail} />
            <TherapySessionCard summary={noteDetail.therapySummary} />

            <NoteSections bedrockResponse={noteDetail.bedrockResponse} />
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            <AuditScoreCard noteDetail={noteDetail} />
            <AISummaryCard summary={noteDetail.aiSummary} />
            <IssuesIdentifiedCard issues={noteDetail.issues} />

            {/* Conditionally render Human Review or Action Buttons */}
            {showHumanReview ? (
              <HumanReviewSection onSaveDraft={handleSaveDraft} onSubmit={handleSubmitReview} setShowHumanReview={setShowHumanReview} />
            ) : null}
            <ActionButtons onFlagReview={handleFlagReview} onReRunAudit={loadNoteDetail} />
          </div>
        </div>
      </div>
    )
  );
};

export default SingleNoteAudit;
