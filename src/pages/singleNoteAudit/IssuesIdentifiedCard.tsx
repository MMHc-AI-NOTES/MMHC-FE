import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NoteDetail } from '@/types/notes';
import { Info, CircleHelp, ThumbsUp, ThumbsDown, Save, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/store/store';

interface IssuesIdentifiedCardProps {
  issues: NoteDetail['issues'];
  onCategoryClick?: (category: string) => void;
}

interface FeedbackState {
  issueIndex: number | null;
  text: string;
}

interface IssueFeedbackData {
  issueId: string; // sectionId
  category: string;
  status: 'up' | 'down';
  comment: string;
  timestamp: string;
  reviewerName: string;
}

const IssuesIdentifiedCard = ({ issues, onCategoryClick }: IssuesIdentifiedCardProps) => {
  const [feedback, setFeedback] = useState<FeedbackState>({ issueIndex: null, text: '' });
  const [issueFeedback, setIssueFeedback] = useState<{ [key: number]: { status: 'up' | 'down'; comment?: string } | null }>({});
  const [savedFeedbackData, setSavedFeedbackData] = useState<IssueFeedbackData[]>([]);
  const authUser = useAppSelector(state => state.auth.user);
  const reviewerName = authUser?.fullName ?? 'Current User';

  // Load saved feedback from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('issues-feedback');
      if (raw) {
        const parsed: IssueFeedbackData[] = JSON.parse(raw);
        setSavedFeedbackData(parsed);

        // Build issueFeedback map from saved items (latest per issue)
        const map: { [key: number]: { status: 'up' | 'down'; comment?: string } | null } = {};
        parsed.forEach(item => {
          const idx = displayIssues.findIndex(i => i.sectionId === item.issueId);
          if (idx !== -1) {
            map[idx] = { status: item.status, comment: item.comment };
          }
        });
        setIssueFeedback(map);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist saved feedback to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('issues-feedback', JSON.stringify(savedFeedbackData));
    } catch {
      // ignore
    }
  }, [savedFeedbackData]);

  // Mock data for issues if none are provided
  const mockIssues = [
    {
      severity: 'CRITICAL' as const,
      category: 'Assessment & Therapeutic Intervention',
      points: 25,
      description:
        'Missing specific DSM-5 diagnostic criteria documentation. Clinical assessment lacks measurable symptoms or severity indicators required for medical necessity.',
      justification:
        'Per DSM-5 guidelines, documented symptoms must meet at least 5 criteria for major depressive disorder. Current note lists only 3 criteria.',
      sectionId: 'zad8-1',
    },
    {
      severity: 'MODERATE' as const,
      category: 'Plan & Collaboration',
      points: 10,
      description:
        'Treatment plan lacks specific, measurable goals. Coordination with psychiatrist mentioned but no documentation of actual communication or consent for information sharing.',
      justification:
        'Treatment goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Current goals are vague and lack timeframes.',
      sectionId: 'hnfi-1',
    },
    {
      severity: 'MODERATE' as const,
      category: 'Objective',
      points: 15,
      description:
        'Vital signs not documented in this session. Blood pressure, heart rate, and other relevant vitals should be recorded for baseline and monitoring purposes.',
      justification: 'Standard practice requires vital signs documentation for all initial psychiatric evaluations.',
      sectionId: 'rb2f-1',
    },
    {
      severity: 'MINOR' as const,
      category: 'Subjective Information',
      points: 5,
      description:
        "Limited detail on patient's social support system. Documentation mentions family but lacks specifics about availability and support level.",
      justification:
        'Social support assessment is crucial for treatment planning and should include details about relationships, frequency of contact, and perceived helpfulness.',
      sectionId: '6tx9-1',
    },
    {
      severity: 'MINOR' as const,
      category: 'Progress Monitoring',
      points: 3,
      description: 'No baseline measurements documented for symptom severity tracking across sessions.',
      justification:
        'Establishing baseline measurements (e.g., PHQ-9 score) enables objective progress monitoring and treatment efficacy assessment.',
      sectionId: 'gm4p-1',
    },
  ];

  // Use provided issues or fall back to mock data
  const displayIssues = issues && issues.length > 0 ? issues : mockIssues;
  const getSeverityTooltip = (severity: 'CRITICAL' | 'MODERATE' | 'MINOR') => {
    switch (severity) {
      case 'CRITICAL':
        return 'Critical issues require immediate attention and may significantly impact the quality or compliance of the note. These issues could lead to serious consequences if not addressed.';
      case 'MODERATE':
        return 'Moderate issues should be addressed to improve the quality of documentation. These issues may affect clarity or completeness but are not immediately critical.';
      case 'MINOR':
        return 'Minor issues are suggestions for improvement. While not critical, addressing these can enhance the overall quality and professionalism of the documentation.';
      default:
        return '';
    }
  };

  const handleThumbsUp = (index: number) => {
    setIssueFeedback(prev => {
      const current = prev[index];
      if (current?.status === 'up') {
        // Toggle off
        return { ...prev, [index]: null };
      } else {
        // Set to up (remove down feedback if exists)
        return { ...prev, [index]: { status: 'up' } };
      }
    });
    // Close feedback input if it was open for this issue
    if (feedback.issueIndex === index) {
      setFeedback({ issueIndex: null, text: '' });
    }
  };

  const handleThumbsDown = (index: number) => {
    const current = issueFeedback[index];
    if (current?.status === 'down') {
      // Already showing feedback form, just close it
      setFeedback({ issueIndex: null, text: '' });
      setIssueFeedback(prev => ({ ...prev, [index]: null }));
    } else {
      // Open feedback form
      setFeedback({ issueIndex: index, text: '' });
      setIssueFeedback(prev => ({ ...prev, [index]: { status: 'down', comment: '' } }));
    }
  };

  const handleSaveFeedback = (index: number) => {
    if (feedback.issueIndex === index && feedback.text.trim()) {
      const issue = displayIssues[index];

      // Create feedback data object
      const feedbackData: IssueFeedbackData = {
        issueId: issue.sectionId,
        category: issue.category,
        status: 'down',
        comment: feedback.text,
        timestamp: new Date().toISOString(),
        reviewerName: reviewerName,
      };

      // Add to saved feedback array (replace any existing feedback for same issue)
      setSavedFeedbackData(prev => {
        const filtered = prev.filter(p => p.issueId !== feedbackData.issueId);
        return [...filtered, feedbackData];
      });

      // Update issue feedback state
      setIssueFeedback(prev => ({
        ...prev,
        [index]: { status: 'down', comment: feedback.text },
      }));

      // Logging removed to satisfy lint rules

      // Clear feedback input
      setFeedback({ issueIndex: null, text: '' });
    }
  };

  const handleCancelFeedback = () => {
    if (feedback.issueIndex !== null) {
      // If there's no saved comment, remove the down feedback
      const current = issueFeedback[feedback.issueIndex];
      if (!current?.comment) {
        setIssueFeedback(prev => ({ ...prev, [feedback.issueIndex!]: null }));
      }
    }
    setFeedback({ issueIndex: null, text: '' });
  };

  const handleDeleteFeedback = (index: number) => {
    const issueId = displayIssues[index]?.sectionId;
    if (!issueId) return;
    setSavedFeedbackData(prev => prev.filter(item => item.issueId !== issueId));
    setIssueFeedback(prev => ({ ...prev, [index]: null }));
  };

  return (
    <>
      <Card className="gap-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
            <Info />
            Issues Identified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayIssues.length ? (
            displayIssues.map((issue, index) => (
              <div key={index}>
                <div
                  onClick={() => onCategoryClick?.(issue.category)}
                  className={`space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors ${onCategoryClick ? 'hover:border-green-300' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`px-3 py-1 text-xs font-semibold text-white uppercase ${
                          issue.severity === 'CRITICAL'
                            ? 'bg-gradient-red'
                            : issue.severity === 'MODERATE'
                              ? 'bg-gradient-severity-moderate'
                              : 'bg-gradient-severity-minor'
                        }`}
                      >
                        {issue.severity}
                      </Badge>
                      <p className="text-primary rounded-[6px] border border-green-600 bg-green-50 px-2.5 py-1 text-xs font-semibold">AI</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleHelp className="h-4 w-4 cursor-help text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{getSeverityTooltip(issue.severity)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{issue.sectionId}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{issue.category}</h3>

                    <p className="mt-1 text-sm font-bold text-red-600">–{issue.points} points</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">{issue.description}</p>
                    {issue.justification != null && issue.justification !== '' && (
                      <p className="mt-2 rounded-md bg-gray-200 p-2 text-xs leading-relaxed text-gray-600">{issue.justification}</p>
                    )}
                  </div>

                  {/* Thumbs Up/Down Section */}
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-200 pt-4">
                    <span className="text-xs font-medium text-gray-500">Was this helpful?</span>
                    <button
                      onClick={() => handleThumbsUp(index)}
                      className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                        issueFeedback[index]?.status === 'up'
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleThumbsDown(index)}
                      className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                        issueFeedback[index]?.status === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Feedback Input Form - Shows when thumbs down is selected */}
                  {feedback.issueIndex === index && issueFeedback[index]?.status === 'down' && (
                    <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                      <div className="text-sm font-medium text-gray-700">Send Feedback</div>
                      <Textarea
                        placeholder="Please let us know why you found this issue unhelpful. Your feedback helps us improve."
                        value={feedback.text}
                        onChange={e => setFeedback({ ...feedback, text: e.target.value })}
                        className="min-h-20 resize-none border-gray-200 focus:border-gray-400"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleCancelFeedback} className="gap-2">
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveFeedback(index)}
                          disabled={!feedback.text.trim()}
                          className="bg-gradient-light text-primary gap-2 border-0"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Saved Feedback Display - Shows always when feedback exists */}
                  {issueFeedback[index]?.comment && (
                    <div className="relative mt-4 rounded-lg border border-gray-200 bg-white p-3">
                      <button
                        onClick={() => handleDeleteFeedback(index)}
                        className="absolute top-2 right-2 text-gray-400 transition-colors hover:text-red-600"
                        title="Delete feedback"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <p className="text-xs font-medium text-black">Reviewer: {reviewerName}</p>
                      <div className="mt-2 border-l-2 border-gray-400 bg-red-50 p-3">
                        <p className="text-xs leading-relaxed text-black">{issueFeedback[index]?.comment}</p>
                      </div>
                    </div>
                  )}
                </div>
                {index < displayIssues.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <p className="text-center font-medium">No Issues Yet </p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default IssuesIdentifiedCard;
