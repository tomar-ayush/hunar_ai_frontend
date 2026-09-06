import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Sliders, 
  Cpu, 
  Layers, 
  Briefcase, 
  MapPin, 
  RotateCcw,
  CheckCircle2,
  FileText,
  Scan,
  Database,
  AlertCircle,
  Bot
} from 'lucide-react';
import { useRecruiter } from '../context';
import { useCreateJobMutation } from '../queries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockJobDescriptionSample } from '../mock/mockData';

export const SourcingBuilderView: React.FC = () => {
  const { 
    extractedParams, 
    setExtractedParams, 
    navigateTo, 
    agents, 
    activeAgentForOutreachId
  } = useRecruiter();

  const createJobMutation = useCreateJobMutation();

  // Multi-step workflow state: 1 = Input JD, 2 = AI Scanning Skeleton, 3 = Refinement & Create
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [jobDescription, setJobDescription] = useState(mockJobDescriptionSample);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Effective selected agent id, defaulting to active agent or first available agent
  const effectiveAgentId = selectedAgentId || activeAgentForOutreachId || agents[0]?.id || '';

  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === effectiveAgentId) || null;
  }, [agents, effectiveAgentId]);

  // Suggested skills to add with 1-click
  const suggestedSkills = ['eBPF', 'Rust', 'Raft Consensus', 'Prometheus', 'CockroachDB', 'gRPC'];

  const handleStartExtraction = () => {
    setCurrentStep(2);
    setScanningProgress(20);

    const timer1 = setTimeout(() => setScanningProgress(55), 450);
    const timer2 = setTimeout(() => setScanningProgress(85), 900);
    const timer3 = setTimeout(() => {
      setScanningProgress(100);
      setCurrentStep(3);
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || extractedParams.requiredSkills.includes(trimmed)) return;
    setExtractedParams(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, trimmed]
    }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExtractedParams(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleRunSearchQuery = async () => {
    setIsQueryRunning(true);
    setCreateError(null);
    try {
      const created = await createJobMutation.mutateAsync({
        title: extractedParams.targetJobTitle,
        jd_text: jobDescription,
        agent_id: effectiveAgentId || null,
        target_seniority_level: extractedParams.seniorityLevel,
        target_location: extractedParams.locationPreference,
        experience_required: `${extractedParams.experienceMin}+ years`,
        required_skills: extractedParams.requiredSkills,
        sourcing_mode: 'auto'
      });
      navigateTo(`/pipeline/${created.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Job creation failed');
      setIsQueryRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
              Campaign & Sourcing Builder
            </h1>
            <Badge variant="purple" className="text-[11px] font-mono">
              Apollo & PDL Engine
            </Badge>
          </div>
          <p className="text-xs text-[#6e6d69] mt-0.5">
            Extract strict candidate sourcing parameters from raw job specs via Hunar AI parser.
          </p>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#f0f0ee] border border-[#e6e5e3] text-xs">
          <button
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStep === 1
                ? 'bg-white text-[#121212] shadow-xs'
                : 'text-[#6e6d69] hover:text-[#121212]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#121212] text-white text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span>Paste JD</span>
          </button>
          
          <button
            onClick={() => setCurrentStep(2)}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStep === 2
                ? 'bg-white text-[#121212] shadow-xs'
                : 'text-[#6e6d69] hover:text-[#121212]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#121212] text-white text-[10px] flex items-center justify-center font-mono">
              2
            </span>
            <span>AI Scanning</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentStep === 3
                ? 'bg-white text-[#121212] shadow-xs'
                : 'text-[#6e6d69] hover:text-[#121212]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#121212] text-white text-[10px] flex items-center justify-center font-mono">
              3
            </span>
            <span>Refine & Search</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Paste Job Description */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#121212]" />
              <h2 className="text-sm font-semibold text-[#121212]">
                Step 1: Paste Target Job Description
              </h2>
            </div>
            <button
              onClick={() => setJobDescription(mockJobDescriptionSample)}
              className="text-xs font-medium text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Load Sample Distributed Systems JD
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste raw text from Greenhouse, Lever, Workday, or custom JD document..."
              className="w-full text-xs font-mono p-4 rounded-xl border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:bg-white focus:outline-none focus:border-[#121212] transition-all leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#8c8b88] bg-white/80 px-2 py-0.5 rounded border border-[#e6e5e3]">
              {jobDescription.length} characters
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#f0f0ee]">
            <div className="flex items-center gap-2 text-xs text-[#6e6d69]">
              <Cpu className="w-3.5 h-3.5 text-[#4f46e5]" />
              <span>Hunar AI will extract seniority, stack requirements, and experience bounds.</span>
            </div>

            <Button
              size="md"
              variant="primary"
              leftIcon={<Sparkles className="w-4 h-4 text-white" />}
              onClick={handleStartExtraction}
            >
              Extract Parameters
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Mock Scanning / Skeleton State */}
      {currentStep === 2 && (
        <Card className="p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] text-[#4f46e5] flex items-center justify-center animate-pulse">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#121212]">
                  Scanning & Deconstructing Job Description...
                </h3>
                <p className="text-xs text-[#6e6d69] mt-0.5">
                  Analyzing semantic intent, tech stack constraints, and target company tiers.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-[#4f46e5]">
              {scanningProgress}%
            </span>
          </div>

          {/* Scanning Progress Bar */}
          <div className="w-full h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4f46e5] transition-all duration-300 ease-out"
              style={{ width: `${scanningProgress}%` }}
            />
          </div>

          {/* Skeleton Extraction Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-[#e6e5e3] bg-[#fbfbfa] space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-[#e6e5e3] rounded animate-pulse" />
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="h-4 w-3/4 bg-[#deddd9] rounded animate-pulse" />
              <div className="space-y-1.5 pt-2">
                <div className="h-2.5 w-full bg-[#ecebe8] rounded animate-pulse" />
                <div className="h-2.5 w-4/5 bg-[#ecebe8] rounded animate-pulse" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#e6e5e3] bg-[#fbfbfa] space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 bg-[#e6e5e3] rounded animate-pulse" />
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#4f46e5] border-t-transparent animate-spin" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-6 w-16 bg-[#e6e5e3] rounded-full animate-pulse" />
                ))}
              </div>
              <div className="h-2.5 w-2/3 bg-[#ecebe8] rounded animate-pulse pt-2" />
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="text-xs text-[#6e6d69] hover:text-[#121212] underline cursor-pointer"
            >
              Skip preview & open editor →
            </button>
          </div>
        </Card>
      )}

      {/* STEP 3: Refinement Form */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-7 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f0ee]">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#121212]" />
                <h2 className="text-sm font-semibold text-[#121212]">
                  Step 3: Refine Parameters & Create the Job
                </h2>
              </div>
              <p className="text-xs text-[#6e6d69] mt-0.5">
                Verify the criteria below — this creates the job in your pipeline and starts candidate sourcing.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-[#5a5957] hover:text-[#121212] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Re-paste JD
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Job Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#8c8b88]" />
                Target Job Title
              </label>
              <input
                type="text"
                value={extractedParams.targetJobTitle}
                onChange={(e) =>
                  setExtractedParams(prev => ({ ...prev, targetJobTitle: e.target.value }))
                }
                className="w-full h-9 px-3.5 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212]"
              />
            </div>

            {/* Seniority Band */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8c8b88]" />
                Target Seniority Level
              </label>
              <select
                value={extractedParams.seniorityLevel}
                onChange={(e) =>
                  setExtractedParams(prev => ({ ...prev, seniorityLevel: e.target.value }))
                }
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212]"
              >
                <option value="Intern">Intern</option>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Staff">Staff</option>
                <option value="Principal">Principal</option>
              </select>
            </div>

            {/* Location Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8c8b88]" />
                Target Location & Remote Policy
              </label>
              <input
                type="text"
                value={extractedParams.locationPreference}
                onChange={(e) =>
                  setExtractedParams(prev => ({ ...prev, locationPreference: e.target.value }))
                }
                className="w-full h-9 px-3.5 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212]"
              />
            </div>

            {/* Assigned Voice Agent Selection */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#4f46e5]" />
                  Voice Agent (Hunar Agent ID)
                </label>
                {selectedAgent && (
                  <span className="text-[11px] text-[#8c8b88]">
                    Persona: <span className="font-semibold text-[#121212]">{selectedAgent.persona_name || selectedAgent.voice_persona}</span> · {selectedAgent.language}
                  </span>
                )}
              </div>
              <select
                value={effectiveAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
              >
                <option value="">Select a voice agent...</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.persona_name || agent.voice_persona} · {agent.language})
                  </option>
                ))}
              </select>

              {selectedAgent ? (
                <div className="p-3.5 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#121212]">{selectedAgent.name}</span>
                      <Badge variant="neutral" className="text-[10px] font-mono">{selectedAgent.voice_persona}</Badge>
                      <Badge variant="neutral" className="text-[10px] font-mono">{selectedAgent.language}</Badge>
                      {selectedAgent.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#8c8b88]">ID: {selectedAgent.id.slice(0, 8)}...</span>
                  </div>

                  {selectedAgent.objective && (
                    <p className="text-[11px] text-[#5a5957] leading-relaxed">
                      <span className="font-semibold text-[#2d2c2a]">Objective: </span>
                      {selectedAgent.objective}
                    </p>
                  )}

                  {selectedAgent.introduction && (
                    <p className="text-[11px] text-[#8c8b88] italic leading-relaxed">
                      <span className="not-italic font-semibold text-[#5a5957]">Opening line: </span>
                      "{selectedAgent.introduction}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#8c8b88]">
                  Select the Hunar AI voice agent that will conduct outreach phone calls for this job.
                </p>
              )}
            </div>

            {/* Experience Range Slider */}
            <div className="space-y-2 md:col-span-2 p-4 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2d2c2a]">
                  Required Experience Bounds
                </label>
                <span className="text-xs font-mono font-semibold text-[#121212] bg-white px-2.5 py-0.5 rounded border border-[#e6e5e3]">
                  {extractedParams.experienceMin} — {extractedParams.experienceMax}+ Years
                </span>
              </div>
              
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-mono text-[#8c8b88]">{extractedParams.experienceMin} yrs</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={extractedParams.experienceMin}
                  onChange={(e) => {
                    const min = parseInt(e.target.value, 10);
                    setExtractedParams(prev => ({
                      ...prev,
                      experienceMin: min,
                      experienceMax: Math.min(12, Math.max(min + 3, prev.experienceMax))
                    }));
                  }}
                  className="w-full accent-[#121212] cursor-pointer"
                />
                <span className="text-xs font-mono text-[#8c8b88]">{extractedParams.experienceMax} yrs</span>
              </div>
              <p className="text-[11px] text-[#8c8b88]">
                Filters Apollo profiles to only candidates with verified staff-level tenure.
              </p>
            </div>

            {/* Required Skills Tag / Chip Input */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2d2c2a]">
                  Required Skills & Technologies (Semantic Match)
                </label>
                <span className="text-[11px] font-mono text-[#8c8b88]">
                  {extractedParams.requiredSkills.length} skills active
                </span>
              </div>

              {/* Tag / Chip container */}
              <div className="p-3 rounded-xl border border-[#e6e5e3] bg-[#fbfbfa] flex flex-wrap items-center gap-2 min-h-[46px]">
                {extractedParams.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#d5d4d0] text-xs font-medium text-[#121212] shadow-xs group"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#8c8b88] hover:text-[#b91c1c] transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Inline add skill input */}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Cassandra)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    className="h-7 px-2 text-xs bg-transparent text-[#121212] placeholder-[#8c8b88] focus:outline-none w-44"
                  />
                  {newSkillInput.trim() && (
                    <button
                      onClick={() => handleAddSkill(newSkillInput)}
                      className="w-6 h-6 rounded bg-[#121212] text-white flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Suggested Skills to quick add */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#8c8b88]">AI suggestions:</span>
                {suggestedSkills.map((suggested) => {
                  const isAdded = extractedParams.requiredSkills.includes(suggested);
                  if (isAdded) return null;
                  return (
                    <button
                      key={suggested}
                      onClick={() => handleAddSkill(suggested)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded border border-dashed border-[#d0cfcb] bg-white text-[#5a5957] hover:border-[#121212] hover:text-[#121212] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5 text-[#8c8b88]" />
                      <span>{suggested}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Companies */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#8c8b88]" />
                Target Benchmark Companies
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedParams.targetCompanies.map((company) => (
                  <span
                    key={company}
                    className="px-2.5 py-1 rounded-md bg-[#f4f4f2] text-xs font-mono text-[#484744] border border-[#e6e5e3]"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer: Create Job */}
          <div className="pt-6 border-t border-[#f0f0ee] space-y-4">
            {createError && (
              <div className="p-3.5 rounded-xl bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6e6d69]">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Creates the job in your Hunar workspace — candidates are then scraped for it automatically.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  isLoading={isQueryRunning}
                  leftIcon={<Plus className="w-4 h-4 text-white" />}
                  onClick={handleRunSearchQuery}
                >
                  Create Job
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
