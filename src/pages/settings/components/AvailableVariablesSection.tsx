import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AvailableVariable } from '@/types/settings';

interface AvailableVariablesSectionProps {
  variables: AvailableVariable[];
}

const AvailableVariablesSection: React.FC<AvailableVariablesSectionProps> = ({ variables }) => {
  return (
    <Card className="border-primary/40 mt-10 border bg-green-50 py-5">
      <CardContent className="px-6">
        <h3 className="text-primary text-md mb-4 font-medium">Available Variables</h3>
        <div className="flex flex-wrap gap-2">
          {variables.map(variable => (
            <Button key={variable.id} variant="outline" size="sm" className="border-primary/40 text-primary bg-card h-8 px-4 text-xs">
              {variable.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableVariablesSection;
