export interface DashboardStats {
  notesAuditedToday: number;
  weeklyGrowth: number;
  activePractitioners: number;
  criticalIssues: number;
  weeklyAuditVolume: WeeklyData[];
  practitionerTrends: PractitionerTrend[];
  recentActivities: RecentActivity[];
}

export interface WeeklyData {
  day: string;
  criticalFailures: number;
  hitl: number;
  passed: number;
  practitionerCorrections: number;
}

export interface PractitionerTrend {
  name: string;
  data: {
    day: string;
    score: number;
  }[];
}

export interface RecentActivity {
  id: string;
  type: 'info' | 'progress' | 'critical' | 'default';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}
