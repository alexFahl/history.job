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

// DELETE => { contacts } — removes one contact by its sub-document _id
export const deleteContact = (id, contactId) =>
  api.delete(`/api/applications/${id}/contacts/${contactId}`);

// POST => { date, note?, communicationChannel? }
export const addFollowUp = (id, data) =>
  api.post(`/api/applications/${id}/followups`, data);

// DELETE => { followUps } — removes one follow-up entry by its sub-document _id
export const deleteFollowUp = (id, followUpId) =>
  api.delete(`/api/applications/${id}/followups/${followUpId}`);

// POST => { date, note?, communicationChannel? }
export const addReply = (id, data) =>
  api.post(`/api/applications/${id}/replies`, data);

// DELETE => { replies } — removes one reply entry by its sub-document _id
export const deleteReply = (id, replyId) =>
  api.delete(`/api/applications/${id}/replies/${replyId}`);

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

// DELETE => { message, docType } — removes the file from Cloudinary and clears the DB fields
export const deleteDocument = (id, docType) =>
  api.delete(`/api/applications/${id}/documents/${docType}`);
