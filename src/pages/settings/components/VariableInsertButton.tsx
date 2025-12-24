import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { AvailableVariable } from '@/types/settings';

interface VariableInsertButtonProps {
  field: 'subject' | 'body';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (variable: string, field: 'subject' | 'body') => void;
  availableVariables: AvailableVariable[];
}

const VariableInsertButton: React.FC<VariableInsertButtonProps> = ({ field, isOpen, onOpenChange, onInsert, availableVariables }) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(true)} className="rounded text-gray-700">
          <Plus className="h-4 w-4" />
          Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" avoidCollisions={false}>
        <div className="space-y-2">
          {availableVariables.map(variable => (
            <Button
              key={variable.id}
              variant="ghost"
              size="sm"
              type="button"
              className="w-full justify-start"
              onClick={() => {
                onInsert(variable.name, field);
                onOpenChange(false);
              }}
            >
              {variable.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VariableInsertButton;
