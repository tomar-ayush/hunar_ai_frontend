import React from 'react';
import {
  Briefcase,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Calendar,
  Target,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const PipelineView: React.FC = () => {
  const { jobs, jobsLoading, jobsError, refreshJobs, navigateTo } = useRecruiter();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
              Recruiting Pipeline
            </h1>
            {jobsError ? (
              <Badge variant="danger" className="font-mono text-[10px]">
                API OFFLINE
              </Badge>
            ) : (
              <Badge variant="success" dot className="font-mono text-[10px]">
                {jobs.length} Jobs
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#6e6d69] mt-0.5">
            Jobs created from your sourcing campaigns. Open a job to review its scraped candidates and audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${jobsLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refreshJobs()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/sourcing')}
          >
            New Sourcing Campaign
          </Button>
        </div>
      </div>

      {/* Error State */}
      {jobsError && jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-[#121212]">Couldn't load jobs</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">{jobsError}</p>
          <Button variant="primary" size="sm" onClick={() => refreshJobs()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {jobsLoading && jobs.length === 0 && !jobsError && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e6e5e3] p-5 space-y-3 animate-pulse">
              <div className="h-4 w-1/3 bg-[#f0f0ee] rounded" />
              <div className="h-3 w-2/3 bg-[#f0f0ee] rounded" />
              <div className="h-3 w-1/2 bg-[#f0f0ee] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!jobsLoading && !jobsError && jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <Briefcase className="w-10 h-10 text-[#8c8b88] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[#121212]">No jobs in the pipeline yet</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">
            Start a sourcing campaign — paste a JD, and Hunar will create the job and scrape candidates for it.
          </p>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => navigateTo('/sourcing')}>
            New Sourcing Campaign
          </Button>
        </div>
      )}

      {/* Jobs List */}
      {jobs.map((job) => (
        <Card
          key={job.id}
          className="p-5 hover:border-[#b0afa9] hover:shadow-sm transition-all cursor-pointer group"
          onClick={() => navigateTo(`/pipeline/${job.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateTo(`/pipeline/${job.id}`);
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#121212] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-sm text-[#121212] group-hover:text-[#4f46e5] transition-colors">
                    {job.title}
                  </h2>
                  {job.sourcing_mode && (
                    <Badge variant="info" className="text-[10px] font-mono">
                      {job.sourcing_mode} sourcing
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-[#5a5957] line-clamp-2 mt-1.5 leading-relaxed max-w-2xl">
                  {job.jd_text}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-[#8c8b88]">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    Created {formatDate(job.created_at)}
                  </span>
                  <span className="text-[#b0afa9]">•</span>
                  <span>{timeAgo(job.created_at)}</span>
                  {job.script?.questions && job.script.questions.length > 0 && (
                    <>
                      <span className="text-[#b0afa9]">•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <HelpCircle className="w-3 h-3" />
                        {job.script.questions.length} screening questions
                      </span>
                    </>
                  )}
                </div>

                {job.pass_criteria && (
                  <div className="flex items-start gap-1.5 mt-3 p-2.5 rounded-lg bg-[#fbfbfa] border border-[#f0f0ee] max-w-2xl">
                    <Target className="w-3.5 h-3.5 text-[#1b6b27] shrink-0 mt-0.5" />
                    <span className="text-[11px] text-[#5a5957] leading-relaxed">
                      <span className="font-semibold text-[#2d2c2a]">Pass criteria: </span>
                      {job.pass_criteria}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <FileText className="w-4 h-4 text-[#8c8b88]" />
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#121212] text-white text-xs font-medium group-hover:bg-[#4f46e5] transition-colors">
                View candidates
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Card>
      ))}

      {!jobsLoading && jobs.length > 0 && (
        <p className="text-[11px] font-mono text-[#8c8b88] text-center flex items-center justify-center gap-1.5">
          <Clock className="w-3 h-3" />
          Showing all {jobs.length} job{jobs.length > 1 ? 's' : ''} from the Hunar API
        </p>
      )}
    </div>
  );
};
