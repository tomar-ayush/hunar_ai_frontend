import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listJobs, getJob, createJob, updateJob, deleteJob } from '../api/hunarClient';
import type { HunarJob, CreateJobPayload } from '../types';

/**
 * Query keys for jobs cache management
 */
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

/**
 * Hook to fetch all jobs from the backend API
 */
export function useJobsQuery(options?: { enabled?: boolean }) {
  return useQuery<HunarJob[], Error>({
    queryKey: jobKeys.lists(),
    queryFn: () => listJobs(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook to fetch a single job by its ID
 */
export function useJobQuery(jobId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<HunarJob, Error>({
    queryKey: jobId ? jobKeys.detail(jobId) : [...jobKeys.details(), 'empty'],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return getJob(jobId);
    },
    enabled: Boolean(jobId) && (options?.enabled ?? true),
  });
}

/**
 * Mutation hook to create a new job and invalidate jobs list cache
 */
export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation<HunarJob, Error, CreateJobPayload>({
    mutationFn: (payload: CreateJobPayload) => createJob(payload),
    onSuccess: (newJob) => {
      // Invalidate the jobs list so any components subscribed to jobs list refetch fresh data
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      // Pre-seed the cache for this specific job detail
      queryClient.setQueryData(jobKeys.detail(newJob.id), newJob);
    },
  });
}

/**
 * Mutation hook to update an existing job and update cache
 */
export function useUpdateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation<HunarJob, Error, { id: string; payload: Partial<CreateJobPayload> }>({
    mutationFn: ({ id, payload }) => updateJob(id, payload),
    onSuccess: (updatedJob, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.setQueryData(jobKeys.detail(id), updatedJob);
    },
  });
}

/**
 * Mutation hook to delete a job and invalidate jobs list cache
 */
export function useDeleteJobMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.removeQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}
