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
