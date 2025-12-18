import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PreAuditCheckResult } from '@/types/noteSubmission';
import { PreAuditCheckStatusEnum, StructureQualityLabels, StructureQualityEnum } from '@/constants/common';

interface PreAuditChecksSectionProps {
  preAuditResults: PreAuditCheckResult | null;
}

const PreAuditChecksSection: React.FC<PreAuditChecksSectionProps> = ({ preAuditResults }) => {
  const getStatusIcon = (status: number) => {
    if (status === PreAuditCheckStatusEnum.passed) {
      return <div className="text-green-600">✓</div>;
    }
    return <div className="text-orange-500">!</div>;
  };

  const getStatusColor = (status: number) => {
    if (status === PreAuditCheckStatusEnum.passed) {
      return 'text-green-600';
    }
    return 'text-orange-500';
  };

  const getOverallBadgeVariant = (status: number | undefined) => {
    if (!status) return 'outline';
    if (status === StructureQualityEnum.strong) return 'default';
    if (status === StructureQualityEnum.moderate) return 'warning';
    return 'warning';
  };

  // Dummy data when no results
  const dummyResults: PreAuditCheckResult = {
    overallStatus: StructureQualityEnum.moderate,
    checks: [
      {
        id: 'phi-check',
        name: 'No PHI Detected',
        status: PreAuditCheckStatusEnum.passed,
      },
      {
        id: 'length-check',
        name: 'Length Check Warning',
        status: PreAuditCheckStatusEnum.warning,
        description: 'No content to analyze',
      },
      {
        id: 'structure-check',
        name: 'Structure Needs Improvement',
        status: PreAuditCheckStatusEnum.warning,
      },
    ],
  };

  const displayResults =
    !preAuditResults || !preAuditResults.checks || preAuditResults.checks.length === 0 ? dummyResults : preAuditResults;

  return (
    <div className="rounded-xl bg-white shadow">
      <Accordion type="single" collapsible defaultValue="pre-audit-checks">
        <AccordionItem value="pre-audit-checks" className="border-0">
          <AccordionTrigger className="px-4 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">Pre-Audit Checks</span>
              {displayResults && (
                <Badge variant={getOverallBadgeVariant(displayResults.overallStatus)}>
                  {StructureQualityLabels[displayResults.overallStatus]}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-3 pt-3 pb-4">
              {displayResults?.checks.map(check => (
                <div key={check.id} className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      check.status === PreAuditCheckStatusEnum.passed ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${getStatusColor(check.status)}`}>{check.name}</p>
                    {check.description && <p className="text-xs text-gray-500">{check.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PreAuditChecksSection;
