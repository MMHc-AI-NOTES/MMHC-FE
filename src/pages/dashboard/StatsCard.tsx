import { Card, CardContent } from '@/components/ui/card';
import { FileText, TrendingUp, CheckCircle, Info, ArrowRight, User } from 'lucide-react';

interface StatsCardProps {
  notesAuditedToday: number;
  weeklyGrowth: number;
  activePractitioners: number;
  criticalIssues: number;
}

const StatsCard = ({ notesAuditedToday, weeklyGrowth, activePractitioners, criticalIssues }: StatsCardProps) => {
  const stats = [
    {
      title: 'Notes Audited Today',
      value: notesAuditedToday,
      icon: FileText,
      iconBg: 'bg-green-50',
      iconColor: 'text-primary',
      isTrendingUp: true,
      trendingValue: 12,
    },
    {
      title: 'Pass Rate',
      value: `${weeklyGrowth}%`,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-primary',
      isTrendingUp: true,
      trendingValue: 3,
    },
    {
      title: 'Practitioner Corrections Required',
      value: activePractitioners,
      icon: Info,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      isReview: true,
    },
    {
      title: 'Pending HITL Reviews',
      description: 'Awaiting human-in-the-loop validation',
      value: criticalIssues,
      icon: User,
      iconBg: 'bg-green-50',
      iconColor: 'text-primary',
      isAlert: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                  <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                </div>

                {stat.isTrendingUp ? (
                  <div className="text-primary-light flex items-center gap-1.5 text-xs">
                    <TrendingUp size={14} /> <p>+{stat.trendingValue}%</p>{' '}
                  </div>
                ) : stat.isReview ? (
                  <div className={`rounded-full p-1.5 ${stat.iconBg}`}>
                    <ArrowRight className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                ) : stat.isAlert ? (
                  <TrendingUp size={14} className="text-primary" />
                ) : null}
              </div>

              <h2 className="text-primary mt-2 text-5xl font-bold">{stat.value.toLocaleString()}</h2>
              <div>
                <p>{stat.title}</p>
                <p className="text-sm text-gray-400">{stat.description ? stat.description : ''}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCard;
