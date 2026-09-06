import React, { useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  Plus, 
  Layers, 
  Briefcase, 
  MapPin, 
  RotateCcw,
  FileText,
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

  const [jobDescription, setJobDescription] = useState(mockJobDescriptionSample);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Effective selected agent id, defaulting to active agent or first available agent
  const effectiveAgentId = selectedAgentId || activeAgentForOutreachId || agents[0]?.id || '';

  const selectedAgent = useMemo(() => {
    return agents.find(a => a.id === effectiveAgentId) || null;
  }, [agents, effectiveAgentId]);

  // Suggested skills to add with 1-click
  const suggestedSkills = ['eBPF', 'Rust', 'Raft Consensus', 'Prometheus', 'CockroachDB', 'gRPC'];

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
              Campaign & Sourcing Builder
            </h1>
            <Badge variant="purple" className="text-[11px] font-mono">
              Create Job
            </Badge>
          </div>
          <p className="text-xs text-[#6e6d69] mt-0.5">
            Define your job requirements and select the AI Voice Agent for outreach.
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-7 space-y-6">
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

          {/* Job Description (Moved below Seniority and Location) */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between pb-1">
              <label className="text-xs font-semibold text-[#2d2c2a] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8c8b88]" />
                Job Description
              </label>
              <button
                onClick={() => setJobDescription(mockJobDescriptionSample)}
                className="text-xs font-medium text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Load Sample JD
              </button>
            </div>
            <div className="relative">
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste raw text from Greenhouse, Lever, Workday, or custom JD document..."
                className="w-full text-xs font-mono p-4 rounded-xl border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:bg-white focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] transition-all leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#8c8b88] bg-white/80 px-2 py-0.5 rounded border border-[#e6e5e3]">
                {jobDescription.length} characters
              </div>
            </div>
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
                onClick={() => navigateTo('/pipeline')}
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
    </div>
  );
};
