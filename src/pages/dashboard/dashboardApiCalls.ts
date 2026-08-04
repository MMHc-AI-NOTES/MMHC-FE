import axios from 'axios';
import { DashboardStats } from '@/types/dashboard';
import { handleCatchMessages } from '@/utils/helper';

export const fetchDashboardData = async (): Promise<DashboardStats | null> => {
  try {
    const response = await axios.get<{ data: DashboardStats }>('/notes/dashboard-statistics');
    if (response?.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};
