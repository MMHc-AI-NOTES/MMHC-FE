import { Card, CardContent } from '@/components/ui/card';
import { FileText, TrendingUp, Users, AlertTriangle } from 'lucide-react';

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
      description: 'Real-time audit tracking',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Weekly Growth',
      value: `${weeklyGrowth}%`,
      description: 'Compared to last week',
      icon: TrendingUp,
      color: 'green',
      gradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Practitioners',
      value: activePractitioners,
      description: 'Currently active',
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Critical Issues',
      value: criticalIssues,
      description: 'Requiring immediate attention',
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-50 to-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className={`border-0 bg-gradient-to-r ${stat.gradient} shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <h2 className="mt-2 text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</h2>
                  <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.iconBg}`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCard;
