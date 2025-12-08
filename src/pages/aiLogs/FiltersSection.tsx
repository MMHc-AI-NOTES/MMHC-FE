import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AGENT_MODEL_DISPLAY_NAMES, AGENT_MODEL_KEYS } from '@/constants';
import { Cpu, Code, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Agent } from '@/types/agent';
import { ChatResultEnum, ChatResultLabels, ChatSeverityEnum, ChatSeverityLabels } from '@/constants/common';
import { getEnumValues } from '@/utils/helper';

interface AILogsFilters {
  model: string;
  prompt: string;
  result: string;
  severity: string;
}

interface FiltersSectionProps {
  filters: AILogsFilters;
  agents: Agent[];
  loading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const modelOptions = Object.entries(AGENT_MODEL_KEYS).map(([key, value]) => ({
  key: key as keyof typeof AGENT_MODEL_KEYS,
  value,
  displayName: AGENT_MODEL_DISPLAY_NAMES[key as keyof typeof AGENT_MODEL_KEYS],
}));

export const FiltersSection = ({ filters, agents, loading, onFilterChange, onApplyFilters, onClearFilters }: FiltersSectionProps) => {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b px-4 pb-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Model Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Cpu className="h-4 w-4" />
            Model:
          </span>
          <Select value={filters.model} onValueChange={value => onFilterChange('model', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Versions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              {modelOptions.map(model => (
                <SelectItem key={model.key} value={model.value}>
                  {model.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Code className="h-4 w-4" />
            Prompt:
          </span>
          <Select value={filters.prompt} onValueChange={value => onFilterChange('prompt', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Prompts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prompts</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id.toString()}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <CheckCircle className="h-4 w-4" />
            Result:
          </span>
          <Select value={filters.result} onValueChange={value => onFilterChange('result', value)}>
            <SelectTrigger className="h-9 w-[130px] border-gray-200 bg-white">
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              {getEnumValues(ChatResultEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {ChatResultLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Severity:
          </span>
          <Select value={filters.severity} onValueChange={value => onFilterChange('severity', value)}>
            <SelectTrigger className="h-9 border-gray-200 bg-white">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {getEnumValues(ChatSeverityEnum).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {ChatSeverityLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Apply and Reset Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={onApplyFilters} disabled={loading} size="lg">
          Apply
        </Button>
        <Button variant="ghost" size="lg" onClick={onClearFilters} disabled={loading} className="text-muted-foreground">
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};
