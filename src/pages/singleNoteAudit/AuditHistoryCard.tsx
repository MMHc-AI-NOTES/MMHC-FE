import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Bot, Mail, Webhook, ListX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import moment from 'moment';
import axios from 'axios';
import { useAppSelector } from '@/store/store';
import { formatDateTime, handleCatchMessages } from '@/utils/helper';
import { AuditActionEnum, AuditActionLabels } from '@/constants/common';

interface NoteActivityItem {
  id: number | string;
  action: string;
  noteId?: string;
  metadata?: any;
  createdAt: string;
  description?: string;
}

interface AuditHistoryCardProps {
  noteId?: string;
}

const AuditHistoryCard = ({ noteId }: AuditHistoryCardProps) => {
  const [activities, setActivities] = useState<NoteActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { agents } = useAppSelector(state => state.agents);

  useEffect(() => {
    if (!noteId) return;

    let cancelled = false;

    const loadActivity = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/notes/activity/${noteId}`);
        const raw = (response?.data?.data ?? response?.data) as any[];
        const mapped: NoteActivityItem[] = Array.isArray(raw)
          ? raw.map((item: any) => ({
              id: item.id ?? item.activityId ?? `${noteId}-${item.actionTime ?? item.createdAt ?? ''}`,
              action: item.action ?? '',
              noteId: item.noteId ?? item.metadata?.note_id,
              description: item.description,
              metadata: item.metadata ?? {},
              createdAt:
                item.actionTime ?? item.createdAt ?? item.metadata?.created_at ?? item.metadata?.actionTime ?? new Date().toISOString(),
            }))
          : [];

        if (!cancelled) {
          setActivities(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          handleCatchMessages(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [noteId]);

  // const sortedActivities = [...activities].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

  // Sort activities by date (newest first), exclude chat_created for now
  const sortedActivities = [...activities]
    .filter(a => a.action !== AuditActionEnum.chatCreated)
    .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

  const getAgentName = (agentId?: number | null): string | null => {
    if (!agentId) return null;
    const agent = agents?.find(a => a.id === agentId);
    return agent?.name ?? null;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case AuditActionEnum.chatCreated:
        return <Bot className="text-primary h-5 w-5" />;
      case AuditActionEnum.emailSmeIssues:
      case AuditActionEnum.emailBulkSmeIssues:
      case AuditActionEnum.emailMissingFields:
        return <Mail className="text-primary h-5 w-5" />;
      case AuditActionEnum.webhookSessionReceived:
        return <Webhook className="text-primary h-5 w-5" />;
      default:
        return <History className="text-primary h-5 w-5" />;
    }
  };

  const getTimelineStyles = (action: string) => {
    // Map backend actions into high-level timeline segments with colors
    if (action === AuditActionEnum.chatCreated) {
      return {
        segmentLabel: 'AI Review',
        dotClass: 'bg-green-dark-light ring-green-light',
        pillClass: 'bg-green-light text-green text-sm px-2.5 py-0.5 rounded',
      };
    }

    if (
      action === AuditActionEnum.emailSmeIssues ||
      action === AuditActionEnum.emailBulkSmeIssues ||
      action === AuditActionEnum.emailMissingFields
    ) {
      return {
        segmentLabel: 'Manager Action',
        dotClass: 'bg-orange-dark ring-orange-light',
        pillClass: 'bg-orange-light text-orange-dark text-sm px-2.5 py-0.5 rounded',
      };
    }

    return {
      segmentLabel: 'System',
      dotClass: 'bg-blue ring-blue',
      pillClass: 'bg-blue-light text-blue text-sm px-2.5 py-0.5 rounded',
    };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <History className="h-5 w-5" />
          Audit History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && sortedActivities.length === 0 ? (
          <div className="relative space-y-6">
            <div className="absolute top-2 bottom-2 left-[4px] w-px bg-gray-200" />
            {[1, 2, 3].map(i => (
              <div key={i} className="relative flex gap-4">
                <Skeleton className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedActivities.length > 0 ? (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute top-2 bottom-2 left-[4px] w-px bg-gray-200" />
            {sortedActivities.map((activity, index) => {
              const formattedDate = formatDateTime(activity.createdAt);
              const action = activity.action;
              const title = AuditActionLabels[action as keyof typeof AuditActionLabels] ?? 'Activity';
              const description = activity.description;
              const meta = activity.metadata ?? {};
              const noteIdDisplay = activity.noteId ?? meta.note_id;

              let subtitle: string | null = null;

              if (action === AuditActionEnum.chatCreated) {
                const agentId = meta.agent_id as number | undefined;
                const agentName = getAgentName(agentId);
                subtitle = [noteIdDisplay ? `Note ${noteIdDisplay}` : null, agentName ? `Agent: ${agentName}` : null]
                  .filter(Boolean)
                  .join(' • ');
              } else if (action === AuditActionEnum.emailSmeIssues) {
                const email = meta.practitioner_email as string | undefined;
                const practitionerName = meta.practitioner_name as string | undefined;
                if (email && practitionerName) {
                  subtitle = `Email sent to ${practitionerName} (${email})`;
                } else if (email) {
                  subtitle = `Email sent to ${email}`;
                } else {
                  subtitle = 'Email sent to practitioner';
                }
              } else if (action === AuditActionEnum.webhookSessionReceived) {
                subtitle = 'New version created';
              }

              const { segmentLabel, dotClass, pillClass } = getTimelineStyles(action);
              const isLast = index === sortedActivities.length - 1;

              return (
                <div key={activity.id} className={`relative flex gap-4 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  {/* Timeline dot + connector */}
                  <div className="relative flex flex-col items-center">
                    <span className={`mt-3 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotClass}`} />
                    {/* {!isLast && <div className="mt-1 w-px flex-1 bg-gray-200" />} */}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={pillClass}>{segmentLabel}</span>
                        <span className="text-muted-foreground text-xs">{formattedDate}</span>
                      </div>
                      <div className="bg-gray-light hidden h-8 w-8 items-center justify-center rounded-full sm:flex">
                        {getActivityIcon(action)}
                      </div>
                    </div>

                    <div className="mt-1 text-sm font-semibold text-gray-900">{title}</div>
                    {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
                    {description && (
                      <div className="bg-gray-light mt-2 rounded-md px-3 py-2 text-xs leading-relaxed text-gray-700">{description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ListX className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No audit history available</p>
            {/* <p className="mt-1 text-xs text-gray-400">Run an audit to see the history</p> */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditHistoryCard;
