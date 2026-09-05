import React, { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { CallTranscriptEntry } from '../types';

export const InterviewAuditView: React.FC = () => {
  const { activeCandidate, candidates, setActiveCandidateId, navigateTo } = useRecruiter();

  // If activeCandidate doesn't have evaluation data, fallback to Alex Johnson
  const candidate = (activeCandidate?.evaluation ? activeCandidate : candidates.find(c => c.evaluation)) || candidates[0];

  // Audio Playback Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.25 | 1.5 | 2>(1);
  const totalDurationSec = candidate.audioDurationSec || 215;

  // Active transcript item synchronized with audio
  const activeTranscriptId = candidate.transcript?.reduce((acc, item) => {
    if (currentTimeSec >= item.timestampSec) {
      return item.id;
    }
    return acc;
  }, candidate.transcript[0]?.id);

  // Playback timer simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
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

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/pipeline')}
            className="w-8 h-8 rounded-lg border border-[#e6e5e3] bg-white flex items-center justify-center text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
                {candidate.name}
              </h1>
              <Badge variant="success" dot className="font-mono">
                Screened by Hunar.AI
              </Badge>
            </div>
            <p className="text-xs text-[#6e6d69] mt-0.5">
              {candidate.currentRole} at {candidate.company} · Applied for Lead Distributed Systems Engineer
            </p>
          </div>
        </div>

        {/* Candidate Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c8b88]">Review Candidate:</span>
          <select
            value={candidate.id}
            onChange={(e) => setActiveCandidateId(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.matchScore}% Match · {c.callStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split-Screen Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Profile & Evaluation (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Candidate Profile Summary Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#e6e5e3]"
                />
                <div>
                  <h2 className="text-sm font-semibold text-[#121212]">{candidate.name}</h2>
                  <p className="text-xs text-[#6e6d69]">{candidate.headline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#8c8b88]">{candidate.location}</span>
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0077b5] hover:opacity-80 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold font-mono text-[#1b6b27] bg-[#edf7ee] px-2.5 py-0.5 rounded border border-[#d4ebd6]">
                  {candidate.matchScore}%
                </div>
                <span className="text-[10px] text-[#8c8b88] font-mono mt-0.5 block">AI Match</span>
              </div>
            </div>

            {/* Quick Contact info */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#f0f0ee] text-xs">
              <div>
                <span className="text-[11px] text-[#8c8b88] block">Email</span>
                <span className="text-[#2d2c2a] font-mono truncate block">{candidate.email}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#8c8b88] block">Phone</span>
                <span className="text-[#2d2c2a] font-mono">{candidate.phone}</span>
              </div>
            </div>
          </Card>

          {/* AI Insights & Evaluation Card */}
          {candidate.evaluation && (
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
                    candidate.evaluation.overallRecommendation === 'Strong Hire'
                      ? 'success'
                      : 'neutral'
                  }
                  className="font-mono text-xs"
                >
                  {candidate.evaluation.overallRecommendation}
                </Badge>
              </div>

              {/* 3 Core Screening Parameters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Seeking Intent
                  </span>
                  <span className="text-xs font-semibold text-[#1b6b27] mt-0.5 block">
                    {candidate.evaluation.jobSeekingIntent}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Notice Period
                  </span>
                  <span className="text-xs font-semibold text-[#121212] mt-0.5 block truncate">
                    {candidate.evaluation.noticePeriod}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3]">
                  <span className="text-[10px] uppercase font-mono text-[#8c8b88] block">
                    Target Comp
                  </span>
                  <span className="text-xs font-semibold text-[#121212] mt-0.5 block truncate">
                    $230k - $250k
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
                  {candidate.evaluation.executiveSummary}
                </p>
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#1b6b27] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Key Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-[#2d2c2a]">
                  {candidate.evaluation.strengths.map((st, i) => (
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
                  {candidate.evaluation.redFlags.map((rf, i) => (
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
                        {candidate.evaluation.technicalProficiencyScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#121212] rounded-full"
                        style={{ width: `${candidate.evaluation.technicalProficiencyScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6e6d69]">Communication & Clarity</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {candidate.evaluation.communicationScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4f46e5] rounded-full"
                        style={{ width: `${candidate.evaluation.communicationScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#6e6d69]">Cultural Alignment</span>
                      <span className="font-mono font-semibold text-[#121212]">
                        {candidate.evaluation.culturalFitScore}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${candidate.evaluation.culturalFitScore}%` }}
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
                    Inbound screening · Recorded Today (Audio codec: Opus 48kHz)
                  </span>
                </div>
              </div>

              {/* Playback Speed Controls */}
              <div className="inline-flex p-0.5 rounded-lg bg-[#f0f0ee] border border-[#e6e5e3] text-xs font-mono">
                {([1, 1.25, 1.5, 2] as const).map((speed) => (
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
                  onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
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
                  // Generate organic waveform heights
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
              {candidate.transcript?.map((entry: CallTranscriptEntry) => {
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
                        ) : (
                          <img
                            src={candidate.avatarUrl}
                            alt={candidate.name}
                            className="w-5 h-5 rounded-full object-cover border border-[#e6e5e3]"
                          />
                        )}
                        <span className="text-xs font-semibold text-[#121212]">
                          {isAI ? 'Hunar AI Voice Recruiter' : candidate.name}
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
                        {entry.highlightKeywords.map((kw) => (
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
