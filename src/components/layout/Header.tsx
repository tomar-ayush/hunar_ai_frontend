import React from 'react';
import { ChevronRight, Sparkles, PhoneCall } from 'lucide-react';
import { useRecruiter } from '../../context';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, metrics, activeCandidate, isCallingSimulated } = useRecruiter();

  const getBreadcrumbs = () => {
    if (currentRoute === '/dashboard') {
      return [
        { label: 'Hunar Autonomous Recruiter', path: '/dashboard' },
        { label: 'Dashboard Overview', path: '/dashboard' },
      ];
    }
    if (currentRoute === '/sourcing') {
      return [
        { label: 'Campaign & Sourcing', path: '/sourcing' },
        { label: 'AI Sourcing Builder', path: '/sourcing' },
      ];
    }
    if (currentRoute === '/pipeline') {
      return [
        { label: 'Pipeline', path: '/pipeline' },
        { label: 'Jobs', path: '/pipeline' },
      ];
    }
    if (currentRoute.startsWith('/pipeline/')) {
      return [
        { label: 'Pipeline', path: '/pipeline' },
        { label: 'Job Candidates', path: currentRoute },
      ];
    }
    if (currentRoute === '/agents') {
      return [
        { label: 'Voice Agents', path: '/agents' },
        { label: 'Agent Catalog', path: '/agents' },
      ];
    }
    if (currentRoute.startsWith('/candidate')) {
      return [
        { label: 'Candidate CRM', path: '/pipeline' },
        { label: 'Call Audit & Scorecard', path: currentRoute },
        { label: activeCandidate ? activeCandidate.name : 'Alex Johnson', path: currentRoute },
      ];
    }
    return [{ label: 'Dashboard', path: '/dashboard' }];
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

      {/* Right: Live Call Status & CTA */}
      <div className="flex items-center gap-3">
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

        {/* Primary Screen Trigger CTA */}
        {currentRoute === '/agents' ? (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/pipeline')}
          >
            Candidate CRM Pipeline
          </Button>
        ) : currentRoute === '/sourcing' ? (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/pipeline')}
          >
            View Sourced Pipeline
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
