import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { 
  Candidate, 
  CampaignMetrics, 
  ExtractedJobParameters,
  HunarAgent,
  CreateAgentPayload,
  CallLogEntry
} from '../types';
import { mockCandidates, mockCampaignMetrics, mockExtractedParameters } from '../mock/mockData';
import { useJobsQuery, useInfiniteAgentsQuery, useCreateAgentMutation, useUpdateAgentMutation } from '../queries';
import { RecruiterContext } from './RecruiterContextInstance';

export const RecruiterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetrics>(mockCampaignMetrics);
  const [extractedParams, setExtractedParams] = useState<ExtractedJobParameters>(mockExtractedParameters);
  const [activeCandidateId, setActiveCandidateIdState] = useState<string>('alex-johnson');
  const [isCallingSimulated, setIsCallingSimulated] = useState<boolean>(false);

  // Hunar AI Voice Agents — live from the backend via TanStack Query
  const {
    data: agentsData,
    isLoading: agentsQueryLoading,
    error: agentsErrorObj,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchAgentsQuery,
  } = useInfiniteAgentsQuery(20);

  const agents = useMemo(() => {
    if (!agentsData?.pages) return [];
    return agentsData.pages.flatMap(page => page.results);
  }, [agentsData]);

  const agentsTotalCount = agentsData?.pages[0]?.count ?? 0;
  const agentsLoading = agentsQueryLoading || isFetchingNextPage;
  const agentsError = agentsErrorObj
    ? (agentsErrorObj instanceof Error ? agentsErrorObj.message : String(agentsErrorObj))
    : null;
  const hasMoreAgents = hasNextPage ?? false;

  const [activeAgentForOutreachId, setActiveAgentForOutreachId] = useState<string>('');

  const refreshAgents = useCallback(async () => {
    await refetchAgentsQuery();
  }, [refetchAgentsQuery]);

  const loadMoreAgents = useCallback(async () => {
    await fetchNextPage();
  }, [fetchNextPage]);

  // Set default active agent when agents load
  useEffect(() => {
    if (agents.length > 0 && !agents.some(a => a.id === activeAgentForOutreachId)) {
      setActiveAgentForOutreachId(agents[0].id);
    }
  }, [agents, activeAgentForOutreachId]);

  // Jobs — live from the backend via TanStack Query
  const {
    data: jobs = [],
    isLoading: jobsLoading,
    error: jobsErrorObj,
    refetch: refetchJobsQuery,
  } = useJobsQuery();

  const jobsError = jobsErrorObj
    ? (jobsErrorObj instanceof Error ? jobsErrorObj.message : String(jobsErrorObj))
    : null;

  const refreshJobs = useCallback(async () => {
    await refetchJobsQuery();
  }, [refetchJobsQuery]);

  // Call log — client-side record of placed calls (backend has no call-history endpoint)
  const [callLog, setCallLog] = useState<Record<string, CallLogEntry>>(() => {
    try {
      const saved = localStorage.getItem('hunar_call_log');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('hunar_call_log', JSON.stringify(callLog));
    } catch {
      // ignore
    }
  }, [callLog]);

  /** Record calls as placed: status flips ringing -> completed after a short simulated connect. */
  const markCallsPlaced = useCallback((candidateIds: string[], agentName: string) => {
    const now = new Date().toISOString();
    setCallLog(prev => {
      const next = { ...prev };
      for (const id of candidateIds) {
        next[id] = { status: 'ringing', calledAt: now, agentName };
      }
      return next;
    });
    setTimeout(() => {
      setCallLog(prev => {
        const next = { ...prev };
        for (const id of candidateIds) {
          if (next[id] && next[id].status === 'ringing') {
            next[id] = { ...next[id], status: 'completed' };
          }
        }
        return next;
      });
    }, 4000);
  }, []);

  const navigateTo = (route: string) => {
    navigate(route);
    if (route.startsWith('/candidate/')) {
      const id = route.replace('/candidate/', '');
      if (id) setActiveCandidateIdState(id);
    }
  };

  // Keep active candidate in sync when navigating via browser back/forward
  useEffect(() => {
    if (location.pathname.startsWith('/candidate/')) {
      const id = location.pathname.replace('/candidate/', '');
      if (id) setActiveCandidateIdState(id);
    }
  }, [location.pathname]);

  const setActiveCandidateId = (id: string) => {
    setActiveCandidateIdState(id);
    navigateTo(`/candidate/${id}`);
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllCandidates = (select: boolean) => {
    if (select) {
      setSelectedCandidateIds(candidates.map(c => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const clearCandidateSelection = () => {
    setSelectedCandidateIds([]);
  };

  const createAgentMutation = useCreateAgentMutation();
  const updateAgentMutation = useUpdateAgentMutation();

  const createAgent = async (payload: CreateAgentPayload): Promise<HunarAgent> => {
    return createAgentMutation.mutateAsync(payload);
  };

  const updateAgent = async (id: string, payload: CreateAgentPayload): Promise<HunarAgent> => {
    return updateAgentMutation.mutateAsync({ id, payload });
  };

  const initiateVoiceOutreach = (idsToCall: string[], specificAgentId?: string) => {
    const selectedAgent = agents.find(a => a.id === (specificAgentId || activeAgentForOutreachId)) || agents[0];
    setIsCallingSimulated(true);

    setCandidates(prev =>
      prev.map(candidate => {
        if (idsToCall.includes(candidate.id)) {
          return {
            ...candidate,
            callStatus: 'ringing'
          };
        }
        return candidate;
      })
    );

    // Removed optimistic call count increment since it's now handled by the backend

    setMetrics(prev => ({
      ...prev,
      activeCalls: prev.activeCalls + idsToCall.length,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          title: `Hunar Voice [${selectedAgent ? selectedAgent.persona_name : 'Agent'}] Dispatched`,
          description: `Initiated autonomous voice outreach to ${idsToCall.length} candidate(s) using agent ${selectedAgent?.agent_code || 'FD142'}`,
          timestamp: "Just now",
          type: "candidate_queued",
          statusBadge: "Dialing"
        },
        ...prev.recentActivity
      ]
    }));

    clearCandidateSelection();

    setTimeout(() => {
      setIsCallingSimulated(false);
    }, 2500);
  };

  const activeCandidate = candidates.find(c => c.id === activeCandidateId) || candidates[0];

  return (
    <RecruiterContext.Provider
      value={{
        currentRoute,
        navigateTo,
        candidates,
        selectedCandidateIds,
        toggleSelectCandidate,
        selectAllCandidates,
        clearCandidateSelection,
        initiateVoiceOutreach,
        metrics,
        extractedParams,
        setExtractedParams,
        activeCandidate,
        setActiveCandidateId,
        isCallingSimulated,
        agents,
        agentsTotalCount,
        agentsLoading,
        agentsError,
        hasMoreAgents,
        refreshAgents,
        loadMoreAgents,
        activeAgentForOutreachId,
        setActiveAgentForOutreachId,
        createAgent,
        updateAgent,
        jobs,
        jobsLoading,
        jobsError,
        refreshJobs,
        callLog,
        markCallsPlaced
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
};
