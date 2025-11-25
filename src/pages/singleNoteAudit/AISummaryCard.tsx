import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
}

const AISummaryCard = ({ summary }: AISummaryCardProps) => {
  return (
    <Card className="gap-1 shadow-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Sparkles />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
      </CardContent>
    </Card>
  );
};

export default AISummaryCard;
