import React from 'react';
import {
  Sparkle,
  ArrowRight,
  ArrowDown,
  FileText,
  Search,
  PhoneCall,
  AudioLines,
  ListChecks,
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ParticleMesh } from '../components/visuals/ParticleMesh';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Paste the job description',
    description:
      'Drop a JD from any ATS or doc. Hunar parses the role, seniority, skills and location into a structured sourcing brief.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Source from Apollo automatically',
    description:
      'The brief runs against Apollo profiles, enriches each match, and ranks candidates by semantic fit score.',
  },
  {
    number: '03',
    icon: PhoneCall,
    title: 'The agent makes the calls',
    description:
      'A Hunar voice agent phones each candidate, screens them against the JD, and returns a transcript with a scorecard.',
  },
];

const features = [
  {
    icon: FileText,
    title: 'JD parsing that reads the role',
    description:
      'Required skills, seniority, salary band and location extracted into editable parameters before a search runs.',
  },
  {
    icon: Search,
    title: 'Ranked sourcing, not lists',
    description:
      'Every Apollo match scored and filterable by skill, company and fit — the shortlist is already ordered.',
  },
  {
    icon: AudioLines,
    title: 'Voice agents with live call states',
    description:
      'Ringing, connected, completed. Outbound screening tracked per candidate as it happens, with test calls before you scale.',
  },
  {
    icon: ListChecks,
    title: 'Audit every conversation',
    description:
      'Transcripts, intent signals, red flags and dimension scores for each call — reviewable in one click from the pipeline.',
  },
];

const pipelineRows = [
  { initials: 'AJ', name: 'Alex Johnson', meta: 'Stripe · Senior Staff Eng', skill: 'Go', status: 'Screened', variant: 'success' as const },
  { initials: 'PC', name: 'Priya Chandra', meta: 'Cloudflare · Distributed Systems', skill: 'Kafka', status: 'Calling', variant: 'warning' as const },
  { initials: 'MW', name: 'Marcus Wei', meta: 'Figma · Infrastructure', skill: 'Raft', status: 'Queued', variant: 'neutral' as const },
];

