import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAgents, getAgent, createAgent, updateAgent } from '../api/hunarClient';
import type { HunarAgent, CreateAgentPayload, HunarAgentListResponse } from '../types';

/**
 * Query keys for agents cache management
 */
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...agentKeys.lists(), { page, pageSize }] as const,
  infinite: () => [...agentKeys.all, 'infinite'] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
};

/**
 * Paginated query for agents (single page).
 * Use this for simple one-page fetches.
 */
export function useAgentsQuery(page = 1, pageSize = 20) {
  return useQuery<HunarAgentListResponse, Error>({
    queryKey: agentKeys.list(page, pageSize),
    queryFn: () => listAgents(page, pageSize),
  });
}

/**
 * Infinite query for agents — accumulates pages with "Load More".
 * Returns flattened `agents` array plus pagination helpers.
 */
export function useInfiniteAgentsQuery(pageSize = 20) {
  return useInfiniteQuery<HunarAgentListResponse, Error>({
    queryKey: agentKeys.infinite(),
    queryFn: ({ pageParam }) => listAgents(pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.next) return (lastPageParam as number) + 1;
      return undefined;
    },
  });
}

/**
 * Hook to fetch a single agent by ID (full detail including prompts).
 */
export function useAgentDetailQuery(agentId: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery<HunarAgent, Error>({
    queryKey: agentId ? agentKeys.detail(agentId) : [...agentKeys.details(), 'empty'],
    queryFn: () => {
      if (!agentId) throw new Error('Agent ID is required');
      return getAgent(agentId);
    },
    enabled: Boolean(agentId) && (options?.enabled ?? true),
  });
}

/**
 * Mutation hook to create a new agent
 */
export function useCreateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation<HunarAgent, Error, CreateAgentPayload>({
    mutationFn: (payload) => createAgent(payload),
    onSuccess: (newAgent) => {
      // Invalidate all agent list queries so they refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.infinite() });
      // Pre-seed the detail cache
      queryClient.setQueryData(agentKeys.detail(newAgent.id), newAgent);
    },
  });
}

/**
 * Mutation hook to update an existing agent
 */
export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation<HunarAgent, Error, { id: string; payload: CreateAgentPayload }>({
    mutationFn: ({ id, payload }) => updateAgent(id, payload),
    onSuccess: (updatedAgent, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.infinite() });
      queryClient.setQueryData(agentKeys.detail(id), updatedAgent);
    },
  });
}
