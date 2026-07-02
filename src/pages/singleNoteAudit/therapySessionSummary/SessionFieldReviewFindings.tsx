import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';
import { BookOpenCheck, HatGlasses, Save, ShieldCheck, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import type { NoteDetail, SMEIssue, WebhookVersion } from '@/types/notes';
import { SmeIssueFindingItem } from './SmeIssueFindingItem';
import { getSmeIssueDescription, getSmeIssueTitle } from './sessionFieldUtils';
import axios from 'axios';
import { showToast } from '@/lib/toast';
import { handleCatchMessages } from '@/utils/helper';
import { FeedbackVerdictEnum } from '@/constants/common';

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
  scorerVersion?: string;
  sessionId?: string;
  feedbackVerdicts?: any[];
  onFeedbackChanged?: () => void;
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
  feedbackVerdicts = [],
  onFeedbackChanged,
}: SessionFieldReviewFindingsProps) {
  const getAiIssueKey = (issue: NoteDetail['issues'][number], index: number) => `${issue.sectionId || issue.category || 'ai'}-${index}`;

  const user = useAppSelector(state => state.auth.user);
  const [aiIssueVotes, setAiIssueVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [aiIssueFeedback, setAiIssueFeedback] = useState<Record<string, string>>({});
  const [savedAiIssueFeedback, setSavedAiIssueFeedback] = useState<Record<string, string>>({});
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState<Record<string, boolean>>({});
  const [deleteFeedbackIssueKey, setDeleteFeedbackIssueKey] = useState<string | null>(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState<Record<string, boolean>>({});
  const [aiIssueFeedbackIds, setAiIssueFeedbackIds] = useState<Record<string, number>>({});
  const [aiIssueReviewers, setAiIssueReviewers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!feedbackVerdicts || !Array.isArray(feedbackVerdicts)) return;

    const initialVotes: Record<string, 'up' | 'down'> = {};
    const initialFeedback: Record<string, string> = {};
    const initialIds: Record<string, number> = {};
    const initialReviewers: Record<string, string> = {};

    aiIssues.forEach((issue, index) => {
      const issueKey = getAiIssueKey(issue, index);

      // Find matching feedback verdict for this issue and current reviewer
      const match = feedbackVerdicts.find(v => {
        if (user?.fullName && v.by && v.by.trim().toLowerCase() !== user.fullName.trim().toLowerCase()) {
          return false;
        }

        return (
          v.code === issue.descriptionId ||
          v.description_id === issue.descriptionId ||
          v.code === issue.sectionId ||
          v.description_id === issue.sectionId
        );
      });

      if (match) {
        const mappedVerdict = match.verdict === 1 || match.verdict === '1' || match.verdict === 'up' ? 'up' : 'down';
        initialVotes[issueKey] = mappedVerdict;
        initialIds[issueKey] = match.id;
        initialReviewers[issueKey] = match.by || '';
        if (mappedVerdict === 'down' && match.comment && match.comment !== 'null') {
          initialFeedback[issueKey] = match.comment;
        }
      }
    });

    setAiIssueVotes(initialVotes);
    setSavedAiIssueFeedback(initialFeedback);
    setAiIssueFeedbackIds(initialIds);
    setAiIssueReviewers(initialReviewers);
  }, [feedbackVerdicts, aiIssues, loggedInUserId, user]);

  if (aiIssues.length === 0 && smeIssues.length === 0) return null;

  const hasCriticalAiIssue = aiIssues.some(issue => issue.severity === 'CRITICAL');
  const canManageSmeIssues = Boolean(noteId && versionId);

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

  const handleVote = async (issueKey: string, vote: 'up' | 'down', issue: NoteDetail['issues'][number]) => {
    if (vote === 'up') {
      const isCurrentlyUp = aiIssueVotes[issueKey] === 'up';
      if (isCurrentlyUp) {
        setAiIssueVotes(prev => {
          const next = { ...prev };
          delete next[issueKey];
          return next;
        });
        setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
        return;
      }

      try {
        const payload = {
          note_id: noteId || '',
          description_id: issue.descriptionId || issue.sectionId || '',
          verdict: FeedbackVerdictEnum.UP,
          comment: 'null',
        };

        const res: any = await axios.post('/feedback', payload);
        showToast.success('Feedback submitted successfully');

        const feedbackId = res?.id || res?.verdicts?.[0]?.id || res?.feedbackVerdict?.id || res?.feedbackVerdicts?.[0]?.id || res?.data?.id;
        if (feedbackId) {
          setAiIssueFeedbackIds(prev => ({ ...prev, [issueKey]: feedbackId }));
        }
        setAiIssueReviewers(prev => ({ ...prev, [issueKey]: user?.fullName || 'Current User' }));

        setAiIssueVotes(prev => ({ ...prev, [issueKey]: 'up' }));
        setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
        onFeedbackChanged?.();
      } catch (error) {
        handleCatchMessages(error);
      }
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

  const handleSaveFeedback = async (issueKey: string, issue: NoteDetail['issues'][number]) => {
    const feedback = (aiIssueFeedback[issueKey] || '').trim();
    if (!feedback) return;

    setIsSavingFeedback(prev => ({ ...prev, [issueKey]: true }));
    try {
      const payload = {
        note_id: noteId || '',
        description_id: issue.descriptionId || issue.sectionId || '',
        verdict: FeedbackVerdictEnum.DOWN,
        comment: feedback,
      };

      const res: any = await axios.post('/feedback', payload);
      showToast.success('Feedback submitted successfully');

      const feedbackId = res?.id || res?.verdicts?.[0]?.id || res?.feedbackVerdict?.id || res?.feedbackVerdicts?.[0]?.id || res?.data?.id;
      if (feedbackId) {
        setAiIssueFeedbackIds(prev => ({ ...prev, [issueKey]: feedbackId }));
      }
      setAiIssueReviewers(prev => ({ ...prev, [issueKey]: user?.fullName || 'Current User' }));

      setSavedAiIssueFeedback(prev => ({ ...prev, [issueKey]: feedback }));
      setAiIssueVotes(prev => ({ ...prev, [issueKey]: 'down' }));
      setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
      onFeedbackChanged?.();
    } catch (error) {
      handleCatchMessages(error);
    } finally {
      setIsSavingFeedback(prev => ({ ...prev, [issueKey]: false }));
    }
  };

  const handleConfirmDeleteFeedback = async () => {
    if (!deleteFeedbackIssueKey) return;
    const feedbackId = aiIssueFeedbackIds[deleteFeedbackIssueKey];

    if (feedbackId) {
      try {
        await axios.delete(`/feedback/${feedbackId}`);
        showToast.success('Feedback deleted successfully');
      } catch (error) {
        handleCatchMessages(error);
        return;
      }
    }

    clearIssueVoteState(deleteFeedbackIssueKey);
    setSavedAiIssueFeedback(prev => {
      const next = { ...prev };
      delete next[deleteFeedbackIssueKey];
      return next;
    });
    setAiIssueFeedbackIds(prev => {
      const next = { ...prev };
      delete next[deleteFeedbackIssueKey];
      return next;
    });
    setAiIssueReviewers(prev => {
      const next = { ...prev };
      delete next[deleteFeedbackIssueKey];
      return next;
    });
    setDeleteFeedbackIssueKey(null);
    onFeedbackChanged?.();
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
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold text-gray-900">{issue.description}</p>
                    {issue.justification && (
                      <div className="mt-1 -ml-5 flex items-start gap-1.5">
                        <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <p className="text-xs leading-relaxed text-gray-600">{issue.justification}</p>
                      </div>
                    )}
                    {issue.evidence && (
                      <div className="mt-1 -ml-5 flex items-start gap-1.5">
                        <HatGlasses className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <p className="text-xs leading-relaxed text-gray-600">{issue.evidence}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-500">Was this helpful?</p>
                    <button
                      type="button"
                      disabled={vote === 'down' || Boolean(savedFeedbackText)}
                      className={`rounded-md p-1.5 transition-colors ${
                        vote === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'
                      } ${vote === 'down' || savedFeedbackText ? 'cursor-not-allowed opacity-50' : ''}`}
                      onClick={() => handleVote(issueKey, 'up', issue)}
                      aria-label="Mark issue as helpful"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={vote === 'up'}
                      className={`rounded-md p-1.5 transition-colors ${
                        vote === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
                      } ${vote === 'up' ? 'cursor-not-allowed opacity-50' : ''}`}
                      onClick={() => handleVote(issueKey, 'down', issue)}
                      aria-label="Mark issue as unhelpful"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>

                  {vote === 'up' && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900">
                          Reviewer: {aiIssueReviewers[issueKey] || user?.fullName?.trim() || 'Current User'}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-gray-600"
                          onClick={() => setDeleteFeedbackIssueKey(issueKey)}
                          title="Delete thumbs up"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {savedFeedbackText && !showFeedbackForm && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-900">
                          Reviewer: {aiIssueReviewers[issueKey] || user?.fullName?.trim() || 'Current User'}
                        </p>
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
                          className="flex items-center gap-1.5 bg-green-200 text-green-700 hover:bg-green-200/80"
                          onClick={() => handleSaveFeedback(issueKey, issue)}
                          disabled={!feedbackText.trim() || isSavingFeedback[issueKey]}
                        >
                          {isSavingFeedback[issueKey] ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
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
