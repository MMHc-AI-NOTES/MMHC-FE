import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ConfirmationDialog from '@/shared/ConfirmationDialog';
import { useAppSelector } from '@/store/store';
import { BookOpenCheck, HatGlasses, Save, ShieldCheck, ThumbsDown, ThumbsUp, Trash2, Pencil } from 'lucide-react';
import type { NoteDetail, SMEIssue, WebhookVersion } from '@/types/notes';
import { SmeIssueFindingItem } from './SmeIssueFindingItem';
import { getSmeIssueDescription, getSmeIssueTitle } from './sessionFieldUtils';
import axios from 'axios';
import { showToast } from '@/lib/toast';
import { handleCatchMessages } from '@/utils/helper';
import { FeedbackVerdictEnum } from '@/constants/common';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  sessionId,
}: SessionFieldReviewFindingsProps) {
  const getAiIssueKey = (issue: NoteDetail['issues'][number], index: number) => `${issue.sectionId || issue.category || 'ai'}-${index}`;

  const user = useAppSelector(state => state.auth.user);
  const [aiIssueVotes, setAiIssueVotes] = useState<Record<string, string>>({});
  const [aiIssueFeedback, setAiIssueFeedback] = useState<Record<string, string>>({});
  const [savedAiIssueFeedback, setSavedAiIssueFeedback] = useState<Record<string, string>>({});
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState<Record<string, boolean>>({});
  const [deleteFeedbackInfo, setDeleteFeedbackInfo] = useState<{ issueKey: string; id: number } | null>(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState<Record<string, boolean>>({});
  const [aiIssueFeedbackIds, setAiIssueFeedbackIds] = useState<Record<string, number>>({});
  // const [aiIssueReviewers, setAiIssueReviewers] = useState<Record<string, string>>({});

  const [lastLoadedNoteId, setLastLoadedNoteId] = useState<string | null>(null);
  const [lastLoadedVersionId, setLastLoadedVersionId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!feedbackVerdicts || !Array.isArray(feedbackVerdicts)) return;

    if (lastLoadedNoteId !== noteId || lastLoadedVersionId !== versionId) {
      const initialVotes: Record<string, string> = {};
      const initialFeedback: Record<string, string> = {};
      const initialIds: Record<string, number> = {};
      const initialReviewers: Record<string, string> = {};

      aiIssues.forEach((issue, index) => {
        const issueKey = getAiIssueKey(issue, index);

        // Find matching feedback verdict for this issue and current reviewer
        const match = feedbackVerdicts.find(v => {
          const currentUserIdentifier = user?.fullName?.trim() || user?.email?.trim() || '';
          if (!currentUserIdentifier) return false;

          const reviewerIdentifier = v.by?.trim() || '';
          if (reviewerIdentifier.toLowerCase() !== currentUserIdentifier.toLowerCase()) {
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
          const mappedVerdict =
            match.verdict === 1 || match.verdict === '1' || match.verdict === 'up'
              ? FeedbackVerdictEnum.UP.icon_text
              : FeedbackVerdictEnum.DOWN.icon_text;
          initialVotes[issueKey] = mappedVerdict;
          initialIds[issueKey] = match.id;
          initialReviewers[issueKey] = match.by || '';
          if (mappedVerdict === FeedbackVerdictEnum.DOWN.icon_text && match.comment && match.comment !== 'null') {
            initialFeedback[issueKey] = match.comment;
          }
        }
      });

      setAiIssueVotes(initialVotes);
      setSavedAiIssueFeedback(initialFeedback);
      setAiIssueFeedbackIds(initialIds);
      // setAiIssueReviewers(initialReviewers);
      setLastLoadedNoteId(noteId || null);
      setLastLoadedVersionId(versionId);
    }
  }, [feedbackVerdicts, aiIssues, loggedInUserId, user, noteId, versionId, lastLoadedNoteId, lastLoadedVersionId]);

  useEffect(() => {
    if (!feedbackVerdicts || !Array.isArray(feedbackVerdicts)) return;

    const idsMap: Record<string, number> = {};

    aiIssues.forEach((issue, index) => {
      const issueKey = getAiIssueKey(issue, index);
      const match = feedbackVerdicts.find(v => {
        const currentUserIdentifier = user?.fullName?.trim() || user?.email?.trim() || '';
        if (!currentUserIdentifier) return false;

        const reviewerIdentifier = v.by?.trim() || '';
        if (reviewerIdentifier.toLowerCase() !== currentUserIdentifier.toLowerCase()) {
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
        idsMap[issueKey] = match.id;
      }
    });

    setAiIssueFeedbackIds(prev => ({ ...prev, ...idsMap }));
  }, [feedbackVerdicts, aiIssues, user]);

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
    setAiIssueFeedbackIds(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
  };

  const handleVote = async (issueKey: string, vote: string, issue: NoteDetail['issues'][number]) => {
    if (vote === FeedbackVerdictEnum.UP.icon_text) {
      const isCurrentlyUp = aiIssueVotes[issueKey] === FeedbackVerdictEnum.UP.icon_text;
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
          session_id: sessionId || '',
          description_id: issue.descriptionId || issue.sectionId || '',
          verdict: FeedbackVerdictEnum.UP.id,
          comment: 'null',
        };

        const res: any = await axios.post('/feedback', payload);
        showToast.success('Feedback submitted successfully');

        const feedbackId =
          res?.id ||
          res?.verdicts?.[0]?.id ||
          res?.feedbackVerdict?.id ||
          res?.feedbackVerdicts?.[0]?.id ||
          res?.data?.id ||
          res?.data?.feedbackVerdict?.id ||
          res?.data?.feedbackVerdicts?.[0]?.id ||
          res?.data?.verdicts?.[0]?.id ||
          res?.data?.verdict?.id ||
          (typeof res?.data === 'number' || typeof res?.data === 'string' ? res.data : undefined);
        if (feedbackId) {
          setAiIssueFeedbackIds(prev => ({ ...prev, [issueKey]: Number(feedbackId) }));
        }
        // setAiIssueReviewers(prev => ({ ...prev, [issueKey]: user?.fullName || 'Current User' }));

        setAiIssueVotes(prev => ({ ...prev, [issueKey]: FeedbackVerdictEnum.UP.icon_text }));
        setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
        onFeedbackChanged?.();
      } catch (error) {
        handleCatchMessages(error);
      }
      return;
    }

    setAiIssueVotes(prev => ({ ...prev, [issueKey]: FeedbackVerdictEnum.DOWN.icon_text }));
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
      setAiIssueVotes(prev => ({ ...prev, [issueKey]: FeedbackVerdictEnum.DOWN.icon_text }));
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
        session_id: sessionId || '',
        description_id: issue.descriptionId || issue.sectionId || '',
        verdict: FeedbackVerdictEnum.DOWN.id,
        comment: feedback,
      };

      const existingFeedbackId = aiIssueFeedbackIds[issueKey];
      let res: any;

      if (existingFeedbackId) {
        try {
          await axios.delete(`/feedback/${existingFeedbackId}`);
        } catch (deleteErr) {
          console.error('Feedback delete failed:', deleteErr);
        }
        res = await axios.post('/feedback', payload);
        showToast.success('Feedback updated successfully');
      } else {
        res = await axios.post('/feedback', payload);
        showToast.success('Feedback submitted successfully');
      }

      const feedbackId =
        res?.id ||
        res?.verdicts?.[0]?.id ||
        res?.feedbackVerdict?.id ||
        res?.feedbackVerdicts?.[0]?.id ||
        res?.data?.id ||
        res?.data?.feedbackVerdict?.id ||
        res?.data?.feedbackVerdicts?.[0]?.id ||
        res?.data?.verdicts?.[0]?.id ||
        res?.data?.verdict?.id ||
        (typeof res?.data === 'number' || typeof res?.data === 'string' ? res.data : undefined) ||
        existingFeedbackId;
      if (feedbackId) {
        setAiIssueFeedbackIds(prev => ({ ...prev, [issueKey]: Number(feedbackId) }));
      }
      // setAiIssueReviewers(prev => ({ ...prev, [issueKey]: user?.fullName || 'Current User' }));

      setSavedAiIssueFeedback(prev => ({ ...prev, [issueKey]: feedback }));
      setAiIssueVotes(prev => ({ ...prev, [issueKey]: FeedbackVerdictEnum.DOWN.icon_text }));
      setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: false }));
      onFeedbackChanged?.();
    } catch (error) {
      handleCatchMessages(error);
    } finally {
      setIsSavingFeedback(prev => ({ ...prev, [issueKey]: false }));
    }
  };

  const handleConfirmDeleteFeedback = async () => {
    if (!deleteFeedbackInfo) return;
    const { issueKey, id: feedbackId } = deleteFeedbackInfo;

    if (feedbackId) {
      try {
        await axios.delete(`/feedback/${feedbackId}`);
        showToast.success('Feedback deleted successfully');
      } catch (error) {
        handleCatchMessages(error);
        return;
      }
    }

    clearIssueVoteState(issueKey);
    setSavedAiIssueFeedback(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
    setAiIssueFeedbackIds(prev => {
      const next = { ...prev };
      delete next[issueKey];
      return next;
    });
    // setAiIssueReviewers(prev => {
    //   const next = { ...prev };
    //   delete next[issueKey];
    //   return next;
    // });
    setDeleteFeedbackInfo(null);
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
            const showFeedbackForm = vote === FeedbackVerdictEnum.DOWN.icon_text && isFeedbackFormOpen[issueKey];

            const matches = (feedbackVerdicts || []).filter(v => {
              return (
                v.code === issue.descriptionId ||
                v.description_id === issue.descriptionId ||
                v.code === issue.sectionId ||
                v.description_id === issue.sectionId
              );
            });

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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 cursor-help text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Justification</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-xs leading-relaxed text-gray-600">{issue.justification}</p>
                      </div>
                    )}
                    {issue.evidence && (
                      <div className="mt-1 -ml-5 flex items-start gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HatGlasses className="mt-0.5 h-4 w-4 shrink-0 cursor-help text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Evidence</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-xs leading-relaxed text-gray-600">{issue.evidence}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-200 pt-3">
                  {(() => {
                    const isLocked = vote === FeedbackVerdictEnum.UP.icon_text || Boolean(savedFeedbackText);
                    return (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-500">Was this helpful?</p>
                        <button
                          type="button"
                          disabled={isLocked || vote === FeedbackVerdictEnum.DOWN.icon_text}
                          className={`rounded-md p-1.5 transition-colors ${
                            vote === FeedbackVerdictEnum.UP.icon_text ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'
                          } ${isLocked || vote === FeedbackVerdictEnum.DOWN.icon_text ? 'cursor-not-allowed opacity-50' : ''}`}
                          onClick={() => handleVote(issueKey, FeedbackVerdictEnum.UP.icon_text, issue)}
                          aria-label="Mark issue as helpful"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isLocked}
                          className={`rounded-md p-1.5 transition-colors ${
                            vote === FeedbackVerdictEnum.DOWN.icon_text ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                          onClick={() => handleVote(issueKey, FeedbackVerdictEnum.DOWN.icon_text, issue)}
                          aria-label="Mark issue as unhelpful"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })()}

                  {(() => {
                    const currentUserIdentifier = user?.fullName?.trim() || user?.email?.trim() || '';
                    const hasMyMatch = matches.some(m => {
                      const reviewerIdentifier = m.by?.trim() || '';
                      return currentUserIdentifier && reviewerIdentifier.toLowerCase() === currentUserIdentifier.toLowerCase();
                    });

                    const displayMatches = [...matches];

                    const isWritingFeedback = vote === FeedbackVerdictEnum.DOWN.icon_text && isFeedbackFormOpen[issueKey];
                    if (!hasMyMatch && vote && !isWritingFeedback) {
                      displayMatches.push({
                        id: aiIssueFeedbackIds[issueKey] || Date.now(),
                        by: user?.fullName || 'Current User',
                        verdict: vote,
                        comment: savedFeedbackText || 'null',
                      });
                    }

                    return displayMatches.map(match => {
                      const isMyFeedback =
                        currentUserIdentifier && match.by && match.by.trim().toLowerCase() === currentUserIdentifier.toLowerCase();
                      const matchVote =
                        match.verdict === 1 || match.verdict === '1' || match.verdict === 'up'
                          ? FeedbackVerdictEnum.UP.icon_text
                          : FeedbackVerdictEnum.DOWN.icon_text;
                      const hasComment = matchVote === FeedbackVerdictEnum.DOWN.icon_text && match.comment && match.comment !== 'null';

                      return (
                        <div key={`match-${match.id}`} className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-sm text-gray-900">
                              Reviewer: {match.by || 'Unknown Reviewer'}
                              {matchVote === FeedbackVerdictEnum.UP.icon_text ? (
                                <ThumbsUp className="h-4 w-4 shrink-0 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-4 w-4 shrink-0 text-red-600" />
                              )}
                            </span>
                            {isMyFeedback && (
                              <div className="flex shrink-0 items-center gap-1">
                                {matchVote === FeedbackVerdictEnum.DOWN.icon_text && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-primary h-7 w-7 text-gray-600"
                                    onClick={() => {
                                      setIsFeedbackFormOpen(prev => ({ ...prev, [issueKey]: true }));
                                      setAiIssueFeedback(prev => ({ ...prev, [issueKey]: match.comment || '' }));
                                    }}
                                    title="Edit feedback"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setDeleteFeedbackInfo({ issueKey, id: match.id })}
                                  title="Delete feedback"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {hasComment && <div className="mt-2 rounded-sm bg-red-50 p-3 text-sm text-gray-700">{match.comment}</div>}
                        </div>
                      );
                    });
                  })()}

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
        isOpen={deleteFeedbackInfo != null}
        onOpenChange={open => {
          if (!open) setDeleteFeedbackInfo(null);
        }}
        onConfirm={handleConfirmDeleteFeedback}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
}
