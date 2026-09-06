import React from 'react';
import { ChevronRight, Sparkles, PhoneCall } from 'lucide-react';
import { useRecruiter } from '../../context';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, activeCandidate } = useRecruiter();

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
