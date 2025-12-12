import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit } from 'lucide-react';
import { EmailTemplate } from '@/types/settings';
import AvailableVariablesSection from './AvailableVariablesSection';
import { AvailableVariable } from '@/types/settings';

interface EmailTemplatesSectionProps {
  emailTemplates: EmailTemplate[];
  availableVariables: AvailableVariable[];
  onAddTemplate: () => void;
  onEditTemplate: (template: EmailTemplate) => void;
}

const EmailTemplatesSection: React.FC<EmailTemplatesSectionProps> = ({
  emailTemplates,
  availableVariables,
  onAddTemplate,
  onEditTemplate,
}) => {
  return (
    <Card className="border p-2">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-primary text-lg font-semibold">Email Templates</h3>
          <Button onClick={onAddTemplate} size="lg" className="bg-gradient-light text-primary border-0 shadow-sm">
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-gray-50/50">
                <TableHead className="text-primary text-left">TEMPLATE NAME</TableHead>
                <TableHead className="text-primary text-left">SUBJECT</TableHead>
                <TableHead className="text-primary text-left">LAST MODIFIED</TableHead>
                <TableHead className="text-primary">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates.map((template, index) => (
                <TableRow key={template.id} className={index === emailTemplates.length - 1 ? 'border-b-0' : ''}>
                  <TableCell className="text-left">{template.name}</TableCell>
                  <TableCell className="text-left text-gray-500">{template.subject}</TableCell>
                  <TableCell className="text-left text-gray-500">{template.lastModified}</TableCell>
                  <TableCell>
                    <Button variant="ghost" className="text-primary" size="sm" onClick={() => onEditTemplate(template)}>
                      <Edit />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AvailableVariablesSection variables={availableVariables} />
      </CardContent>
    </Card>
  );
};

export default EmailTemplatesSection;
