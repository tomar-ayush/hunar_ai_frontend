import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Radio, 
  Layers, 
  ChevronRight,
  RefreshCw,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { useRecruiter } from '../context/RecruiterContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardView: React.FC = () => {
  const { metrics, candidates, navigateTo, setActiveCandidateId } = useRecruiter();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const metricCards = [
    {
      title: 'Total Sourced',
      value: metrics.totalSourced.toLocaleString(),
      change: '+14.2%',
      trend: 'up',
      subtext: 'Apollo & PDL enriched',
      icon: Users,
      iconBg: 'bg-[#f4f4f2] text-[#121212]',
    },
    {
      title: 'Active AI Calls',
      value: `${metrics.activeCalls}`,
      change: 'Live Dialing',
      trend: 'pulse',
      subtext: 'Simulating Hunar.AI voice',
      icon: PhoneCall,
      iconBg: 'bg-[#edf7ee] text-[#1b6b27]',
    },
    {
      title: 'Answer Rate',
      value: `${metrics.answerRate}%`,
      change: '+4.8% vs benchmark',
      trend: 'up',
      subtext: '480 ms voice latency',
      icon: TrendingUp,
      iconBg: 'bg-[#edf4fe] text-[#1a56db]',
    },
    {
      title: 'Qualified Candidates',
      value: `${metrics.qualifiedCandidates}`,
      change: `${metrics.qualificationRate}% pass rate`,
      trend: 'up',
      subtext: 'Score ≥ 85% verified',
      icon: CheckCircle2,
      iconBg: 'bg-[#f5f3ff] text-[#4f46e5]',
    },
  ];

  return (
    <div className="space-y-7 pb-12">
      {/* Top Banner & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
              Autonomous Recruiting Operations
            </h1>
            <Badge variant="purple" className="text-[11px] font-mono">
              Campaign Live
            </Badge>
          </div>
          <p className="text-xs text-[#6e6d69] mt-0.5">
            Automated pipeline telemetry for <span className="font-medium text-[#121212]">Lead Distributed Systems Engineer</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timeframe pill selector */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#f0f0ee] border border-[#e6e5e3] text-xs font-medium">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === 'today'
                  ? 'bg-white text-[#121212] shadow-xs'
                  : 'text-[#6e6d69] hover:text-[#121212]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-white text-[#121212] shadow-xs'
                  : 'text-[#6e6d69] hover:text-[#121212]'
              }`}
            >
              Last 7d
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-white text-[#121212] shadow-xs'
                  : 'text-[#6e6d69] hover:text-[#121212]'
              }`}
            >
              Last 30d
            </button>
          </div>

          <button
            onClick={handleRefresh}
            title="Sync pipeline data"
            className="w-8 h-8 rounded-lg border border-[#e6e5e3] bg-white flex items-center justify-center text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
            onClick={() => navigateTo('/sourcing')}
          >
            Edit Campaign JD
          </Button>
        </div>
      </div>

      {/* 1. High-Level Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-4 relative overflow-hidden group hover:border-[#cfceca]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-[#787774]">{card.title}</span>
                  <div className="text-2xl font-semibold tracking-tight text-[#121212] mt-1 font-mono">
                    {card.value}
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#f4f4f2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {card.trend === 'pulse' ? (
                    <span className="flex items-center gap-1 text-[#1b6b27] font-medium font-mono text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {card.change}
                    </span>
                  ) : (
                    <span className="text-[#1b6b27] font-semibold text-[11px] font-mono">
                      {card.change}
                    </span>
                  )}
                </div>
                <span className="text-[#8c8b88] text-[11px] truncate">{card.subtext}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Campaign Spotlight Bar */}
      <div className="bg-[#121212] text-white rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#262626]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Active Autonomous Bot
            </span>
            <span className="text-xs text-white/60">Campaign ID: hunar-camp-9481</span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Lead Distributed Systems Engineer (Go / Kafka / Raft)
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-white/70">Required skills:</span>
            {['Go (Golang)', 'Kafka', 'Kubernetes', 'gRPC', 'Distributed Systems'].map((s) => (
              <span
                key={s}
                className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/90 font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigateTo('/pipeline')}
            className="text-xs px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Pipeline ({candidates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigateTo('/candidate/alex-johnson')}
            className="text-xs px-3.5 py-2 rounded-lg bg-white text-[#121212] hover:bg-white/90 font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
            <span>Audit Top Candidate</span>
          </button>
        </div>
      </div>

      {/* Middle Section: Funnel Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Visual Conversion Funnel Chart (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#121212]" />
                  <h3 className="text-sm font-semibold text-[#121212] tracking-tight">
                    Candidate Conversion Funnel
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#6e6d69]">
                  Total Efficiency: <strong className="text-[#121212]">12.4%</strong>
                </span>
              </div>
              <p className="text-xs text-[#6e6d69] mb-5">
                Drop-off telemetry from Apollo/PDL sourcing through Hunar.AI voice screening.
              </p>

              {/* Stepped Funnel Visual Bars */}
              <div className="space-y-4">
                {metrics.funnel.map((stage, idx) => {
                  const prevCount = idx > 0 ? metrics.funnel[idx - 1].count : null;
                  const stepDrop = prevCount
                    ? (((prevCount - stage.count) / prevCount) * 100).toFixed(1)
                    : null;

                  return (
                    <div key={stage.stage} className="group">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center font-mono text-[10px] font-semibold text-[#5a5957]">
                            0{idx + 1}
                          </span>
                          <span className="font-medium text-[#121212]">{stage.stage}</span>
                          <span className="text-[11px] text-[#8c8b88] hidden sm:inline">
                            — {stage.subtext}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-semibold text-[#121212]">
                            {stage.count.toLocaleString()}
                          </span>
                          <span className="text-[#6e6d69] text-[11px]">
                            ({stage.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress bar container */}
                      <div className="relative w-full h-3.5 bg-[#f4f4f2] rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            idx === 0
                              ? 'bg-[#121212]'
                              : idx === 1
                              ? 'bg-[#2b2b2b]'
                              : idx === 2
                              ? 'bg-[#4f46e5]'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>

                      {/* Drop-off metric chip below stage if applicable */}
                      {stepDrop && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8c8b88] font-mono mt-1 ml-7">
                          <span>↓ Drop-off:</span>
                          <span className="text-[#b91c1c] font-medium">-{stepDrop}%</span>
                          <span>from previous stage</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funnel Bottom Quick Insights */}
            <div className="mt-6 pt-4 border-t border-[#f0f0ee] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#fbfbfa] border border-[#f0f0ee]">
                <div className="text-[10px] text-[#8c8b88] uppercase tracking-wider font-mono">Contact Rate</div>
                <div className="text-sm font-semibold text-[#121212] font-mono mt-0.5">63.6%</div>
              </div>
              <div className="p-2 rounded-lg bg-[#fbfbfa] border border-[#f0f0ee]">
                <div className="text-[10px] text-[#8c8b88] uppercase tracking-wider font-mono">Screening Completion</div>
                <div className="text-sm font-semibold text-[#121212] font-mono mt-0.5">65.6%</div>
              </div>
              <div className="p-2 rounded-lg bg-[#fbfbfa] border border-[#f0f0ee]">
                <div className="text-[10px] text-[#8c8b88] uppercase tracking-wider font-mono">Qualification Yield</div>
                <div className="text-sm font-semibold text-[#1b6b27] font-mono mt-0.5">29.8%</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Recent Activity Feed (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#121212]" />
                  <h3 className="text-sm font-semibold text-[#121212] tracking-tight">
                    Recent Autonomous Activity
                  </h3>
                </div>
                <Badge variant="neutral" className="text-[10px] font-mono">
                  Live Updates
                </Badge>
              </div>
              <p className="text-xs text-[#6e6d69] mb-4">
                Real-time log of AI screening calls and sourcing triggers.
              </p>

              {/* Activity Timeline List */}
              <div className="space-y-3">
                {metrics.recentActivity.map((activity) => {
                  return (
                    <div
                      key={activity.id}
                      onClick={() => {
                        if (activity.candidateId) {
                          setActiveCandidateId(activity.candidateId);
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all text-left flex items-start gap-3 ${
                        activity.candidateId
                          ? 'hover:border-[#cfceca] hover:bg-[#fbfbfa] cursor-pointer'
                          : 'border-[#f0f0ee] bg-[#fdfdfc]'
                      } border-[#e6e5e3]`}
                    >
                      <div className="mt-0.5">
                        {activity.type === 'call_completed' ? (
                          <div className="w-7 h-7 rounded-full bg-[#edf7ee] text-[#1b6b27] flex items-center justify-center text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : activity.type === 'candidate_queued' ? (
                          <div className="w-7 h-7 rounded-full bg-[#fef7ec] text-[#975a16] flex items-center justify-center text-xs">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                        ) : activity.type === 'jd_parsed' ? (
                          <div className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#4f46e5] flex items-center justify-center text-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#edf4fe] text-[#1a56db] flex items-center justify-center text-xs">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-[#121212] truncate">
                            {activity.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#8c8b88] shrink-0">
                            {activity.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#5a5957] line-clamp-2 mt-0.5 leading-relaxed">
                          {activity.description}
                        </p>

                        {activity.statusBadge && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                activity.statusBadge === 'Strong Hire'
                                  ? 'success'
                                  : activity.statusBadge === 'Ringing'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              className="text-[10px] py-0 px-1.5"
                            >
                              {activity.statusBadge}
                            </Badge>

                            {activity.candidateId && (
                              <span className="text-[11px] text-[#4f46e5] font-medium flex items-center gap-0.5 hover:underline">
                                Review Scorecard <ArrowUpRight className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => navigateTo('/pipeline')}
              className="mt-4 w-full py-2 rounded-lg bg-[#f4f4f2] hover:bg-[#ebeae7] text-xs font-medium text-[#121212] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Full Pipeline CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Top Sourced Candidates Ready for Voice Screening */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#d97706]" />
              <h3 className="text-sm font-semibold text-[#121212] tracking-tight">
                Top Sourced Candidates (Ready for Outreach)
              </h3>
            </div>
            <p className="text-xs text-[#6e6d69] mt-0.5">
              Simulated Apollo & PDL enrichments ranked by AI semantic fit.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/pipeline')}
          >
            Explore All Candidates ({candidates.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {candidates.slice(0, 3).map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => {
                setActiveCandidateId(candidate.id);
              }}
              className="p-4 rounded-xl border border-[#e6e5e3] hover:border-[#b0afa9] hover:bg-[#fafaf8] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#e6e5e3]"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-[#121212] group-hover:text-[#4f46e5] transition-colors">
                        {candidate.name}
                      </h4>
                      <p className="text-[11px] text-[#6e6d69] leading-tight mt-0.5">
                        {candidate.currentRole}
                      </p>
                      <span className="text-[10px] text-[#8c8b88] font-mono">
                        {candidate.company}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-[#1b6b27] bg-[#edf7ee] px-2 py-0.5 rounded border border-[#d4ebd6]">
                      {candidate.matchScore}%
                    </span>
                    <span className="text-[9px] text-[#8c8b88] font-mono mt-0.5">Fit Score</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#484744] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-[10px] px-1 py-0.5 text-[#8c8b88] font-mono">
                      +{candidate.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0f0ee] flex items-center justify-between">
                <Badge
                  variant={
                    candidate.callStatus === 'completed'
                      ? 'success'
                      : candidate.callStatus === 'ringing'
                      ? 'warning'
                      : 'neutral'
                  }
                  dot
                  className="text-[10px]"
                >
                  {candidate.callStatus === 'completed'
                    ? 'Screened'
                    : candidate.callStatus === 'ringing'
                    ? 'Call In Progress'
                    : candidate.callStatus === 'queued'
                    ? 'Queued'
                    : 'Not Contacted'}
                </Badge>

                <span className="text-[11px] font-medium text-[#4f46e5] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Audit <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
