import axios from 'axios';
import { handleCatchMessages, handleErrorMessages, handleLogout } from '@/utils/helper';
import { setLocalStorageItem } from '@/utils/storage';
import { showToast } from '../../lib/toast';
import { setHideBeatLoader, setShowBeatLoader } from '@/store/slices/alertsSlice';
import { dispatch } from '@/store/store';
import { setAuthUser } from '@/store/slices/authSlice';
import type { User } from '@/types/settings';

export const API_ENDPOINTS = {
  LOGOUT: '/auth/logout',
};

// interface ApiResponse {
//   status: boolean;
//   message?: string;
//   errors?: Record<string, string[]>;
// }

interface LoginResponseBody {
  status: boolean;
  message?: string;
  data?: {
    token?: {
      token?: string;
    };
    user?: User;
  };
}

interface MeResponseBody {
  status: boolean;
  message?: string;
  data?: User;
}

interface OnboardingPayload {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

interface OnboardingResponseBody {
  status: boolean;
  message?: string;
  data?: any;
}

export const logoutUser = async (): Promise<boolean> => {
  try {
    await axios.get('/logout');
    handleLogout();
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};

export const handleSignIn = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = (await axios.post('/login', { email, password })) as unknown as LoginResponseBody;

    // Axios interceptor returns response body (not AxiosResponse)
    const token = response?.data?.token?.token;
    const user = response?.data?.user;

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
  }
};

export const handleImpersonateSignIn = async (email: string, password: string, targetUserEmail: string): Promise<boolean> => {
  try {
    const response = (await axios.post('/impersonate', {
      email,
      password,
      target_user_email: targetUserEmail,
    })) as unknown as LoginResponseBody;

    const token = response?.data?.token?.token;
    const user = response?.data?.user;

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
  }
};

export const fetchMe = async (): Promise<User | null> => {
  dispatch(setShowBeatLoader());
  try {
    const response = (await axios.get('/me')) as unknown as MeResponseBody;

    if (response?.status && response.data) {
      dispatch(setAuthUser(response.data));
      return response.data;
    }
    handleErrorMessages(response);
    return null;
  } catch (error: any) {
    handleCatchMessages(error);
    return null;
  } finally {
    dispatch(setHideBeatLoader());
  }
};

export const onboardInvitedUser = async (payload: OnboardingPayload): Promise<boolean> => {
  dispatch(setShowBeatLoader());
  try {
    const response = (await axios.post('/users/onboarding', payload)) as unknown as OnboardingResponseBody;
    const token = response?.data?.token?.token;
    if (response?.status) {
      showToast.success(response?.message || 'Account created successfully!');
      setLocalStorageItem('authentication_token', token);

      // Refresh auth user from backend
      await fetchMe();
      return true;
    }
    handleErrorMessages(response);
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  } finally {
    dispatch(setHideBeatLoader());
  }
};

export const requestForgotPassword = async (email: string): Promise<boolean> => {
  try {
    const response = (await axios.post('/forgot-password', { email })) as unknown as { status?: boolean; message?: string };
    if (response?.status) {
      return true;
    }
    handleErrorMessages(response);
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};

interface ResetPasswordPayload {
  token: string;
  password: string;
  password_confirmation: string;
}

export const resetPassword = async (payload: ResetPasswordPayload): Promise<boolean> => {
  try {
    const response = (await axios.post('/reset-password', payload)) as unknown as { status?: boolean; message?: string };
    if (response?.status) {
      showToast.success(response?.message || 'Password reset successfully.');
      return true;
    }
    handleErrorMessages(response);
    return false;
  } catch (error: any) {
    handleCatchMessages(error);
    return false;
  }
};
