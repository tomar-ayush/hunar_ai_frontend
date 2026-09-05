import React, { useState, useMemo } from 'react';
import { 
  Search, 
  PhoneCall, 
  ExternalLink, 
  Sparkles, 
  CheckSquare, 
  Square, 
  RotateCcw,
  Radio, 
  ChevronRight, 
  Building2,
  MapPin
} from 'lucide-react';
import { useRecruiter } from '../context';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { CallStatus } from '../types';

export const PipelineView: React.FC = () => {
  const { 
    candidates, 
    selectedCandidateIds, 
    toggleSelectCandidate, 
    selectAllCandidates, 
    clearCandidateSelection,
    initiateVoiceOutreach,
    setActiveCandidateId,
    navigateTo
  } = useRecruiter();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CallStatus>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'company'>('score');

  // Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchesStatus = statusFilter === 'all' || c.callStatus === statusFilter;
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.matchScore - a.matchScore;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'company') return a.company.localeCompare(b.company);
        return 0;
      });
  }, [candidates, statusFilter, searchQuery, sortBy]);

  const allFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedCandidateIds.includes(c.id));

  const handleSelectAllToggle = () => {
    if (allFilteredSelected) {
      clearCandidateSelection();
    } else {
      selectAllCandidates(true);
    }
  };

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" dot className="font-mono">
            Completed
          </Badge>
        );
      case 'ringing':
        return (
          <Badge variant="warning" dot className="font-mono animate-pulse">
            Ringing
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="info" dot className="font-mono">
            Queued
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="neutral" dot className="font-mono text-[#8c8b88]">
            Declined
          </Badge>
        );
      case 'not_contacted':
      default:
        return (
          <Badge variant="neutral" className="font-mono text-[#6e6d69]">
            Not Contacted
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Header & Sourcing Source Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#121212]">
              Candidate CRM Pipeline
            </h1>
            <Badge variant="neutral" className="text-[11px] font-mono">
              Apollo & PDL Enriched
            </Badge>
          </div>
          <p className="text-xs text-[#6e6d69] mt-0.5">
            Sourced candidates matched against <span className="font-medium text-[#121212]">Lead Distributed Systems Engineer</span> criteria.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#5a5957]" />}
            onClick={() => navigateTo('/sourcing')}
          >
            Refine Sourcing Query
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
            onClick={() => {
              const uncontacted = candidates.filter(c => c.callStatus === 'not_contacted').map(c => c.id);
              if (uncontacted.length > 0) {
                initiateVoiceOutreach(uncontacted);
              }
            }}
          >
            Auto-Dial Uncontacted
          </Button>
        </div>
      </div>

      {/* Filter Bar & Quick Stats */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8c8b88] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, company, or skill (e.g. Go, Kafka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-4 text-xs rounded-lg border border-[#e6e5e3] bg-[#fbfbfa] text-[#121212] placeholder-[#8c8b88] focus:bg-white focus:outline-none focus:border-[#121212] transition-all"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#8c8b88] text-[11px] font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'completed', label: 'Completed' },
              { id: 'ringing', label: 'Ringing' },
              { id: 'queued', label: 'Queued' },
              { id: 'not_contacted', label: 'Not Contacted' },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-white font-medium shadow-xs'
                      : 'bg-[#f4f4f2] text-[#5a5957] hover:text-[#121212] hover:bg-[#ebeae7]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[#8c8b88] text-xs">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 text-xs rounded-lg border border-[#e6e5e3] bg-white text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              <option value="score">AI Match Score (High to Low)</option>
              <option value="name">Candidate Name (A-Z)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Candidate Table */}
      <div className="bg-white border border-[#e6e5e3] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e6e5e3] bg-[#fbfbfa] text-[11px] font-semibold text-[#6e6d69] uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    onClick={handleSelectAllToggle}
                    className="text-[#6e6d69] hover:text-[#121212] cursor-pointer flex items-center justify-center"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#121212]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8c8b88]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">AI Match Score</th>
                <th className="py-3 px-4">Call Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ee] text-xs">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8c8b88]">
                    No candidates found matching the query criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => {
                  const isSelected = selectedCandidateIds.includes(candidate.id);
                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-[#fcfcfa] transition-colors group ${
                        isSelected ? 'bg-[#f8f9ff]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleSelectCandidate(candidate.id)}
                          className="text-[#6e6d69] hover:text-[#121212] cursor-pointer flex items-center justify-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#4f46e5]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#b0afa9] group-hover:text-[#6e6d69]" />
                          )}
                        </button>
                      </td>

                      {/* Candidate Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={candidate.avatarUrl}
                            alt={candidate.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#e6e5e3]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => setActiveCandidateId(candidate.id)}
                                className="font-semibold text-[#121212] hover:text-[#4f46e5] cursor-pointer transition-colors"
                              >
                                {candidate.name}
                              </span>
                              <a
                                href={candidate.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#8c8b88] hover:text-[#0077b5] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <span className="text-[11px] text-[#8c8b88] flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {candidate.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Current Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#2d2c2a]">{candidate.currentRole}</div>
                        <div className="text-[11px] text-[#8c8b88]">
                          {candidate.experienceYears} yrs exp
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#2d2c2a] font-medium">
                          <Building2 className="w-3.5 h-3.5 text-[#8c8b88]" />
                          <span>{candidate.company}</span>
                        </div>
                        {candidate.previousCompany && (
                          <div className="text-[10px] text-[#8c8b88] font-mono">
                            prev: {candidate.previousCompany}
                          </div>
                        )}
                      </td>

                      {/* AI Match Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                candidate.matchScore >= 90
                                  ? 'bg-emerald-600'
                                  : candidate.matchScore >= 80
                                  ? 'bg-[#4f46e5]'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${candidate.matchScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-xs text-[#121212]">
                            {candidate.matchScore}%
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8c8b88] truncate max-w-[140px]">
                          {candidate.skills.slice(0, 2).join(', ')}
                        </div>
                      </td>

                      {/* Call Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(candidate.callStatus)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {candidate.callStatus === 'completed' ? (
                          <button
                            onClick={() => setActiveCandidateId(candidate.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#edf7ee] text-[#1b6b27] hover:bg-[#d4ebd6] font-medium text-xs transition-colors cursor-pointer"
                          >
                            <span>Audit Call</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : candidate.callStatus === 'ringing' ? (
                          <button
                            onClick={() => setActiveCandidateId(candidate.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fef7ec] text-[#975a16] hover:bg-[#fde4c0] font-medium text-xs transition-colors cursor-pointer"
                          >
                            <span>Listen Live</span>
                            <Radio className="w-3 h-3 animate-pulse" />
                          </button>
                        ) : (
                          <button
                            onClick={() => initiateVoiceOutreach([candidate.id])}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#e6e5e3] bg-white text-[#2d2c2a] hover:bg-[#f4f4f2] font-medium text-xs transition-colors cursor-pointer"
                          >
                            <PhoneCall className="w-3 h-3 text-[#4f46e5]" />
                            <span>Dial AI Voice</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Telemetry */}
        <div className="px-4 py-3 bg-[#fbfbfa] border-t border-[#e6e5e3] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6e6d69] gap-2">
          <div>
            Showing <span className="font-medium text-[#121212]">{filteredCandidates.length}</span> of{' '}
            <span className="font-medium text-[#121212]">{candidates.length}</span> enriched candidate profiles
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Completed: {candidates.filter(c => c.callStatus === 'completed').length}</span>
            <span>Ringing: {candidates.filter(c => c.callStatus === 'ringing').length}</span>
            <span>Queued: {candidates.filter(c => c.callStatus === 'queued').length}</span>
          </div>
        </div>
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectedCandidateIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#121212] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#2a2a2a] flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-[#333333] pr-4">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-mono font-semibold">
                {selectedCandidateIds.length}
              </span>
              <span className="text-xs text-white/80">Candidates Selected</span>
            </div>

            <button
              onClick={clearCandidateSelection}
              className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Deselect
            </button>

            <Button
              size="sm"
              variant="indigo"
              leftIcon={<PhoneCall className="w-3.5 h-3.5 fill-white text-white" />}
              onClick={() => initiateVoiceOutreach(selectedCandidateIds)}
            >
              Initiate Hunar.AI Voice Outreach
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
