import axios from 'axios';

// Create API instances for each service
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const projectApi = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const taskApi = axios.create({
  baseURL: import.meta.env.VITE_TASK_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to all API instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all API instances
[authApi, projectApi, taskApi].forEach(addAuthInterceptor);

// Export API instances and endpoint functions
export const auth = {
  login: (credentials) => authApi.post('/login', credentials),
  signup: (userData) => authApi.post('/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  getProfile: () => authApi.get('/validate', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
};

export const projects = {
  getAll: () => projectApi.get('/'),
  getById: (id) => projectApi.get(`/${id}`),
  create: (data) => projectApi.post('/', data),
  update: (id, data) => projectApi.put(`/${id}`, data),
  delete: (id) => projectApi.delete(`/${id}`),
  getProjectTasks: (id) => projectApi.get(`/${id}/tasks`),
  addProjectTask: (id, taskData) => projectApi.post(`/${id}/tasks`, taskData),
};

export const tasks = {
  getAll: () => taskApi.get('/'),
  getById: (id) => taskApi.get(`/${id}`),
  create: (data) => taskApi.post('/', data),
  update: (id, data) => taskApi.put(`/${id}`, data),
  delete: (id) => taskApi.delete(`/${id}`),
  updateStatus: (id, status) => taskApi.patch(`/${id}/status`, { status }),
  assignTask: (id, userId) => taskApi.post(`/${id}/assign`, { userId }),
};

export { authApi, projectApi, taskApi };
