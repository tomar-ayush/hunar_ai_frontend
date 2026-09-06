export type CallStatus = 'not_contacted' | 'queued' | 'ringing' | 'completed' | 'declined';

export type JobSeekingIntent = 'Immediate' | 'High' | 'Passive' | 'Not Interested';

export type Recommendation = 'Strong Hire' | 'Hire' | 'Borderline' | 'Reject';

export interface CallTranscriptEntry {
  id: string;
  speaker: 'ai' | 'candidate';
  timestamp: string; // e.g. "00:14"
  timestampSec: number; // in seconds for synchronizing audio playback
  text: string;
  sentiment?: 'positive' | 'neutral' | 'caution';
  highlightKeywords?: string[];
  keyTopic?: string;
}

export interface CandidateEvaluation {
  jobSeekingIntent: JobSeekingIntent;
  intentDetails: string;
  expectedSalary: string;
  currentSalary?: string;
  noticePeriod: string;
  strengths: string[];
  redFlags: string[];
  technicalProficiencyScore: number; // 0 - 100
  culturalFitScore: number; // 0 - 100
  communicationScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  overallRecommendation: Recommendation;
  executiveSummary: string;
  verifiedSkills: string[];
}

export interface Candidate {
  id: string;
  name: string;
  headline: string;
  currentRole: string;
  company: string;
  previousCompany?: string;
  avatarUrl: string;
  location: string;
  matchScore: number; // 0 - 100
  matchSummary: string;
  callStatus: CallStatus;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl?: string;
  skills: string[];
  experienceYears: number;
  sourcedDate: string;
  audioDurationSec?: number;
  evaluation?: CandidateEvaluation;
  transcript?: CallTranscriptEntry[];
}

export interface FunnelMetric {
  stage: 'Sourced' | 'Contacted' | 'Screened' | 'Qualified';
  count: number;
  percentage: number;
  subtext: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'call_completed' | 'sourcing_started' | 'jd_parsed' | 'candidate_queued' | 'candidate_matched';
  candidateId?: string;
  candidateName?: string;
  statusBadge?: string;
}

export interface CampaignMetrics {
  totalSourced: number;
  activeCalls: number;
  answerRate: number; // e.g. 74.8%
  qualifiedCandidates: number;
  qualificationRate: number; // e.g. 29.8%
  funnel: FunnelMetric[];
  recentActivity: ActivityItem[];
}

export interface ExtractedJobParameters {
  targetJobTitle: string;
  seniorityLevel: string;
  requiredSkills: string[];
  optionalSkills: string[];
  experienceMin: number;
  experienceMax: number;
  locationPreference: string;
  targetCompanies: string[];
  compensationRange: string;
}

export type HunarAgentStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface CreateAgentPayload {
  name: string;
  language: string;
  voice_persona: string;
  persona_name: string;
  agent_prompt: string;
  objective: string;
  introduction: string;
  result_prompt: string;
  result_schema: Record<string, any>;
  summary?: string;
  logo?: string;
  agent_code?: string;
  required_variables?: string[];
  custom_variables?: string[];
}

export interface UpdateAgentPayload extends Partial<CreateAgentPayload> {
  status?: HunarAgentStatus;
}

export interface HunarAgentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: HunarAgent[];
}

export interface HunarJobScript {
  introduction?: string;
}

export interface HunarJob {
  id: string;
  title: string;
  jd_text: string;
  target_seniority_level?: string | null;
  target_location?: string | null;
  experience_required?: string | null;
  required_skills?: string[] | null;
  script?: HunarJobScript | null;
  sourcing_mode?: string | null;
  created_at?: string;
}

export interface CreateJobPayload {
  title: string;
  jd_text: string;
  target_seniority_level?: string | null;
  target_location?: string | null;
  experience_required?: string | null;
  required_skills?: string[] | null;
  script?: HunarJobScript | null;
  sourcing_mode?: string;
}

export interface JobCandidateRecord {
  id: string;
  job_id: string;
  name: string;
  phone: string;
  email: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  profile_url?: string | null;
  avatar_url?: string | null;
  skills?: string[] | null;
  source: string;
  consent_status: string;
  created_at?: string;
}

export interface AddCandidatePayload {
  name: string;
  phone?: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  linkedin_url?: string;
  profile_url?: string;
  avatar_url?: string;
  skills?: string[];
  source?: string;
  consent_status?: string;
}

export interface ScrapeJobResponse {
  status: string;
  job_id: string;
  job_title: string;
  filters_applied?: Record<string, any>;
  scraped_count: number;
  saved_count: number;
  candidates?: JobCandidateRecord[];
}

export interface CallInitiationResult {
  [key: string]: any;
}

export interface CallLogEntry {
  status: 'ringing' | 'completed' | 'failed';
  calledAt: string;
  agentName: string;
}

export interface HunarAgent {
  id: string;
  status: HunarAgentStatus;
  name: string;
  voice_persona: string;
  persona_name: string;
  voice_name: string;
  summary: string;
  logo: string;
  language: string;
  custom_variables: string[];
  result_schema: Record<string, any>;
  agent_code: string;
  result_variables: string[];
  required_variables: string[];
  agent_prompt?: string;
  objective?: string;
  introduction?: string;
  result_prompt?: string;
  silence_response?: string;
  conclusion?: string;
  created_at?: string;
  total_calls?: number;
  successful_calls?: number;
}

