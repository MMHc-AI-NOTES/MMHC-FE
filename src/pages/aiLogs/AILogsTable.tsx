// @/components/aiLogs/AILogsTable.tsx
import { ChevronDown, AlertTriangle, Info, Database, CircleCheckBig, CircleX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AILog } from '@/types/aiLogs';
import moment from 'moment';
import { getResultStatus, getSeverity } from './aiLogsApiCalls';

interface AILogsTableProps {
  logs: AILog[];
  selectedLogId: number | null;
  onSelectLog: (log: AILog) => void;
}

// Helper to get badge styling for Result column
const getResultBadgeStyle = (result: 'pass' | 'fail' | 'error') => {
  switch (result) {
    case 'pass':
      return 'bg-green-light text-green border-green';
    case 'fail':
      return 'bg-orange-light text-orange border-orange';
    case 'error':
      return 'bg-red-light text-red border-red';
    default:
      return 'bg-gray-light text-gray border-gray';
  }
};

// Helper to get badge styling for Severity column
const getSeverityBadgeStyle = (severity: 'info' | 'warning' | 'error') => {
  switch (severity) {
    case 'info':
      return 'bg-blue-light text-blue border-blue';
    case 'warning':
      return 'bg-orange-light text-orange border-orange';
    case 'error':
      return 'bg-red-light text-red border-red';
    default:
      return 'bg-gray-light text-gray border-gray';
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
const getSeverityIcon = (severity: 'info' | 'warning' | 'error') => {
  switch (severity) {
    case 'info':
      return <Info className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return null;
  }
};

// Format model version badge with color
const getModelVersionBadge = (modelId: string) => {
  return (
    <Badge className="text-blue bg-blue-light gap-2 rounded-[6px] [&>svg]:!size-4">
      <Database className="h-4 w-4" />
      {modelId}
    </Badge>
  );
};

export const AILogsTable = ({ logs, selectedLogId, onSelectLog }: AILogsTableProps) => {
  if (logs.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-primary min-w-[100px] font-medium">Log ID</TableHead>
                <TableHead className="text-primary min-w-[100px] font-medium">Note ID</TableHead>
                <TableHead className="text-primary min-w-[130px] font-medium">Model Version</TableHead>
                <TableHead className="text-primary min-w-[120px] font-medium">Prompt Version</TableHead>
                <TableHead className="text-primary min-w-[160px] font-medium">Timestamp</TableHead>
                <TableHead className="text-primary min-w-[100px] font-medium">Result</TableHead>
                <TableHead className="text-primary min-w-[100px] font-medium">Severity</TableHead>
                <TableHead className="text-primary min-w-[120px] font-medium">Action</TableHead>
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
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="text-primary min-w-[100px] font-medium">Log ID</TableHead>
              <TableHead className="text-primary min-w-[100px] font-medium">Note ID</TableHead>
              <TableHead className="text-primary min-w-[130px] font-medium">Model Version</TableHead>
              <TableHead className="text-primary min-w-[120px] font-medium">Prompt Version</TableHead>
              <TableHead className="text-primary min-w-[160px] font-medium">Timestamp</TableHead>
              <TableHead className="text-primary min-w-[100px] font-medium">Result</TableHead>
              <TableHead className="text-primary min-w-[100px] font-medium">Severity</TableHead>
              <TableHead className="text-primary min-w-[120px] font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => {
              const result = getResultStatus(log.evaluationScore);
              const severity = getSeverity(log.bedrockResponse);
              const isSelected = selectedLogId === log.id;

              return (
                <TableRow
                  key={log.id}
                  className={`cursor-pointer transition-colors hover:bg-green-50 ${isSelected && 'bg-green-50'}`}
                  onClick={() => onSelectLog(log)}
                >
                  <TableCell className="text-sm font-medium text-gray-900">LOG-{log.id}</TableCell>
                  <TableCell className="text-sm text-gray-600">{log.noteId?.slice(0, 8) || '-'}</TableCell>
                  <TableCell>{getModelVersionBadge(log.modelId)}</TableCell>
                  <TableCell className="text-sm text-gray-600">P-2.1</TableCell>
                  <TableCell className="text-sm text-gray-600">{moment(log.createdAt).format('MMM D, YYYY – h:mm A')}</TableCell>
                  <TableCell>
                    <Badge className={`gap-2 rounded-[6px] border capitalize [&>svg]:!size-4 ${getResultBadgeStyle(result)}`}>
                      {getResultIcon(result)}
                      {result === 'pass' ? 'Pass' : result === 'fail' ? 'Fail' : 'Error'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`gap-2 rounded-[6px] border capitalize [&>svg]:!size-4 ${getSeverityBadgeStyle(severity)}`}>
                      {getSeverityIcon(severity)}
                      {severity === 'info' ? 'Info' : severity === 'warning' ? 'Warning' : 'Error'}
                    </Badge>
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
