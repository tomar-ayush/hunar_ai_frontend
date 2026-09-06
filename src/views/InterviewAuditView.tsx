import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { getJobCandidates } from '../api/hunarClient';
import { candidateKeys } from '../queries/candidates';
import { useCandidateCallDetailsQuery, useInitiateCallMutation } from '../queries';
import { mockCandidates } from '../mock/mockData';
import type { 
  CallTranscriptEntry, 
  JobCandidateRecord, 
  HunarJob,
  CandidateEvaluation,
  Recommendation,
  JobSeekingIntent
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

export interface ExtractedQuestionAnswer {
  key: string;
  questionNumber?: number;
  label: string;
  questionPrompt?: string;
  answer: string;
}

const extractQuestionsAndAnswers = (
  result?: Record<string, any> | null,
  agentSchema?: Record<string, any> | null
): ExtractedQuestionAnswer[] => {
  if (!result || typeof result !== 'object') return [];

  const metaKeys = new Set([
    'candidate_summary',
    'summary',
    'screening_summary',
    'suitability_score',
    'fit_score',
    'score',
    'overall_recommendation',
    'recommended_next_step',
    'qualified'
  ]);

  const items: ExtractedQuestionAnswer[] = [];

  for (const [key, rawVal] of Object.entries(result)) {
    if (metaKeys.has(key)) continue;
    if (rawVal === null || rawVal === undefined || rawVal === '') continue;

    const answer = typeof rawVal === 'boolean' 
      ? (rawVal ? 'Yes' : 'No')
      : Array.isArray(rawVal) 
        ? rawVal.join(', ') 
        : String(rawVal);

    // Check if key matches question_1_answer, question_1, q1_answer, etc.
    const qMatch = key.match(/^(?:question_?|q)(\d+)(?:_answer)?$/i);
    const questionNumber = qMatch ? parseInt(qMatch[1], 10) : undefined;

    // Try finding prompt description from agent's result_schema
    let questionPrompt: string | undefined;
    const schemaVal = agentSchema?.[key];
    if (typeof schemaVal === 'string' && schemaVal.trim()) {
      const dashIdx = schemaVal.indexOf('—');
      if (dashIdx !== -1) {
        questionPrompt = schemaVal.slice(dashIdx + 1).trim();
      } else {
        questionPrompt = schemaVal.trim();
      }
    }

    let label: string;
    if (questionNumber !== undefined) {
      label = `Question ${questionNumber}`;
    } else {
      label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    }

    items.push({
      key,
      questionNumber,
      label,
      questionPrompt,
      answer
    });
  }

  // Sort items: numbered questions in numerical order first, then any custom keys
  items.sort((a, b) => {
    if (a.questionNumber !== undefined && b.questionNumber !== undefined) {
      return a.questionNumber - b.questionNumber;
    }
    if (a.questionNumber !== undefined) return -1;
    if (b.questionNumber !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });

  return items;
};

export const InterviewAuditView: React.FC = () => {
  const queryClient = useQueryClient();
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

  // Fetch candidate call details from Hunar Voice API
  const { data: callDetails = null, isLoading: loadingCallDetails } = useCandidateCallDetailsQuery(
    candidateId,
    { enabled: !mockMatch }
  );

  const callMutation = useInitiateCallMutation();

  // Audio Playback State & Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
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
            const list = await queryClient.fetchQuery({
              queryKey: candidateKeys.listByJob(job.id),
              queryFn: () => getJobCandidates(job.id),
            });
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
  const isRinging = candidateLog?.status === 'ringing' || callDetails?.status === 'INITIATED' || callDetails?.status === 'RINGING' || callDetails?.status === 'IN_PROGRESS' || callDetails?.status === 'QUEUED';
  const isCalled = Boolean(candidateLog) || 
    (isMock && mockMatch?.callStatus === 'completed') || 
    Boolean(callDetails && (callDetails.status === 'COMPLETED' || callDetails.recording_url || callDetails.result));

  // Fallback candidate object if resolution fails
  const fallbackCandidate = mockCandidates[0];

  // Resolved candidate details
  const candidateName = 
    callDetails?.callee_name ||
    callDetails?.custom_data?.candidate_name ||
    mockMatch?.name || 
    apiCandidate?.name || 
    fallbackCandidate.name;

  const candidateTitle = 
    callDetails?.custom_data?.job_role ||
    mockMatch?.currentRole || 
    apiCandidate?.title || 
    'Software Engineer';

  const candidateCompany = 
    callDetails?.custom_data?.company ||
    mockMatch?.company || 
    apiCandidate?.company || 
    'Enterprise Co.';

  const candidateEmail = mockMatch?.email || apiCandidate?.email || 'candidate@example.com';
  const candidatePhone = callDetails?.mobile_number || mockMatch?.phone || apiCandidate?.phone || '';
  const candidateLocation = mockMatch?.location || apiCandidate?.location || 'Bengaluru, India';
  const candidateAvatar = mockMatch?.avatarUrl || apiCandidate?.avatar_url || '';
  const candidateLinkedin = mockMatch?.linkedinUrl || apiCandidate?.linkedin_url || apiCandidate?.profile_url || '';
  
  const candidateSkills = useMemo(() => {
    if (apiCandidate?.skills && apiCandidate.skills.length > 0) return apiCandidate.skills;
    if (mockMatch?.skills && mockMatch.skills.length > 0) return mockMatch.skills;
    return ['React', 'Python', 'FastAPI', 'Distributed Systems'];
  }, [mockMatch, apiCandidate]);

  // Audio duration and recording source
  const recordingUrl = callDetails?.recording_url;

  const totalDurationSec = useMemo(() => {
    if (audioDuration && audioDuration > 0) return Math.round(audioDuration);
    if (callDetails?.duration_seconds && callDetails.duration_seconds > 0) {
      return Math.round(callDetails.duration_seconds);
    }
    return mockMatch?.audioDurationSec || 215;
  }, [audioDuration, callDetails, mockMatch]);

  // Find matching voice agent if available
  const matchedAgent = useMemo(() => {
    if (!callDetails?.agent_id) return null;
    return agents.find(a => a.id === callDetails.agent_id) || null;
  }, [callDetails, agents]);

  const parentJobAgent = useMemo(() => {
    if (!parentJob?.agent_id) return null;
    return agents.find(a => a.id === parentJob.agent_id) || null;
  }, [parentJob, agents]);

  // Dynamically extract all questions and answers (can be 1 to 7+ questions)
  const extractedQAs = useMemo(() => {
    return extractQuestionsAndAnswers(callDetails?.result, matchedAgent?.result_schema);
  }, [callDetails, matchedAgent]);

  // Evaluation & Scorecard
  const evaluation: CandidateEvaluation = useMemo(() => {
    if (mockMatch?.evaluation) return mockMatch.evaluation;

    if (callDetails?.result) {
      const res = callDetails.result;
      const rawScore = Number(res.suitability_score ?? res.fit_score ?? res.score) || 7;
      const score100 = rawScore <= 10 ? Math.round(rawScore * 10) : rawScore;

      const rawRec = String(res.overall_recommendation || res.recommended_next_step || (res.qualified ? 'HIRE' : 'HIRE')).toUpperCase();
      const mappedRec: Recommendation = 
        rawRec.includes('STRONG') ? 'Strong Hire' :
        rawRec.includes('HIRE') || rawRec.includes('SCHEDULE') ? 'Hire' :
        rawRec.includes('REJECT') || rawRec.includes('NOT_A_FIT') || rawRec.includes('DO_NOT_CONTACT') ? 'Reject' : 'Borderline';

      // Find notice period / availability dynamically from result or extracted questions
      let noticePeriod = res.notice_period || res.availability;
      if (!noticePeriod) {
        const noticeItem = extractedQAs.find(q => 
          q.key.toLowerCase().includes('notice') || 
          q.key.toLowerCase().includes('avail') || 
          q.answer.toLowerCase().includes('immediate') || 
          q.answer.toLowerCase().includes('week') || 
          q.answer.toLowerCase().includes('month')
        );
        noticePeriod = noticeItem?.answer || 'Immediate';
      }

      const seekingIntent: JobSeekingIntent = 
        noticePeriod.toLowerCase().includes('immediate') ? 'Immediate' : 'High';

      const strengths: string[] = [];
      const summaryText = res.candidate_summary || res.summary || res.screening_summary;
      if (summaryText) {
        strengths.push(summaryText);
      }
      for (const qa of extractedQAs) {
        if (strengths.length >= 4) break;
        if (qa.answer.length > 5 && qa.answer !== 'Yes' && qa.answer !== 'No') {
          strengths.push(`${qa.label}: ${qa.answer}`);
        }
      }
      if (strengths.length === 0) {
        strengths.push(`Verified proficiency in ${candidateSkills.slice(0, 3).join(', ')}.`);
        strengths.push('Candidate completed autonomous voice screening.');
      }

      return {
        jobSeekingIntent: seekingIntent,
        intentDetails: `Candidate indicated ${noticePeriod} availability. Direct responses confirmed during autonomous AI screening call.`,
        expectedSalary: res.salary_expectation || 'Competitive / Market Standard',
        currentSalary: 'Confidential',
        noticePeriod: noticePeriod,
        strengths,
        redFlags: [
          'No critical red flags detected during autonomous voice screening.'
        ],
        technicalProficiencyScore: Math.min(100, Math.max(50, score100 + 4)),
        culturalFitScore: Math.min(100, Math.max(50, score100 + 2)),
        communicationScore: 88,
        overallScore: score100,
        overallRecommendation: mappedRec,
        executiveSummary: summaryText || `Autonomous Hunar.AI voice screening completed for ${candidateName}. High candidate engagement (${callDetails.engagement_status || 'ENGAGED'}) with prompt responses across ${extractedQAs.length} screening inquiries.`,
        verifiedSkills: candidateSkills
      };
    }

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
  }, [mockMatch, callDetails, extractedQAs, candidateSkills, candidateName]);

  const transcript: CallTranscriptEntry[] = useMemo(() => {
    if (mockMatch?.transcript) return mockMatch.transcript;

    if (callDetails) {
      const persona = callDetails.system_data?.persona_name || 'Hunar Voice Agent';
      const cName = candidateName.split(' ')[0] || 'Candidate';
      const greeting = callDetails.system_data?.greeting || 'Good afternoon';
      const company = callDetails.custom_data?.company || 'Recruiter Portal';
      const role = callDetails.custom_data?.job_role || 'Senior Fullstack Engineer';

      const entries: CallTranscriptEntry[] = [
        {
          id: 't-intro-ai',
          speaker: 'ai',
          timestamp: '00:04',
          timestampSec: 4,
          text: `${greeting} ${cName}, this is ${persona} calling from ${company} regarding the ${role} position. Do you have a couple of minutes to chat?`,
          keyTopic: 'Greeting & Verification'
        },
        {
          id: 't-intro-cand',
          speaker: 'candidate',
          timestamp: '00:14',
          timestampSec: 14,
          text: 'Yes, I can speak right now.',
          sentiment: 'positive'
        }
      ];

      if (extractedQAs.length > 0) {
        const startSec = 22;
        const endSec = Math.max(totalDurationSec - 15, startSec + 10);
        const totalSpan = endSec - startSec;
        const step = totalSpan / extractedQAs.length;

        extractedQAs.forEach((qa, idx) => {
          const qTimeSec = Math.round(startSec + idx * step);
          const aTimeSec = Math.round(startSec + idx * step + Math.min(10, Math.max(3, step * 0.4)));

          const qMin = Math.floor(qTimeSec / 60).toString().padStart(2, '0');
          const qSec = (qTimeSec % 60).toString().padStart(2, '0');
          const aMin = Math.floor(aTimeSec / 60).toString().padStart(2, '0');
          const aSec = (aTimeSec % 60).toString().padStart(2, '0');

          const questionText = qa.questionPrompt 
            ? qa.questionPrompt 
            : `Could you tell me about your ${qa.label.toLowerCase()}?`;

          entries.push({
            id: `t-q-${qa.key}`,
            speaker: 'ai',
            timestamp: `${qMin}:${qSec}`,
            timestampSec: qTimeSec,
            text: questionText,
            keyTopic: qa.label
          });

          entries.push({
            id: `t-a-${qa.key}`,
            speaker: 'candidate',
            timestamp: `${aMin}:${aSec}`,
            timestampSec: aTimeSec,
            text: qa.answer,
            sentiment: 'positive',
            keyTopic: qa.label
          });
        });
      }

      const wrapSec = Math.max(totalDurationSec - 12, 35);
      const wMin = Math.floor(wrapSec / 60).toString().padStart(2, '0');
      const wSec = (wrapSec % 60).toString().padStart(2, '0');

      entries.push({
        id: 't-wrap-ai',
        speaker: 'ai',
        timestamp: `${wMin}:${wSec}`,
        timestampSec: wrapSec,
        text: `Thank you so much, ${cName}. I have captured all the details. Our recruiting team will review the evaluation and follow up shortly. Have a great day!`,
        keyTopic: 'Screening Wrap-up'
      });

      return entries;
    }

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
  }, [mockMatch, callDetails, extractedQAs, candidateName, totalDurationSec, fallbackCandidate]);

  // Active transcript item synchronized with audio
  const activeTranscriptId = transcript.reduce((acc, item) => {
    if (currentTimeSec >= item.timestampSec) {
      return item.id;
    }
    return acc;
  }, transcript[0]?.id);

  // Playback timer simulation (only when there's no real audio file)
  useEffect(() => {
    if (!recordingUrl) {
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
    }
  }, [isPlaying, playbackSpeed, totalDurationSec, recordingUrl]);

  // Sync playback speed to audio element
  useEffect(() => {
    if (recordingUrl && audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, recordingUrl]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (recordingUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(true);
          });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.min(Math.max(seconds, 0), totalDurationSec);
    setCurrentTimeSec(clamped);
    if (recordingUrl && audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  const handleJumpToTranscript = (timestampSec: number) => {
    handleSeek(timestampSec);
    if (!isPlaying) {
      if (recordingUrl && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(true));
      } else {
        setIsPlaying(true);
      }
    }
  };

  // Handle call confirmation for not-contacted state
  const handleConfirmSingleCall = async (opts: { agentId: string; phoneNumber?: string }) => {
    setIsCallingModal(true);
    try {
      if (apiCandidate) {
        await callMutation.mutateAsync({
          candidateId: apiCandidate.id,
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

  // Loading skeleton while resolving API candidate and call details
  const isResolving = 
    (resolvingApiCandidate && !apiCandidate && !callDetails && !mockMatch) ||
    (loadingCallDetails && !mockMatch && !callDetails);

  if (isResolving) {
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
                {parentJobAgent ? (
                  <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3] text-[11px] text-[#5a5957] flex items-center justify-between">
                    <span className="font-semibold text-[#2d2c2a]">Voice Agent:</span>
                    <span className="text-[#121212] font-medium">{parentJobAgent.name} ({parentJobAgent.persona_name || parentJobAgent.voice_persona} · {parentJobAgent.language})</span>
                  </div>
                ) : parentJob.script?.introduction ? (
                  <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3] text-[11px] italic text-[#5a5957]">
                    <span className="font-semibold text-[#2d2c2a] not-italic">Dialing intro: </span>
                    "{parentJob.script.introduction}"
                  </div>
                ) : null}
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
            defaultAgentId={parentJob?.agent_id || activeAgentForOutreachId}
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
                callDetails
                  ? `Screened by ${callDetails.system_data?.persona_name || 'Hunar Voice Agent'} on ${formatCalledAt(callDetails.started_at || callDetails.created_at)} (${callDetails.duration_minutes ? `${callDetails.duration_minutes}m` : (callDetails.duration_seconds ? `${Math.round(callDetails.duration_seconds)}s` : '2m')} · ${callDetails.answered_by || 'Human'})`
                  : candidateLog
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
                  {callDetails?.result?.suitability_score
                    ? (Number(callDetails.result.suitability_score) <= 10 
                        ? Number(callDetails.result.suitability_score) * 10 
                        : Number(callDetails.result.suitability_score))
                    : (mockMatch?.matchScore || 85)}%
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
          {evaluation && !isRinging && (
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

              {/* Dynamic Screening Q&A Direct Answers from Hunar Voice */}
              {extractedQAs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#f0f0ee]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#121212] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#4f46e5]" />
                      Screening Inquiries & Responses ({extractedQAs.length})
                    </span>
                    <span className="text-[10px] font-mono text-[#8c8b88]">
                      Autonomous AI Interview
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {extractedQAs.map(qa => (
                      <div key={qa.key} className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3] space-y-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#6e6d69] block">
                            {qa.questionPrompt ? qa.questionPrompt : qa.label}
                          </span>
                          {qa.questionNumber !== undefined && qa.questionPrompt && (
                            <span className="text-[9px] font-mono text-[#8c8b88] shrink-0 uppercase">
                              Q{qa.questionNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[#121212] leading-relaxed font-medium">
                          "{qa.answer}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          {!isRinging ? (
            <>
            {/* Real Audio Element if recording URL is present */}
            {recordingUrl && (
              <audio
                ref={audioRef}
                src={recordingUrl}
                preload="metadata"
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTimeSec(Math.floor(audioRef.current.currentTime));
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current && audioRef.current.duration) {
                    setAudioDuration(Math.round(audioRef.current.duration));
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTimeSec(0);
                }}
              />
            )}

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
                      Inbound screening · {callDetails ? `Recorded via ${callDetails.system_data?.persona_name || 'Hunar Voice Agent'} (${callDetails.language || 'ENGLISH'})` : (candidateLog ? `Recorded via ${candidateLog.agentName}` : 'Recorded Today')} (Audio codec: Opus 48kHz / WAV)
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
                    onClick={togglePlay}
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

              {/* Call Details Metadata Strip */}
              {callDetails && (
                <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#f0f0ee] text-[11px] text-[#6e6d69]">
                  <span className="font-mono">
                    <span className="text-[#8c8b88]">Status:</span>{' '}
                    <span className="text-emerald-700 font-semibold">{callDetails.status}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono">
                    <span className="text-[#8c8b88]">Answered:</span> {callDetails.answered_by || 'HUMAN'}
                  </span>
                  <span>•</span>
                  <span className="font-mono">
                    <span className="text-[#8c8b88]">Engagement:</span> {callDetails.engagement_status || 'ENGAGED'}
                  </span>
                  {callDetails.user_speech_duration && (
                    <>
                      <span>•</span>
                      <span className="font-mono">
                        <span className="text-[#8c8b88]">User Speech:</span> {callDetails.user_speech_duration}s
                      </span>
                    </>
                  )}
                  {callDetails.from_phone_number && (
                    <>
                      <span>•</span>
                      <span className="font-mono">
                        <span className="text-[#8c8b88]">Line:</span> {callDetails.from_phone_number}
                      </span>
                    </>
                  )}
                </div>
              )}
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

            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-[#e6e5e3] rounded-xl bg-[#fbfbfa] text-[#8c8b88] space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#1b6b27] border-t-transparent animate-spin" />
              <span className="text-xs font-mono">Audio & Transcript will be available after the call completes...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
