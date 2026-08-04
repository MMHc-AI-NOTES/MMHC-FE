import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchDashboardData } from './dashboardApiCalls';
import { DashboardStats } from '@/types/dashboard';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('fetchDashboardData API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches live dashboard statistics successfully from API endpoint', async () => {
    const mockStats: DashboardStats = {
      notesAuditedToday: 12,
      weeklyGrowth: 15,
      activePractitioners: 8,
      criticalIssues: 2,
      weeklyAuditVolume: [
        { day: 'Mon', criticalFailures: 1, hitl: 2, passed: 5, practitionerCorrections: 0 },
        { day: 'Tue', criticalFailures: 0, hitl: 1, passed: 8, practitionerCorrections: 1 },
      ],
      practitionerTrends: [
        {
          name: 'A. Martinez',
          data: [{ day: 'Mon', score: 92 }],
        },
      ],
      recentActivities: [
        {
          id: '1',
          type: 'info',
          title: 'Note #101 processed',
          description: 'Practitioner: A. Martinez',
          timestamp: '2026-08-04T12:00:00Z',
          timeAgo: '5 minutes ago',
        },
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { data: mockStats },
    });

    const result = await fetchDashboardData();

    expect(mockedAxios.get).toHaveBeenCalledWith('/notes/dashboard-statistics');
    expect(result).toEqual(mockStats);
    expect(result?.notesAuditedToday).toBe(12);
    expect(result?.activePractitioners).toBe(8);
  });

  it('handles API errors gracefully and returns null', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    const result = await fetchDashboardData();

    expect(mockedAxios.get).toHaveBeenCalledWith('/notes/dashboard-statistics');
    expect(result).toBeNull();
  });
});
