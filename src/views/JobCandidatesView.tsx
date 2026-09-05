import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  PhoneCall,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Users,
  Mail,
  Radio,
  Briefcase,
} from 'lucide-react';
import { useRecruiter } from '../context';
import { getJobCandidates, initiateCandidateCall } from '../api/hunarClient';
import type { JobCandidateRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type CallState = 'not_contacted' | 'ringing' | 'completed' | 'failed';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || '?';

const consentBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'granted' || s === 'opted_in' || s === 'opted-in') {
    return <Badge variant="success" className="text-[10px] font-mono">Consent: {status}</Badge>;
  }
  if (s === 'pending') {
    return <Badge variant="warning" className="text-[10px] font-mono">Consent: {status}</Badge>;
  }
  return <Badge variant="neutral" className="text-[10px] font-mono">Consent: {status || 'unknown'}</Badge>;
};

export const JobCandidatesView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, jobsLoading, navigateTo } = useRecruiter();

  const [candidates, setCandidates] = useState<JobCandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStates, setCallStates] = useState<Record<string, CallState>>({});
  const [callingIds, setCallingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const job = useMemo(() => jobs.find(j => j.id === jobId), [jobs, jobId]);

  const loadCandidates = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      setCandidates(await getJobCandidates(jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const markCallState = (id: string, state: CallState) =>
    setCallStates(prev => ({ ...prev, [id]: state }));

  const handleDial = async (candidate: JobCandidateRecord) => {
    if (callingIds.includes(candidate.id)) return;
    setCallingIds(prev => [...prev, candidate.id]);
    markCallState(candidate.id, 'ringing');
    try {
      await initiateCandidateCall(candidate.id);
      // The webhook drives real completion; reflect a connected call locally
      setTimeout(() => markCallState(candidate.id, 'completed'), 4000);
    } catch (err) {
      markCallState(candidate.id, 'failed');
      setTimeout(() => {
        setCallingIds(prev => prev.filter(id => id !== candidate.id));
      }, 1500);
    } finally {
      setCallingIds(prev => prev.filter(id => id !== candidate.id));
    }
  };

  const handleBulkDial = async () => {
    const toCall = filtered.filter(c => (callStates[c.id] ?? 'not_contacted') === 'not_contacted');
    for (const c of toCall) {
      await handleDial(c);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return candidates.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.source || '').toLowerCase().includes(q)
    );
  }, [candidates, searchQuery]);

  const stateOf = (id: string): CallState => callStates[id] ?? 'not_contacted';

  const statusBadge = (state: CallState) => {
    switch (state) {
      case 'completed':
        return <Badge variant="success" dot className="font-mono">Completed</Badge>;
      case 'ringing':
        return <Badge variant="warning" dot className="font-mono animate-pulse">Ringing</Badge>;
      case 'failed':
        return <Badge variant="danger" dot className="font-mono">Failed</Badge>;
      default:
        return <Badge variant="neutral" className="font-mono text-[#6e6d69]">Not Contacted</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Back link + Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigateTo('/pipeline')}
          className="inline-flex items-center gap-1.5 text-xs text-[#8c8b88] hover:text-[#121212] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All jobs
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#121212] truncate max-w-xl">
                {job?.title || (jobsLoading ? 'Loading job…' : 'Job candidates')}
              </h1>
              <Badge variant="neutral" className="text-[11px] font-mono">
                {candidates.length} scraped
              </Badge>
            </div>
            <p className="text-xs text-[#6e6d69] mt-0.5">
              People sourced for this job. Dial them with the Hunar voice agent, then open the interview audit.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadCandidates}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Job context strip */}
      {job && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-[#121212]" />
            </div>
            <div className="min-w-0 text-xs text-[#5a5957] space-y-1.5">
              <p className="line-clamp-2 leading-relaxed">{job.jd_text}</p>
              {job.pass_criteria && (
                <p className="text-[11px]">
                  <span className="font-semibold text-[#2d2c2a]">Pass criteria: </span>
                  {job.pass_criteria}
                </p>
              )}
              {callingIds.length > 0 && (
                <p className="flex items-center gap-1.5 text-[#975a16] font-mono text-[11px]">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Hunar voice agent is dialing…
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Search bar */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-[#8c8b88] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by name, email, phone, or source..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-4 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:bg-white focus:outline-none focus:border-[#121212] transition-all"
          />
        </div>
      </Card>

      {/* Error state */}
      {error && candidates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-[#121212]">Couldn't load scraped candidates</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">{error}</p>
          <Button variant="primary" size="sm" onClick={loadCandidates}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && candidates.length === 0 && !error && (
        <div className="bg-white border border-[#e6e5e3] rounded-xl p-5 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f0f0ee]" />
              <div className="h-3 w-1/3 bg-[#f0f0ee] rounded" />
              <div className="h-3 w-1/4 bg-[#f0f0ee] rounded ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Candidates table */}
      {!loading && !error && (
        <div className="bg-white border border-[#e6e5e3] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e6e5e3] bg-[#fbfbfa] text-[11px] font-semibold text-[#6e6d69] uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4">Call Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ee] text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center">
                      <div className="space-y-2">
                        <Users className="w-8 h-8 text-[#8c8b88] mx-auto opacity-50" />
                        <p className="text-sm font-semibold text-[#121212]">
                          {candidates.length === 0
                            ? 'No candidates scraped for this job yet'
                            : 'No candidates match your filter'}
                        </p>
                        {candidates.length === 0 && (
                          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">
                            Run sourcing for this job to scrape matching profiles into the pipeline.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(candidate => {
                    const state = stateOf(candidate.id);
                    return (
                      <tr key={candidate.id} className="hover:bg-[#fcfcfa] transition-colors group">
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-[10px] font-semibold text-[#5a5957] shrink-0">
                              {initialsOf(candidate.name)}
                            </div>
                            <div>
                              <button
                                onClick={() => navigateTo(`/candidate/${candidate.id}`)}
                                className="font-semibold text-[#121212] hover:text-[#4f46e5] cursor-pointer transition-colors text-left"
                                title="Open interview audit"
                              >
                                {candidate.name}
                              </button>
                              <div className="text-[10px] text-[#8c8b88] font-mono">
                                Added {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[#2d2c2a]">{candidate.phone}</div>
                          <div className="text-[11px] text-[#8c8b88] flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            {candidate.email}
                          </div>
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#f4f4f2] text-[#484744] font-mono text-[10px] border border-[#e6e5e3]">
                            {candidate.source || '—'}
                          </span>
                        </td>

                        {/* Consent */}
                        <td className="py-3.5 px-4">{consentBadge(candidate.consent_status)}</td>

                        {/* Call status */}
                        <td className="py-3.5 px-4">{statusBadge(state)}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {state === 'completed' ? (
                              <button
                                onClick={() => navigateTo(`/candidate/${candidate.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#edf7ee] text-[#1b6b27] hover:bg-[#d4ebd6] font-medium text-xs transition-colors cursor-pointer"
                              >
                                Audit Call
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : state === 'ringing' ? (
                              <button
                                onClick={() => navigateTo(`/candidate/${candidate.id}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fef7ec] text-[#975a16] hover:bg-[#fde4c0] font-medium text-xs transition-colors cursor-pointer"
                              >
                                Listen Live
                                <Radio className="w-3 h-3 animate-pulse" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDial(candidate)}
                                disabled={callingIds.includes(candidate.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#e6e5e3] bg-white text-[#2d2c2a] hover:bg-[#f4f4f2] font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <PhoneCall className="w-3 h-3 text-[#4f46e5]" />
                                {callingIds.includes(candidate.id) ? 'Dialing…' : 'Dial AI Voice'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 bg-[#fbfbfa] border-t border-[#e6e5e3] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6e6d69] gap-2">
            <div>
              Showing <span className="font-medium text-[#121212]">{filtered.length}</span> of{' '}
              <span className="font-medium text-[#121212]">{candidates.length}</span> scraped profiles
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>Completed: {candidates.filter(c => stateOf(c.id) === 'completed').length}</span>
              <span>Ringing: {candidates.filter(c => stateOf(c.id) === 'ringing').length}</span>
              <span>Not contacted: {candidates.filter(c => stateOf(c.id) === 'not_contacted').length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating bulk dial bar */}
      {candidates.some(c => stateOf(c.id) === 'not_contacted') && !loading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#121212] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#2a2a2a] flex items-center gap-4">
            <span className="text-xs text-white/80">
              {candidates.filter(c => stateOf(c.id) === 'not_contacted').length} candidates not contacted
            </span>
            <Button
              size="sm"
              variant="indigo"
              leftIcon={<PhoneCall className="w-3.5 h-3.5 fill-white text-white" />}
              onClick={handleBulkDial}
              disabled={callingIds.length > 0}
            >
              Auto-Dial Uncontacted
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
