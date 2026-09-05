import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Users2, 
  FileCheck2, 
  ChevronDown, 
  Settings, 
  Sparkle,
  Flame
} from 'lucide-react';
import { useRecruiter } from '../../context';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo, metrics, candidates, activeCandidate } = useRecruiter();

  const navItems = [
    {
      id: '/',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: '/sourcing',
      label: 'Campaign & Sourcing',
      icon: Sparkles,
      badge: 'AI JD Parser',
    },
    {
      id: '/pipeline',
      label: 'Candidate CRM Pipeline',
      icon: Users2,
      badge: `${candidates.length}`,
    },
    {
      id: `/candidate/${activeCandidate?.id || 'alex-johnson'}`,
      label: 'Interview Audit & Scorecard',
      icon: FileCheck2,
      badge: 'Hunar Voice',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e6e5e3] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Top Header / Brand */}
      <div>
        <div className="p-4 border-b border-[#f0f0ee]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#121212] flex items-center justify-center text-white shadow-xs">
                <Sparkle className="w-4 h-4 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-[#121212]">
                    HUNAR<span className="text-[#4f46e5]">.AI</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#6e6d69] font-medium">
                    v2.4
                  </span>
                </div>
                <p className="text-[11px] text-[#8c8b88] leading-none mt-0.5">Autonomous Recruiter</p>
              </div>
            </div>
          </div>

          {/* Workspace selector */}
          <div className="mt-3.5 px-2 py-1.5 rounded-lg bg-[#fbfbfa] border border-[#e6e5e3] flex items-center justify-between hover:border-[#d0cfcb] transition-colors cursor-pointer">
            <div className="flex items-center gap-2 truncate">
              <div className="w-4 h-4 rounded bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center text-[10px] font-bold">
                A
              </div>
              <span className="text-xs font-medium text-[#2d2c2a] truncate">Acme Infrastructure Inc.</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8c8b88] shrink-0" />
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9e9d99]">
            Workspaces
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.id ||
              (item.id.startsWith('/candidate') && currentRoute.startsWith('/candidate'));

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#121212] text-white font-medium shadow-xs'
                    : 'text-[#5a5957] hover:text-[#121212] hover:bg-[#f5f5f3]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-[#8c8b88] group-hover:text-[#121212]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#f0f0ee] text-[#5a5957]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Voice Agent Live Telemetry Box */}
        <div className="px-3 pt-2">
          <div className="p-3 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-[#2d2c2a]">Hunar Voice Bot</span>
              </div>
              <Badge variant="success" className="text-[10px] py-0 px-1.5 font-mono">
                ONLINE
              </Badge>
            </div>
            
            <div className="space-y-1.5 text-xs text-[#6e6d69]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8c8b88]">Active Lines:</span>
                <span className="font-semibold font-mono text-[#121212]">{metrics.activeCalls} dialing</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8c8b88]">Screening Queue:</span>
                <span className="font-semibold font-mono text-[#121212]">12 pending</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8c8b88]">Answer Rate:</span>
                <span className="font-semibold font-mono text-[#1b6b27]">{metrics.answerRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Top Matches */}
        <div className="px-3 pt-4">
          <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9e9d99] flex items-center justify-between">
            <span>High Intent Stars</span>
            <Flame className="w-3 h-3 text-[#d97706]" />
          </div>
          <div className="space-y-1">
            {candidates.slice(0, 2).map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => navigateTo(`/candidate/${candidate.id}`)}
                className="w-full p-2 rounded-lg hover:bg-[#f5f5f3] text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
              >
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#e6e5e3]"
                />
                <div className="truncate flex-1">
                  <div className="text-xs font-medium text-[#2d2c2a] group-hover:text-[#121212] truncate">
                    {candidate.name}
                  </div>
                  <div className="text-[10px] text-[#8c8b88] truncate">{candidate.company}</div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[#1b6b27] bg-[#edf7ee] px-1.5 py-0.5 rounded">
                  {candidate.matchScore}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#f0f0ee]">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f7f7f5] transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#121212] text-white flex items-center justify-center font-semibold text-xs">
              SJ
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-[#121212] leading-tight">Sarah Jenkins</div>
              <div className="text-[11px] text-[#8c8b88] leading-tight mt-0.5">Head of Talent</div>
            </div>
          </div>
          <Settings className="w-4 h-4 text-[#8c8b88] hover:text-[#121212] transition-colors" />
        </div>
      </div>
    </aside>
  );
};
