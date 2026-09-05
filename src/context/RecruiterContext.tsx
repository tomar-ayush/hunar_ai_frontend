import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { 
  Candidate, 
  CampaignMetrics, 
  ExtractedJobParameters,
  HunarAgent,
  CreateAgentPayload
} from '../types';
import { mockCandidates, mockCampaignMetrics, mockExtractedParameters } from '../mock/mockData';
import * as hunarApi from '../api/hunarClient';
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

  // Hunar AI Voice Agents — live from the backend
  const [agents, setAgents] = useState<HunarAgent[]>([]);
  const [agentsTotalCount, setAgentsTotalCount] = useState<number>(0);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [hasMoreAgents, setHasMoreAgents] = useState<boolean>(false);

  const [activeAgentForOutreachId, setActiveAgentForOutreachId] = useState<string>('');

  const refreshAgents = useCallback(async () => {
    setAgentsLoading(true);
    setAgentsError(null);
    try {
      const res = await hunarApi.listAgents(1, 20);
      setAgents(res.results);
      setAgentsTotalCount(res.count);
      setHasMoreAgents(Boolean(res.next) || res.results.length < res.count);
      setActiveAgentForOutreachId(prev =>
        prev && res.results.some(a => a.id === prev) ? prev : res.results[0]?.id || ''
      );
    } catch (err) {
      setAgentsError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  const loadMoreAgents = useCallback(async () => {
    setAgentsLoading(true);
    try {
      const res = await hunarApi.listAgents(Math.ceil(agents.length / 20) + 1, 20);
      setAgents(prev => {
        const seen = new Set(prev.map(a => a.id));
        return [...prev, ...res.results.filter(a => !seen.has(a.id))];
      });
      setAgentsTotalCount(res.count);
      setHasMoreAgents(agents.length + res.results.length < res.count);
    } catch (err) {
      setAgentsError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setAgentsLoading(false);
    }
  }, [agents.length]);

  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

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

  const createAgent = async (payload: CreateAgentPayload): Promise<HunarAgent> => {
    const created = await hunarApi.createAgent(payload);
    setAgents(prev => [created, ...prev]);
    setAgentsTotalCount(prev => prev + 1);
    return created;
  };

  const updateAgent = async (id: string, payload: CreateAgentPayload): Promise<HunarAgent> => {
    const updated = await hunarApi.updateAgent(id, payload);
    setAgents(prev => prev.map(agent => (agent.id === id ? { ...agent, ...updated } : agent)));
    return updated;
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

    // Increment agent call counts
    if (selectedAgent) {
      setAgents(prev =>
        prev.map(a =>
          a.id === selectedAgent.id
            ? { ...a, total_calls: (a.total_calls || 0) + idsToCall.length }
            : a
        )
      );
    }

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
        updateAgent
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
};
