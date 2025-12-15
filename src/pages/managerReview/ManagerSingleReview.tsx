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

import type { NoteDetail, Chat } from '@/types/notes';

// --- Dummy API layer for Manager Single Review (replace with real endpoints later) ---

const dummyBedrockResponse = {
  score: 82,
  pass: false,
  createdAt: '2025-02-09T10:32:00Z',
  issues: [
    {
      severity: 'CRITICAL',
      points_deducted: 25,
      section_id: 'zad8-1',
      section: 'Assessment & Therapeutic Intervention',
      justification:
        'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
    },
    {
      severity: 'MODERATE',
      points_deducted: 10,
      section_id: 'hnfi-1',
      section: 'Plan & Collaboration',
      justification:
        'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
    },
    {
      severity: 'MINOR',
      points_deducted: 5,
      section_id: '6tx9-1',
      section: 'Subjective',
      justification:
        'Could benefit from more specific timeline documentation (e.g., exact duration and frequency of symptoms). Current documentation meets minimum requirements.',
    },
  ],
  summary:
    'This progress note demonstrates adequate clinical documentation with appropriate coverage of therapeutic interventions and patient response. However, several areas require attention to meet full compliance standards.',
  sentiment: 'Neutral',
  evaluation: 'Needs Correction',
  '6tx9-1_subjective':
    'Patient reports feeling increased anxiety over the past week, particularly related to work deadlines. States difficulty sleeping and increased irritability. Denies suicidal ideation or intent. Reports medication compliance with current regimen.',
  'rb2f-1_objective': '',
  'zad8-1_asment_&_therapeutic_intervention': '',
  'ugq6-1_reaction_to_intervention': '',
  'hnfi-1_plan_and_collaboration': '',
  '9z5t-1_therapist_reflection': '',
  'gm4p-1_progress': '',
  'kxgx-7_&_kxgx-8_suicidality/homicidality': '',
  raw_response: '',
};

const dummyNoteDetail: NoteDetail = {
  id: '12439',
  aiStatus: { id: 2, name: 'Needs Correction' },
  priority: { id: 1, name: 'High' },
  humanReview: null,
  date: 'Feb 9, 2025',
  practitioner: 'Jane Thompson',
  cptCode: 90791,
  reviewCycle: { id: 1, name: 'Review Cycle 1' },
  clientId: '—',
  noteType: 'Progress Note',
  aiReviews: 1,
  auditScore: dummyBedrockResponse.score,
  lastRun: 'Feb 9, 2025 — 10:32 AM',
  aiSummary: dummyBedrockResponse.summary,
  therapySummary:
    'Therapy session focused on exploring work-related stressors and identifying coping strategies. Practitioner used CBT techniques to challenge catastrophic thinking and encouraged behavioral activation for mood improvement.',
  bedrockResponse: dummyBedrockResponse,
  prompt: 'Audit this clinical progress note for documentation quality and compliance with DSM-5 and payer requirements.',
  promptData: 'Session details and structured clinical data used to generate the note.',
  rawResponse: 'Raw model output will appear here when connected to the backend.',
  modelDetail: {
    modelVersion: 'gpt-4.1',
    auditRunId: 1,
    lastRun: 'Feb 9, 2025 — 10:32 AM',
  },
  issues: dummyBedrockResponse.issues.map(issue => ({
    severity: issue.severity as 'CRITICAL' | 'MODERATE' | 'MINOR',
    category: issue.section,
    points: issue.points_deducted,
    description: issue.justification,
    sectionId: issue.section_id,
  })),
};

const dummyChats: Chat[] = [
  {
    id: 1,
    prompt: 'Audit this clinical progress note for documentation quality and compliance.',
    userNote: 'Full clinical note contents...',
    userInput: 'Session details and structured clinical data used to generate the note.',
    modelId: 'gpt-4.1',
    evaluationScore: 82,
    humanReviews: null,
    sentiment: 'Neutral',
    evaluation: 'Needs Correction',
    bedrockResponse: dummyBedrockResponse,
    noteId: dummyNoteDetail.id,
    userId: 1,
    createdAt: '2025-02-09T10:32:00Z',
    updatedAt: '2025-02-09T10:32:00Z',
  },
];

const fetchManagerSingleNoteDetail = (id: string): Promise<NoteDetail> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ ...dummyNoteDetail, id });
    }, 600);
  });

const fetchManagerAuditHistory = (): Promise<Chat[]> =>
  new Promise(resolve => {
    setTimeout(() => resolve(dummyChats), 600);
  });

// --- Component ---

export const ManagerSingleReview = () => {
  const navigate = useNavigate();
  const { id: noteIdParam } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);

  const noteId = noteIdParam || dummyNoteDetail.id;
  const statusTags = ['Pending Manager Review', 'Practitioner Disputed', 'Awaiting SME Review'];
  const humanReviewStatus = 'Escalated';
  const humanReviewDecision = 'Escalated to Manager';
  const humanReviewReviewer = 'J. Turner';
  const humanReviewScore = 78;
  const humanReviewComments =
    'AI assessment appears correct but practitioner has disputed the critical finding. Requires manager validation.';

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [note] = await Promise.all([fetchManagerSingleNoteDetail(noteId), fetchManagerAuditHistory()]);
        if (!isMounted) return;
        setNoteDetail(note);
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
  }, [noteId]);

  if (loading || !noteDetail) {
    return (
      <div>
        <LoadingSkeleton />
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
          <NoteSections bedrockResponse={noteDetail.bedrockResponse} />
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
          <IssuesIdentifiedCard issues={noteDetail.issues} />
          <ManagerDecisionCard onReturnToQueue={() => navigate('/manager-review')} />
          <ManagerReviewHistoryCard />
        </div>
      </div>
    </div>
  );
};

export default ManagerSingleReview;
