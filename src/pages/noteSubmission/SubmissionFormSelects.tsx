import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteTypeEnum, NoteTypeLabels } from '@/constants/common';
import { getAgentModelOptions } from '@/utils/helper';
import { Agent } from '@/types/agent';

interface SubmissionFormSelectsProps {
  noteType: number;
  onNoteTypeChange: (value: number) => void;
  modelVersion: string;
  onModelVersionChange: (value: string) => void;
  selectedAgentId: number | null;
  onAgentChange: (value: number) => void;
  agents: Agent[];
}

const SubmissionFormSelects: React.FC<SubmissionFormSelectsProps> = ({
  noteType,
  onNoteTypeChange,
  modelVersion,
  onModelVersionChange,
  selectedAgentId,
  onAgentChange,
  agents,
}) => {
  const isNoteTypeDisabled = (type: number) => {
    return type !== NoteTypeEnum.progress_note;
  };

  return (
    <>
      {/* Note Type Select */}
      <div className="space-y-1">
        <Label className="text-sm text-gray-700">Note Type</Label>
        <Select value={String(noteType)} onValueChange={value => onNoteTypeChange(Number(value))}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select note type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(NoteTypeEnum).map(([key, value]) => (
              <SelectItem
                key={key}
                value={String(value)}
                disabled={isNoteTypeDisabled(value)}
                className={isNoteTypeDisabled(value) ? 'text-gray-400' : ''}
              >
                {NoteTypeLabels[value]}
                {isNoteTypeDisabled(value) && ' (Coming Soon)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Version Select */}
      <div className="space-y-1">
        <Label className="text-sm text-gray-700">Model Version</Label>
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
