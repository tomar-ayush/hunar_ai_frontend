import React, { useState, useEffect } from 'react';
import { 
  X, 
  PhoneCall, 
  PhoneOff, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  Mic, 
  Radio
} from 'lucide-react';
import type { HunarAgent } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AgentTestCallModalProps {
  agent: HunarAgent | null;
  isOpen: boolean;
  onClose: () => void;
}

type CallPhase = 'idle' | 'dialing' | 'connected' | 'completed';

export const AgentTestCallModal: React.FC<AgentTestCallModalProps> = ({
  agent,
  isOpen,
  onClose
}) => {
  const [calleeName, setCalleeName] = useState('Alex Johnson');
  const [calleePhone, setCalleePhone] = useState('+1 (415) 890-2341');
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [simulatedDialogue, setSimulatedDialogue] = useState<Array<{ speaker: 'agent' | 'user'; text: string; time: string }>>([]);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'connected') {
      timer = setInterval(() => {
        setElapsedSec(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen || !agent) return null;

  const handleStartCall = () => {
    setPhase('dialing');
    setSimulatedDialogue([]);
    setExtractedData(null);
    setElapsedSec(0);

    // Step 1: Connect after 1.8s
    setTimeout(() => {
      setPhase('connected');

      // Introduction
      const introText = agent.introduction
        ? agent.introduction.replace('{callee_name}', calleeName)
        : `Hello ${calleeName}, this is ${agent.persona_name} from Hunar AI. Do you have a few minutes?`;

      setSimulatedDialogue([
        {
          speaker: 'agent',
          text: introText,
          time: '00:01'
        }
      ]);

      // Step 2: Callee answer
      setTimeout(() => {
        setSimulatedDialogue(prev => [
          ...prev,
          {
            speaker: 'user',
            text: `Hi ${agent.persona_name}! Yes, I have a couple of minutes. What's this regarding?`,
            time: '00:04'
          }
        ]);

        // Step 3: Agent probes on objective
        setTimeout(() => {
          setSimulatedDialogue(prev => [
            ...prev,
            {
              speaker: 'agent',
              text: `Great! I'm calling regarding our open Lead Distributed Systems role. We're looking for strong Go and Kafka experience. How actively are you exploring new opportunities, and what is your availability?`,
              time: '00:09'
            }
          ]);

          // Step 4: Callee details notice and intent
          setTimeout(() => {
            setSimulatedDialogue(prev => [
              ...prev,
              {
                speaker: 'user',
                text: `I'm actively looking right now because of a recent team reorganization. I'm targeting around $230k to $250k base with equity, and my notice period is 2 weeks.`,
                time: '00:15'
              }
            ]);

            // Step 5: Wrap up call & extract structured schema
            setTimeout(() => {
              setSimulatedDialogue(prev => [
                ...prev,
                {
                  speaker: 'agent',
                  text: `That aligns well with our team! I've logged your preferences and our talent partner will follow up with scheduling details. Have a wonderful day!`,
                  time: '00:20'
                }
              ]);

              // Build extracted JSON based on the agent's schema
              const resultObj: Record<string, any> = {};
              Object.entries(agent.result_schema || {}).forEach(([key, type]) => {
                if (key === 'call_completed') resultObj[key] = true;
                else if (key.includes('intent')) resultObj[key] = 'Immediate';
                else if (key.includes('salary') || key.includes('ctc')) resultObj[key] = '$230,000 - $250,000 Base';
                else if (key.includes('notice')) resultObj[key] = '2 weeks';
                else if (key.includes('score') || key.includes('rating')) resultObj[key] = 95;
                else if (key.includes('joiner') || key.includes('offers')) resultObj[key] = true;
                else if (type === 'boolean') resultObj[key] = true;
                else if (type === 'number') resultObj[key] = 88;
                else resultObj[key] = 'Verified positive alignment';
              });

              setExtractedData(resultObj);
              setPhase('completed');
            }, 2500);
          }, 2500);
        }, 2200);
      }, 2000);
    }, 1800);
  };

  const handleEndCall = () => {
    setPhase('completed');
    if (!extractedData) {
      setExtractedData({
        call_completed: true,
        summary: 'Call wrapped up by recruiter test.'
      });
    }
  };

  const formatSec = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#e6e5e3] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#f0f0ee] bg-[#fbfbfa] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4f46e5]/10 text-[#4f46e5] flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#121212]">Hunar Voice Test Sandbox</h2>
                <Badge variant="outline" className="font-mono text-[10px] max-w-[200px] truncate">
                  {agent.id}
                </Badge>
              </div>
              <p className="text-xs text-[#8c8b88]">
                Dialing via Voice Persona <span className="font-semibold text-[#121212]">{agent.persona_name}</span> ({agent.language})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#e6e5e3] hover:bg-[#f5f5f3] flex items-center justify-center text-[#5a5957] hover:text-[#121212] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Dialer Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-[#2d2c2a]">Callee Name</label>
              <input
                type="text"
                disabled={phase !== 'idle'}
                value={calleeName}
                onChange={e => setCalleeName(e.target.value)}
                className="w-full h-8 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-[#2d2c2a]">Target Mobile Number</label>
              <input
                type="text"
                disabled={phase !== 'idle'}
                value={calleePhone}
                onChange={e => setCalleePhone(e.target.value)}
                className="w-full h-8 px-3 text-xs bg-[#fbfbfa] border border-[#e6e5e3] rounded-lg text-[#121212] font-mono disabled:opacity-60"
              />
            </div>
          </div>

          {/* Telephony Status Stage */}
          <div className="p-4 rounded-xl bg-[#121212] text-white flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                {phase === 'dialing' ? (
                  <Radio className="w-5 h-5 text-amber-400 animate-spin" />
                ) : phase === 'connected' ? (
                  <Mic className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : phase === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white/60" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {phase === 'idle' && 'Ready to Place Sandbox Call'}
                  {phase === 'dialing' && 'Establishing Hunar Voice SIP Trunk...'}
                  {phase === 'connected' && `Call in Progress with ${calleeName}`}
                  {phase === 'completed' && 'Call Concluded & Data Extracted'}
                </div>
                <div className="text-[11px] text-white/60 font-mono mt-0.5">
                  {phase === 'connected'
                    ? `Duration: ${formatSec(elapsedSec)} | SIP Latency: 380ms`
                    : `Hunar Engine: ${agent.voice_persona} (${agent.language})`}
                </div>
              </div>
            </div>

            {phase === 'idle' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartCall}
                leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              >
                Start Test Call
              </Button>
            )}

            {phase === 'dialing' && (
              <span className="text-amber-400 text-xs font-mono animate-pulse">
                Ringing...
              </span>
            )}

            {phase === 'connected' && (
              <button
                onClick={handleEndCall}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Hang Up</span>
              </button>
            )}

            {phase === 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPhase('idle')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Live Transcript Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#8c8b88] font-mono text-[11px]">
              <span>Real-time Audio Transcript Stream</span>
              {phase === 'connected' && (
                <span className="text-emerald-600 font-semibold animate-pulse">
                  ● Live Streaming
                </span>
              )}
            </div>

            <div className="p-3 bg-[#fbfbfa] border border-[#e6e5e3] rounded-xl min-h-[140px] max-h-52 overflow-y-auto space-y-2.5">
              {simulatedDialogue.length === 0 ? (
                <div className="h-28 flex items-center justify-center text-[#8c8b88] italic">
                  Press "Start Test Call" to begin live audio exchange simulation.
                </div>
              ) : (
                simulatedDialogue.map((d, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      d.speaker === 'agent' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {d.speaker === 'agent' && (
                      <div className="w-5 h-5 rounded-md bg-[#121212] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        H
                      </div>
                    )}
                    <div
                      className={`p-2.5 rounded-xl max-w-[80%] text-xs leading-relaxed ${
                        d.speaker === 'agent'
                          ? 'bg-white border border-[#e6e5e3] text-[#121212]'
                          : 'bg-[#4f46e5] text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] opacity-70 mb-0.5">
                        <span>{d.speaker === 'agent' ? agent.persona_name : calleeName}</span>
                        <span className="font-mono">{d.time}</span>
                      </div>
                      <div>{d.text}</div>
                    </div>
                    {d.speaker === 'user' && (
                      <div className="w-5 h-5 rounded-md bg-[#4f46e5] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Structured Post-Call Extraction Result */}
          {extractedData && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-xs font-semibold text-[#121212]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
                  <span>Structured Extraction Result (`result_schema`)</span>
                </div>
                <Badge variant="success" className="text-[10px] py-0">
                  Schema Validated
                </Badge>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#f6f6f4] border border-[#e6e5e3] text-xs font-mono text-[#121212] leading-relaxed">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#f0f0ee] bg-[#fbfbfa] flex items-center justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Sandbox
          </Button>
        </div>
      </div>
    </div>
  );
};
