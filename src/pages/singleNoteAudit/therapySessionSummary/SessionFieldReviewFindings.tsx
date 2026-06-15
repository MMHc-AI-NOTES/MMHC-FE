import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import type { NoteDetail, SMEIssue, WebhookVersion } from '@/types/notes';
import { SmeIssueFindingItem } from './SmeIssueFindingItem';
import { getSmeIssueDescription, getSmeIssueTitle } from './sessionFieldUtils';

interface SessionFieldReviewFindingsProps {
  fieldKey: string;
  aiIssues: NoteDetail['issues'];
  smeIssues: SMEIssue[];
  noteId?: string;
  versionId?: number | null;
  practitionerId?: number;
  aiStatusId?: number;
  priorityId?: number;
  webhookVersions?: WebhookVersion[];
  readOnly?: boolean;
  loggedInUserId?: number | null;
  alreadyUsedDescriptionIds?: number[];
  onSMEIssueDeleted?: (versionId: number, smeIssueId: number) => void;
  onSMEIssueUpdated?: (
    versionId: number,
    smeIssueId: number,
    payload: { issueDescriptionId?: number; issueDescriptionText?: string; comment?: string },
  ) => void;
}

const getAiSeverityClass = (severity: NoteDetail['issues'][number]['severity']) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-gradient-red';
    case 'MODERATE':
      return 'bg-gradient-severity-moderate';
    default:
      return 'bg-gradient-severity-minor';
  }
};

const getAiBorderClass = (severity: NoteDetail['issues'][number]['severity']) => {
  switch (severity) {
    case 'CRITICAL':
      return 'border-red-200 bg-red-50/40';
    case 'MODERATE':
      return 'border-orange-200 bg-orange-50/40';
    default:
      return 'border-yellow-200 bg-yellow-50/40';
  }
};

export function SessionFieldReviewFindings({
  fieldKey,
  aiIssues,
  smeIssues,
  noteId,
  versionId,
  practitionerId = 0,
  aiStatusId = 1,
  priorityId = 1,
  webhookVersions = [],
  readOnly = false,
  loggedInUserId = null,
  alreadyUsedDescriptionIds = [],
  onSMEIssueDeleted,
  onSMEIssueUpdated,
}: SessionFieldReviewFindingsProps) {
  if (aiIssues.length === 0 && smeIssues.length === 0) return null;

  const hasCriticalAiIssue = aiIssues.some(issue => issue.severity === 'CRITICAL');
  const canManageSmeIssues = Boolean(noteId && versionId);

  return (
    <div className="border-t border-gray-200 px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="text-primary h-4 w-4" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          {hasCriticalAiIssue ? 'Critical Review Findings' : 'Review Findings'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          {aiIssues.map((issue, index) => (
            <div key={`ai-${index}`} className={`rounded-lg border p-3 ${getAiBorderClass(issue.severity)}`}>
              <div className="flex items-start gap-2">
                <Badge
                  className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold text-white uppercase ${getAiSeverityClass(issue.severity)}`}
                >
                  AI {issue.severity} (-{issue.points})
                </Badge>
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{issue.description}</p>
                  {issue.justification && <p className="text-xs leading-relaxed text-gray-600">{issue.justification}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {smeIssues.map(issue =>
            canManageSmeIssues ? (
              <SmeIssueFindingItem
                key={`sme-${issue.id}`}
                issue={issue}
                fieldKey={fieldKey}
                noteId={noteId!}
                versionId={versionId!}
                practitionerId={practitionerId}
                aiStatusId={aiStatusId}
                priorityId={priorityId}
                webhookVersions={webhookVersions}
                readOnly={readOnly}
                loggedInUserId={loggedInUserId}
                alreadyUsedDescriptionIds={alreadyUsedDescriptionIds}
                onSMEIssueDeleted={onSMEIssueDeleted}
                onSMEIssueUpdated={onSMEIssueUpdated}
              />
            ) : (
              <div key={`sme-${issue.id}`} className="rounded-lg border border-green-200 bg-green-50/30 p-3">
                <Badge className="bg-primary mb-2 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">SME Action</Badge>
                <p className="text-sm font-semibold text-gray-900">{getSmeIssueTitle(issue)}</p>
                <p className="text-xs leading-relaxed text-gray-600">{getSmeIssueDescription(issue)}</p>
                {issue.comment?.trim() && (
                  <div className="mt-2 rounded-md border-l-2 border-green-600 bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase">Practitioner Reply</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700 italic">&ldquo;{issue.comment.trim()}&rdquo;</p>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
