import React, { useState } from 'react';
import { PhoneCall, Bot, X, Users, AlertCircle } from 'lucide-react';
import type { JobCandidateRecord } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CallConfirmModalProps {
  variant: 'single' | 'bulk';
  /** Candidates being called (single = length 1) */
  candidates: JobCandidateRecord[];
  agents: { id: string; name: string; persona_name: string }[];
  defaultAgentId: string;
  isCalling?: boolean;
  onConfirm: (opts: { agentId: string; phoneNumber?: string }) => void;
  onClose: () => void;
}

/**
 * Pre-call confirmation screen. Single calls surface the target phone number
 * for review/override; bulk calls intentionally omit phone numbers.
 */
export const CallConfirmModal: React.FC<CallConfirmModalProps> = ({
  variant,
  candidates,
  agents,
  defaultAgentId,
  isCalling = false,
  onConfirm,
  onClose
}) => {
  const candidate = candidates[0];
  const [phoneNumber, setPhoneNumber] = useState(candidate?.phone || '');
  const [agentId, setAgentId] = useState(defaultAgentId || agents[0]?.id || '');
  const [error, setError] = useState<string | null>(null);

  const isSingle = variant === 'single';
  const selectedAgent = agents.find(a => a.id === agentId);

  const handleConfirm = () => {
    if (isSingle && !phoneNumber.trim()) {
      setError('A phone number is required to place the call.');
      return;
    }
    if (!agentId) {
      setError('Select a voice agent for this call.');
      return;
    }
    onConfirm({
      agentId,
      phoneNumber: isSingle ? phoneNumber.trim() : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#e6e5e3] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f0ee] bg-[#fbfbfa] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#121212] text-white flex items-center justify-center shadow-xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#121212]">
                {isSingle ? 'Confirm voice call' : `Confirm bulk call — ${candidates.length} candidates`}
              </h2>
              <p className="text-[11px] text-[#8c8b88] mt-0.5">
                {isSingle
                  ? 'Review the details before the Hunar agent dials.'
                  : 'Each candidate is dialed on their saved phone number.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCalling}
            className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f5f5f3] flex items-center justify-center text-[#5a5957] hover:text-[#121212] transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Single: candidate + editable phone */}
          {isSingle && candidate && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fbfbfa] border border-[#e6e5e3]">
                {candidate.avatar_url ? (
                  <img
                    src={candidate.avatar_url}
                    alt={candidate.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#e6e5e3]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#f4f4f2] border border-[#e6e5e3] flex items-center justify-center text-[10px] font-semibold text-[#5a5957]">
                    {candidate.name.split(/\s+/).slice(0, 2).map(p => p[0]).join('')}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#121212] truncate">{candidate.name}</div>
                  <div className="text-[11px] text-[#8c8b88] truncate">
                    {[candidate.title, candidate.company].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <Badge
                  variant={candidate.consent_status?.toLowerCase() === 'granted' ? 'success' : 'warning'}
                  className="text-[10px] font-mono ml-auto shrink-0"
                >
                  consent: {candidate.consent_status || 'unknown'}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2d2c2a] flex items-center justify-between">
                  <span>Phone number</span>
                  <span className="text-[10px] text-[#8c8b88] font-normal">editable — overrides saved number</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-[#e6e5e3] bg-white text-[#121212] placeholder-[#8c8b88] focus:outline-none focus:border-[#121212] transition-all"
                />
                {!candidate.phone && !phoneNumber && (
                  <p className="text-[11px] text-[#975a16]">
                    This candidate has no saved phone number — enter one to dial.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bulk: names only, explicitly no phone numbers */}
          {!isSingle && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#6e6d69] uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Selected candidates
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e6e5e3] divide-y divide-[#f0f0ee]">
                {candidates.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-white">
                    <span className="text-xs font-medium text-[#121212] truncate">{c.name}</span>
                    <span className="text-[10px] font-mono text-[#8c8b88] shrink-0 ml-2">
                      {c.consent_status || 'pending'} consent
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#8c8b88]">
                Phone numbers are hidden in bulk mode — the saved number for each candidate is dialed automatically.
              </p>
            </div>
          )}

          {/* Voice agent selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2d2c2a] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#8c8b88]" />
              Hunar voice agent
            </label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.persona_name})
                </option>
              ))}
            </select>
            {selectedAgent && (
              <p className="text-[11px] text-[#8c8b88] font-mono">
                Persona: {selectedAgent.persona_name}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#f0f0ee] bg-[#fbfbfa] flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isCalling}>
            Cancel
          </Button>
          <Button
            variant="indigo"
            size="sm"
            isLoading={isCalling}
            loadingText="Dialing…"
            leftIcon={<PhoneCall className="w-3.5 h-3.5 fill-white text-white" />}
            onClick={handleConfirm}
          >
            {isSingle
              ? 'Start AI call'
              : `Call ${candidates.length} candidate${candidates.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
