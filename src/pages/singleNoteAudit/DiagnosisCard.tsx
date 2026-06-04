import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosisItem } from '@/types/notes';
import { formatDate } from '@/utils/helper';
import { Calendar, ClipboardList, Code, HeartPulse } from 'lucide-react';
import moment from 'moment';

interface DiagnosisCardProps {
  diagnoses: DiagnosisItem[];
}

const formatDiagnosisDate = (date?: DiagnosisItem['date']): string => {
  if (!date || typeof date !== 'object') return '-';
  const seconds = 'seconds' in date && typeof date.seconds === 'number' ? date.seconds : undefined;
  if (seconds == null) return '-';
  return formatDate(moment.unix(seconds).toDate());
};

const DiagnosisCard = ({ diagnoses }: DiagnosisCardProps) => {
  return (
    <Card className="gap-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <HeartPulse className="h-5 w-5" />
          Diagnosis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {diagnoses.length === 0 ? (
          <div className="rounded-lg bg-[#F0F0F0] p-4">
            <p className="text-center text-sm text-gray-500">N/A</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnoses.map((diagnosis, index) => (
              <div key={`${diagnosis.code}-${diagnosis.noteId ?? ''}-${index}`} className="space-y-4 rounded-lg bg-[#F0F0F0] p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-primary flex gap-1 text-sm">
                    <Code className="text-primary mt-0.5" size={16} />
                    <div>
                      <p className="font-medium">Code</p>
                      <p className="text-sm text-black">{diagnosis.code || '-'}</p>
                    </div>
                  </div>

                  <div className="text-primary flex gap-1 text-sm">
                    <Calendar className="text-primary mt-0.5" size={16} />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-black">{formatDiagnosisDate(diagnosis.date)}</p>
                    </div>
                  </div>
                </div>

                <div className="text-primary flex gap-1 text-sm">
                  <ClipboardList className="text-primary mt-0.5 shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="font-medium">Description</p>
                    <p className="text-sm whitespace-pre-wrap text-black">{diagnosis.description || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosisCard;
