import type { 
  HunarAgent, 
  CreateAgentPayload, 
  HunarAgentListResponse, 
  HunarJob, 
  CreateJobPayload, 
  JobCandidateRecord, 
  AddCandidatePayload, 
  ScrapeJobResponse, 
  CallInitiationResult,
  CandidateCallDetails
} from '../types';

/**
 * Client for the Hunar voice-agent API.
 *
 * Defaults to the Vite proxy at `/api` (dev/preview proxy it to
 * http://localhost:8000); set VITE_HUNAR_API_URL to point somewhere else.
 */
const BASE_URL: string =
  (import.meta.env?.VITE_HUNAR_API_URL as string | undefined) ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { accept: 'application/json', ...init?.headers },
      ...init,
    });
  } catch {
    throw new Error('Could not reach the Hunar API. Is the backend running?');
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = typeof body?.detail === 'string' ? `: ${body.detail}` : '';
    } catch {
      // non-JSON error body
    }
    throw new Error(`Hunar API error ${res.status}${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listAgents(page = 1, pageSize = 20): Promise<HunarAgentListResponse> {
  return request<HunarAgentListResponse>(`/agents?page=${page}&page_size=${pageSize}`);
}

export function getAgent(agentId: string): Promise<HunarAgent> {
  return request<HunarAgent>(`/agents/${encodeURIComponent(agentId)}`);
}

export function createAgent(payload: CreateAgentPayload): Promise<HunarAgent> {
  return request<HunarAgent>('/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateAgent(agentId: string, payload: CreateAgentPayload): Promise<HunarAgent> {
  return request<HunarAgent>(`/agents/${encodeURIComponent(agentId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function listJobs(): Promise<HunarJob[]> {
  return request<HunarJob[]>('/jobs');
}

export function createJob(payload: CreateJobPayload): Promise<HunarJob> {
  return request<HunarJob>('/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateJob(jobId: string, payload: Partial<CreateJobPayload>): Promise<HunarJob> {
  return request<HunarJob>(`/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getJobCandidates(jobId: string): Promise<JobCandidateRecord[]> {
  return request<JobCandidateRecord[]>(`/jobs/${encodeURIComponent(jobId)}/candidates`);
}

/** Scrape matching people from Apollo/web sources for a job and save them as candidates. */
export function scrapePeopleForJob(jobId: string, limit = 25): Promise<ScrapeJobResponse> {
  return request<ScrapeJobResponse>(
    `/people-search/${encodeURIComponent(jobId)}?limit=${limit}`,
    { method: 'POST' }
  );
}

export function addJobCandidate(jobId: string, payload: AddCandidatePayload): Promise<JobCandidateRecord> {
  return request<JobCandidateRecord>(`/jobs/${encodeURIComponent(jobId)}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, consent_status: 'pending', source: 'manual', ...payload }),
  });
}

export function uploadCandidatesCsv(jobId: string, file: File): Promise<JobCandidateRecord[]> {
  const form = new FormData();
  form.append('file', file);
  return request<JobCandidateRecord[]>(`/jobs/${encodeURIComponent(jobId)}/candidates/csv`, {
    method: 'POST',
    body: form,
  });
}

export function initiateCandidateCall(
  candidateId: string,
  opts?: { agentId?: string; phoneNumber?: string }
): Promise<CallInitiationResult> {
  return request<CallInitiationResult>(`/candidates/${encodeURIComponent(candidateId)}/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: opts?.agentId ?? null,
      phone_number: opts?.phoneNumber ?? null
    }),
  });
}

export function getCandidateCallDetails(candidateId: string): Promise<CandidateCallDetails> {
  return request<CandidateCallDetails>(`/candidates/${encodeURIComponent(candidateId)}/call-details`);
}
