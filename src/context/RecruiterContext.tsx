import React, { createContext, useContext, useState } from 'react';
import type { Candidate, CampaignMetrics, ExtractedJobParameters } from '../types';
import { mockCandidates, mockCampaignMetrics, mockExtractedParameters } from '../mock/mockData';

interface RecruiterContextType {
  currentRoute: string;
  navigateTo: (route: string) => void;
  candidates: Candidate[];
  selectedCandidateIds: string[];
  toggleSelectCandidate: (id: string) => void;
  selectAllCandidates: (select: boolean) => void;
  clearCandidateSelection: () => void;
  initiateVoiceOutreach: (candidateIds: string[]) => void;
  metrics: CampaignMetrics;
  extractedParams: ExtractedJobParameters;
  setExtractedParams: React.Dispatch<React.SetStateAction<ExtractedJobParameters>>;
  activeCandidate: Candidate | undefined;
  setActiveCandidateId: (id: string) => void;
  isCallingSimulated: boolean;
}

const RecruiterContext = createContext<RecruiterContextType | undefined>(undefined);

export const RecruiterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetrics>(mockCampaignMetrics);
  const [extractedParams, setExtractedParams] = useState<ExtractedJobParameters>(mockExtractedParameters);
  const [activeCandidateId, setActiveCandidateIdState] = useState<string>('alex-johnson');
  const [isCallingSimulated, setIsCallingSimulated] = useState<boolean>(false);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    if (route.startsWith('/candidate/')) {
      const id = route.replace('/candidate/', '');
      setActiveCandidateIdState(id);
    }
  };

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

  const initiateVoiceOutreach = (idsToCall: string[]) => {
    setIsCallingSimulated(true);
    // Optimistically update candidate call status to 'ringing' or 'queued'
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

    // Update active calls in metrics
    setMetrics(prev => ({
      ...prev,
      activeCalls: prev.activeCalls + idsToCall.length,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          title: "Outbound Hunar.AI Calls Dispatched",
          description: `Initiated autonomous voice outreach to ${idsToCall.length} candidate(s)`,
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
        isCallingSimulated
      }}
    >
      {children}
    </RecruiterContext.Provider>
  );
};

export const useRecruiter = () => {
  const context = useContext(RecruiterContext);
  if (!context) {
    throw new Error('useRecruiter must be used within a RecruiterProvider');
  }
  return context;
};
