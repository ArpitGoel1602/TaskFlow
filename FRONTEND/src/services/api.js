import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
console.log("BASE_URL", BASE_URL);
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    // const auth = useAuthStore.getState();
    // const token = auth.accessToken;

    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
    }

    return Promise.reject(error);
  },
);

export default api;
