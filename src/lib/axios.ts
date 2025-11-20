import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getLocalStorageItem, handleLogout } from '@/utils/helper';
import { config } from '@/config/config';

const AxiosInterceptor = {
  initialized: false,

  initialize: (): void => {
    if (AxiosInterceptor.initialized) return;
    AxiosInterceptor.initialized = true;

    axios.defaults.baseURL = config.backendUrl;
    axios.defaults.timeout = 10000;
    axios.defaults.headers['Content-Type'] = 'application/json';

    axios.interceptors.request.use(
      (axiosConfig: InternalAxiosRequestConfig) => {
        const token = getLocalStorageItem('authentication_token');
        if (token) {
          const headers = new AxiosHeaders(axiosConfig.headers);
          headers.set('Authorization', `Bearer ${token}`);
          axiosConfig.headers = headers;
        }
        return axiosConfig;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    axios.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) handleLogout();
        return Promise.reject(error);
      },
    );
  },
};

export default AxiosInterceptor;
