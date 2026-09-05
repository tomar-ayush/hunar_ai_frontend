import type { HunarAgent, CreateAgentPayload, HunarAgentListResponse } from '../types';

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
