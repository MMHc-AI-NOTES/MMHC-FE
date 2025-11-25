import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { NoteDetail } from '@/types/notes';

const SingleNoteAudit = () => {
  const navigate = useNavigate();
  const [noteDetail, setNoteDetail] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHumanReview, setShowHumanReview] = useState(false);

  // Dummy API call to fetch note details
  const fetchNoteDetail = async (id: string): Promise<NoteDetail> => {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      id: id,
      date: 'Feb 9, 2025',
      practitioner: 'Jane Thompson',
      cptCode: '90791',
      noteType: 'Progress Note',
      aiReviews: 1,
      auditScore: 82,
      lastRun: 'Feb 9, 2025 – 10:32 AM',
      summary:
        'This progress note demonstrates adequate clinical documentation with appropriate coverage of therapeutic interventions and patient response. However, several areas require attention to meet full compliance standards, particularly regarding diagnostic criteria specificity and treatment plan measurability.',
      issues: [
        {
          severity: 'CRITICAL',
          category: 'Assessment & Therapeutic Intervention',
          points: 25,
          description:
            'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
          sectionId: 'zad8-1',
        },
        {
          severity: 'MODERATE',
          category: 'Plan & Collaboration',
          points: 10,
          description:
            'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
          sectionId: 'hwh-1',
        },
        {
          severity: 'MINOR',
          category: 'Subjective',
          points: 5,
          description:
            'Could benefit from more specific timeline documentation (e.g., exact duration and frequency of symptoms). Current documentation meets minimum requirements.',
          sectionId: '6tx9-1',
        },
      ],
    };
  };

  useEffect(() => {
    const loadNoteDetail = async () => {
      try {
        setLoading(true);
        const detail = await fetchNoteDetail('12439');
        setNoteDetail(detail);
      } catch (error) {
        console.error('Error fetching note detail:', error);
        setNoteDetail(null);
      } finally {
        setLoading(false);
      }
    };

    loadNoteDetail();
  }, []);

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

  if (!noteDetail) {
    return (
      <div>
        <Button onClick={() => navigate('/notes-queue')} className="mb-2">
          <ArrowLeft />
        </Button>
        <div className="flex flex-col items-center justify-between">
          <h1 className="text-2xl font-bold">Note not found</h1>
          <p className="mt-2 text-gray-600">Please check the note ID and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => navigate('/notes-queue')} className="mb-2">
        <ArrowLeft />
      </Button>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          <NoteInformation noteDetail={noteDetail} />
          <NoteSections />
        </div>

        {/* Right Content */}
        <div className="space-y-4">
          <AuditScoreCard noteDetail={noteDetail} />
          <AISummaryCard summary={noteDetail.summary} />
          <IssuesIdentifiedCard issues={noteDetail.issues} />

          {/* Conditionally render Human Review or Action Buttons */}

          {showHumanReview ? (
            <HumanReviewSection onSaveDraft={handleSaveDraft} onSubmit={handleSubmitReview} setShowHumanReview={setShowHumanReview} />
          ) : null}
          <ActionButtons onFlagReview={handleFlagReview} />
        </div>
      </div>
    </div>
  );
};

export default SingleNoteAudit;
