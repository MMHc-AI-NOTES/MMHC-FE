import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Reuse existing Single Note Audit components and manager-specific cards
import ManagerNoteInformation from './ManagerNoteInformation';
import ManagerHumanReviewSummaryCard from './ManagerHumanReviewSummaryCard';
import ManagerAuditScoreCard from './ManagerAuditScoreCard';
import ManagerDecisionCard from './ManagerDecisionCard';
import ManagerReviewHistoryCard from './ManagerReviewHistoryCard';
import NoteSections from '../singleNoteAudit/NoteSections';
import IssuesIdentifiedCard from '../singleNoteAudit/IssuesIdentifiedCard';
import LoadingSkeleton from '../singleNoteAudit/LoadingSkeleton';

import type { NoteDetail } from '@/types/notes';
import { formatDate, formatDateTime, mapCategoryToSectionId } from '@/utils/helper';
import { fetchManagerReviewDetail } from './managerReviewApiCalls';
import { ManagerReviewApiItem } from './managerReviewTypes';
import { HumanReviewDecisionLabels, HumanReviewLabels, SessionTypeLabels } from '@/constants/common';

// Transform API response to NoteDetail format
const transformToNoteDetail = (data: ManagerReviewApiItem): NoteDetail => {
  const bedrockResponse = data.chat?.bedrockResponse || {};
  const issues = bedrockResponse.issues || [];

  return {
    id: data.noteId,
    aiStatus: data.aiStatus || { id: 0, name: 'Unknown' },
    priority: data.priority || { id: 1, name: 'Low' },
    humanReview: data.review
      ? [
          {
            id: data.review.id,
            chatId: data.chatId,
            comment: data.review.comment || undefined,
            decision: data.review.decision,
            manualScore: data.review.manualScore,
            noteId: data.noteId,
            practitionerId: data.review.practitionerId,
            humanResult: data.review.humanResult,
          },
        ]
      : null,
    date: data.createdAt ? formatDate(data.createdAt) : 'N/A',
    practitioner: data.practitioner?.fullName || 'Unknown',
    cptCode: data.session?.cptCodeId || 0,
    reviewCycle: data.session?.reviewCycle || { id: 1, name: 'Cycle 1' },
    clientId: data.session?.patientId?.toString() || '—',
    noteType: SessionTypeLabels[data.session?.type?.id] || '-',
    aiReviews: data.chat_count || 0,
    auditScore: data.aiScore || data.chat?.evaluationScore || 0,
    lastRun: data.chat?.createdAt ? formatDateTime(data.chat.createdAt) : 'N/A',
    aiSummary: bedrockResponse.summary || data.chat?.evaluation || '',
    therapySummary: data.session?.session || '',
    bedrockResponse: bedrockResponse,
    prompt: data.chat?.prompt || '',
    promptData: data.chat?.userInput || '',
    rawResponse: bedrockResponse.raw_response || '',
    modelDetail: {
      modelVersion: data.chat?.modelId || 'Unknown',
      auditRunId: data.chatId,
      lastRun: data.chat?.createdAt ? formatDateTime(data.chat.createdAt) : 'N/A',
    },
    issues: issues.map((issue: any) => ({
      severity: (issue.severity?.toUpperCase() || 'MINOR') as 'CRITICAL' | 'MODERATE' | 'MINOR',
      category: issue.section || '',
      points: issue.points_deducted || 0,
      description: issue.justification || '',
      sectionId: issue.section_id || '',
    })),
    webhookVersions: data.webhookVersions || [],
  };
};

export const ManagerSingleReview = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [rawData, setRawData] = useState<ManagerReviewApiItem | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | undefined>(undefined);

  const id = idParam || '';

  // Derive values from API data
  const statusTags = rawData
    ? [
        rawData.session?.manager?.name === 'in_progress' ? 'Pending Manager Review' : '',
        rawData.session?.humanReview?.name === 'completed' ? 'Admin Review Completed' : '',
      ].filter(Boolean)
    : [];
  const humanReviewStatus = rawData?.session?.humanReview?.id ? HumanReviewLabels[rawData.session.humanReview.id] : '-';
  const humanReviewDecision = rawData?.humanDecision?.id
    ? HumanReviewDecisionLabels[rawData.humanDecision.id] || rawData.humanDecision.name
    : 'N/A';
  const humanReviewReviewer = rawData?.manager?.fullName || 'Unknown';
  const humanReviewScore = rawData?.manualScore || rawData?.review?.manualScore || 0;
  const humanReviewComments = rawData?.review?.comment || rawData?.comment || '';

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchManagerReviewDetail(id);
        if (!isMounted || !data) return;

        setRawData(data);
        const transformedNote = transformToNoteDetail(data);
        setNoteDetail(transformedNote);
      } catch (error) {
        console.error('Error loading manager review detail:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !noteDetail) {
    return (
      <div>
        <LoadingSkeleton backPath="/manager-review" />
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft />
      </Button>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          <ManagerNoteInformation noteDetail={noteDetail} statusTags={statusTags} humanReviewStatus={humanReviewStatus} />
          <NoteSections bedrockResponse={noteDetail.bedrockResponse} openSectionId={openSectionId} />
        </div>

        {/* Right Content */}
        <div className="space-y-4">
          <ManagerAuditScoreCard noteDetail={noteDetail} />
          <ManagerHumanReviewSummaryCard
            decision={humanReviewDecision}
            reviewer={humanReviewReviewer}
            humanScore={humanReviewScore}
            comments={humanReviewComments}
          />
          <IssuesIdentifiedCard
            issues={noteDetail.issues}
            onCategoryClick={category => {
              const sectionId = mapCategoryToSectionId(category);
              setOpenSectionId(sectionId);
            }}
          />
          <ManagerDecisionCard rawData={rawData} onReturnToQueue={() => navigate('/manager-review')} />
          <ManagerReviewHistoryCard />
        </div>
      </div>
    </div>
  );
};

export default ManagerSingleReview;
