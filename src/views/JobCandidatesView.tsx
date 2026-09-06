import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles,
  UserPlus,
  Upload,
  X,
  Check,
  MapPin,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { useRecruiter } from '../context';
import {
  getJobCandidates,
  initiateCandidateCall,
  scrapePeopleForJob,
  addJobCandidate,
  uploadCandidatesCsv,
} from '../api/hunarClient';
import type { JobCandidateRecord } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CallConfirmModal } from '../components/candidates/CallConfirmModal';

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
    return <Badge variant="success" className="text-[10px] font-mono">{status}</Badge>;
  }
  if (s === 'pending') {
    return <Badge variant="warning" className="text-[10px] font-mono">{status}</Badge>;
  }
  return <Badge variant="neutral" className="text-[10px] font-mono">{status || 'unknown'}</Badge>;
};

interface AddCandidateForm {
  name: string;
  title: string;
  company: string;
  location: string;
  email: string;
  phone: string;
  skills: string;
  profile_url: string;
  linkedin_url: string;
}

const emptyCandidateForm: AddCandidateForm = {
  name: '',
  title: '',
  company: '',
  location: '',
  email: '',
  phone: '',
  skills: '',
  profile_url: '',
  linkedin_url: '',
};

export const JobCandidatesView: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { 
    jobs, 
    jobsLoading, 
    navigateTo, 
    agents, 
    activeAgentForOutreachId, 
    markCallsPlaced, 
    callLog 
  } = useRecruiter();

  const [candidates, setCandidates] = useState<JobCandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStates, setCallStates] = useState<Record<string, CallState>>({});
  const [callingIds, setCallingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  // Selection & Call confirmation states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    variant: 'single' | 'bulk';
    candidates: JobCandidateRecord[];
  }>({ open: false, variant: 'single', candidates: [] });
  const [isCallingModal, setIsCallingModal] = useState(false);

  // Scraping state
  const [scrapeLimit, setScrapeLimit] = useState(5);
  const [isScraping, setIsScraping] = useState(false);

  // Add candidate modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<AddCandidateForm>(emptyCandidateForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // CSV upload
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const showToast = (text: string, error = false) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), 4000);
  };

  const job = useMemo(() => jobs.find(j => j.id === jobId), [jobs, jobId]);

  const assignedAgent = useMemo(() => {
    if (!job?.agent_id) return null;
    return agents.find(a => a.id === job.agent_id) || null;
  }, [job, agents]);

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

  // ── Scrape from Apollo ────────────────────────────────────────────
  const handleScrape = async () => {
    if (!jobId || isScraping) return;
    setIsScraping(true);
    try {
      const res = await scrapePeopleForJob(jobId, scrapeLimit);
      await loadCandidates();
      showToast(`Scraped ${res.scraped_count} people — ${res.saved_count} new candidates saved.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Scraping failed', true);
    } finally {
      setIsScraping(false);
    }
  };

  // ── Add candidate manually ────────────────────────────────────────
  const handleSaveCandidate = async () => {
    if (!jobId) return;
    if (!form.name.trim()) {
      setFormError('Candidate name is required.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const skills = form.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      await addJobCandidate(jobId, {
        name: form.name.trim(),
        title: form.title.trim() || undefined,
        company: form.company.trim() || undefined,
        location: form.location.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        profile_url: form.profile_url.trim() || undefined,
        linkedin_url: form.linkedin_url.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
      });
      setIsAddOpen(false);
      setForm(emptyCandidateForm);
      await loadCandidates();
      showToast(`Candidate "${form.name.trim()}" added.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add candidate');
    } finally {
      setIsSaving(false);
    }
  };

  // ── CSV upload ────────────────────────────────────────────────────
  const handleCsvUpload = async (file: File) => {
    if (!jobId) return;
    setIsUploadingCsv(true);
    try {
      await uploadCandidatesCsv(jobId, file);
      await loadCandidates();
      showToast(`Imported candidates from ${file.name}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'CSV import failed', true);
    } finally {
      setIsUploadingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  // ── Voice call ────────────────────────────────────────────────────
  const markCallState = (id: string, state: CallState) =>
    setCallStates(prev => ({ ...prev, [id]: state }));

  const handleConfirmCall = async (opts: { agentId: string; phoneNumber?: string }) => {
    setIsCallingModal(true);
    const toCall = confirmModal.candidates;
    const isSingle = confirmModal.variant === 'single';

    for (const c of toCall) {
      setCallingIds(prev => [...prev, c.id]);
      markCallState(c.id, 'ringing');
      try {
        await initiateCandidateCall(c.id, {
          agentId: opts.agentId,
          phoneNumber: isSingle ? opts.phoneNumber : undefined,
        });
      } catch {
        markCallState(c.id, 'failed');
      } finally {
        setCallingIds(prev => prev.filter(id => id !== c.id));
      }
    }

    const agent = agents.find(a => a.id === opts.agentId);
    const agentName = agent?.persona_name || agent?.name || 'Hunar Voice Agent';
    markCallsPlaced(toCall.map(c => c.id), agentName);

    setTimeout(() => {
      toCall.forEach(c => markCallState(c.id, 'completed'));
    }, 4000);

    setIsCallingModal(false);
    setConfirmModal({ open: false, variant: 'single', candidates: [] });
    setSelectedIds([]);
    showToast(
      isSingle
        ? `Initiated call to ${toCall[0]?.name || 'candidate'}.`
        : `Initiated calls to ${toCall.length} candidates.`
    );
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return candidates.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.source || '').toLowerCase().includes(q) ||
        (c.skills || []).some(s => s.toLowerCase().includes(q))
    );
  }, [candidates, searchQuery]);

  const stateOf = (id: string): CallState => {
    if (callStates[id]) return callStates[id];
    if (callLog[id]) {
      return callLog[id].status === 'ringing' ? 'ringing' : 'completed';
    }
    const cand = candidates.find(c => c.id === id);
    if (cand?.call_id) return 'completed';
    return 'not_contacted';
  };

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

  const setField = (key: keyof AddCandidateForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200 border ${
          toast.error
            ? 'bg-[#fdf2f2] text-[#9b1c1c] border-[#f8b4b4]'
            : 'bg-[#121212] text-white border-[#2d2c2a]'
        }`}>
          {toast.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Back link + Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigateTo('/pipeline')}
          className="inline-flex items-center gap-1.5 text-xs text-[#8c8b88] hover:text-[#121212] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All jobs
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
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
              Scrape matching people from Apollo, import a CSV, or add someone manually — then dial with the Hunar voice agent.
            </p>
          </div>

          {/* Sourcing actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleCsvUpload(file);
              }}
            />

            {/* PRIMARY: Scrape from Apollo */}
            <div className="flex items-stretch rounded-lg shadow-xs border border-transparent">
              <Button
                variant="indigo"
                size="sm"
                isLoading={isScraping}
                loadingText="Scraping Apollo…"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
                onClick={handleScrape}
                className="rounded-r-none border-r border-white/20"
              >
                Scrape from Apollo
              </Button>
              <select
                value={scrapeLimit}
                onChange={e => setScrapeLimit(Number(e.target.value))}
                title="Max candidates to scrape"
                className="h-auto text-xs font-medium bg-[#4f46e5] text-white rounded-r-lg px-1.5 focus:outline-none cursor-pointer appearance-none w-11 text-center"
              >
                {[5, 10, 15, 20, 25, 30, 50].map(n => (
                  <option key={n} value={n} className="text-[#121212]">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => {
                setForm(emptyCandidateForm);
                setFormError(null);
                setIsAddOpen(true);
              }}
            >
              Add candidate
            </Button>

            <Button
              variant="outline"
              size="sm"
              isLoading={isUploadingCsv}
              loadingText="Importing…"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => csvInputRef.current?.click()}
            >
              Upload CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadCandidates}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Job context strip */}
      {job && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-[#121212]" />
            </div>
            <div className="min-w-0 text-xs text-[#5a5957] space-y-1.5 flex-1">
              <p className="line-clamp-2 leading-relaxed">{job.jd_text}</p>
              {assignedAgent ? (
                <div className="flex items-center gap-2 text-[11px] text-[#2d2c2a]">
                  <Bot className="w-3.5 h-3.5 text-[#4f46e5] shrink-0" />
                  <span>
                    Voice Agent: <span className="font-semibold text-[#121212]">{assignedAgent.name}</span> ({assignedAgent.persona_name || assignedAgent.voice_persona} · {assignedAgent.language})
                  </span>
                </div>
              ) : job.agent_id ? (
                <div className="flex items-center gap-2 text-[11px] text-[#8c8b88]">
                  <Bot className="w-3.5 h-3.5 text-[#4f46e5] shrink-0" />
                  <span>Voice Agent ID: {job.agent_id}</span>
                </div>
              ) : job.script?.introduction ? (
                <p className="text-[11px] italic">
                  <span className="font-semibold text-[#2d2c2a] not-italic">Call intro: </span>
                  "{job.script.introduction}"
                </p>
              ) : null}
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
            placeholder="Filter by name, skill, company, or source..."
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
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all candidates"
                      checked={filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id))}
                      ref={el => {
                        if (el) {
                          const someSelected = filtered.some(c => selectedIds.includes(c.id)) && !filtered.every(c => selectedIds.includes(c.id));
                          el.indeterminate = someSelected;
                        }
                      }}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedIds(prev => Array.from(new Set([...prev, ...filtered.map(c => c.id)])));
                        } else {
                          const filteredIds = new Set(filtered.map(c => c.id));
                          setSelectedIds(prev => prev.filter(id => !filteredIds.has(id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-[#e6e5e3] text-[#121212] accent-[#121212] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Skills</th>
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
                    <td colSpan={8} className="py-14 text-center">
                      <div className="space-y-3">
                        <Users className="w-8 h-8 text-[#8c8b88] mx-auto opacity-50" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#121212]">
                            {candidates.length === 0
                              ? 'No candidates sourced for this job yet'
                              : 'No candidates match your filter'}
                          </p>
                          {candidates.length === 0 && (
                            <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">
                              Scrape matching people from Apollo, upload a CSV, or add a candidate manually.
                            </p>
                          )}
                        </div>
                        {candidates.length === 0 && (
                          <Button
                            variant="indigo"
                            size="sm"
                            isLoading={isScraping}
                            leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
                            onClick={handleScrape}
                          >
                            Scrape from Apollo
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(candidate => {
                    const state = stateOf(candidate.id);
                    return (
                      <tr key={candidate.id} className="hover:bg-[#fcfcfa] transition-colors group">
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            aria-label={`Select ${candidate.name}`}
                            checked={selectedIds.includes(candidate.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, candidate.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== candidate.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-[#e6e5e3] text-[#121212] accent-[#121212] cursor-pointer"
                          />
                        </td>

                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {candidate.avatar_url ? (
                              <img
                                src={candidate.avatar_url}
                                alt={candidate.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#e6e5e3]"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-[10px] font-semibold text-[#5a5957] shrink-0">
                                {initialsOf(candidate.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => navigateTo(`/candidate/${candidate.id}`)}
                                  className="font-semibold text-[#121212] hover:text-[#4f46e5] cursor-pointer transition-colors text-left"
                                  title="Open interview audit"
                                >
                                  {candidate.name}
                                </button>
                                {(candidate.linkedin_url || candidate.profile_url) && (
                                  <a
                                    href={candidate.linkedin_url || candidate.profile_url || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-[#8c8b88] hover:text-[#0077b5] transition-colors"
                                    title={candidate.linkedin_url ? 'LinkedIn' : 'Profile'}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              {(candidate.title || candidate.company) && (
                                <div className="text-[11px] text-[#5a5957] truncate max-w-[220px]">
                                  {candidate.title}
                                  {candidate.title && candidate.company ? ' · ' : ''}
                                  {candidate.company}
                                </div>
                              )}
                              {candidate.location && (
                                <div className="text-[10px] text-[#8c8b88] flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {candidate.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Skills */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {(candidate.skills || []).slice(0, 3).map(skill => (
                              <span
                                key={skill}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#484744] font-mono border border-[#e6e5e3]"
                              >
                                {skill}
                              </span>
                            ))}
                            {(candidate.skills?.length || 0) > 3 && (
                              <span className="text-[10px] text-[#8c8b88] font-mono">
                                +{candidate.skills!.length - 3}
                              </span>
                            )}
                            {(candidate.skills?.length || 0) === 0 && (
                              <span className="text-[#8c8b88]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          {candidate.phone ? (
                            <div className="font-mono text-[#2d2c2a]">{candidate.phone}</div>
                          ) : (
                            <div className="text-[10px] text-[#d97706] font-mono">No phone</div>
                          )}
                          <div className="text-[11px] text-[#8c8b88] flex items-center gap-1 mt-0.5 max-w-[200px]">
                            <Mail className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{candidate.email || '—'}</span>
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
                                onClick={() =>
                                  setConfirmModal({
                                    open: true,
                                    variant: 'single',
                                    candidates: [candidate],
                                  })
                                }
                                disabled={callingIds.includes(candidate.id)}
                                title="Dial with Hunar voice agent"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#e6e5e3] bg-white text-[#2d2c2a] hover:bg-[#f4f4f2] font-medium text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Selection floating bar */}
      {selectedIds.length > 0 && !loading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#121212] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#2a2a2a] flex items-center gap-4">
            <span className="text-xs text-white/80 font-medium">
              {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              variant="indigo"
              leftIcon={<PhoneCall className="w-3.5 h-3.5 fill-white text-white" />}
              onClick={() => {
                const chosen = candidates.filter(c => selectedIds.includes(c.id));
                setConfirmModal({ open: true, variant: 'bulk', candidates: chosen });
              }}
            >
              Call selected
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#8c8b88] hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Pre-Call Confirmation Modal */}
      {confirmModal.open && (
        <CallConfirmModal
          variant={confirmModal.variant}
          candidates={confirmModal.candidates}
          agents={agents}
          defaultAgentId={job?.agent_id || activeAgentForOutreachId}
          isCalling={isCallingModal}
          onConfirm={handleConfirmCall}
          onClose={() => {
            if (!isCallingModal) {
              setConfirmModal({ open: false, variant: 'single', candidates: [] });
            }
          }}
        />
      )}

      {/* Add Candidate Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#e6e5e3] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#f0f0ee] flex items-center justify-between bg-[#fbfbfa]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#121212] text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#121212]">Add candidate manually</h2>
                  <p className="text-xs text-[#8c8b88] mt-0.5">
                    Added to "{job?.title || 'this job'}" with consent marked as pending.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f5f5f3] flex items-center justify-center text-[#5a5957] hover:text-[#121212] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField('name')}
                    placeholder="e.g. Akshat Kumar"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Current title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={setField('title')}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={setField('company')}
                    placeholder="e.g. TekionCorp"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={setField('location')}
                    placeholder="e.g. Bangalore, India"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    placeholder="candidate@example.com"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={setField('phone')}
                    placeholder="+91 98765 43210"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-[#2d2c2a]">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={setField('skills')}
                    placeholder="Python, FastAPI, React"
                    className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">LinkedIn URL</label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={setField('linkedin_url')}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2d2c2a]">Profile URL</label>
                  <input
                    type="url"
                    value={form.profile_url}
                    onChange={setField('profile_url')}
                    placeholder="https://github.com/..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#f0f0ee] bg-[#fbfbfa] flex items-center justify-end gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<UserPlus className="w-3.5 h-3.5 text-white" />}
                onClick={handleSaveCandidate}
              >
                Add candidate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
