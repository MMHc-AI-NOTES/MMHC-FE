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
import { Activity, Clock, Settings, Users, Zap } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import { fetchAgents } from '@/pages/settings/settingsApiCalls';
import { useAppSelector } from '@/store/store';
import { setAgents } from '@/store/slices/agentsSlice';
import { useAppDispatch } from '@/store/store';
import type { Agent } from '@/types/agent';
import { formatDate } from '@/utils/helper';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { agents } = useAppSelector(state => state.agents);
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

  useEffect(() => {
    const loadAgents = async () => {
      const agentsData = await fetchAgents();
      if (agentsData) {
        dispatch(setAgents(agentsData));
      }
    };

    if (agents.length === 0) {
      loadAgents();
    }
  }, [dispatch, agents.length]);

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
            <DashboardCardHeader title="Default Agent" icon={Settings} isIconBg />
          </CardHeader>
          <CardContent>
            {(() => {
              const defaultAgent = agents.find((agent: Agent) => agent.is_default === 1) || agents[0];
              if (defaultAgent) {
                return (
                  <>
                    <p className="text-primary text-3xl font-semibold [overflow-wrap:anywhere] whitespace-normal">{defaultAgent.name}</p>
                    <p className="mt-2 text-gray-400">
                      {defaultAgent.updated_at
                        ? `Last updated ${formatDate(defaultAgent.updated_at)}`
                        : defaultAgent.created_at
                          ? `Created ${formatDate(defaultAgent.created_at)}`
                          : 'Default agent'}
                    </p>
                  </>
                );
              }
              return (
                <>
                  <p className="text-primary text-3xl font-semibold">No default agent found</p>
                  <p className="mt-2 text-gray-400">Please create a default agent</p>
                </>
              );
            })()}
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}

        <Card className="gap-2">
          <CardHeader>
            <DashboardCardHeader title="Recent Activity" icon={Clock} />
          </CardHeader>
          <CardContent>
            <RecentActivity activities={[]} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
