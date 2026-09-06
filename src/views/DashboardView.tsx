import React from 'react';
import { 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Radio, 
  Layers, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardView: React.FC = () => {
  const { metrics, navigateTo, setActiveCandidateId } = useRecruiter();

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

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
          onClick={() => navigateTo('/sourcing')}
        >
          Edit Campaign JD
        </Button>
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
    </div>
  );
};
