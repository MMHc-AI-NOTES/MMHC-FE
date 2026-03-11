import { Card, CardContent } from '@/components/ui/card';
import { ReviewCycleEnum, ReviewCycleLabels } from '@/constants/common';
import { GradientBadge } from '@/shared/GradientBadge';
import { useAppSelector } from '@/store/store';
import { NoteDetail } from '@/types/notes';
import { Hash, User, Calendar, ClipboardList, Code, Bot, RefreshCw, UserSearch, ExternalLink } from 'lucide-react';

interface NoteInformationProps {
  noteDetail: NoteDetail;
  handleNoteIdClick: () => void;
}

const NoteInformation = ({ noteDetail, handleNoteIdClick }: NoteInformationProps) => {
  const { cptCodes } = useAppSelector(state => state.filterOptions);
  const cptCode = cptCodes.find(cptCode => cptCode.id === noteDetail.cptCode)?.code || '-';

  const getReviewCycleGradient = (cycle: number): string => {
    switch (cycle) {
      case ReviewCycleEnum.cycle_1:
        return 'bg-gradient-review-cycle-1';
      case ReviewCycleEnum.cycle_2:
        return 'bg-gradient-review-cycle-2';
      case ReviewCycleEnum.cycle_3:
        return 'bg-gradient-review-cycle-3';
      case ReviewCycleEnum.blacklisted:
        return 'bg-gradient-review-cycle-blacklisted';
      default:
        return 'bg-gradient-neutral';
    }
  };

  return (
    <Card>
      <CardContent className="space-y-7">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Hash className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Note ID</p>
              <div className="group inline cursor-pointer" onClick={handleNoteIdClick}>
                <span className="align-middle text-sm text-blue-600 transition-colors group-hover:text-blue-700">{noteDetail.id}</span>
                <ExternalLink className="ml-1 inline align-middle text-blue-600 transition-colors group-hover:text-blue-700" size={14} />
              </div>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <User className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Practitioner</p>
              <p className="text-sm text-black">{noteDetail.practitioner}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Calendar className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-sm text-black">{noteDetail.date}</p>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <ClipboardList className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Note Type</p>
              <p className="text-sm text-black">{noteDetail.noteType}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Code className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">CPT Code</p>
              <p className="text-sm text-black">{cptCode}</p>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <Bot className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">AI Reviews</p>
              <p className="text-sm text-black">{noteDetail.aiReviews}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <RefreshCw className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Review Cycle</p>

              {noteDetail.reviewCycle ? (
                <GradientBadge
                  label={ReviewCycleLabels[noteDetail.reviewCycle.id]}
                  gradient={getReviewCycleGradient(noteDetail.reviewCycle.id)}
                />
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          </div>
          <div className="text-primary flex gap-1 text-sm">
            <UserSearch className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Client Id</p>
              <p className="text-sm text-black">{noteDetail.clientId}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteInformation;
