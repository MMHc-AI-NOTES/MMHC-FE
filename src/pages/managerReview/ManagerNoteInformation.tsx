import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/store/store';
import { NoteDetail } from '@/types/notes';
import { Hash, User, Calendar, ClipboardList, Code, Bot, ShieldCheck, Info } from 'lucide-react';

interface ManagerNoteInformationProps {
  noteDetail: NoteDetail;
  statusTags: string[];
  humanReviewStatus: string;
}

const statusStyleMap: Record<string, string> = {
  'Pending Manager Review': 'bg-orange-light text-orange-dark border-none',
  'Practitioner Disputed': 'bg-orange-light text-orange-dark border-orange-dark',
  'Awaiting SME Review': 'bg-blue-50 text-blue-dark border-blue-dark',
};

export const ManagerNoteInformation = ({ noteDetail, statusTags, humanReviewStatus }: ManagerNoteInformationProps) => {
  const { cptCodes } = useAppSelector(state => state.filterOptions);
  const cptCode = cptCodes.find(cpt => cpt.id === noteDetail.cptCode)?.code || noteDetail.cptCode || '-';

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {statusTags.map((tag, index) => (
            <div
              key={tag}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${statusStyleMap[tag] || 'border-slate-200 bg-slate-100 text-slate-800'}`}
            >
              {index === 0 ? <Info className="h-4 w-4" /> : null}
              {tag}
            </div>
          ))}
        </div>

        {/* Note meta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Hash className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Note ID</p>
              <p className="text-sm text-black">{noteDetail.id}</p>
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
            <ShieldCheck className="text-primary mt-0.5 h-4 w-4" />
            <div>
              <p className="font-medium">Admin Review Status</p>
              <p className="text-black">{humanReviewStatus}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerNoteInformation;
