import axios, { AxiosError } from 'axios';
import { handleCatchMessages, handleErrorMessages } from '@/utils/helper';
import { setHideBeatLoader, setShowBeatLoader } from '@/store/slices/alertsSlice';
import { dispatch } from '@/store/store';
import { setAuthUser } from '@/store/slices/authSlice';
import { showToast } from '@/lib/toast';
import type { User } from '@/types/settings';

interface ApiResponse {
  status: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
}

interface UpdateProfilePayload {
  fullName: string;
  email: string;
}

interface UpdatePasswordPayload {
  user_id: number;
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const updateProfile = async (payload: UpdateProfilePayload, userId: number): Promise<boolean> => {
  dispatch(setShowBeatLoader());
  try {
    const response = (await axios.patch(`/users/${userId}`, {
      full_name: payload.fullName,
      email: payload.email,
    })) as unknown as ApiResponse;

    if (response?.status) {
      // Update Redux state with response data
      if (response.data) {
        dispatch(setAuthUser(response.data as User));
      }
      showToast.success(response?.message || 'Profile updated successfully!');
      return true;
    } else {
      handleErrorMessages(response);
      return false;
    }
  } catch (error: any) {
    handleCatchMessages(error as AxiosError<{ message?: string }>);
    return false;
  } finally {
    dispatch(setHideBeatLoader());
  }
};

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<boolean> => {
  dispatch(setShowBeatLoader());
  try {
    const response = (await axios.patch('/users/update-password', {
      user_id: payload.user_id,
      current_password: payload.current_password,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    })) as unknown as ApiResponse;

    if (response?.status) {
      showToast.success(response?.message || 'Password updated successfully!');
      return true;
    } else {
      handleErrorMessages(response);
      return false;
    }
  } catch (error: any) {
    handleCatchMessages(error as AxiosError<{ message?: string }>);
    return false;
  } finally {
    dispatch(setHideBeatLoader());
  }
};
