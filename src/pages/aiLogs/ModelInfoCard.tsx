import { Card, CardContent } from '@/components/ui/card';
import { AILog } from '@/types/aiLogs';
import { Cpu, FileCode, Hash, Clock } from 'lucide-react';
import { formatDateTime, getModelDisplayName } from '@/utils/helper';

interface ModelInfoCardProps {
  log: AILog;
}

const ModelInfoCard = ({ log }: ModelInfoCardProps) => {
  const modelDisplayName = getModelDisplayName(log.modelId);

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="space-y-7">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Cpu className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Model Version</p>
              <p className="text-sm text-black">{modelDisplayName}</p>
            </div>
          </div>
          <div className="text-primary flex gap-1 text-sm">
            <FileCode className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Prompt Version</p>
              <p className="text-sm break-all text-black" title={log.agent?.name || '-'}>
                {log.agent?.name || '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-primary flex gap-1 text-sm">
            <Hash className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Audit Run ID</p>
              <p className="text-sm text-black">{log.id}</p>
            </div>
          </div>
          <div className="text-primary flex gap-1 text-sm">
            <Clock className="text-primary mt-0.5" size={16} />
            <div>
              <p className="font-medium">Last Run</p>
              <p className="text-sm text-black">{formatDateTime(log.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelInfoCard;
