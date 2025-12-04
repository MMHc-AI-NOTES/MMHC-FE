import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AILog } from '@/types/aiLogs';
import { Agent } from '@/types/agent';
import { FileText, Hash, Database, Code, Clock, Activity, Calendar, Zap, HelpCircle } from 'lucide-react';
import moment from 'moment';
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';
import { cn } from '@/lib/utils';

interface LogDetailsCardProps {
  log: AILog;
  agents: Agent[];
}

const LogDetailsCard = ({ log, agents }: LogDetailsCardProps) => {
  const getModelDisplayName = (modelId: string): string => {
    const modelEntry = Object.entries(AGENT_MODEL_KEYS).find(([, value]) => value === modelId);
    return modelEntry ? AGENT_MODEL_DISPLAY_NAMES[modelEntry[0] as keyof typeof AGENT_MODEL_KEYS] : modelId;
  };

  const modelDisplayName = getModelDisplayName(log.modelId);
  const defaultAgent = agents.find(a => a.is_default === 1) || agents[0];

  const getConfidenceLevel = (score: number) => {
    if (score >= 95) {
      return { label: 'High (95-100)', percentage: score, range: 'high' };
    }
    if (score >= 70) {
      return { label: 'Medium (70-94)', percentage: score, range: 'medium' };
    }
    return { label: 'Low (0-69)', percentage: score, range: 'low' };
  };

  const confidence = getConfidenceLevel(log.evaluationScore);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-primary mb-6 flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5" />
          Log Details
        </h3>

        <div className="space-y-4 divide-y divide-gray-200 border-t py-4">
          <div>
            {/* Log ID */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Hash className="h-4 w-4" />
                <span className="text-sm">Log ID:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">LOG-{log.id}</span>
            </div>

            {/* Note ID */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Note ID:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{log.noteId || '-'}</span>
            </div>
          </div>
          <div>
            {/* Model Version */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Database className="h-4 w-4" />
                <span className="text-sm">Model Version:</span>
              </div>
              <Badge className="bg-blue-light text-blue gap-1.5 rounded-md [&>svg]:!size-3">
                <Database className="h-3 w-3" />
                {modelDisplayName}
              </Badge>
            </div>

            {/* Prompt Agent */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Code className="h-4 w-4" />
                <span className="text-sm">Prompt Agent:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{defaultAgent?.name || 'N/A'}</span>
            </div>
          </div>
          <div>
            {/* Runtime */}
            <div className="flex items-center justify-between py-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-help items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <HelpCircle className="h-3 w-3" />
                      <span className="text-sm">Runtime:</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>The total time taken for the AI model to process and return the evaluation result.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm font-medium text-gray-900">{log.responseTime?.toFixed(1) || '-'}s</span>
            </div>

            {/* AI Confidence */}
            <div className="py-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mb-2 flex cursor-help items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Activity className="h-4 w-4" />
                        <HelpCircle className="h-3 w-3" />
                        <span className="text-sm">AI Confidence:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{confidence.label.split(' ')[0]}</span>
                        <span className="text-sm font-semibold text-gray-900">{confidence.percentage}%</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    <p>
                      The AI's confidence level in its evaluation score. Higher confidence (95-100%) indicates more reliable assessments,
                      while lower confidence (0-69%) suggests the evaluation may need human review.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="ml-6 space-y-1.5">
                <Progress
                  value={confidence.percentage}
                  className={cn(
                    'h-2',
                    confidence.range === 'high' && '[&>div]:bg-green-500',
                    confidence.range === 'medium' && '[&>div]:bg-[#D97706]',
                    confidence.range === 'low' && '[&>div]:bg-red-500',
                  )}
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Low (0-69)</span>
                  <span>Medium (70-94)</span>
                  <span>High (95-100)</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            {/* Timestamp */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Timestamp:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{moment(log.createdAt).format('MMM D, YYYY – h:mm A')}</span>
            </div>

            {/* Trigger Source */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Trigger Source:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Re-run</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogDetailsCard;
