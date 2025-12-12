import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/store/store';
import { NoteDetail } from '@/types/notes';
import { Hash, User, Calendar, ClipboardList, Code, Bot, RefreshCw, UserSearch } from 'lucide-react';

interface NoteInformationProps {
  noteDetail: NoteDetail;
}

const NoteInformation = ({ noteDetail }: NoteInformationProps) => {
  const { cptCodes } = useAppSelector(state => state.filterOptions);
  const cptCode = cptCodes.find(cptCode => cptCode.id === noteDetail.cptCode);

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="space-y-7">
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
              <p className="text-sm text-black">{cptCode?.code || '-'}</p>
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
              <p className="text-sm text-black">-</p>
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
