import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJobCandidates,
  scrapePeopleForJob,
  addJobCandidate,
  uploadCandidatesCsv,
  initiateCandidateCall,
  getCandidateCallDetails,
} from '../api/hunarClient';
import type {
  JobCandidateRecord,
  AddCandidatePayload,
  ScrapeJobResponse,
  CallInitiationResult,
  CandidateCallDetails,
} from '../types';


/**
 * Query keys for candidates cache management
 */
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  listByJob: (jobId: string) => [...candidateKeys.lists(), jobId] as const,
  callDetails: () => [...candidateKeys.all, 'call-details'] as const,
  callDetail: (candidateId: string) => [...candidateKeys.callDetails(), candidateId] as const,
};

/**
 * Hook to fetch all candidates for a specific job
 */
export function useJobCandidatesQuery(jobId: string | undefined) {
  return useQuery<JobCandidateRecord[], Error>({
    queryKey: jobId ? candidateKeys.listByJob(jobId) : [...candidateKeys.lists(), 'empty'],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return getJobCandidates(jobId);
    },
    enabled: Boolean(jobId),
  });
}

/**
 * Mutation hook to scrape candidates from Apollo for a job
 */
export function useScrapeCandidatesMutation(jobId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<ScrapeJobResponse, Error, { limit?: number }>({
    mutationFn: ({ limit = 25 }) => {
      if (!jobId) throw new Error('Job ID is required');
      return scrapePeopleForJob(jobId, limit);
    },
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.listByJob(jobId) });
      }
    },
  });
}

/**
 * Mutation hook to add a candidate manually to a job
 */
export function useAddCandidateMutation(jobId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<JobCandidateRecord, Error, AddCandidatePayload>({
    mutationFn: (payload) => {
      if (!jobId) throw new Error('Job ID is required');
      return addJobCandidate(jobId, payload);
    },
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.listByJob(jobId) });
      }
    },
  });
}

/**
 * Mutation hook to upload candidates via CSV
 */
export function useUploadCandidatesCsvMutation(jobId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<JobCandidateRecord[], Error, File>({
    mutationFn: (file) => {
      if (!jobId) throw new Error('Job ID is required');
      return uploadCandidatesCsv(jobId, file);
    },
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.listByJob(jobId) });
      }
    },
  });
}

/**
 * Mutation hook to initiate a voice call to a candidate
 */
export function useInitiateCallMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CallInitiationResult,
    Error,
    { candidateId: string; agentId?: string; phoneNumber?: string }
  >({
    mutationFn: ({ candidateId, agentId, phoneNumber }) =>
      initiateCandidateCall(candidateId, { agentId, phoneNumber }),
    onSuccess: (_data, { candidateId }) => {
      // Invalidate call details for this candidate so it refetches
      queryClient.invalidateQueries({ queryKey: candidateKeys.callDetail(candidateId) });
      // Also invalidate candidate lists since call_id may change
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
    },
  });
}

/**
 * Hook to fetch call details for a specific candidate
 */
export function useCandidateCallDetailsQuery(
  candidateId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery<CandidateCallDetails, Error>({
    queryKey: candidateId ? candidateKeys.callDetail(candidateId) : [...candidateKeys.callDetails(), 'empty'],
    queryFn: () => {
      if (!candidateId) throw new Error('Candidate ID is required');
      return getCandidateCallDetails(candidateId);
    },
    enabled: Boolean(candidateId) && (options?.enabled ?? true),
    // Call details don't change often once a call is completed
    staleTime: 1000 * 60 * 5,
    // Don't throw errors for missing call details (404 is expected for uncalled candidates)
    retry: false,
  });
}
