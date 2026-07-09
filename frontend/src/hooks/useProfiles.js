import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../api/profileApi";

/**
 * useProfiles
 *
 * Fetches the list of profiles belonging to the logged-in user
 *
 */
export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await getProfiles();
      return response.data.profiles;
    },
  });
};

/**
 * useCreateProfile
 *
 * A mutation hook for creating a new profile
 *
 */
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

/**
 * useUpdateProfile
 * Mutation for renaming a profile or toggling isActive
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

/**
 * useDeleteProfile
 * Mutation for deleting a profile
 */
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};
