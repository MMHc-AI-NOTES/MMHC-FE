// @/components/aiLogs/AILogsTable.tsx
import { ChevronDown, AlertTriangle, Info, Database, CircleCheckBig, CircleX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GradientBadge } from '@/shared/GradientBadge';
import { AILog } from '@/types/aiLogs';
import { getResultStatus } from './aiLogsApiCalls';
import { getModelDisplayName, formatDateTime } from '@/utils/helper';

interface AILogsTableProps {
  logs: AILog[];
  selectedLogId: number | null;
  onSelectLog: (log: AILog) => void;
}

// Helper to get gradient class for Result column
const getResultGradient = (result: 'pass' | 'fail' | 'error'): string => {
  switch (result) {
    case 'pass':
      return 'bg-gradient-result-pass';
    case 'fail':
      return 'bg-gradient-result-fail';
    case 'error':
      return 'bg-gradient-result-error';
    default:
      return 'bg-gradient-neutral';
  }
};

// Helper to get gradient class for Severity column
const getSeverityGradient = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'minor':
      return 'bg-gradient-severity-minor';
    case 'moderate':
      return 'bg-gradient-severity-moderate';
    case 'critical':
      return 'bg-gradient-severity-critical';
    default:
      return 'bg-gradient-neutral';
  }
};

// Helper to get result icon
const getResultIcon = (result: 'pass' | 'fail' | 'error') => {
  switch (result) {
    case 'pass':
      return <CircleCheckBig className="h-4 w-4" />;
    case 'fail':
      return <CircleX className="h-4 w-4" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

// Helper to get severity icon
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'minor':
      return <Info className="h-4 w-4" />;
    case 'moderate':
      return <AlertTriangle className="h-4 w-4" />;
    case 'critical':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

export const AILogsTable = ({ logs, selectedLogId, onSelectLog }: AILogsTableProps) => {
  if (logs.length === 0) {
    return (
      <div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent!">
              <TableRow>
                <TableHead className="text-primary min-w-[100px] font-semibold">LOG ID</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
                <TableHead className="text-primary min-w-[130px] font-semibold">MODEL VERSION</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">PROMPT VERSION</TableHead>
                <TableHead className="text-primary min-w-[160px] font-semibold">TIMESTAMP</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">RESULT</TableHead>
                <TableHead className="text-primary min-w-[100px] font-semibold">SEVERITY</TableHead>
                <TableHead className="text-primary min-w-[120px] font-semibold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                  No logs found matching your filters.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-transparent!">
            <TableRow>
              <TableHead className="text-primary min-w-[100px] font-semibold">LOG ID</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">NOTE ID</TableHead>
              <TableHead className="text-primary min-w-[130px] font-semibold">MODEL VERSION</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">PROMPT VERSION</TableHead>
              <TableHead className="text-primary min-w-[160px] font-semibold">TIMESTAMP</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">RESULT</TableHead>
              <TableHead className="text-primary min-w-[100px] font-semibold">SEVERITY</TableHead>
              <TableHead className="text-primary min-w-[120px] font-semibold">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => {
              const result = getResultStatus(log.evaluationScore);
              const severity = log.severity?.name || '-';
              const isSelected = selectedLogId === log.id;

              return (
                <TableRow
                  key={log.id}
                  className={`cursor-pointer transition-colors hover:bg-green-50 ${isSelected && 'bg-green-50'}`}
                  onClick={() => onSelectLog(log)}
                >
                  <TableCell className="text-sm font-medium text-gray-900">{log.id}</TableCell>
                  <TableCell className="text-sm text-gray-600">{log.noteId || '-'}</TableCell>
                  <TableCell>
                    <GradientBadge
                      label={getModelDisplayName(log.modelId)}
                      gradient="bg-gradient-blue"
                      icon={<Database className="h-4 w-4" />}
                      className="rounded-[6px] text-[#0369a1]!"
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{log.agent?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <GradientBadge
                      label={result === 'pass' ? 'Pass' : result === 'fail' ? 'Fail' : 'Error'}
                      gradient={getResultGradient(result)}
                      icon={getResultIcon(result)}
                      className="rounded-[6px]"
                    />
                  </TableCell>
                  <TableCell>
                    <GradientBadge
                      label={severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()}
                      gradient={getSeverityGradient(severity)}
                      icon={getSeverityIcon(severity)}
                      className="rounded-[6px]"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                    >
                      View Details
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
