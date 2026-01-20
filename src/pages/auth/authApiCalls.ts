import axios, { AxiosError } from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { setLocalStorageItem } from '@/utils/storage';
import { showToast } from '../../lib/toast';
import { setHideBeatLoader, setShowBeatLoader } from '@/store/slices/alertsSlice';
import { dispatch } from '@/store/store';
import { setAuthUser } from '@/store/slices/authSlice';
import type { User } from '@/types/settings';

export const API_ENDPOINTS = {
  LOGOUT: '/auth/logout',
};

interface ApiResponse {
  status: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

const delay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const logoutUser = async (): Promise<boolean> => {
  try {
    await delay(2000);

    const response: ApiResponse = { status: true, message: 'Logged out successfully' };

    if (response.status) {
      showToast.success('Logged Out Successfully!');
      return true;
    }
    return false;
  } catch (error: unknown) {
    handleCatchMessages(error as AxiosError<{ message?: string }>);
    return false;
  }
};

export const handleSignIn = async (email: string, password: string): Promise<boolean> => {
  dispatch(setShowBeatLoader());

  try {
    const response = await axios.post('/login', { email, password });

    // Axios interceptor returns `response.data` already
    const token = response?.data?.token?.token;
    const user = response?.data?.user as User | undefined;

    if (response?.status && token && user) {
      setLocalStorageItem('authentication_token', token);
      dispatch(setAuthUser(user));
      return true;
    } else {
      handleErrorMessages(response);
      return false;
    }
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  } finally {
    dispatch(setHideBeatLoader());
  }
};
