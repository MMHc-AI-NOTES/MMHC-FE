import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AILog } from '@/types/aiLogs';
import { Copy, Check, Code, Zap, History } from 'lucide-react';
import { EvaluationPromptKeys } from '@/constants/common';
import { cleanSummary } from '@/utils/helper';

interface PromptOutputTabsProps {
  log: AILog;
}

type TabType = 'prompt' | 'output' | 'prompt-history';

const PromptOutputTabs = ({ log }: PromptOutputTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const [promptCopied, setPromptCopied] = useState(false);
  const displayText =
    activeTab === 'prompt'
      ? log.prompt
      : activeTab === 'prompt-history'
        ? log.bedrockResponse.user_input
        : log.bedrockResponse?.raw_response || '';
  const lines = cleanSummary(displayText)
    .split('\n')
    .filter(line => line.trim());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Function to highlight EvaluationPromptKeys in text
  const highlightPromptKeys = (text: string) => {
    const keys = Object.values(EvaluationPromptKeys);
    let highlightedText = text;

    keys.forEach(key => {
      const regex = new RegExp(`(${key})`, 'gi');
      highlightedText = highlightedText.replace(regex, match => {
        return `<span class="font-bold text-lg ">${match}</span>`;
      });
    });

    return highlightedText;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setActiveTab('prompt')}
          className={`hover:bg-primary-light hover:text-primary h-12 min-w-[220px] flex-1 ${activeTab === 'prompt' ? 'bg-gradient-light text-primary' : 'bg-gray-50 text-gray-600'}`}
        >
          <Code className="h-4 w-4" />
          Prompt (Raw Input)
        </Button>
        <Button
          onClick={() => setActiveTab('prompt-history')}
          className={`hover:bg-primary-light hover:text-primary h-12 min-w-[220px] flex-1 ${activeTab === 'prompt-history' ? 'bg-gradient-light text-primary' : 'bg-gray-50 text-gray-600'}`}
        >
          <History className="h-4 w-4" />
          Prompt History (All Prompts)
        </Button>
        <Button
          onClick={() => setActiveTab('output')}
          className={`hover:bg-primary-light hover:text-primary h-12 min-w-[220px] flex-1 ${activeTab === 'output' ? 'bg-primary-light text-primary' : 'bg-gray-50 text-gray-600'}`}
        >
          <Zap className="h-4 w-4" />
          AI Output (Raw Response)
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                {activeTab === 'prompt'
                  ? 'Prompt (Raw Input)'
                  : activeTab === 'prompt-history'
                    ? 'Prompt History (All Prompts)'
                    : 'AI Output (Raw Response)'}
              </h4>
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === 'prompt'
                      ? log.prompt
                      : activeTab === 'prompt-history'
                        ? log.bedrockResponse.user_input
                        : log.bedrockResponse?.raw_response || '',
                  )
                }
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {promptCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                Copy All
              </button>
            </div>
            <div className="rounded-lg bg-black p-6">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[#58A6FF] opacity-80">
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
                        <h4 className="font-semibold" dangerouslySetInnerHTML={{ __html: `${highlightedHeader}:` }} />
                        {content.length > 0 && <p className="ml-4" dangerouslySetInnerHTML={{ __html: highlightedContent }} />}
                      </div>
                    );
                  }

                  const highlightedLine = highlightPromptKeys(line);

                  return <p key={index} dangerouslySetInnerHTML={{ __html: highlightedLine }} />;
                })}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptOutputTabs;
