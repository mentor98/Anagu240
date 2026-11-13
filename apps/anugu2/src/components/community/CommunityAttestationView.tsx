import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommunityAttestation, OracleOutcome } from '../../types';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MapPin,
  MessageSquare,
  FileCheck,
  Landmark,
  Compass,
  FileQuestion
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const CommunityAttestationView: React.FC = () => {
  const { communityAttestations, signNeighborAttestation } = useApp();
  const [selectedAttestationId, setSelectedAttestationId] = useState<string>(communityAttestations[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'all' | 'customary' | 'statutory'>('all');

  // Modal for signing
  const [showSignModal, setShowSignModal] = useState(false);
  const [activeNeighbor, setActiveNeighbor] = useState('');
  const [signStatus, setSignStatus] = useState<'confirmed' | 'disputed'>('confirmed');
  const [signComment, setSignComment] = useState('I hereby attest that the boundary beacons set by the surveyor correspond with historical boundary trees and markers.');

  // Per-parcel Traditional Council Verification state
  const [traditionalCouncilVerifiedMap, setTraditionalCouncilVerifiedMap] = useState<Record<string, boolean>>({
    'att-001': true,
    'att-002': true
  });

  const filteredAttestations = communityAttestations.filter(att => {
    if (activeTab === 'all') return true;
    if (activeTab === 'customary') return att.tenureType === 'Customary';
    return att.tenureType !== 'Customary';
  });

  const selectedAttestation: CommunityAttestation =
    filteredAttestations.find(a => a.id === selectedAttestationId) ||
    filteredAttestations[0] ||
    communityAttestations[0];

  const traditionalCouncilVerified = selectedAttestation
    ? traditionalCouncilVerifiedMap[selectedAttestation.id] ?? true
    : true;

  const toggleTraditionalCouncil = () => {
    if (!selectedAttestation) return;
    setTraditionalCouncilVerifiedMap(prev => ({
      ...prev,
      [selectedAttestation.id]: !(prev[selectedAttestation.id] ?? true)
    }));
  };

  // Compute Oracle Outcome based on neighbor status and disputes
  const calculateOracleOutcome = (): { outcome: OracleOutcome; color: string; desc: string } => {
    const hasDisputes = selectedAttestation.neighborAttestations.some(n => n.status === 'disputed') ||
      selectedAttestation.publicDisputes.length > 0;
    const allConfirmed = selectedAttestation.neighborAttestations.every(n => n.status === 'confirmed');
    const hasPending = selectedAttestation.neighborAttestations.some(n => n.status === 'pending');

    if (hasDisputes) {
      return {
        outcome: 'Ownership Information Conflict',
        color: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
        desc: 'Boundary conflict or overlapping ownership claim lodged during statutory notice period.'
      };
    }
    if (!traditionalCouncilVerified) {
      return {
        outcome: 'Incomplete Supporting Documents',
        color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
        desc: 'Family allotment or traditional council chieftaincy consent seal pending attestation review.'
      };
    }
    if (hasPending) {
      return {
        outcome: 'Legal Verification Pending',
        color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        desc: 'Abutting neighbor attestations in progress. Awaiting perimeter signatures.'
      };
    }
    if (allConfirmed && traditionalCouncilVerified) {
      return {
        outcome: 'Successfully Verified',
        color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        desc: 'Unanimous 4-cardinal perimeter consensus and traditional chieftaincy verification completed.'
      };
    }
    return {
      outcome: 'Incomplete Supporting Documents',
      color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
      desc: 'Family allotment or traditional consent documentation pending deed review.'
    };
  };

  const oracleResult = calculateOracleOutcome();

  const handleOpenSign = (neighborName: string) => {
    setActiveNeighbor(neighborName);
    setShowSignModal(true);
  };

  const handleConfirmSign = (e: React.FormEvent) => {
    e.preventDefault();
    signNeighborAttestation(selectedAttestation.id, activeNeighbor, signStatus, signComment);
    setShowSignModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#13C98A]" />
          Community Verification Oracle & Boundary Attestation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Reconciling statutory titles and customary land tenure through decentralized perimeter neighbor consensus and traditional council attestation.
        </p>
      </div>

      {/* Tenure Filter Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">Filter Notices:</span>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'all' ? 'bg-[#6338F5] text-white shadow' : 'bg-[#171A3B] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Notices ({communityAttestations.length})
        </button>
        <button
          onClick={() => setActiveTab('customary')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'customary' ? 'bg-[#6338F5] text-white shadow' : 'bg-[#171A3B] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Customary & Communal ({communityAttestations.filter(a => a.tenureType === 'Customary').length})
        </button>
        <button
          onClick={() => setActiveTab('statutory')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'statutory' ? 'bg-[#6338F5] text-white shadow' : 'bg-[#171A3B] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Statutory Grants ({communityAttestations.filter(a => a.tenureType !== 'Customary').length})
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attestation Notices */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400">Active Public Notices</div>
          {filteredAttestations.map(att => (
            <div
              key={att.id}
              onClick={() => setSelectedAttestationId(att.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedAttestation?.id === att.id
                  ? 'bg-[#171A3B] border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-[#12163b]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-white text-xs">{att.parcelTitle}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  att.tenureType === 'Customary'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {att.tenureType || 'Statutory'} Notice
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium">{att.applicantName}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">{att.location}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Deadline: {att.attestationDeadline}
              </div>
            </div>
          ))}
        </div>

        {/* Right 2 Columns: Perimeter Breakdown & Oracle Verdict */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div>
              <div className="text-xs text-slate-400">Target Parcel</div>
              <div className="text-xl font-bold text-white font-mono">{selectedAttestation.parcelTitle}</div>
              <div className="text-xs text-slate-300">{selectedAttestation.location}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Notice Expiration</div>
              <div className="text-xs font-mono font-bold text-amber-400">{selectedAttestation.attestationDeadline}</div>
            </div>
          </div>

          {/* Oracle Determination Banner (PDF 4 Outcome States) */}
          <div className={`p-4 rounded-xl border ${oracleResult.color} space-y-1 text-xs`}>
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Community Oracle Outcome: {oracleResult.outcome.toUpperCase()}</span>
              </div>
              <span className="text-[10px] font-mono uppercase">21-Day Statutory Window</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">{oracleResult.desc}</p>
          </div>

          {/* Customary / Traditional Authority Assent Card */}
          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Traditional Rulers & Chieftaincy Council Verification</span>
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  traditionalCouncilVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {traditionalCouncilVerified ? 'AFFIRMED BY COUNCIL' : 'SEAL PENDING'}
                </span>
                <button
                  type="button"
                  onClick={toggleTraditionalCouncil}
                  className="px-2.5 py-1 rounded-lg bg-[#6338F5]/20 border border-[#6338F5]/40 text-indigo-300 hover:bg-[#6338F5]/30 text-[10px] font-semibold"
                >
                  {traditionalCouncilVerified ? 'Revoke Seal (Test)' : 'Affirm Council Seal'}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Family Trustee and Traditional Council seal: Root of title traced to communal allotment with ancestral boundary landmarks confirmed.
            </p>
          </div>

          {/* 4 Perimeter Neighbors Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Perimeter Boundary Neighbors (4 Cardinals)</span>
              <span className="text-indigo-400 text-[11px]">
                {selectedAttestation.neighborAttestations.filter(n => n.status === 'confirmed').length} / 4 Confirmed
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedAttestation.neighborAttestations.map((neighbor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-indigo-400 text-[11px]">
                      {neighbor.boundarySide} Boundary
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        neighbor.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : neighbor.status === 'disputed'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {neighbor.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-white">{neighbor.neighborName}</div>
                    {neighbor.comment ? (
                      <p className="text-[11px] text-slate-300 italic mt-1 leading-snug">
                        "{neighbor.comment}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        Pending attestation signature.
                      </p>
                    )}
                  </div>

                  {neighbor.status === 'pending' && (
                    <button
                      onClick={() => handleOpenSign(neighbor.neighborName)}
                      className="w-full py-1.5 rounded-lg bg-[#6338F5] text-white text-[11px] font-semibold hover:bg-[#5229db] transition-colors flex items-center justify-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simulate Signoff as Neighbor</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Neighbor Signoff Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#171A3B] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#6338F5]" />
                Neighbor Boundary Attestation Signoff
              </h3>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSign} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Attesting Abutting Neighbor</label>
                <div className="font-bold text-white text-sm">{activeNeighbor}</div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Attestation Stance</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSignStatus('confirmed')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      signStatus === 'confirmed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Confirm Boundary (No Encroachment)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignStatus('disputed')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      signStatus === 'disputed'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    File Boundary Dispute
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Attestation Statement / Boundary Observation</label>
                <textarea
                  value={signComment}
                  onChange={e => setSignComment(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6338F5] text-white font-bold hover:bg-[#5229db] text-xs shadow-md shadow-indigo-600/30"
                >
                  Record Attestation On-Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
