import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';
import { Save, ShieldCheck, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
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
  const user = useAppSelector(state => state.auth.user);
  const [aiIssueVotes, setAiIssueVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [aiIssueFeedback, setAiIssueFeedback] = useState<Record<string, string>>({});
  const [savedAiIssueFeedback, setSavedAiIssueFeedback] = useState<Record<string, string>>({});
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState<Record<string, boolean>>({});
  const [deleteFeedbackIssueKey, setDeleteFeedbackIssueKey] = useState<string | null>(null);

  if (aiIssues.length === 0 && smeIssues.length === 0) return null;

  const hasCriticalAiIssue = aiIssues.some(issue => issue.severity === 'CRITICAL');
  const canManageSmeIssues = Boolean(noteId && versionId);
  const getAiIssueKey = (issue: NoteDetail['issues'][number], index: number) => `${issue.sectionId || issue.category || 'ai'}-${index}`;

  const clearIssueVoteState = (issueKey: string) => {
    setAiIssueVotes(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
    setAiIssueFeedback(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
    setIsFeedbackFormOpen(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
  };

  const handleVote = (issueKey: string, vote: 'up' | 'down') => {
    if (vote === 'up') {
      setAiIssueVotes(prev => {
        if (prev[issueKey] === 'up') {
          const next = { ...prev };
          delete next[issueKey];
          return next;
        }
        return { ...prev, [issueKey]: 'up' };
      });
      setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
      return;
    }

    setAiIssueVotes(prev => ({ ...prev, [issueKey]: 'down' }));
    setAiIssueFeedback(prev => ({ ...prev, [issueKey]: prev[issueKey] ?? savedAiIssueFeedback[issueKey] ?? '' }));
    setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: true }));
  };

  const handleCancelFeedback = (issueKey: string) => {
    const savedFeedback = savedAiIssueFeedback[issueKey];
    setIsFeedbackFormOpen(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });

    if (savedFeedback) {
      setAiIssueFeedback(prev => ({ ...prev, [issueKey]: savedFeedback }));
      setAiIssueVotes(prev => ({ ...prev, [issueKey]: 'down' }));
      return;
    }

    clearIssueVoteState(issueKey);
  };

  const handleSaveFeedback = (issueKey: string) => {
    const feedback = (aiIssueFeedback[issueKey] || '').trim();
    if (!feedback) return;
    setSavedAiIssueFeedback(prev => ({ ...prev, [issueKey]: feedback }));
    setAiIssueVotes(prev => ({ ...prev, [issueKey]: 'down' }));
    setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
  };

  const handleConfirmDeleteFeedback = () => {
    if (!deleteFeedbackIssueKey) return;
    clearIssueVoteState(deleteFeedbackIssueKey);
    setSavedAiIssueFeedback(prev => {
      const next = { ...prev };
      delete next[deleteFeedbackIssueKey];
      return next;
    });
    setDeleteFeedbackIssueKey(null);
  };

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
          {aiIssues.map((issue, index) => {
            const issueKey = getAiIssueKey(issue, index);
            const vote = aiIssueVotes[issueKey];
            const feedbackText = aiIssueFeedback[issueKey] || '';
            const savedFeedbackText = savedAiIssueFeedback[issueKey];
            const showFeedbackForm = vote === 'down' && isFeedbackFormOpen[issueKey];

            return (
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

                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-500">Was this helpful?</p>
                    <button
                      type="button"
                      className={`rounded-md p-1.5 transition-colors ${
                        vote === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      onClick={() => handleVote(issueKey, 'up')}
                      aria-label="Mark issue as helpful"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`rounded-md p-1.5 transition-colors ${
                        vote === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      onClick={() => handleVote(issueKey, 'down')}
                      aria-label="Mark issue as unhelpful"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>

                  {savedFeedbackText && !showFeedbackForm && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900">Reviewer: {user?.fullName?.trim() || 'Current User'}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-gray-600"
                          onClick={() => setDeleteFeedbackIssueKey(issueKey)}
                          title="Delete feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 rounded-sm bg-red-50 p-3 text-sm text-gray-700">{savedFeedbackText}</div>
                    </div>
                  )}

                  {showFeedbackForm && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="mb-3 text-sm font-semibold text-gray-700">Send Feedback</p>
                      <Textarea
                        value={feedbackText}
                        onChange={e => setAiIssueFeedback(prev => ({ ...prev, [issueKey]: e.target.value }))}
                        placeholder="Please let us know why you found this issue unhelpful. Your feedback helps us improve."
                        className="min-h-[74px] bg-white"
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleCancelFeedback(issueKey)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-200 text-green-700 hover:bg-green-200/80"
                          onClick={() => handleSaveFeedback(issueKey)}
                          disabled={!feedbackText.trim()}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

      <ConfirmationDialog
        isOpen={deleteFeedbackIssueKey != null}
        onOpenChange={open => {
          if (!open) setDeleteFeedbackIssueKey(null);
        }}
        onConfirm={handleConfirmDeleteFeedback}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
}
