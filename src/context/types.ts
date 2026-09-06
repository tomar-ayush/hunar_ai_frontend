import type { 
  Candidate, 
  CampaignMetrics, 
  ExtractedJobParameters,
  HunarAgent,
  CreateAgentPayload,
  HunarJob,
  CallLogEntry
} from '../types';

export interface RecruiterContextType {
  currentRoute: string;
  navigateTo: (route: string) => void;
  candidates: Candidate[];
  selectedCandidateIds: string[];
  toggleSelectCandidate: (id: string) => void;
  selectAllCandidates: (select: boolean) => void;
  clearCandidateSelection: () => void;
  initiateVoiceOutreach: (candidateIds: string[], agentId?: string) => void;
  metrics: CampaignMetrics;
  extractedParams: ExtractedJobParameters;
  setExtractedParams: React.Dispatch<React.SetStateAction<ExtractedJobParameters>>;
  activeCandidate: Candidate | undefined;
  setActiveCandidateId: (id: string) => void;
  isCallingSimulated: boolean;

  // Hunar AI Agents — live backend state
  agents: HunarAgent[];
  agentsTotalCount: number;
  agentsLoading: boolean;
  agentsError: string | null;
  hasMoreAgents: boolean;
  refreshAgents: () => Promise<void>;
  loadMoreAgents: () => Promise<void>;
  activeAgentForOutreachId: string;
  setActiveAgentForOutreachId: (id: string) => void;
  createAgent: (payload: CreateAgentPayload) => Promise<HunarAgent>;
  updateAgent: (id: string, payload: CreateAgentPayload) => Promise<HunarAgent>;

  // Jobs — live backend state
  jobs: HunarJob[];
  jobsLoading: boolean;
  jobsError: string | null;
  refreshJobs: () => Promise<void>;

  // Voice call bookkeeping (client-side; backend has no call-history API)
  callLog: Record<string, CallLogEntry>;
  markCallsPlaced: (candidateIds: string[], agentName: string) => void;
}
