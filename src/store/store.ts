import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertsReducer from './slices/alertsSlice';
import { useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    alerts: alertsReducer,
  },
});
export const { dispatch, getState } = store;

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
