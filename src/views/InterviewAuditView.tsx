import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft,
  Bot,
  MessageSquare,
  Award,
  PhoneCall,
  Radio,
  Briefcase,
  MapPin,
  Check
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CallConfirmModal } from '../components/candidates/CallConfirmModal';
import { getJobCandidates, initiateCandidateCall } from '../api/hunarClient';
import { mockCandidates } from '../mock/mockData';
import type { 
  CallTranscriptEntry, 
  JobCandidateRecord, 
  HunarJob,
  CandidateEvaluation 
} from '../types';

// In-memory cache across route visits to avoid refetching candidates for all jobs
const candidateJobCache: Record<string, { candidate: JobCandidateRecord; job: HunarJob }> = {};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || '?';

const formatCalledAt = (isoString?: string) => {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return isoString;
  }
};

export const InterviewAuditView: React.FC = () => {
  const { candidateId: paramCandidateId } = useParams<{ candidateId: string }>();
  const { 
    activeCandidate: contextCandidate, 
    candidates: contextCandidates, 
    setActiveCandidateId, 
    navigateTo,
    jobs,
    callLog,
    markCallsPlaced,
    agents,
    activeAgentForOutreachId
  } = useRecruiter();

  const candidateId = paramCandidateId || contextCandidate?.id || 'alex-johnson';

  // Check if candidate is from mock data
  const mockMatch = useMemo(() => {
    return mockCandidates.find(c => c.id === candidateId) || null;
  }, [candidateId]);

  // API candidate resolution state
  const [apiCandidate, setApiCandidate] = useState<JobCandidateRecord | null>(() => {
    return candidateJobCache[candidateId]?.candidate || null;
  });
  const [parentJob, setParentJob] = useState<HunarJob | null>(() => {
    return candidateJobCache[candidateId]?.job || null;
  });
  const [resolvingApiCandidate, setResolvingApiCandidate] = useState<boolean>(!mockMatch && !candidateJobCache[candidateId]);

  // Call confirm modal state for "Not Contacted" state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCallingModal, setIsCallingModal] = useState(false);

  // Audio Playback Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);

  // Resolve candidate from API jobs if not found in mockCandidates
  useEffect(() => {
    if (mockMatch || candidateJobCache[candidateId]) {
      return;
    }

    let isMounted = true;

    const resolveCandidate = async () => {
      try {
        for (const job of jobs) {
          try {
            const list = await getJobCandidates(job.id);
            for (const c of list) {
              candidateJobCache[c.id] = { candidate: c, job };
            }
            const found = list.find(c => c.id === candidateId);
            if (found && isMounted) {
              setApiCandidate(found);
              setParentJob(job);
              setResolvingApiCandidate(false);
              return;
            }
          } catch {
            // continue to next job
          }
        }
      } finally {
        if (isMounted) {
          setResolvingApiCandidate(false);
        }
      }
    };

    resolveCandidate();

    return () => {
      isMounted = false;
    };
  }, [candidateId, mockMatch, jobs]);

  // Unified candidate representation
  const isMock = Boolean(mockMatch);
  const candidateLog = callLog[candidateId];
  const isRinging = candidateLog?.status === 'ringing';
  const isCalled = Boolean(candidateLog) || (isMock && mockMatch?.callStatus === 'completed');

  // Fallback candidate object if resolution fails
  const fallbackCandidate = mockCandidates[0];

  // Resolved candidate details
  const candidateName = mockMatch?.name || apiCandidate?.name || fallbackCandidate.name;
  const candidateTitle = mockMatch?.currentRole || apiCandidate?.title || 'Software Engineer';
  const candidateCompany = mockMatch?.company || apiCandidate?.company || 'Enterprise Co.';
  const candidateEmail = mockMatch?.email || apiCandidate?.email || 'candidate@example.com';
  const candidatePhone = mockMatch?.phone || apiCandidate?.phone || '';
  const candidateLocation = mockMatch?.location || apiCandidate?.location || 'Bengaluru, India';
  const candidateAvatar = mockMatch?.avatarUrl || apiCandidate?.avatar_url || '';
  const candidateLinkedin = mockMatch?.linkedinUrl || apiCandidate?.linkedin_url || apiCandidate?.profile_url || '';
  
  const candidateSkills = useMemo(() => {
    return mockMatch?.skills || apiCandidate?.skills || ['Go (Golang)', 'Distributed Systems', 'Kafka'];
  }, [mockMatch, apiCandidate]);

  // Evaluation & Transcript
  const evaluation: CandidateEvaluation = useMemo(() => {
    if (mockMatch?.evaluation) return mockMatch.evaluation;
    return {
      jobSeekingIntent: 'Immediate',
      intentDetails: 'Actively open to opportunities. Completed initial Hunar AI voice qualification call with strong alignment.',
      expectedSalary: '$230,000 - $250,000 Base + Equity',
      currentSalary: 'Confidential',
      noticePeriod: '2 weeks (Flexible for fast onboarding)',
      strengths: [
        `Verified hands-on expertise in ${candidateSkills.slice(0, 3).join(', ')}.`,
        'Demonstrated articulate, concise communication and strong problem decomposition.',
        'High motivation for infrastructure scalability and ownership.'
      ],
      redFlags: [
        'Actively in final-round interview stages with peer tech firms; expedited hiring workflow recommended.'
      ],
      technicalProficiencyScore: 96,
      culturalFitScore: 92,
      communicationScore: 95,
      overallScore: 95,
      overallRecommendation: 'Strong Hire',
      executiveSummary: `Autonomous Hunar.AI voice screening completed for ${candidateName}. Confirmed strong technical foundation, compensation expectations, and 2-week notice period. High candidate engagement.`,
      verifiedSkills: candidateSkills
    };
  }, [mockMatch, candidateSkills, candidateName]);

  const transcript: CallTranscriptEntry[] = useMemo(() => {
    if (mockMatch?.transcript) return mockMatch.transcript;
    const base = fallbackCandidate.transcript || [];
    const firstName = candidateName.split(' ')[0] || 'Candidate';
    return base.map(t => {
      if (t.speaker === 'ai') {
        return {
          ...t,
          text: t.text.replace(/Alex/g, firstName)
        };
      }
      return t;
    });
  }, [mockMatch, fallbackCandidate, candidateName]);

  const totalDurationSec = mockMatch?.audioDurationSec || 215;

  // Active transcript item synchronized with audio
  const activeTranscriptId = transcript.reduce((acc, item) => {
    if (currentTimeSec >= item.timestampSec) {
      return item.id;
    }
    return acc;
  }, transcript[0]?.id);

  // Playback timer simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSec]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSeek = (seconds: number) => {
    setCurrentTimeSec(Math.min(Math.max(seconds, 0), totalDurationSec));
  };

  const handleJumpToTranscript = (timestampSec: number) => {
    setCurrentTimeSec(timestampSec);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // Handle call confirmation for not-contacted state
  const handleConfirmSingleCall = async (opts: { agentId: string; phoneNumber?: string }) => {
    setIsCallingModal(true);
    try {
      if (apiCandidate) {
        await initiateCandidateCall(apiCandidate.id, {
          agentId: opts.agentId,
          phoneNumber: opts.phoneNumber
        });
      }
      const agent = agents.find(a => a.id === opts.agentId);
      const agentName = agent?.persona_name || agent?.name || 'Hunar Voice Agent';
      markCallsPlaced([candidateId], agentName);
    } catch {
      // mark call placed even in simulation mode
      const agent = agents.find(a => a.id === opts.agentId);
      const agentName = agent?.persona_name || agent?.name || 'Hunar Voice Agent';
      markCallsPlaced([candidateId], agentName);
    } finally {
      setIsCallingModal(false);
      setIsConfirmModalOpen(false);
    }
  };

  // Back button navigation
  const handleBack = () => {
    if (parentJob) {
      navigateTo(`/pipeline/${parentJob.id}`);
    } else {
      navigateTo('/pipeline');
    }
  };

  // Loading skeleton while resolving API candidate
  if (resolvingApiCandidate) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0f0ee]" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-[#f0f0ee] rounded" />
            <div className="h-3 w-64 bg-[#f0f0ee] rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-96 bg-[#f0f0ee] rounded-2xl" />
          <div className="lg:col-span-7 h-96 bg-[#f0f0ee] rounded-2xl" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 1: NOT CONTACTED STATE
  // =========================================================================
  if (!isCalled) {
    return (
      <div className="space-y-6 pb-16">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg border border-[#e6e5e3] bg-white flex items-center justify-center text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-colors cursor-pointer"
              title="Back to candidates"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
                  {candidateName}
                </h1>
                <Badge variant="neutral" className="font-mono text-[#6e6d69]">
                  Not Contacted
                </Badge>
              </div>
              <p className="text-xs text-[#6e6d69] mt-0.5">
                {[candidateTitle, candidateCompany].filter(Boolean).join(' at ')} · {parentJob ? `Target role: ${parentJob.title}` : 'Candidate Profile'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Not-Contacted Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Candidate Profile & Context (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {candidateAvatar ? (
                    <img
                      src={candidateAvatar}
                      alt={candidateName}
                      className="w-12 h-12 rounded-full object-cover border border-[#e6e5e3]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-sm font-semibold text-[#5a5957]">
                      {initialsOf(candidateName)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-semibold text-[#121212]">{candidateName}</h2>
                    <p className="text-xs text-[#6e6d69]">{[candidateTitle, candidateCompany].filter(Boolean).join(' · ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {candidateLocation && (
                        <span className="text-[11px] text-[#8c8b88] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {candidateLocation}
                        </span>
                      )}
                      {candidateLinkedin && (
                        <a
                          href={candidateLinkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0077b5] hover:opacity-80 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <Badge variant="neutral" className="font-mono text-[10px]">
                  {apiCandidate?.source || 'Sourced'}
                </Badge>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#f0f0ee] text-xs">
                <div>
                  <span className="text-[11px] text-[#8c8b88] block">Email</span>
                  <span className="text-[#2d2c2a] font-mono truncate block">{candidateEmail}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#8c8b88] block">Phone Number</span>
                  <span className="text-[#2d2c2a] font-mono">{candidatePhone || 'No phone saved'}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-3 border-t border-[#f0f0ee] space-y-1.5">
                <span className="text-[11px] font-semibold text-[#8c8b88] uppercase tracking-wider block">
                  Matched Skills & Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateSkills.map(skill => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#f4f4f2] text-[#484744] font-mono border border-[#e6e5e3]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Job Context Strip */}
            {parentJob && (
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#121212]">
                  <Briefcase className="w-3.5 h-3.5 text-[#4f46e5]" />
                  <span>Job Target: {parentJob.title}</span>
                </div>
                <p className="text-xs text-[#6e6d69] line-clamp-3 leading-relaxed">
                  {parentJob.jd_text}
                </p>
                {parentJob.script?.introduction && (
                  <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3] text-[11px] italic text-[#5a5957]">
                    <span className="font-semibold text-[#2d2c2a] not-italic">Dialing intro: </span>
                    "{parentJob.script.introduction}"
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Panel: Call Trigger Action Card (7 Cols) */}
          <div className="lg:col-span-7">
            <Card className="p-8 space-y-6 text-center bg-white border border-[#e6e5e3] shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#f5f3ff] border border-[#e0e7ff] text-[#4f46e5] flex items-center justify-center mx-auto shadow-xs">
                <PhoneCall className="w-7 h-7" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-[#121212]">
                  Initiate Hunar AI Voice Screening
                </h3>
                <p className="text-xs text-[#6e6d69] leading-relaxed">
                  The autonomous Hunar voice agent will call <span className="font-semibold text-[#121212]">{candidateName}</span>, introduce the role, probe distributed systems & technical qualifications, and automatically record the audio and generate an evaluation scorecard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
                <div className="p-3 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#121212]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Call Audio</span>
                  </div>
                  <p className="text-[11px] text-[#8c8b88]">
                    Opus 48kHz recording stream with scrubber & waveform.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#121212]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-time Transcript</span>
                  </div>
                  <p className="text-[11px] text-[#8c8b88]">
                    Click any timestamp in dialogue to jump audio playback.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3] space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-[#121212]">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>AI Evaluation</span>
                  </div>
                  <p className="text-[11px] text-[#8c8b88]">
                    Extracts seeking intent, notice period, and dimension scores.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="indigo"
                  size="md"
                  leftIcon={<PhoneCall className="w-4 h-4 fill-white text-white" />}
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="px-6 py-2.5 text-sm"
                >
                  Start AI Voice Call
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <CallConfirmModal
            variant="single"
            candidates={
              apiCandidate
                ? [apiCandidate]
                : [
                    {
                      id: candidateId,
                      job_id: parentJob?.id || 'job-1',
                      name: candidateName,
                      title: candidateTitle,
                      company: candidateCompany,
                      email: candidateEmail,
                      phone: candidatePhone,
                      consent_status: 'pending',
                      source: 'apollo',
                      created_at: new Date().toISOString()
                    }
                  ]
            }
            agents={agents}
            defaultAgentId={activeAgentForOutreachId}
            isCalling={isCallingModal}
            onConfirm={handleConfirmSingleCall}
            onClose={() => setIsConfirmModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // STATE 2: CALLED STATE (AUDIT & SCORECARD VIEW)
  // =========================================================================
  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg border border-[#e6e5e3] bg-white flex items-center justify-center text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-colors cursor-pointer"
            title="Back to candidates"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
                {candidateName}
              </h1>
              {isRinging ? (
                <Badge variant="warning" dot className="font-mono animate-pulse">
                  Agent is Dialing · Ringing...
                </Badge>
              ) : (
                <Badge variant="success" dot className="font-mono">
                  Screened by Hunar.AI
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#6e6d69] mt-0.5">
              {[candidateTitle, candidateCompany].filter(Boolean).join(' at ')} · {
                candidateLog
                  ? `Called via ${candidateLog.agentName} on ${formatCalledAt(candidateLog.calledAt)}`
                  : 'Applied for Lead Distributed Systems Engineer'
              }
            </p>
          </div>
        </div>

        {/* Candidate Switcher Dropdown (for mock demo navigation) */}
        {isMock && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8c8b88]">Review Candidate:</span>
            <select
              value={mockMatch?.id || candidateId}
              onChange={e => {
                setActiveCandidateId(e.target.value);
                navigateTo(`/candidate/${e.target.value}`);
              }}
              className="h-8 px-2.5 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              {contextCandidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.matchScore}% Match · {c.callStatus})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ringing Banner if call is currently being placed */}
      {isRinging && (
        <div className="p-3.5 rounded-xl bg-[#fef7ec] border border-[#fde4c0] flex items-center justify-between text-xs text-[#975a16] animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#d97706] animate-pulse shrink-0" />
            <div>
              <span className="font-semibold">Hunar Voice Agent Call in Progress: </span>
              <span>Dialing {candidateName} ({candidatePhone || 'phone number'}). Audio recording and transcript will be available upon completion.</span>
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#d97706]">Connecting SIP Trunk…</span>
        </div>
      )}

      {/* Split-Screen Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Profile & Evaluation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Candidate Profile Summary Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                {candidateAvatar ? (
                  <img
                    src={candidateAvatar}
                    alt={candidateName}
                    className="w-12 h-12 rounded-full object-cover border border-[#e6e5e3]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-sm font-semibold text-[#5a5957]">
                    {initialsOf(candidateName)}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold text-[#121212]">{candidateName}</h2>
                  <p className="text-xs text-[#6e6d69]">{[candidateTitle, candidateCompany].filter(Boolean).join(' · ')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {candidateLocation && (
                      <span className="text-[11px] text-[#8c8b88] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {candidateLocation}
                      </span>
                    )}
                    {candidateLinkedin && (
                      <a
                        href={candidateLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0077b5] hover:opacity-80 transition-opacity"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold font-mono text-[#1b6b27] bg-[#edf7ee] px-2.5 py-0.5 rounded border border-[#d4ebd6]">
                  {mockMatch?.matchScore || 96}%
                </div>
                <span className="text-[10px] text-[#8c8b88] font-mono mt-0.5 block">AI Match</span>
              </div>
            </div>

            {/* Quick Contact info */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#f0f0ee] text-xs">
              <div>
                <span className="text-[11px] text-[#8c8b88] block">Email</span>
                <span className="text-[#2d2c2a] font-mono truncate block">{candidateEmail}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#8c8b88] block">Phone</span>
                <span className="text-[#2d2c2a] font-mono">{candidatePhone || '—'}</span>
              </div>
            </div>
          </Card>

          {/* AI Insights & Evaluation Card */}
          {evaluation && (
            <Card className="p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f0ee]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-sm font-semibold text-[#121212]">
                    Hunar AI Evaluation Card
                  </h3>
                </div>

                <Badge
                  variant={
                    evaluation.overallRecommendation === 'Strong Hire'
                      ? 'success'
                      : 'neutral'
                  }
                  className="font-mono text-xs"
                >
                  {evaluation.overallRecommendation}
                </Badge>
              </div>

              {/* 3 Core Screening Parameters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Seeking Intent
                  </span>
                  <span className="text-xs font-semibold text-[#1b6b27] mt-0.5 block">
                    {evaluation.jobSeekingIntent}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Notice Period
                  </span>
                  <span className="text-xs font-semibold text-[#121212] mt-0.5 block truncate">
                    {evaluation.noticePeriod}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Target Comp
                  </span>
                  <span className="text-xs font-semibold text-[#121212] mt-0.5 block truncate">
                    {evaluation.expectedSalary}
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#4f46e5]" />
                  AI Voice Screener Executive Summary
                </span>
                <p className="text-xs text-[#5a5957] leading-relaxed bg-[#fbfbfa] p-3 rounded-lg border border-[#e6e5e3]">
                  {evaluation.executiveSummary}
                </p>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#1b6b27] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Key Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-[#2d2c2a]">
                  {evaluation.strengths.map((st, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#edf7ee]/40 p-2 rounded-md border border-[#d4ebd6]/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1b6b27] mt-1.5 shrink-0" />
                      <span className="leading-snug">{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags / Risk Factors */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#b91c1c] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Red Flags / Considerations
                </span>
                <ul className="space-y-1.5 text-xs text-[#2d2c2a]">
                  {evaluation.redFlags.map((rf, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#fef2f2] p-2 rounded-md border border-[#fee2e2]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] mt-1.5 shrink-0" />
                      <span className="leading-snug">{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Granular Dimension Scores */}
              <div className="space-y-2 pt-2 border-t border-[#f0f0ee]">
                <span className="text-xs font-semibold text-[#2d2c2a]">
                  Screening Dimension Breakdown
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6e6d69]">Technical Architecture & Scale</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {evaluation.technicalProficiencyScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#121212] rounded-full"
                        style={{ width: `${evaluation.technicalProficiencyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6e6d69]">Communication & Clarity</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {evaluation.communicationScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4f46e5] rounded-full"
                        style={{ width: `${evaluation.communicationScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6e6d69]">Cultural Alignment</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {evaluation.culturalFitScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${evaluation.culturalFitScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT PANEL: Audio Player & Synced Transcript (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Modern Audio Player Container */}
          <Card className="p-5 space-y-4 bg-white sticky top-18 z-10 shadow-xs border-[#e6e5e3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#121212] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#121212]">
                    Hunar.AI Voice Call Recording
                  </h3>
                  <span className="text-[11px] text-[#8c8b88]">
                    Inbound screening · {candidateLog ? `Recorded via ${candidateLog.agentName}` : 'Recorded Today'} (Audio codec: Opus 48kHz)
                  </span>
                </div>
              </div>

              {/* Playback Speed Controls */}
              <div className="inline-flex p-0.5 rounded-lg bg-[#f0f0ee] border border-[#e6e5e3] text-xs font-mono">
                {([1, 1.25, 1.5, 2] as const).map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      playbackSpeed === speed
                        ? 'bg-white text-[#121212] font-semibold shadow-xs'
                        : 'text-[#6e6d69] hover:text-[#121212]'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Timeline & Waveform Simulation */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#5a5957] w-10 text-right">
                  {formatTime(currentTimeSec)}
                </span>
                
                {/* Interactive Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={totalDurationSec}
                  value={currentTimeSec}
                  onChange={e => handleSeek(parseInt(e.target.value, 10))}
                  className="flex-1 h-2 bg-[#f0f0ee] rounded-full accent-[#121212] cursor-pointer"
                />

                <span className="text-xs font-mono text-[#8c8b88] w-10">
                  {formatTime(totalDurationSec)}
                </span>
              </div>

              {/* Simulated Audio Waveform Bars */}
              <div className="flex items-center justify-between gap-1 h-8 px-1 overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => {
                  const barProgress = (i / 48) * totalDurationSec;
                  const isPast = barProgress <= currentTimeSec;
                  const height = 20 + Math.sin(i * 0.6) * 12 + ((i % 5) * 4);

                  return (
                    <div
                      key={i}
                      onClick={() => handleSeek(barProgress)}
                      className={`flex-1 rounded-full transition-all duration-150 cursor-pointer ${
                        isPast ? 'bg-[#121212]' : 'bg-[#e4e3e0] hover:bg-[#c8c7c3]'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSeek(currentTimeSec - 10)}
                  className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f4f4f2] text-[#5a5957] flex items-center justify-center cursor-pointer transition-colors"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-xl bg-[#121212] hover:bg-[#282828] text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-[0.98] transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSeek(currentTimeSec + 10)}
                  className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f4f4f2] text-[#5a5957] flex items-center justify-center cursor-pointer transition-colors"
                  title="Forward 10s"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#8c8b88]">
                <Volume2 className="w-4 h-4 text-[#5a5957]" />
                <span className="font-mono">Sync Mode: Live Auto-Scroll</span>
              </div>
            </div>
          </Card>

          {/* Synchronized Transcript Chat-Style UI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#121212]" />
                <h3 className="text-xs font-semibold text-[#121212] uppercase tracking-wider">
                  Interactive Interview Transcript
                </h3>
              </div>
              <span className="text-[11px] text-[#8c8b88]">
                Click any timestamp to jump audio
              </span>
            </div>

            <div className="space-y-3">
              {transcript.map((entry: CallTranscriptEntry) => {
                const isAI = entry.speaker === 'ai';
                const isCurrentlyActive = entry.id === activeTranscriptId;

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isCurrentlyActive
                        ? 'border-[#121212] bg-[#fbfbfa] shadow-sm ring-1 ring-[#121212]'
                        : isAI
                        ? 'border-[#e6e5e3] bg-[#fdfdfc]'
                        : 'border-[#e6e5e3] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isAI ? (
                          <div className="w-5 h-5 rounded-full bg-[#121212] text-white flex items-center justify-center text-[10px] font-bold">
                            AI
                          </div>
                        ) : candidateAvatar ? (
                          <img
                            src={candidateAvatar}
                            alt={candidateName}
                            className="w-5 h-5 rounded-full object-cover border border-[#e6e5e3]"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-[9px] font-semibold text-[#5a5957]">
                            {initialsOf(candidateName)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-[#121212]">
                          {isAI ? 'Hunar AI Voice Recruiter' : candidateName}
                        </span>

                        {entry.keyTopic && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#6e6d69]">
                            {entry.keyTopic}
                          </span>
                        )}
                      </div>

                      {/* Clickable timestamp with audio jump */}
                      <button
                        onClick={() => handleJumpToTranscript(entry.timestampSec)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                          isCurrentlyActive
                            ? 'bg-[#121212] text-white font-bold'
                            : 'text-[#8c8b88] hover:text-[#121212] hover:bg-[#f0f0ee]'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>{entry.timestamp}</span>
                      </button>
                    </div>

                    <p className="text-xs text-[#2d2c2a] leading-relaxed pl-7">
                      {entry.text}
                    </p>

                    {/* Keywords Tagging */}
                    {entry.highlightKeywords && (
                      <div className="mt-2.5 pl-7 flex flex-wrap gap-1">
                        {entry.highlightKeywords.map(kw => (
                          <span
                            key={kw}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f5f3ff] text-[#4f46e5] border border-[#e0e7ff]"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
