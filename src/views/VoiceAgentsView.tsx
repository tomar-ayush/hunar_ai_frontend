import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Plus, 
  Search, 
  PhoneCall, 
  Play, 
  Square, 
  Copy, 
  Globe,
  Sparkles, 
  Check,
  AlertCircle,
  RefreshCw,
  Pencil
} from 'lucide-react';
import { useRecruiter } from '../context';
import type { HunarAgent, CreateAgentPayload } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { getAgent } from '../api/hunarClient';
import { agentKeys } from '../queries/agents';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AgentEditorModal } from '../components/agents/AgentEditorModal';
import { AgentTestCallModal } from '../components/agents/AgentTestCallModal';

export const VoiceAgentsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { 
    agents, 
    agentsTotalCount,
    agentsLoading,
    agentsError,
    hasMoreAgents,
    refreshAgents,
    loadMoreAgents,
    createAgent, 
    updateAgent, 
    activeAgentForOutreachId,
    setActiveAgentForOutreachId
  } = useRecruiter();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DRAFT'>('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<HunarAgent | null>(null);
  const [isFetchingAgent, setIsFetchingAgent] = useState<string | null>(null);
  const [testingAgent, setTestingAgent] = useState<HunarAgent | null>(null);

  // Audio preview playing state (by agent ID)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const showToast = (text: string, error = false) => {
    setToastMessage({ text, error });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.agent_code && agent.agent_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.summary && agent.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        agent.persona_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
      const matchesLanguage = languageFilter === 'ALL' || agent.language === languageFilter;

      return matchesSearch && matchesStatus && matchesLanguage;
    });
  }, [agents, searchQuery, statusFilter, languageFilter]);

  // Handle Voice Audio Preview
  const handleToggleVoicePreview = (agentId: string) => {
    if (playingAudioId === agentId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(agentId);
      setTimeout(() => {
        setPlayingAudioId(prev => (prev === agentId ? null : prev));
      }, 4000);
    }
  };

  // Clicking anywhere on a card opens the editor with full agent detail
  const handleCardClick = async (agent: HunarAgent) => {
    if (isFetchingAgent) return;
    setIsFetchingAgent(agent.id);
    try {
      // The list endpoint omits prompts — hydrate from the detail endpoint via cache if available
      const detail = await queryClient.fetchQuery({
        queryKey: agentKeys.detail(agent.id),
        queryFn: () => getAgent(agent.id),
      });
      setAgentToEdit({ ...agent, ...detail });
      setIsEditorOpen(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load agent', true);
    } finally {
      setIsFetchingAgent(null);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setAgentToEdit(null);
    setIsEditorOpen(true);
  };

  // Save Agent from Modal
  const handleSaveAgent = async (payload: CreateAgentPayload, agentId?: string) => {
    try {
      if (agentId) {
        await updateAgent(agentId, payload);
        showToast(`Agent "${payload.name}" updated.`);
      } else {
        const created = await createAgent(payload);
        showToast(`Agent "${created.name}" created with ID ${created.id || created.agent_code}.`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', true);
    }
  };

  // Duplicate Agent
  const handleDuplicateAgent = async (agent: HunarAgent) => {
    try {
      // Prompts live only on the detail endpoint — hydrate before copying
      const detail = await queryClient.fetchQuery({
        queryKey: agentKeys.detail(agent.id),
        queryFn: () => getAgent(agent.id),
      });
      const full: HunarAgent = { ...agent, ...detail };
      const duplicatedPayload: CreateAgentPayload = {
        name: `${full.name} (Copy)`,
        language: full.language,
        voice_persona: full.voice_persona,
        persona_name: full.persona_name,
        agent_prompt: full.agent_prompt || '',
        objective: full.objective || '',
        introduction: full.introduction || '',
        result_prompt: full.result_prompt || '',
        result_schema: full.result_schema || { call_completed: 'boolean' },
        summary: full.summary,
        agent_code: `${full.agent_code}B`,
        required_variables: full.required_variables,
        custom_variables: full.custom_variables
      };
      const newAg = await createAgent(duplicatedPayload);
      showToast(`Duplicated into "${newAg.name}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Duplicate failed', true);
    }
  };

  // Count active languages
  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(agents.map(a => a.language)));
  }, [agents]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200 border ${
          toastMessage.error
            ? 'bg-[#fdf2f2] text-[#9b1c1c] border-[#f8b4b4]'
            : 'bg-[#121212] text-white border-[#2d2c2a]'
        }`}>
          {toastMessage.error ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6e5e3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#121212] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#121212]">
                  Hunar AI Voice Agents
                </h1>
                {agentsError ? (
                  <Badge variant="danger" className="font-mono text-[10px]">
                    API OFFLINE
                  </Badge>
                ) : (
                  <Badge variant="success" dot className="font-mono text-[10px]">
                    LIVE API
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#6e6d69] mt-0.5">
                Autonomous phone screeners from your Hunar workspace. Click any agent to edit its persona, prompts, and extraction schema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${agentsLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refreshAgents()}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleOpenCreateModal}
          >
            Create New Voice Agent
          </Button>
        </div>
      </div>

      {/* High-Level Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#e6e5e3]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8c8b88] font-medium">Agents in Workspace</span>
            <Bot className="w-3.5 h-3.5 text-[#4f46e5]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#121212]">{agentsTotalCount}</span>
            <span className="text-xs text-[#8c8b88]">from live API</span>
          </div>
          <div className="text-[11px] text-[#6e6d69] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{agents.filter(a => a.status === 'ACTIVE').length} active on this page</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#e6e5e3]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8c8b88] font-medium">Languages In Use</span>
            <Globe className="w-3.5 h-3.5 text-[#1b6b27]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[#121212]">{uniqueLanguages.length}</span>
            <span className="text-xs text-[#8c8b88]">locales configured</span>
          </div>
          <div className="text-[11px] text-[#6e6d69] mt-1 font-mono truncate">
            {uniqueLanguages.slice(0, 3).join(', ') || '—'}
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#e6e5e3]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8c8b88] font-medium">Default Outreach Agent</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
          </div>
          <div className="mt-2 truncate">
            <span className="text-sm font-semibold text-[#121212] truncate block">
              {agents.find(a => a.id === activeAgentForOutreachId)?.name || '—'}
            </span>
          </div>
          <div className="text-[11px] text-[#8c8b88] mt-1 font-mono">
            Used for 1-Click candidate calls
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e6e5e3]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#8c8b88] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agent by name, code, persona, or summary..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#8c8b88] text-[11px]">Status:</span>
            {(['ALL', 'ACTIVE', 'INACTIVE', 'DRAFT'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#121212] text-white shadow-xs'
                    : 'bg-[#f6f6f4] text-[#6e6d69] hover:bg-[#ebebe9]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1 text-xs pl-2 border-l border-[#e6e5e3]">
            <span className="text-[#8c8b88] text-[11px]">Language:</span>
            <select
              value={languageFilter}
              onChange={e => setLanguageFilter(e.target.value)}
              className="h-7 px-2 text-xs bg-[#f6f6f4] border border-[#e6e5e3] rounded-md font-mono text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              <option value="ALL">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {agentsError && agents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-sm font-semibold text-[#121212]">Couldn't load voice agents</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">{agentsError}</p>
          <Button variant="primary" size="sm" onClick={() => refreshAgents()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {agentsLoading && agents.length === 0 && !agentsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e6e5e3] p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#f0f0ee]" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-1/2 bg-[#f0f0ee] rounded" />
                  <div className="h-3 w-1/3 bg-[#f0f0ee] rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-[#f0f0ee] rounded" />
              <div className="h-3 w-2/3 bg-[#f0f0ee] rounded" />
              <div className="h-8 w-full bg-[#f0f0ee] rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Agents Grid */}
      {!agentsLoading || agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map(agent => {
            const isPlaying = playingAudioId === agent.id;
            const isDefault = activeAgentForOutreachId === agent.id;
            const isFetching = isFetchingAgent === agent.id;

            return (
              <div
                key={agent.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(agent)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(agent);
                  }
                }}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 text-left group/card ${
                  isFetching ? 'opacity-60' : ''
                } ${
                  isDefault ? 'border-[#4f46e5]/40 shadow-xs' : 'border-[#e6e5e3]'
                } hover:shadow-md hover:border-[#b0afa9] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40`}
              >
                {/* Top Row: Avatar, Name, Code, Status */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={agent.logo}
                          alt={agent.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#e6e5e3] shadow-xs"
                        />
                        {agent.status === 'ACTIVE' && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-semibold text-sm text-[#121212] group-hover/card:text-[#4f46e5] transition-colors truncate">
                            {agent.name}
                          </h3>
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f4f4f2] text-[#5a5957] font-semibold border border-[#e6e5e3] max-w-[180px] truncate shrink-0"
                            title={`Agent ID: ${agent.id}`}
                          >
                            {agent.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono font-medium text-[#4f46e5]">
                            {agent.voice_persona}
                          </span>
                          <span className="text-xs text-[#8c8b88]">•</span>
                          <span className="text-[11px] font-mono text-[#6e6d69]">
                            {agent.language}
                          </span>
                          {isDefault && (
                            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-[#edf7ee] text-[#1b6b27] font-medium border border-[#cbe7ce]">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={agent.status === 'ACTIVE' ? 'success' : 'neutral'}
                      className="text-[10px] py-0.5"
                    >
                      {agent.status}
                    </Badge>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#5a5957] line-clamp-2 mt-3 leading-relaxed">
                    {agent.summary || agent.objective}
                  </p>
                </div>

                {/* Middle Section: Spoken Intro preview & Variables */}
                <div className="space-y-3 pt-2 border-t border-[#f0f0ee]">
                  {/* Intro preview strip */}
                  <div className="p-2.5 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3] flex items-center justify-between gap-3 text-xs">
                    <div className="truncate text-xs text-[#6e6d69] italic flex-1">
                      "{agent.introduction?.slice(0, 70) || agent.summary?.slice(0, 70)}..."
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleVoicePreview(agent.id);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-[#4f46e5] text-white'
                          : 'bg-white border border-[#e6e5e3] text-[#121212] hover:bg-[#f0f0ee]'
                      }`}
                      title="Simulate intro cadence"
                    >
                      {isPlaying ? (
                        <Square className="w-3 h-3 fill-white" />
                      ) : (
                        <Play className="w-3 h-3 fill-[#121212]" />
                      )}
                    </button>
                  </div>

                  {/* Variable Chips */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#8c8b88] text-[10px] uppercase tracking-wider font-semibold">
                        Extracts:
                      </span>
                      {(agent.result_variables && agent.result_variables.length > 0
                        ? agent.result_variables
                        : Object.keys(agent.result_schema || {})
                      ).slice(0, 4).map(rv => (
                        <span
                          key={rv}
                          className="px-1.5 py-0.5 rounded bg-[#edf4fe] text-[#1a56db] font-mono text-[10px] border border-[#d4e4fc]"
                        >
                          {rv}
                        </span>
                      ))}
                      {(agent.result_variables?.length || 0) > 4 && (
                        <span className="text-[10px] text-[#8c8b88] font-mono">
                          +{agent.result_variables.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f0f0ee]">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5a5957] group-hover/card:text-[#121212] transition-colors">
                    {isFetching ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-[#4f46e5]" />
                        <span>Loading editor…</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3 h-3 text-[#4f46e5]" />
                        <span>Click to edit</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setActiveAgentForOutreachId(agent.id);
                          showToast(`"${agent.name}" set as default outreach agent.`);
                        }}
                        title="Set as Default Outreach Agent"
                        className="p-1.5 rounded-lg text-[#8c8b88] hover:text-[#121212] hover:bg-[#f5f5f3] transition-colors cursor-pointer text-xs"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDuplicateAgent(agent);
                      }}
                      title="Duplicate Agent"
                      className="p-1.5 rounded-lg text-[#8c8b88] hover:text-[#121212] hover:bg-[#f5f5f3] transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setTestingAgent(agent);
                      }}
                      title="Simulate Test Call"
                      className="p-1.5 rounded-lg text-[#8c8b88] hover:text-[#4f46e5] hover:bg-[#f5f3ff] transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Empty State */}
      {!agentsLoading && !agentsError && agents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <Bot className="w-10 h-10 text-[#8c8b88] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[#121212]">No voice agents yet</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">
            Create your first Hunar AI voice agent to start screening candidates by phone.
          </p>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={handleOpenCreateModal}>
            Create New Voice Agent
          </Button>
        </div>
      )}

      {/* No filter matches */}
      {!agentsLoading && !agentsError && agents.length > 0 && filteredAgents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e6e5e3] p-8 space-y-3">
          <Bot className="w-10 h-10 text-[#8c8b88] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[#121212]">No voice agents match your query</h3>
          <p className="text-xs text-[#8c8b88] max-w-sm mx-auto">
            Try clearing your search query or status filter to see configured Hunar AI agents.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setLanguageFilter('ALL');
            }}
          >
            Reset All Filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {hasMoreAgents && !agentsLoading && filteredAgents.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${agentsLoading ? 'animate-spin' : ''}`} />}
            onClick={loadMoreAgents}
          >
            Load more agents ({agents.length} of {agentsTotalCount})
          </Button>
        </div>
      )}

      {/* Editor Modal (Create or Update) */}
      {isEditorOpen && (
        <AgentEditorModal
          key={agentToEdit ? `edit-${agentToEdit.id}` : 'create-new'}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveAgent}
          initialAgent={agentToEdit}
        />
      )}

      {/* Test Call Modal */}
      {Boolean(testingAgent) && (
        <AgentTestCallModal
          key={testingAgent?.id || 'test'}
          agent={testingAgent}
          isOpen={Boolean(testingAgent)}
          onClose={() => setTestingAgent(null)}
        />
      )}
    </div>
  );
};
