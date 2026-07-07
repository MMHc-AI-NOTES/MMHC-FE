import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAgentModelOptions } from '@/utils/helper';
import { Agent } from '@/types/agent';

interface SubmissionFormSelectsProps {
  modelVersion: string;
  onModelVersionChange: (value: string) => void;
  selectedAgentId: number | null;
  onAgentChange: (value: number) => void;
  agents: Agent[];
}

const SubmissionFormSelects: React.FC<SubmissionFormSelectsProps> = ({
  modelVersion,
  onModelVersionChange,
  selectedAgentId,
  onAgentChange,
  agents,
}) => {
  return (
    <>
      {/* Model Version Select */}
      <div className="space-y-1">
        <Label className="text-sm text-gray-700">Model Versionfdhvbvh</Label>
        <Select value={modelVersion} onValueChange={value => onModelVersionChange(value)}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select model version" />
          </SelectTrigger>
          <SelectContent>
            {getAgentModelOptions().map(model => (
              <SelectItem key={model.key} value={model.value}>
                {model.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompt Agent Select */}
      <div className="space-y-1">
        <Label className="text-sm text-gray-700">Prompt Agent</Label>
        <Select value={String(selectedAgentId || '')} onValueChange={value => onAgentChange(Number(value))}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select prompt agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={String(agent.id)}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default SubmissionFormSelects;
