import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  summary: string;
  icon: LucideIcon;
  showCopyButton?: boolean;
  className?: string;
}

const SummaryCard = ({ title, summary, icon: Icon, showCopyButton = false, className }: SummaryCardProps) => {
  const [copied, setCopied] = useState(false);

  // Function to convert newlines to <br> tags and basic HTML rendering
  const formatHtmlContent = (html: string) => {
    return { __html: html.replace(/\n/g, '<br />') };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  return (
    <Card className={cn('gap-1 shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Icon />
            {title}
          </CardTitle>
          {showCopyButton && (
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0 hover:bg-gray-100" title="Copy to clipboard">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-relaxed text-gray-700" dangerouslySetInnerHTML={formatHtmlContent(summary)} />
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
