import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Bot, Mail, Webhook, RotateCcw } from 'lucide-react';
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

  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <RotateCcw className="mb-3 h-12 w-12 animate-spin text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Loading audit history…</p>
          </div>
        ) : sortedActivities.length > 0 ? (
          sortedActivities.map((activity, index) => {
            const formattedDate = formatDateTime(activity.createdAt);
            const action = activity.action;
            const title = AuditActionLabels[action as keyof typeof AuditActionLabels] ?? (activity.description as string) ?? 'Activity';
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
              subtitle = 'New Version created';
            }

            return (
              <div key={activity.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">{getActivityIcon(action)}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                      {subtitle && <div className="mt-1 text-xs text-gray-600">{subtitle}</div>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>

                {index < sortedActivities.length - 1 && <div className="border-t border-gray-200" />}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <RotateCcw className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No audit history available</p>
            <p className="mt-1 text-xs text-gray-400">Run an audit to see the history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditHistoryCard;
