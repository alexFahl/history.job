import api from "./axios";

/**
 * Auth API
 */

// POST => { username, password } => { token, user }
export const register = (data) => api.post("/api/auth/register", data);

// POST => { username, password } => { token, user }
export const login = (data) => api.post("/api/auth/login", data);

// GET => (JWT in header) => { user }
export const getMe = () => api.get("/api/auth/me");
