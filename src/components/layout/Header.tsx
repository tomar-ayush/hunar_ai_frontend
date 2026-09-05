import React from 'react';
import { 
  ChevronRight, 
  Search, 
  Bell, 
  Sparkles, 
  PhoneCall, 
  Command
} from 'lucide-react';
import { useRecruiter } from '../../context/RecruiterContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, metrics, activeCandidate, isCallingSimulated } = useRecruiter();

  const getBreadcrumbs = () => {
    if (currentRoute === '/') {
      return [
        { label: 'Hunar Autonomous Recruiter', path: '/' },
        { label: 'Dashboard Overview', path: '/' },
      ];
    }
    if (currentRoute === '/sourcing') {
      return [
        { label: 'Campaigns', path: '/sourcing' },
        { label: 'Lead Distributed Systems Engineer', path: '/sourcing' },
        { label: 'AI Sourcing Builder', path: '/sourcing' },
      ];
    }
    if (currentRoute === '/pipeline') {
      return [
        { label: 'Pipelines', path: '/pipeline' },
        { label: 'Apollo & PDL Sync', path: '/pipeline' },
        { label: 'Candidate CRM', path: '/pipeline' },
      ];
    }
    if (currentRoute.startsWith('/candidate')) {
      return [
        { label: 'Candidate CRM', path: '/pipeline' },
        { label: 'Call Audit & Scorecard', path: currentRoute },
        { label: activeCandidate ? activeCandidate.name : 'Alex Johnson', path: currentRoute },
      ];
    }
    return [{ label: 'Dashboard', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-[#e6e5e3] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6e6d69]">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.label + index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#b0afa9] shrink-0" />}
              <span
                onClick={() => navigateTo(crumb.path)}
                className={`transition-colors cursor-pointer ${
                  isLast
                    ? 'font-medium text-[#121212]'
                    : 'hover:text-[#121212] text-[#8c8b88]'
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right: Actions, Search, Status & Profile */}
      <div className="flex items-center gap-3">
        {/* Command Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#8c8b88] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidates, skills (Kafka, Go)..."
            className="h-8 pl-8 pr-12 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white w-64 transition-all"
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#ebeae7] border border-[#d8d7d3] text-[10px] font-mono text-[#5a5957]">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>

        {/* Live Call Telemetry Badge */}
        {isCallingSimulated ? (
          <Badge variant="warning" dot className="animate-pulse font-mono">
            Dialing Candidate Lines...
          </Badge>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] text-xs font-mono text-[#484744]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium">{metrics.activeCalls} Concurrent Calls Active</span>
          </div>
        )}

        {/* Notifications */}
        <button 
          aria-label="View notifications"
          className="w-8 h-8 rounded-lg border border-[#e6e5e3] bg-white flex items-center justify-center text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#4f46e5] rounded-full" />
        </button>

        {/* Primary Screen Trigger CTA */}
        {currentRoute === '/sourcing' ? (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/pipeline')}
          >
            View Sourced Pipeline
          </Button>
        ) : currentRoute === '/pipeline' ? (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/candidate/alex-johnson')}
          >
            View Latest Audit
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/sourcing')}
          >
            + New Sourcing Campaign
          </Button>
        )}
      </div>
    </header>
  );
};
