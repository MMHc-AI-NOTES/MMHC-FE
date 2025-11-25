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
    weeklyAuditVolume: [
      { day: 'Mon', volume: 45 },
      { day: 'Tue', volume: 78 },
      { day: 'Wed', volume: 92 },
      { day: 'Thu', volume: 120 },
      { day: 'Fri', volume: 156 },
      { day: 'Sat', volume: 89 },
      { day: 'Sun', volume: 67 },
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
        type: 'failed_audit',
        title: 'Note #12439 failed audit',
        description: 'Critical issues detected.',
        timestamp: '2024-01-20T10:28:00Z',
        timeAgo: '2 minutes ago',
      },
      {
        id: '2',
        type: 'ai_update',
        title: 'AI model v1.3 deployed',
        description: 'Improved stability.',
        timestamp: '2024-01-20T09:30:00Z',
        timeAgo: '1 hour ago',
      },
      {
        id: '3',
        type: 'practitioner_submission',
        title: 'Practitioner submitted updated note #9921',
        description: '',
        timestamp: '2024-01-20T07:15:00Z',
        timeAgo: '3 hours ago',
      },
      {
        id: '4',
        type: 'report_generated',
        title: 'Weekly report generated',
        description: '876 notes processed.',
        timestamp: '2024-01-20T05:10:00Z',
        timeAgo: '5 hours ago',
      },
      {
        id: '5',
        type: 'blacklisted',
        title: 'Note #8745 moved to blacklist',
        description: 'Repeat violations.',
        timestamp: '2024-01-20T02:45:00Z',
        timeAgo: '8 hours ago',
      },
    ],
  };
};
