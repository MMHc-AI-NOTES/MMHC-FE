import axios, { AxiosError } from 'axios';
import { handleCatchMessages, handleErrorMessages, setLocalStorageItem } from '@/utils/helper';
import { showToast } from '../../lib/toast';
import { setHideBeatLoader, setShowBeatLoader } from '@/store/slices/alertsSlice';
import { dispatch } from '@/store/store';

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

    if (response.status && response.data?.token?.token) {
      setLocalStorageItem('authentication_token', response.data.token.token);
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
