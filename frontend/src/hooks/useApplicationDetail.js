import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
  addContact,
  deleteContact,
  addFollowUp,
  deleteFollowUp,
  addReply,
  deleteReply,
  uploadDocument,
  deleteDocument,
} from "../api/appApi";

/**
 * useApplicationDetail
 *
 * Fetches a single application by ID for the ApplicationDetail page
 */
export const useApplicationDetail = (id) => {
  return useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const response = await getApplicationById(id);
      return response.data.application;
    },
    enabled: !!id,
  });
};

/**
 * useUpdateApplicationDetail
 *
 * Mutation for updating the application from the detail page
 * @param {string} id        - Application ID
 * @param {string} profileId - Parent profile ID
 */
export const useUpdateApplicationDetail = (id, profileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications", profileId] });
    },
  });
};

/**
 * useDeleteApplicationDetail
 * Mutation for permanently deleting the application
 */
export const useDeleteApplicationDetail = (id, profileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", profileId] });
    },
  });
};

/**
 * useAddContact
 * Mutation for adding a recruiter contact to contacts
 */
export const useAddContact = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => addContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useDeleteContact
 * Mutation for removing a recruiter contact from the contacts array.
 */
export const useDeleteContact = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId) => deleteContact(id, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useAddFollowUp
 * Mutation for logging a follow-up
 */
export const useAddFollowUp = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => addFollowUp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useDeleteFollowUp
 * Mutation for removing a follow-up entry from the timeline
 */
export const useDeleteFollowUp = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpId) => deleteFollowUp(id, followUpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useAddReply
 * Mutation for logging a reply
 */
export const useAddReply = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => addReply(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useDeleteReply
 * Mutation for removing a reply entry from the timeline
 */
export const useDeleteReply = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId) => deleteReply(id, replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useUploadDocument
 * Mutation for uploading a CV or cover letter to Cloudinary
 */
export const useUploadDocument = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadDocument(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};

/**
 * useDeleteDocument
 * Mutation for deleting an uploaded CV or cover letter (removes it from
 * Cloudinary on the back-end too).
 */
export const useDeleteDocument = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docType) => deleteDocument(id, docType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
  });
};
