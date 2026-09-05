import React from 'react';
import { LayoutDashboard, Sparkles, Users2, FileCheck2, Sparkle, Bot } from 'lucide-react';
import { useRecruiter } from '../../context';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo, candidates, activeCandidate, agents, agentsTotalCount } = useRecruiter();

  const navItems = [
    {
      id: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: '/sourcing',
      label: 'Sourcing',
      icon: Sparkles,
      badge: undefined,
    },
    {
      id: '/pipeline',
      label: 'Pipeline',
      icon: Users2,
      badge: `${candidates.length}`,
    },
    {
      id: '/agents',
      label: 'Voice Agents',
      icon: Bot,
      badge: `${agentsTotalCount || agents.length}`,
    },
    {
      id: `/candidate/${activeCandidate?.id || 'alex-johnson'}`,
      label: 'Interview Audit',
      icon: FileCheck2,
      badge: undefined,
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-[#e6e5e3] flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand */}
      <div className="p-4 border-b border-[#f0f0ee]">
        <button
          onClick={() => navigateTo('/')}
          title="Back to landing page"
          className="flex items-center gap-2.5 rounded-lg hover:bg-[#f5f5f3] transition-colors p-1 -m-1 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#121212] flex items-center justify-center text-white shadow-xs">
            <Sparkle className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm tracking-tight text-[#121212]">
              HUNAR<span className="text-[#4f46e5]">.AI</span>
            </span>
            <p className="text-[11px] text-[#8c8b88] leading-none mt-0.5">Autonomous Recruiter</p>
          </div>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 py-4 space-y-1" aria-label="Main navigation">
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
      </nav>
    </aside>
  );
};
