import { DashboardStats } from '@/types/dashboard';

// Mock API call - replace with actual API
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    notesAuditedToday: 0,
    weeklyGrowth: 0,
    activePractitioners: 0,
    criticalIssues: 0,
    // Update the weeklyAuditVolume data in your fetchDashboardData function
    weeklyAuditVolume: [
      { day: 'Mon', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Tue', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Wed', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Thu', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Fri', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Sat', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
      { day: 'Sun', criticalFailures: 0, hitl: 0, passed: 0, practitionerCorrections: 0 },
    ],
    practitionerTrends: [
      {
        name: 'A. Martinez',
        data: [
          { day: 'Mon', score: 0 },
          { day: 'Tue', score: 0 },
          { day: 'Wed', score: 0 },
          { day: 'Thu', score: 0 },
          { day: 'Fri', score: 0 },
          { day: 'Sat', score: 0 },
          { day: 'Sun', score: 0 },
        ],
      },
      {
        name: 'J. Thompson',
        data: [
          { day: 'Mon', score: 0 },
          { day: 'Tue', score: 0 },
          { day: 'Wed', score: 0 },
          { day: 'Thu', score: 0 },
          { day: 'Fri', score: 0 },
          { day: 'Sat', score: 0 },
          { day: 'Sun', score: 0 },
        ],
      },
      {
        name: 'L. Chen',
        data: [
          { day: 'Mon', score: 0 },
          { day: 'Tue', score: 0 },
          { day: 'Wed', score: 0 },
          { day: 'Thu', score: 0 },
          { day: 'Fri', score: 0 },
          { day: 'Sat', score: 0 },
          { day: 'Sun', score: 0 },
        ],
      },
      {
        name: 'R. Williams',
        data: [
          { day: 'Mon', score: 0 },
          { day: 'Tue', score: 0 },
          { day: 'Wed', score: 0 },
          { day: 'Thu', score: 0 },
          { day: 'Fri', score: 0 },
          { day: 'Sat', score: 0 },
          { day: 'Sun', score: 0 },
        ],
      },
    ],
    recentActivities: [
      {
        id: '1',
        type: 'info',
        title: 'Note #12439 failed audit',
        description: 'Critical issues detected.',
        timestamp: '2024-01-20T10:28:00Z',
        timeAgo: '2 minutes ago',
      },
      {
        id: '2',
        type: 'progress',
        title: 'AI model v1.3 deployed',
        description: 'Improved stability.',
        timestamp: '2024-01-20T09:30:00Z',
        timeAgo: '1 hour ago',
      },
      {
        id: '3',
        type: 'progress',
        title: 'Practitioner submitted updated note #9921',
        description: '',
        timestamp: '2024-01-20T07:15:00Z',
        timeAgo: '3 hours ago',
      },
      {
        id: '4',
        type: 'critical',
        title: 'Weekly report generated',
        description: '876 notes processed.',
        timestamp: '2024-01-20T05:10:00Z',
        timeAgo: '5 hours ago',
      },
      {
        id: '5',
        type: 'default',
        title: 'Note #8745 moved to blacklist',
        description: 'Repeat violations.',
        timestamp: '2024-01-20T02:45:00Z',
        timeAgo: '8 hours ago',
      },
    ],
  };
};
