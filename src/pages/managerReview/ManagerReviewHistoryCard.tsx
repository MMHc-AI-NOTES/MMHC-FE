import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock3 } from 'lucide-react';

const reviewEvents = [
  {
    id: 'ai-review',
    type: 'AI Review',
    dotColor: 'bg-green-600',
    badgeClass: 'bg-green-100 text-primary border-primary',
    title: 'Initial audit completed',
    actor: 'AI System',
    timestamp: 'Feb 9, 2025 – 10:32 AM',
    body: 'Score: 82/100 - Note flagged for human review due to critical issue in Assessment section.',
  },
  {
    id: 'human-review',
    type: 'Human Review',
    dotColor: 'bg-blue-dark',
    badgeClass: 'bg-blue-100 text-blue-dark border-blue-dark',
    title: 'Escalated to Manager',
    actor: 'J. Turner',
    timestamp: 'Feb 9, 2025 – 2:15 PM',
    body: 'AI assessment appears correct but practitioner has disputed the critical finding. Requires manager validation.',
  },
  {
    id: 'manager-action',
    type: 'Manager Action',
    dotColor: 'bg-orange-dark',
    badgeClass: 'bg-orange-100 text-orange-dark border-orange-dark',
    title: 'Requested SME review',
    actor: 'S. Martinez',
    timestamp: 'Feb 8, 2025 – 4:20 PM',
    body: 'Similar case reviewed last week - need clinical expert input on DSM-5 documentation standards.',
  },
];

export const ManagerReviewHistoryCard = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-primary flex items-center gap-2 text-base font-semibold">
          <Clock3 className="h-5 w-5" />
          Review History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8">
          {/* Vertical connecting line */}
          <div className="absolute top-2 bottom-2 left-4 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {reviewEvents.map(event => (
              <div key={event.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute top-2 -left-[19px]">
                  <div className={`h-2 w-2 rounded-full ${event.dotColor} shadow-sm ring-5 ring-gray-50`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  {/* Badge */}
                  <div className={`${event.badgeClass} w-fit rounded px-3 py-1 text-xs font-semibold`}>{event.type}</div>

                  {/* Title */}
                  <p className="text-sm font-semibold text-gray-900">{event.title}</p>

                  {/* Actor and timestamp */}
                  <p className="text-xs text-gray-500">
                    {event.actor} • {event.timestamp}
                  </p>

                  {/* Comment box */}
                  <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">{event.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerReviewHistoryCard;
