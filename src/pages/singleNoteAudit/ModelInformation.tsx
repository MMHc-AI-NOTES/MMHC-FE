import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/store/store';
import { ModelDetail } from '@/types/notes';
import { getModelDisplayName } from '@/utils/helper';
import { Hash, Cpu, FileCode, Clock } from 'lucide-react';

interface ModelInformationProps {
  modelDetail: ModelDetail;
}

const ModelInformation = ({ modelDetail }: ModelInformationProps) => {
  const { agents, selectedAgentId } = useAppSelector(state => state.agents);

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="space-y-7">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Cpu className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Model Version</p>
              <p className="text-sm text-black">{getModelDisplayName(modelDetail.modelVersion)}</p>
            </div>
          </div>
          <div className="text-primary flex gap-1 text-sm">
            <FileCode className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Prompt Version</p>
              <p className="text-sm text-black">{selectedAgent?.name || '-'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Hash className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Audit Run ID</p>
              <p className="text-sm text-black">{modelDetail.auditRunId}</p>
            </div>
          </div>
          <div className="text-primary flex gap-1 text-sm">
            <Clock className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Last Run</p>
              <p className="text-sm text-black">{modelDetail.lastRun}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelInformation;
