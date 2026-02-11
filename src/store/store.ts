import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import alertsReducer from './slices/alertsSlice';
import agentsReducer from './slices/agentsSlice';
import filterOptionsReducer from './slices/filterOptionsSlice';
import smeConfigReducer from './slices/smeConfigSlice';
import usersReducer from './slices/usersSlice';
import authReducer from './slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    alerts: alertsReducer,
    auth: authReducer,
    agents: agentsReducer,
    filterOptions: filterOptionsReducer,
    smeConfig: smeConfigReducer,
    users: usersReducer,
  },
});
export const { dispatch, getState } = store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
