import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AILog } from '@/types/aiLogs';
import { Copy, Check, Code, Zap } from 'lucide-react';

interface PromptOutputTabsProps {
  log: AILog;
}

type TabType = 'prompt' | 'output';

const PromptOutputTabs = ({ log }: PromptOutputTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompt');
  const [promptCopied, setPromptCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Button
          size="lg"
          onClick={() => setActiveTab('prompt')}
          className={`h-12 ${activeTab === 'prompt' ? 'bg-gradient-light text-primary' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
          <Code className="h-4 w-4" />
          Prompt (Raw Input)
        </Button>
        <Button
          size="lg"
          onClick={() => setActiveTab('output')}
          className={`h-12 ${activeTab === 'output' ? 'bg-primary-light text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
        >
          <Zap className="h-4 w-4" />
          AI Output (Raw Response)
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Full Prompt Sent to Model</h4>
              <button
                onClick={() => copyToClipboard(activeTab === 'prompt' ? log.prompt : log.bedrockResponse?.raw_response || '')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {promptCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                Copy All
              </button>
            </div>
            <div className="rounded-lg bg-black p-6">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[#58A6FF] opacity-80">
                {activeTab === 'prompt' ? log.prompt : log.bedrockResponse?.raw_response || JSON.stringify(log.bedrockResponse, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptOutputTabs;
