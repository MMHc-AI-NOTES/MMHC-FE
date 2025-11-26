import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertsReducer from './slices/alertsSlice';
import agentsReducer from './slices/agentsSlice';
import { useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    alerts: alertsReducer,
    agents: agentsReducer,
  },
});
export const { dispatch, getState } = store;

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
