import axios from 'axios';
import { DashboardStats } from '@/types/dashboard';
import { handleCatchMessages } from '@/utils/helper';

export const fetchDashboardData = async (): Promise<DashboardStats | null> => {
  try {
    const response = await axios.get<DashboardStats>('/notes/dashboard-statistics');
    if (response?.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  }
};
