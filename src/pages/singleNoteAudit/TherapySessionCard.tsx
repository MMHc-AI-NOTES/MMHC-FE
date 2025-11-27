import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

interface TherapySessionCardProps {
  summary: string;
}

const TherapySessionCard = ({ summary }: TherapySessionCardProps) => {
  // Function to convert newlines to <br> tags and basic HTML rendering
  const formatHtmlContent = (html: string) => {
    return { __html: html.replace(/\n/g, '<br />') };
  };

  return (
    <Card className="gap-1 shadow-sm">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Stethoscope />
          Therapy Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-relaxed text-gray-700" dangerouslySetInnerHTML={formatHtmlContent(summary)} />
      </CardContent>
    </Card>
  );
};

export default TherapySessionCard;
