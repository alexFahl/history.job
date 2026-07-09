import api from "./axios";

/**
 * Application API
 */

// POST => { profileId, companyName, jobTitle, ... } => created application
export const createApplication = (data) => api.post("/api/applications", data);

// GET => { applications: [...] }
export const getApplicationsByProfile = (profileId) =>
  api.get(`/api/applications/profile/${profileId}`);

// GET => { application }
export const getApplicationById = (id) => api.get(`/api/applications/${id}`);

// PUT => partial update => { application }
export const updateApplication = (id, data) =>
  api.put(`/api/applications/${id}`, data);

// DELETE => { message }
export const deleteApplication = (id) => api.delete(`/api/applications/${id}`);

// POST => { name, email?, phone?, job? } => { contacts }
export const addContact = (id, data) =>
  api.post(`/api/applications/${id}/contacts`, data);

// POST => { date, note?, communicationChannel? }
export const addFollowUp = (id, data) =>
  api.post(`/api/applications/${id}/followups`, data);

// POST => { date, communicationChannel? }
export const addReply = (id, data) =>
  api.post(`/api/applications/${id}/replies`, data);

/**
 * uploadDocument
 * Sends a file as multipart/form-data
 *
 * @param {string} id      - Application ID
 * @param {FormData} formData - Must contain "file" and "docType"
 */
export const uploadDocument = (id, formData) =>
  api.post(`/api/applications/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
