import axios from "axios";
import useAuthStore from "../store/authStore";

/**
 * Axios Instance
 *
 * Link to the backend API
 *
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 *
 * Runs before every outgoing request
 * Reads the token from the Zustand store and injects it as a Bearer token in the Authorization header
 *
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
