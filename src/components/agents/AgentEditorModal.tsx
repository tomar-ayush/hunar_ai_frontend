import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Code, 
  Check, 
  Plus, 
  Trash2, 
  Volume2, 
  Layers, 
  Bot, 
  AlertCircle,
  Copy
} from 'lucide-react';
import type { HunarAgent, CreateAgentPayload } from '../../types';
import { Button } from '../ui/Button';

interface AgentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateAgentPayload, agentId?: string) => void;
  initialAgent?: HunarAgent | null;
}

const LANGUAGES = [
  'ENGLISH',
  'HINDI',
  'TAMIL',
  'TELUGU',
  'KANNADA',
  'MARATHI',
  'MALAYALAM',
  'GUJARATI',
  'BENGALI',
  'TURKISH',
  'ARABIC',
  'SPANISH'
];

const VOICE_PERSONAS = [
  { id: 'NEHA', name: 'Neha', gender: 'Female', accent: 'Indian English / Warm', style: 'Warm & Professional' },
  { id: 'ROY', name: 'Roy', gender: 'Male', accent: 'Professional English', style: 'Crisp & Technical' },
  { id: 'ZOE', name: 'Zoe', gender: 'Female', accent: 'Approachable Neutral', style: 'Friendly & Conversational' },
  { id: 'SAM', name: 'Sam', gender: 'Male', accent: 'Corporate Executive', style: 'Authoritative & Clear' },
  { id: 'MIRA', name: 'Mira', gender: 'Female', accent: 'Energetic Indian English', style: 'Engaging & Dynamic' },
  { id: 'EESHA', name: 'Eesha', gender: 'Female', accent: 'Gentle & Patient', style: 'Empathetic & Structured' },
];

