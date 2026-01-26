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
  profilePicture?: File;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  password: string;
  password_confirmation: string;
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
  dispatch(setShowBeatLoader());
  try {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    if (payload.profilePicture) {
      formData.append('profilePicture', payload.profilePicture);
    }

    const response = (await axios.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })) as unknown as ApiResponse;

    if (response?.status) {
      // Refresh user data
      const meResponse = (await axios.get('/me')) as unknown as ApiResponse;
      if (meResponse?.status && meResponse.data) {
        dispatch(setAuthUser(meResponse.data as User));
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
    const response = (await axios.put('/profile/password', payload)) as unknown as ApiResponse;

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
