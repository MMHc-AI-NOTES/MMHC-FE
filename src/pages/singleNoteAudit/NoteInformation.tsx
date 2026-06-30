import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { ReviewCycleEnum } from '@/constants/common';
// import { GradientBadge } from '@/shared/GradientBadge';
import { useAppSelector } from '@/store/store';
import { NoteDetail, WebhookVersion } from '@/types/notes';
import { Hash, User, Calendar, ClipboardList, Code, Bot, UserSearch, ExternalLink } from 'lucide-react';
import { VersionHistoryPopover } from './therapySessionSummary/VersionHistoryPopover';
import moment from 'moment';
import { DATE_FORMAT } from '@/constants/common';

interface NoteInformationProps {
  noteDetail: NoteDetail;
  handleNoteIdClick: () => void;
  webhookVersions?: WebhookVersion[];
  selectedVersionId?: number | null;
  onVersionChange?: (versionId: number) => void;
}

const formatDate = (dateString: string) => moment(dateString).format(DATE_FORMAT);

const NoteInformation = ({
  noteDetail,
  handleNoteIdClick,
  webhookVersions = [],
  selectedVersionId,
  onVersionChange,
}: NoteInformationProps) => {
  const { cptCodes } = useAppSelector(state => state.filterOptions);
  const cptCode = cptCodes.find(cptCode => cptCode.id === noteDetail.cptCode)?.code || '-';
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const sortedVersions = useMemo(() => [...webhookVersions].sort((a, b) => b.id - a.id), [webhookVersions]);
  const selectedVersionIndex = useMemo(() => {
    if (!sortedVersions.length) return 0;
    if (selectedVersionId == null) return 0;
    const index = sortedVersions.findIndex(v => v.id === selectedVersionId);
    return index >= 0 ? index : 0;
  }, [selectedVersionId, sortedVersions]);

  const handleVersionSelect = (versionId: number) => {
    onVersionChange?.(versionId);
    setIsVersionHistoryOpen(false);
  };

  // const getReviewCycleGradient = (cycle: number): string => {
  //   switch (cycle) {
  //     case ReviewCycleEnum.cycle_1:
  //       return 'bg-gradient-review-cycle-1';
  //     case ReviewCycleEnum.cycle_2:
  //       return 'bg-gradient-review-cycle-2';
  //     case ReviewCycleEnum.cycle_3:
  //       return 'bg-gradient-review-cycle-3';
  //     case ReviewCycleEnum.blacklisted:
  //       return 'bg-gradient-review-cycle-blacklisted';
  //     default:
  //       return 'bg-gradient-neutral';
  //   }
  // };

  return (
    <Card className="sticky top-[-20px] z-20 bg-white">
      <CardContent className="space-y-7">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="text-primary flex gap-1 text-sm">
            <Hash className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Note ID</p>
              {noteDetail.id ? (
                <div className="group inline cursor-pointer" onClick={handleNoteIdClick}>
                  <span className="align-middle text-sm text-blue-600 transition-colors group-hover:text-blue-700">{noteDetail.id}</span>
                  <ExternalLink className="ml-1 inline align-middle text-blue-600 transition-colors group-hover:text-blue-700" size={14} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <Calendar className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-sm text-black">{noteDetail.date}</p>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <User className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Practitioner</p>
              <p className="text-sm text-black">{noteDetail.practitioner}</p>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <UserSearch className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Client Id</p>
              <p className="text-sm text-black">{noteDetail.clientId}</p>
            </div>
          </div>

          <div className="text-primary flex gap-1 text-sm">
            <ClipboardList className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Note Type</p>
              <p className="text-sm text-black">{noteDetail.noteType}</p>
            </div>
          </div>

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

          {/* <div className="text-primary flex gap-1 text-sm">
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
          </div> */}

          {sortedVersions.length > 0 && (
            <div>
              <VersionHistoryPopover
                versions={sortedVersions}
                selectedVersionIndex={selectedVersionIndex}
                isOpen={isVersionHistoryOpen}
                onOpenChange={setIsVersionHistoryOpen}
                onVersionSelect={handleVersionSelect}
                formatDate={formatDate}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteInformation;
