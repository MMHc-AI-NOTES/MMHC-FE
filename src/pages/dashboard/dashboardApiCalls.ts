import { DashboardStats } from '@/types/dashboard';

// Mock API call - replace with actual API
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    notesAuditedToday: 128,
    weeklyGrowth: 15,
    activePractitioners: 24,
    criticalIssues: 8,
    // Update the weeklyAuditVolume data in your fetchDashboardData function
    weeklyAuditVolume: [
      { day: 'Mon', criticalFailures: 0, hitl: 45, passed: 100, practitionerCorrections: 10 },
      { day: 'Tue', criticalFailures: 12, hitl: 38, passed: 70, practitionerCorrections: 18 },
      { day: 'Wed', criticalFailures: 8, hitl: 42, passed: 35, practitionerCorrections: 12 },
      { day: 'Thu', criticalFailures: 20, hitl: 50, passed: 40, practitionerCorrections: 20 },
      { day: 'Fri', criticalFailures: 10, hitl: 35, passed: 50, practitionerCorrections: 15 },
      { day: 'Sat', criticalFailures: 19, hitl: 25, passed: 60, practitionerCorrections: 13 },
      { day: 'Sun', criticalFailures: 13, hitl: 20, passed: 20, practitionerCorrections: 21 },
    ],
    practitionerTrends: [
      {
        name: 'A. Martinez',
        data: [
          { day: 'Mon', score: 85 },
          { day: 'Tue', score: 88 },
          { day: 'Wed', score: 92 },
          { day: 'Thu', score: 90 },
          { day: 'Fri', score: 94 },
          { day: 'Sat', score: 91 },
          { day: 'Sun', score: 89 },
        ],
      },
      {
        name: 'J. Thompson',
        data: [
          { day: 'Mon', score: 78 },
          { day: 'Tue', score: 82 },
          { day: 'Wed', score: 85 },
          { day: 'Thu', score: 87 },
          { day: 'Fri', score: 90 },
          { day: 'Sat', score: 88 },
          { day: 'Sun', score: 86 },
        ],
      },
      {
        name: 'L. Chen',
        data: [
          { day: 'Mon', score: 92 },
          { day: 'Tue', score: 94 },
          { day: 'Wed', score: 96 },
          { day: 'Thu', score: 95 },
          { day: 'Fri', score: 97 },
          { day: 'Sat', score: 96 },
          { day: 'Sun', score: 94 },
        ],
      },
      {
        name: 'R. Williams',
        data: [
          { day: 'Mon', score: 70 },
          { day: 'Tue', score: 75 },
          { day: 'Wed', score: 78 },
          { day: 'Thu', score: 82 },
          { day: 'Fri', score: 85 },
          { day: 'Sat', score: 83 },
          { day: 'Sun', score: 80 },
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
