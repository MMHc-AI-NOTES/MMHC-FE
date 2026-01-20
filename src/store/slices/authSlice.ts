import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/settings';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/storage';

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: (getLocalStorageItem<User>('current_user', null) as User | null) ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      setLocalStorageItem('current_user', action.payload);
    },
    clearAuth: state => {
      state.user = null;
      setLocalStorageItem('current_user', null);
    },
  },
});

export const { setAuthUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
