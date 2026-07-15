import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardStats } from '@/types/dashboard';
import { fetchDashboardData } from './dashboardApiCalls';
import StatsCard from './StatsCard';
import WeeklyVolumeChart from './WeeklyVolumeChart';
import PractitionerTrendsChart from './PractitionerTrendsChart';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardCardHeader from './DashboardCardHeader';
import { Activity, Clock, Users, Zap } from 'lucide-react';
import DashboardHeader from './DashboardHeader';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader count={0} />
      {/* Stats Card */}
      <StatsCard
        notesAuditedToday={dashboardData.notesAuditedToday}
        weeklyGrowth={0} // Example data - you can add this to your API response
        activePractitioners={0} // Example data
        criticalIssues={0} // Example data
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-2">
          <CardHeader>
            <DashboardCardHeader title="Current Validation Phase" icon={Zap} isIconBg />
          </CardHeader>

          <CardContent>
            <p className="text-primary text-3xl font-semibold">Week 3 &mdash; Supervised Automation</p>
            <p className="mt-2 text-gray-400">AI primary decisions, 50% HITL audit sampling</p>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <DashboardCardHeader title="Weekly Audit Volume" icon={Activity} />
          </CardHeader>
          <CardContent>
            <WeeklyVolumeChart data={dashboardData.weeklyAuditVolume} />
          </CardContent>
        </Card>

        {/* Practitioner Quality Trends */}
        <Card className="gap-2">
          <CardHeader>
            <DashboardCardHeader title="Practitioner Quality Trends" icon={Users} />
          </CardHeader>
          <CardContent>
            <PractitionerTrendsChart data={dashboardData.practitionerTrends} />
          </CardContent>
        </Card>

        {/* Recent Activity */}

        <Card className="gap-2">
          <CardHeader>
            <DashboardCardHeader title="Recent Activity" icon={Clock} />
          </CardHeader>
          <CardContent>
            <RecentActivity activities={[]} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