export const AgentEditorModal: React.FC<AgentEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAgent
}) => {
  const isEditing = Boolean(initialAgent);

  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  // Form states matching user's schema
  const [name, setName] = useState(() => initialAgent?.name || '');
  const [language, setLanguage] = useState(() => initialAgent?.language || 'ENGLISH');
  const [voicePersona, setVoicePersona] = useState(() => initialAgent?.voice_persona || 'NEHA');
  const [personaName, setPersonaName] = useState(() => initialAgent?.persona_name || initialAgent?.voice_persona || 'NEHA');
  const [agentPrompt, setAgentPrompt] = useState(
    () =>
      initialAgent?.agent_prompt ||
      'You are an AI recruiting screener on behalf of Acme Infrastructure. Conduct a brief 4-minute qualification call with candidates sourced from Apollo. Validate their experience with Kafka, Go, distributed systems, salary expectations, and notice period.'
  );
  const [objective, setObjective] = useState(
    () => initialAgent?.objective || 'Screen candidates on technical fit, job seeking intent, expected CTC, and notice period.'
  );
  const [introduction, setIntroduction] = useState(
    () =>
      initialAgent?.introduction ||
      "Hi {callee_name}, this is Neha calling from Acme Infrastructure via Hunar AI. Do you have 3 minutes to discuss our Lead Distributed Systems opportunity?"
  );
  const [resultPrompt, setResultPrompt] = useState(
    () =>
      initialAgent?.result_prompt ||
      'Extract call_completed (boolean), job_seeking_intent (Immediate/High/Passive/Not Interested), expected_ctc (string), notice_period (string), and technical_fit_score (number).'
  );
  const [agentCode, setAgentCode] = useState(() => initialAgent?.agent_code || `FD${Math.floor(100 + Math.random() * 900)}`);
  const [summary, setSummary] = useState(
    () => initialAgent?.summary || 'Autonomous recruiter assistant screening distributed systems engineering candidates.'
  );

  // Result Schema Key-Value Pairs
  const [schemaFields, setSchemaFields] = useState<Array<{ key: string; type: string }>>(() => {
    if (initialAgent?.result_schema && Object.keys(initialAgent.result_schema).length > 0) {
      return Object.entries(initialAgent.result_schema).map(([k, v]) => ({
        key: k,
        type: typeof v === 'string' ? v : 'string'
      }));
    }
    if (initialAgent) {
      return [{ key: 'call_completed', type: 'boolean' }];
    }
    return [
      { key: 'call_completed', type: 'boolean' },
      { key: 'job_seeking_intent', type: 'string' },
      { key: 'expected_salary', type: 'string' },
      { key: 'notice_period', type: 'string' },
      { key: 'technical_fit_score', type: 'number' }
    ];
  });

  const [rawSchemaJson, setRawSchemaJson] = useState(() => {
    if (initialAgent?.result_schema && Object.keys(initialAgent.result_schema).length > 0) {
      return JSON.stringify(initialAgent.result_schema, null, 2);
    }
    if (initialAgent) {
      return '{\n  "call_completed": "boolean"\n}';
    }
    return JSON.stringify(
      {
        call_completed: 'boolean',
        job_seeking_intent: 'string',
        expected_salary: 'string',
        notice_period: 'string',
        technical_fit_score: 'number'
      },
      null,
      2
    );
  });
  const [isRawSchemaMode, setIsRawSchemaMode] = useState(false);

  // Variables
  const [requiredVariables, setRequiredVariables] = useState<string[]>(
    () => initialAgent?.required_variables || ['callee_name', 'mobile_number']
  );
  const [newReqVar, setNewReqVar] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Sync persona name when voice persona changes (if not custom modified)
  const handlePersonaChange = (val: string) => {
    setVoicePersona(val);
    setPersonaName(val);
  };

  // Add schema field
  const handleAddField = () => {
    const updated = [...schemaFields, { key: `field_${schemaFields.length + 1}`, type: 'string' }];
    setSchemaFields(updated);
    updateRawJsonFromFields(updated);
  };

  const handleRemoveField = (idx: number) => {
    const updated = schemaFields.filter((_, i) => i !== idx);
    setSchemaFields(updated);
    updateRawJsonFromFields(updated);
  };

  const handleFieldChange = (idx: number, key: string, type: string) => {
    const updated = [...schemaFields];
    updated[idx] = { key, type };
    setSchemaFields(updated);
    updateRawJsonFromFields(updated);
  };

  const updateRawJsonFromFields = (fields: Array<{ key: string; type: string }>) => {
    const obj: Record<string, string> = {};
    fields.forEach(f => {
      if (f.key.trim()) {
        obj[f.key.trim()] = f.type;
      }
    });
    setRawSchemaJson(JSON.stringify(obj, null, 2));
  };

  const handleRawJsonChange = (val: string) => {
    setRawSchemaJson(val);
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) {
        const fields = Object.entries(parsed).map(([k, v]) => ({
          key: k,
          type: typeof v === 'string' ? v : 'string'
        }));
        setSchemaFields(fields);
        setErrorMsg(null);
      }
    } catch {
      // Allow user to finish typing invalid json temporarily
    }
  };

  const handleAddReqVariable = () => {
    if (!newReqVar.trim()) return;
    const clean = newReqVar.trim().toLowerCase().replace(/\s+/g, '_');
    if (!requiredVariables.includes(clean)) {
      setRequiredVariables([...requiredVariables, clean]);
    }
    setNewReqVar('');
  };

  const handleRemoveReqVariable = (varName: string) => {
    setRequiredVariables(requiredVariables.filter(v => v !== varName));
  };

  // Templates
  const handleLoadTemplate = (templateType: 'telecom' | 'recruiter' | 'notice') => {
    if (templateType === 'telecom') {
      setName('Personal Caller');
      setLanguage('TELUGU');
      setVoicePersona('NEHA');
      setPersonaName('NEHA');
      setAgentCode('FD142');
      setObjective('Confirm network signal clarity and record connection quality feedback.');
      setIntroduction(
        'Namaskaram! Nenu Neha ni, mee telecom service provider nundi call chestunnaanu. Mee connection quality gurinchi oka 2 minutes matladavacha?'
      );
      setAgentPrompt(
        'You are Neha, an intelligent telecommunications voice agent. Your role is to politely check in on line quality, query if the user has experienced call drops or latency, and ensure positive customer sentiment.'
      );
      setResultPrompt('Extract whether the call was completed successfully and if the user reported any call drops or network issues.');
      setSummary('This friendly assistant performs check-in calls to confirm connection quality, targeting telecommunications users.');
      setRequiredVariables(['callee_name', 'mobile_number']);
      const s = { call_completed: 'boolean', issue_reported: 'string', satisfaction_rating: 'number' };
      setSchemaFields(Object.entries(s).map(([k, v]) => ({ key: k, type: v })));
      setRawSchemaJson(JSON.stringify(s, null, 2));
    } else if (templateType === 'recruiter') {
      setName('Staff Systems Talent Screener');
      setLanguage('ENGLISH');
      setVoicePersona('PRIYA');
      setPersonaName('PRIYA');
      setAgentCode('TR101');
      setObjective('Screen infrastructure engineers against the Lead Distributed Systems JD, assess technical depth, notice period, and salary expectations.');
      setIntroduction(
        'Hello! This is Priya from Acme Infrastructure calling via Hunar AI. I came across your distributed systems experience and wanted to see if you have 3 minutes for a quick conversation?'
      );
      setAgentPrompt(
        'You are Priya, a senior technical talent screener for Hunar AI working on behalf of Acme Infrastructure. Ask focused questions on Go low-latency services, Kafka high-throughput streams, notice period, and compensation expectations.'
      );
      setResultPrompt('Extract candidate active intent (Immediate, High, Passive), compensation expectation, notice period in weeks, and technical confidence score.');
      setSummary('Conducts 5-minute pre-qualification calls for Senior and Staff Distributed Systems Engineers.');
      setRequiredVariables(['callee_name', 'mobile_number', 'target_job_title']);
      const s = {
        call_completed: 'boolean',
        job_seeking_intent: 'string',
        expected_salary: 'string',
        notice_period: 'string',
        technical_proficiency_score: 'number'
      };
      setSchemaFields(Object.entries(s).map(([k, v]) => ({ key: k, type: v })));
      setRawSchemaJson(JSON.stringify(s, null, 2));
    } else {
      setName('Rapid Notice & Intent Verification');
      setLanguage('HINDI');
      setVoicePersona('AARAV');
      setPersonaName('AARAV');
      setAgentCode('HR204');
      setObjective('Verify candidate open-to-work status and geographic relocation flexibility in under 2 minutes.');
      setIntroduction(
        'Namaste! Main Aarav baat kar raha hoon Hunar Talent Intelligence se. Kya main aapka do minute le sakta hoon ek exciting career opportunity discuss karne ke liye?'
      );
      setAgentPrompt(
        'You are Aarav, an empathetic recruitment associate at Hunar AI. Speak in warm, conversational Hindi mixed with English terms. Ask whether the candidate is currently open to new roles.'
      );
      setResultPrompt('Determine if callee is open to offers (boolean), immediate joiner (boolean), and their preferred city/remote preference.');
      setSummary('High-speed 2-minute bilingual voice screening in Hindi and English.');
      setRequiredVariables(['callee_name', 'mobile_number']);
      const s = {
        call_completed: 'boolean',
        open_to_offers: 'boolean',
        immediate_joiner: 'boolean',
        preferred_location: 'string'
      };
      setSchemaFields(Object.entries(s).map(([k, v]) => ({ key: k, type: v })));
      setRawSchemaJson(JSON.stringify(s, null, 2));
    }
  };

  // Compile final result_schema
  const buildResultSchema = (): Record<string, any> => {
    if (isRawSchemaMode) {
      return JSON.parse(rawSchemaJson);
    }
    const schemaObj: Record<string, string> = {};
    schemaFields.forEach(f => {
      if (f.key.trim()) {
        schemaObj[f.key.trim()] = f.type;
      }
    });
    return schemaObj;
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorMsg('Agent Name is required.');
      return;
    }
    if (!agentPrompt.trim()) {
      setErrorMsg('Agent Prompt is required.');
      return;
    }
    if (!objective.trim()) {
      setErrorMsg('Objective is required.');
      return;
    }
    if (!introduction.trim()) {
      setErrorMsg('Introduction greeting script is required.');
      return;
    }
    if (!resultPrompt.trim()) {
      setErrorMsg('Result Prompt is required for post-call data extraction.');
      return;
    }

    let parsedSchema: Record<string, any> = {};
    try {
      parsedSchema = buildResultSchema();
    } catch {
      setErrorMsg('Result Schema contains invalid JSON.');
      return;
    }

    const payload: CreateAgentPayload = {
      name: name.trim(),
      language,
      voice_persona: voicePersona,
      persona_name: personaName.trim() || voicePersona,
      agent_prompt: agentPrompt.trim(),
      objective: objective.trim(),
      introduction: introduction.trim(),
      result_prompt: resultPrompt.trim(),
      result_schema: parsedSchema,
      agent_code: agentCode.trim() || `FD${Math.floor(100 + Math.random() * 900)}`,
      summary: summary.trim() || objective.trim(),
      required_variables: requiredVariables.length > 0 ? requiredVariables : ['callee_name', 'mobile_number']
    };

    onSave(payload, initialAgent?.id);
    onClose();
  };

  // Live JSON output preview matching user's exact specification
  const currentPayloadPreview = {
    name: name || 'string',
    language,
    voice_persona: voicePersona,
    persona_name: personaName || voicePersona,
    agent_prompt: agentPrompt || 'string',
    objective: objective || 'string',
    introduction: introduction || 'string',
    result_prompt: resultPrompt || 'string',
    result_schema: (() => {
      try {
        return buildResultSchema();
      } catch {
        return { additionalProp1: {} };
      }
    })()
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayloadPreview, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#e6e5e3] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#f0f0ee] flex items-center justify-between bg-[#fbfbfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121212] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#121212]">
                  {isEditing ? `Update Voice Agent (${initialAgent?.id || initialAgent?.agent_code || initialAgent?.name})` : 'Create New Hunar AI Voice Agent'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#edf4fe] text-[#1a56db] font-semibold border border-[#d4e4fc]">
                  API v1 Schema
                </span>
              </div>
              <p className="text-xs text-[#8c8b88] mt-0.5">
                Configure conversational voice persona, greeting scripts, system prompts, and structured extraction schema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Form vs JSON Payload */}
            <div className="flex items-center p-1 bg-[#f0f0ee] rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'form' ? 'bg-white text-[#121212] shadow-xs' : 'text-[#6e6d69] hover:text-[#121212]'
                }`}
              >
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'json' ? 'bg-white text-[#121212] shadow-xs' : 'text-[#6e6d69] hover:text-[#121212]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON Payload</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f5f5f3] flex items-center justify-center text-[#5a5957] hover:text-[#121212] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Load Template Bar (only when creating or user wants presets) */}
        <div className="px-6 py-2.5 bg-[#f6f6f4] border-b border-[#e6e5e3] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#6e6d69]">
            <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
            <span className="font-medium text-[#2d2c2a]">Pre-load Template:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadTemplate('recruiter')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d8d7d3] hover:border-[#121212] text-[#2d2c2a] text-[11px] font-medium transition-colors cursor-pointer"
            >
              Staff Systems Recruiter (Priya)
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('telecom')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d8d7d3] hover:border-[#121212] text-[#2d2c2a] text-[11px] font-medium transition-colors cursor-pointer"
            >
              Personal Caller - Telecom (Neha)
            </button>
            <button
              type="button"
              onClick={() => handleLoadTemplate('notice')}
              className="px-2.5 py-1 rounded-md bg-white border border-[#d8d7d3] hover:border-[#121212] text-[#2d2c2a] text-[11px] font-medium transition-colors cursor-pointer"
            >
              Notice & CTC Screener (Aarav)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'json' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#6e6d69]">
                  POST /agents payload preview
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 text-xs text-[#4f46e5] hover:text-[#4338ca] font-medium transition-colors cursor-pointer"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON Payload</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#121212] text-[#fbfbfa] text-xs font-mono overflow-x-auto border border-[#2d2c2a] leading-relaxed">
                {JSON.stringify(currentPayloadPreview, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section 1: Agent Identification & Persona */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#f0f0ee] pb-2">
                  <Bot className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2c2a]">
                    1. Voice Agent Profile & Persona
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Agent Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Personal Caller, Staff Screener"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all cursor-pointer font-mono"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice Persona */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Voice Persona <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={voicePersona}
                      onChange={e => handlePersonaChange(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all cursor-pointer font-mono"
                    >
                      {VOICE_PERSONAS.map(vp => (
                        <option key={vp.id} value={vp.id}>
                          {vp.name} ({vp.accent} - {vp.gender})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Persona Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Persona Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NEHA"
                      value={personaName}
                      onChange={e => setPersonaName(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  {/* Agent Code */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Agent Code <span className="text-[#8c8b88] font-normal">(e.g. FD142, TR101)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="FD142"
                      value={agentCode}
                      onChange={e => setAgentCode(e.target.value.toUpperCase())}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all font-mono uppercase"
                    />
                  </div>

                  {/* Summary / Tagline */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Catalog Summary
                    </label>
                    <input
                      type="text"
                      placeholder="Brief role summary for dashboard cards"
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Conversational Script & System Directives */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#f0f0ee] pb-2">
                  <Volume2 className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2c2a]">
                    2. Dialogue & Voice Prompts
                  </h3>
                </div>

                {/* Introduction */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Introduction Greeting Line <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#8c8b88]">
                      Spoken immediately after candidate answers call
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Namaskaram! Nenu Neha ni... or Hello {callee_name}, this is Priya..."
                    value={introduction}
                    onChange={e => setIntroduction(e.target.value)}
                    className="w-full p-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                {/* Objective */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2d2c2a]">
                    Call Objective <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Screen senior infrastructure engineers on Kafka, Go, notice period, and salary."
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>

                {/* Agent Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Agent System Prompt (Conversational Directives) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 text-[11px] text-[#6e6d69]">
                      <span>Inject chips:</span>
                      <button
                        type="button"
                        onClick={() => setAgentPrompt(prev => prev + ' {callee_name}')}
                        className="px-1.5 py-0.5 rounded bg-[#f0f0ee] hover:bg-[#e4e4e0] font-mono text-[10px]"
                      >
                        {'{callee_name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgentPrompt(prev => prev + ' {target_job_title}')}
                        className="px-1.5 py-0.5 rounded bg-[#f0f0ee] hover:bg-[#e4e4e0] font-mono text-[10px]"
                      >
                        {'{target_job_title}'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="You are an autonomous screening assistant. Speak concisely, listen actively, and verify candidate skills..."
                    value={agentPrompt}
                    onChange={e => setAgentPrompt(e.target.value)}
                    className="w-full p-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Section 3: Intelligence & Structured Result Extraction */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0f0ee] pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#4f46e5]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d2c2a]">
                      3. Post-Call Result Extraction & Schema
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRawSchemaMode(!isRawSchemaMode)}
                    className="text-[11px] text-[#4f46e5] hover:text-[#4338ca] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3 h-3" />
                    <span>{isRawSchemaMode ? 'Switch to Visual Schema Builder' : 'Switch to Raw JSON Schema'}</span>
                  </button>
                </div>

                {/* Result Prompt */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2d2c2a]">
                    Result Extraction Prompt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Analyze transcript and extract call_completed, notice_period, expected_salary, and candidate intent..."
                    value={resultPrompt}
                    onChange={e => setResultPrompt(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all"
                  />
                </div>

                {/* Result Schema Definition */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-[#2d2c2a]">
                      Result Schema (`result_schema`)
                    </label>
                    <span className="text-[11px] text-[#8c8b88]">
                      Structured JSON fields extracted after call ends
                    </span>
                  </div>

                  {isRawSchemaMode ? (
                    <textarea
                      rows={5}
                      value={rawSchemaJson}
                      onChange={e => handleRawJsonChange(e.target.value)}
                      className="w-full p-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] focus:outline-none focus:border-[#121212] focus:bg-white transition-all font-mono"
                    />
                  ) : (
                    <div className="p-3 bg-[#fbfbfa] border border-[#e6e5e3] rounded-xl space-y-2.5">
                      {schemaFields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="field_name (e.g. call_completed)"
                            value={field.key}
                            onChange={e => handleFieldChange(index, e.target.value, field.type)}
                            className="flex-1 h-8 px-2.5 text-xs bg-white border border-[#e6e5e3] rounded-lg text-[#121212] font-mono focus:outline-none focus:border-[#121212]"
                          />
                          <select
                            value={field.type}
                            onChange={e => handleFieldChange(index, field.key, e.target.value)}
                            className="w-32 h-8 px-2 text-xs bg-white border border-[#e6e5e3] rounded-lg text-[#121212] font-mono focus:outline-none focus:border-[#121212] cursor-pointer"
                          >
                            <option value="boolean">boolean</option>
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="array">array</option>
                            <option value="object">object</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            disabled={schemaFields.length <= 1}
                            className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#8c8b88] flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddField}
                        className="w-full py-1.5 rounded-lg border border-dashed border-[#d8d7d3] hover:border-[#121212] text-xs text-[#5a5957] hover:text-[#121212] flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Result Schema Field</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Required Variables */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2d2c2a]">
                    Required Outbound Calling Variables
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3]">
                    {requiredVariables.map(v => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#e6e5e3] text-xs font-mono text-[#2d2c2a]"
                      >
                        <span>{v}</span>
                        {v !== 'callee_name' && v !== 'mobile_number' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReqVariable(v)}
                            className="text-[#8c8b88] hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add variable..."
                        value={newReqVar}
                        onChange={e => setNewReqVar(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddReqVariable();
                          }
                        }}
                        className="h-7 px-2 text-xs bg-white border border-[#e6e5e3] rounded-md font-mono text-[#121212] w-28 focus:outline-none focus:border-[#121212]"
                      />
                      <button
                        type="button"
                        onClick={handleAddReqVariable}
                        className="h-7 px-2 rounded-md bg-[#121212] text-white text-[11px] font-medium cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#f0f0ee] bg-[#fbfbfa] flex items-center justify-between">
          <div className="text-xs text-[#8c8b88] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${errorMsg ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <span className="font-mono">POST /agents · PUT /agents/&#123;id&#125;</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              {isEditing ? 'Save Agent Changes' : 'Create Hunar Voice Agent'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
