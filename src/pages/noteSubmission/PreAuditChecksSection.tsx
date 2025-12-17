import React from 'react';
import { Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PreAuditCheckResult } from '@/types/noteSubmission';
import { PreAuditCheckStatusEnum, StructureQualityLabels, StructureQualityEnum } from '@/constants/common';

interface PreAuditChecksSectionProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  preAuditResults: PreAuditCheckResult | null;
}

const PreAuditChecksSection: React.FC<PreAuditChecksSectionProps> = ({ isExpanded, setIsExpanded, preAuditResults }) => {
  const getStatusIcon = (status: number) => {
    if (status === PreAuditCheckStatusEnum.passed) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
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

  return (
    <div className="rounded-lg border bg-white">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex w-full items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">Pre-Audit Checks</span>
          {preAuditResults && (
            <Badge variant={getOverallBadgeVariant(preAuditResults.overallStatus)}>
              {StructureQualityLabels[preAuditResults.overallStatus]}
            </Badge>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </button>

      {isExpanded && preAuditResults && (
        <div className="space-y-3 border-t px-4 pt-3 pb-4">
          {preAuditResults.checks.map(check => (
            <div key={check.id} className="flex items-start gap-2">
              {getStatusIcon(check.status)}
              <div>
                <p className={`text-sm font-medium ${getStatusColor(check.status)}`}>{check.name}</p>
                {check.description && <p className="text-xs text-gray-500">{check.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreAuditChecksSection;
