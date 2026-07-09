import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicationsByProfile,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../api/appApi";

/**
 * useApplications
 *
 * Fetches all applications belonging to a given profile
 *
 */
export const useApplications = (profileId) => {
  return useQuery({
    queryKey: ["applications", profileId],
    queryFn: async () => {
      const response = await getApplicationsByProfile(profileId);
      return response.data.applications;
    },
    enabled: !!profileId,
  });
};

/**
 * useCreateApplication
 * Mutation for adding a new application
 */
export const useCreateApplication = (profileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", profileId] });
    },
  });
};

/**
 * useUpdateApplication
 * Mutation for updating an application
 */
export const useUpdateApplication = (profileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", profileId] });
    },
  });
};

/**
 * useDeleteApplication
 * Mutation for permanently deleting an application
 */
export const useDeleteApplication = (profileId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", profileId] });
    },
  });
};
