import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { ToastObj } from '@/lib/toast';

interface AlertsState {
  toastObj: ToastObj | null;
  beatLoader: number;
}

const initialState: AlertsState = { toastObj: null, beatLoader: 0 };

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setToastObj: (state, action: PayloadAction<ToastObj | null>) => {
      state.toastObj = action.payload;
    },
    setShowBeatLoader: state => {
      state.beatLoader += 1;
    },
    setHideBeatLoader: state => {
      if (state.beatLoader > 0) state.beatLoader -= 1;
    },
  },
});

export const { setToastObj, setShowBeatLoader, setHideBeatLoader } = alertsSlice.actions;
export default alertsSlice.reducer;