export const LandingView: React.FC = () => {
  const { navigateTo } = useRecruiter();

  return (
    <div className="min-h-dvh bg-[#fbfbfa] text-[#121212] flex flex-col antialiased">
      {/* Nav — same brand block and hairline chrome as the console */}
      <nav className="border-b border-[#e6e5e3] bg-white">
        <div className="max-w-6xl mx-auto w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#121212] flex items-center justify-center shadow-xs">
              <Sparkle className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight">
                HUNAR<span className="text-[#4f46e5]">.AI</span>
              </span>
              <p className="text-[11px] text-[#8c8b88] leading-none mt-0.5">Autonomous Recruiter</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigateTo('/dashboard')}
          >
            Open console
          </Button>
        </div>
      </nav>

      {/* Hero — geometric lattice mesh behind editorial type */}
      <header className="relative border-b border-[#e6e5e3] overflow-hidden">
        <ParticleMesh className="absolute inset-0 w-full h-full" spacing={88} interactive />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <p
            className="animate-rise text-[11px] font-mono uppercase tracking-[0.22em] text-[#8c8b88]"
            style={{ animationDelay: '0ms' }}
          >
            Autonomous recruiting console
          </p>

          <h1
            className="animate-rise font-display font-bold tracking-[-0.03em] leading-[1.06] text-[clamp(2.4rem,5.2vw,4.2rem)] mt-6"
            style={{ animationDelay: '80ms', textWrap: 'balance' }}
          >
            Paste a job description.
            <br />
            The console sources the matches
            <br />
            and <span className="text-[#4f46e5]">makes the calls</span>.
          </h1>

          <p
            className="animate-rise text-[#5a5957] text-base md:text-lg leading-relaxed max-w-xl mt-6"
            style={{ animationDelay: '160ms' }}
          >
            Hunar.AI turns a JD into a structured brief, pulls ranked candidates from
            Apollo, and sends a voice agent to screen them by phone — you review the
            scorecards.
          </p>

          <div
            className="animate-rise flex flex-wrap items-center gap-3 mt-9"
            style={{ animationDelay: '240ms' }}
          >
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigateTo('/dashboard')}
            >
              Open the console
            </Button>
            <a
              href="#flow"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#e6e5e3] bg-white text-sm font-medium text-[#5a5957] hover:text-[#121212] hover:bg-[#f9f9f8] transition-all active:scale-[0.98] shadow-xs"
            >
              See the flow
              <ArrowDown className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Stat rail — hairline dividers, tabular figures */}
          <div
            className="animate-rise grid grid-cols-3 max-w-lg mt-16 border-t border-[#e6e5e3] pt-6 gap-4"
            style={{ animationDelay: '320ms' }}
          >
            {[
              { value: '1,240+', label: 'candidates sourced' },
              { value: '63.6%', label: 'contact rate' },
              { value: '480 ms', label: 'voice latency' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[11px] text-[#8c8b88] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Flow — numbered steps on a drawn rail */}
      <section id="flow" className="border-b border-[#e6e5e3]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8c8b88]">
            How it works
          </p>
          <h2
            className="font-display font-semibold tracking-tight text-3xl md:text-4xl mt-3 max-w-xl"
            style={{ textWrap: 'balance' }}
          >
            From job description to screened shortlist, without the busywork
          </h2>

          <div className="relative grid md:grid-cols-3 gap-10 mt-14">
            {/* the rail the steps sit on */}
            <div
              className="animate-draw-x hidden md:block absolute top-[21px] left-[3px] right-[3px] h-px bg-[#d8d7d3] origin-left"
              aria-hidden="true"
            />
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="w-11 h-11 rounded-lg bg-white border border-[#121212] flex items-center justify-center font-mono text-xs font-semibold shadow-xs">
                    {step.number}
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <Icon className="w-4 h-4 text-[#4f46e5]" />
                    <h3 className="font-display font-semibold text-lg tracking-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[#5a5957] leading-relaxed mt-2 max-w-xs">
                    {step.description}
                  </p>
                  <span className="hidden md:block absolute top-[14px] -left-[3px] w-3 h-3 bg-[#fbfbfa] border border-[#d8d7d3] rotate-45" aria-hidden="true" />
                  <span className="sr-only">Step {i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product preview — a miniature of the real console */}
      <section className="border-b border-[#e6e5e3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8c8b88]">
            Inside the console
          </p>
          <h2
            className="font-display font-semibold tracking-tight text-3xl md:text-4xl mt-3 max-w-xl"
            style={{ textWrap: 'balance' }}
          >
            The same console from the first JD to the final offer
          </h2>

          <div className="rounded-2xl border border-[#e6e5e3] bg-[#fbfbfa] shadow-sm overflow-hidden mt-12">
            {/* window chrome */}
            <div className="h-10 border-b border-[#e6e5e3] bg-white flex items-center gap-3 px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e6e5e3]" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e6e5e3]" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#121212]" />
              </div>
              <span className="text-[10px] font-mono text-[#8c8b88] ml-2">
                console.hunar.ai/pipeline
              </span>
            </div>

            <div className="flex">
              {/* mini sidebar */}
              <div className="w-44 border-r border-[#e6e5e3] bg-white p-3 space-y-1 hidden sm:block">
                <div className="flex items-center gap-2 px-1 pb-3">
                  <div className="w-5 h-5 rounded bg-[#121212] flex items-center justify-center">
                    <Sparkle className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                  <span className="text-[11px] font-semibold">HUNAR.AI</span>
                </div>
                {['Dashboard', 'Sourcing', 'Pipeline', 'Voice Agents', 'Audit'].map((item) => (
                  <div
                    key={item}
                    className={`text-[11px] px-2 py-1.5 rounded-md ${
                      item === 'Pipeline'
                        ? 'bg-[#121212] text-white font-medium'
                        : 'text-[#5a5957]'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* mini pipeline */}
              <div className="flex-1 p-4 space-y-2.5 min-w-0">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-semibold">Candidate CRM</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f0f0ee] text-[#5a5957]">
                    9 sourced
                  </span>
                </div>
                {pipelineRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#e6e5e3] bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-[10px] font-semibold text-[#5a5957] shrink-0">
                        {row.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{row.name}</div>
                        <div className="text-[10px] text-[#8c8b88] truncate">{row.meta}</div>
                      </div>
                      <span className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#484744] font-mono">
                        {row.skill}
                      </span>
                    </div>
                    <Badge
                      variant={row.variant}
                      dot
                      className="text-[10px] shrink-0"
                    >
                      {row.status}
                    </Badge>
                  </div>
                ))}
                {/* floating outreach bar, like the real pipeline */}
                <div className="pt-1.5">
                  <div className="flex items-center justify-between bg-[#121212] text-white px-4 py-2.5 rounded-xl">
                    <span className="text-xs font-medium flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-[#8b83f6]" />
                      Initiate voice outreach
                    </span>
                    <span className="text-[10px] font-mono text-white/60">3 selected · NEHA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[#8c8b88] mt-4">
            Live view — candidate CRM with 1-click voice outreach
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-[#e6e5e3]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#8c8b88]">
            Built for the whole flow
          </p>
          <h2
            className="font-display font-semibold tracking-tight text-3xl md:text-4xl mt-3 max-w-xl"
            style={{ textWrap: 'balance' }}
          >
            Four surfaces, one pipeline
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mt-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-5 hover:border-[#cfceca] transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#4f46e5]" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-[#5a5957] leading-relaxed mt-1.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA — the lattice returns, calmer */}
      <section className="relative border-b border-[#e6e5e3] overflow-hidden">
        <ParticleMesh className="absolute inset-0 w-full h-full" spacing={110} interactive={false} opacity={0.55} />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <h2
            className="font-display font-bold tracking-tight text-3xl md:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            Your next shortlist is one JD away
          </h2>
          <p className="text-sm md:text-base text-[#5a5957] mt-4 max-w-md mx-auto">
            Open the console, paste a JD, and hear back from qualified candidates today.
          </p>
          <Button
            size="lg"
            variant="primary"
            className="mt-8"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigateTo('/dashboard')}
          >
            Open the Hunar.AI console
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#121212] flex items-center justify-center">
              <Sparkle className="w-2.5 h-2.5 fill-white text-white" />
            </div>
            <span className="font-semibold text-xs tracking-tight">
              HUNAR<span className="text-[#4f46e5]">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#8c8b88]">
            <span>© 2026 Hunar AI</span>
            <span className="hover:text-[#121212] transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-[#121212] transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
