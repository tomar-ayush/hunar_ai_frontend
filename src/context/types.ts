import type { Candidate, CampaignMetrics, ExtractedJobParameters } from '../types';

export interface RecruiterContextType {
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
