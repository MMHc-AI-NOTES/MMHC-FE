import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/dashboard';
import { fetchDashboardData } from './dashboardApiCalls';
import StatsCard from './StatsCard';
import WeeklyVolumeChart from './WeeklyVolumeChart';
import PractitionerTrendsChart from './PractitionerTrendsChart';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import DashboardSkeleton from './DashboardSkeleton';

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
      {/* Stats Card */}
      <StatsCard
        notesAuditedToday={dashboardData.notesAuditedToday}
        weeklyGrowth={15} // Example data - you can add this to your API response
        activePractitioners={24} // Example data
        criticalIssues={8} // Example data
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Audit Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Audit Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyVolumeChart data={dashboardData.weeklyAuditVolume} />
          </CardContent>
        </Card>

        {/* Practitioner Quality Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Practitioner Quality Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PractitionerTrendsChart data={dashboardData.practitionerTrends} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={dashboardData.recentActivities} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
