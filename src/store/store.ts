import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertsReducer from './slices/alertsSlice';
import agentsReducer from './slices/agentsSlice';
import filterOptionsReducer from './slices/filterOptionsSlice';
import { useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    alerts: alertsReducer,
    agents: agentsReducer,
    filterOptions: filterOptionsReducer,
  },
});
export const { dispatch, getState } = store;

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
