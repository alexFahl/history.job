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

/**
 * Response Interceptor
 *
 * Runs after every response (or error) coming back from the API
 * If the server answers 401 (expired or invalid JWT) , we clear the auth state and back to the login page
 *
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isAuthRoute =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register");

    if (status === 401 && !isAuthRoute) {
      const { token, clearAuth } = useAuthStore.getState();

      // Only act if there was an active session to tear down
      if (token) {
        clearAuth();

        // Redirect to the login page unless we're already there
        if (window.location.pathname !== "/auth") {
          window.location.assign("/auth");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
