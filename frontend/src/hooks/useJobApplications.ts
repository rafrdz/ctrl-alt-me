import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApplicationsApi } from '../services/api';
import type { JobApplication, NewJobApplication } from '../types/jobApplication';

// Query keys
export const QUERY_KEYS = {
  jobApplications: ['jobApplications'] as const,
  jobApplication: (id: number) => ['jobApplications', id] as const,
};

// Get all job applications
export const useJobApplications = () => {
  return useQuery({
    queryKey: QUERY_KEYS.jobApplications,
    queryFn: jobApplicationsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get job application by ID
export const useJobApplication = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.jobApplication(id),
    queryFn: () => jobApplicationsApi.getById(id),
    enabled: !!id,
  });
};

// Create job application
export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: NewJobApplication) =>
      jobApplicationsApi.create(application),
    onSuccess: () => {
      // Invalidate and refetch job applications list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplications,
      });
    },
  });
};

// Update job application
export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (application: JobApplication) =>
      jobApplicationsApi.update(application),
    onSuccess: (updatedApplication) => {
      // Update the specific job application in cache
      queryClient.setQueryData(
        QUERY_KEYS.jobApplication(updatedApplication.id),
        updatedApplication
      );
      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplications,
      });
    },
  });
};

// Delete job application
export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => jobApplicationsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.jobApplication(deletedId),
      });
      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jobApplications,
      });
    },
  });
};
