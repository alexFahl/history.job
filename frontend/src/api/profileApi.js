import api from "./axios";

/**
 * Profile API
 */

// POST => { profileName, country, timezone } => created profile
export const createProfile = (data) => api.post("/api/profiles", data);

// GET => { profiles: [...] }
export const getProfiles = () => api.get("/api/profiles");

// GET => { profile }
export const getProfileById = (id) => api.get(`/api/profiles/${id}`);

// PUT => { profileName?, isActive? } => updated profile
export const updateProfile = (id, data) => api.put(`/api/profiles/${id}`, data);

// DELETE => { message }
export const deleteProfile = (id) => api.delete(`/api/profiles/${id}`);
