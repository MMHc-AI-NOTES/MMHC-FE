import { BlacklistedNote } from '@/types/blacklistedNotes';
import { NoteMetadataCard } from './NoteMetadataCard';
import { ReasonCard } from './ReasonCard';
import { IssuesCard } from './IssuesCard';
import { ReviewHistoryCard } from './ReviewHistoryCard';
import { ResolutionActionsCard } from './ResolutionActionsCard';

interface BlacklistedNotesDetailsSectionProps {
  note: BlacklistedNote;
  onApplyAction: (action: number, comment: string) => void;
  onSaveDraft: (action: number, comment: string) => void;
  onCancel: () => void;
}

const BlacklistedNotesDetailsSection = ({ note, onApplyAction, onSaveDraft, onCancel }: BlacklistedNotesDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <NoteMetadataCard note={note} />
          <ReasonCard note={note} />
          <IssuesCard issues={note.issues || []} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ReviewHistoryCard reviewHistory={note.reviewHistory || []} />
          <ResolutionActionsCard onApplyAction={onApplyAction} onSaveDraft={onSaveDraft} onCancel={onCancel} />
        </div>
      </div>
    </div>
  );
};

export default BlacklistedNotesDetailsSection;
