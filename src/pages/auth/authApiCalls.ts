import { AxiosError } from 'axios';
import { handleCatchMessages, setLocalStorageItem } from '@/utils/helper';
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

export const handleSignIn = async (): Promise<boolean> => {
  dispatch(setShowBeatLoader());
  await delay(1000);

  try {
    // const response = await axios.post('/login', {
    //   email: 'adnanafzal7111@gmail.com',
    //   password: 'experts@123',
    // });
    const response = {
      status: true,
      data: {
        token: { type: 'bearer', token: 'oat_MjU5.enk2YzNxb' },
        id: 41,
        fullName: 'Saqlain Ali',
        email: 'imhassan66@gmail.com',
      },
      message: 'Logged In Successfully',
    };

    if (response.status && response.data?.token?.token) {
      setLocalStorageItem('authentication_token', response.data.token.token);
      showToast.success('Login successful! Welcome back.');

      return true;
    }
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  } finally {
    dispatch(setHideBeatLoader());
  }
};
