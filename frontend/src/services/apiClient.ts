import axios from 'axios';

//IP lokal backend FastAPI
const API_BASE_URL = 'http://localhost:8000'; 

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//interceptor Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uigm_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('uigm_token');
        localStorage.removeItem('uigm_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);