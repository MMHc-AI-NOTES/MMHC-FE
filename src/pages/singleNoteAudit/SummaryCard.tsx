import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EvaluationPromptKeys } from '@/constants/common';
import { cleanSummary } from '@/utils/helper';

interface SummaryCardProps {
  title: string;
  summary: string;
  icon: LucideIcon;
  showCopyButton?: boolean;
  showExpandable?: boolean;
  className?: string;
}

const SummaryCard = ({ title, summary, icon: Icon, showCopyButton = false, className }: SummaryCardProps) => {
  const [copied, setCopied] = useState(false);

  const displayText = cleanSummary(summary);
  const lines = displayText.split('\n').filter(line => line.trim());

  // Function to highlight EvaluationPromptKeys in text
  const highlightPromptKeys = (text: string) => {
    const keys = Object.values(EvaluationPromptKeys);
    let highlightedText = text;

    keys.forEach(key => {
      const regex = new RegExp(`(${key})`, 'gi');
      highlightedText = highlightedText.replace(regex, match => {
        return `<span class="font-bold text-lg text-primary">${match}</span>`;
      });
    });

    return highlightedText;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  return (
    <Card className={cn('gap-1', className)}>
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
        <div className="rounded-lg bg-[#F0F0F0] p-4">
          <div className="space-y-2 text-sm leading-relaxed text-gray-700">
            {lines.map((line, index) => {
              if (!line.trim()) return null;

              // Check if line is a section header (ends with colon or contains specific headers)
              const isSectionHeader =
                line.includes(':') &&
                (line.includes('Session Duration') ||
                  line.includes('Suicidality') ||
                  line.includes('Homicidality') ||
                  line.includes('Subjective') ||
                  line.includes('Objective') ||
                  line.includes('Assessment') ||
                  line.includes('Reaction') ||
                  line.includes('Plan') ||
                  line.includes('Progress') ||
                  line.includes('Therapist'));

              if (isSectionHeader) {
                const [header, ...content] = line.split(':');
                const highlightedHeader = highlightPromptKeys(header);
                const highlightedContent = content.length > 0 ? highlightPromptKeys(content.join(':').trim()) : '';
                return (
                  <div key={index} className="mb-2">
                    <h4 className="font-semibold text-gray-800" dangerouslySetInnerHTML={{ __html: `${highlightedHeader}:` }} />
                    {content.length > 0 && <p className="ml-4 text-gray-700" dangerouslySetInnerHTML={{ __html: highlightedContent }} />}
                  </div>
                );
              }

              const highlightedLine = highlightPromptKeys(line);

              return <p key={index} className="text-gray-700" dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
