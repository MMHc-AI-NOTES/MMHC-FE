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
  volume: number;
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
  type: 'failed_audit' | 'ai_update' | 'practitioner_submission' | 'report_generated' | 'blacklisted';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}
