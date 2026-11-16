import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandApplication } from '../../types';
import {
  Clock,
  CheckCircle2,
  FileText,
  Users,
  Compass,
  FileCheck,
  ShieldCheck,
  Layers,
  Cpu,
  Wifi,
  Sparkles
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const ApplicationTrackingView: React.FC = () => {
  const { applications, updateApplicationStatus, addNotification } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [amendmentNote, setAmendmentNote] = useState('Certified SURCON Survey Plan and updated treasury receipt re-uploaded for deeds review.');

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  if (!selectedApp) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        You have no land applications to track yet.
      </div>
    );
  }

  // Unified 8-Stage ANAGU Pipeline from PDF Specification
  const pipelineStages = [
    { key: 'submitted', label: '1. Application Submission', icon: FileText, desc: 'Identity (NIN Tier 3), tenure claim, and fee clearance.' },
    { key: 'spatial_verification', label: '2. PostGIS Spatial Verification', icon: Layers, desc: 'WGS 84 coordinates validated; ST_IsValid & ST_Intersects checked with 0.5m buffer.' },
    { key: 'community_attestation', label: '3. Community Attestation & Oracle', icon: Users, desc: '21-day public notice window; 4 cardinal abutting neighbors signoff.' },
    { key: 'legal_verification', label: '4. Legal Instrument Verification', icon: Compass, desc: 'Root of title, gazette notices, and encumbrance search verified.' },
    { key: 'registrar_approval', label: '5. Registrar Title Approval', icon: FileCheck, desc: 'Deeds Registrar executes sovereign multi-sig validation.' },
    { key: 'blockchain_registration', label: '6. Blockchain Consensus Registration', icon: Cpu, desc: 'Cadastral block finalized on Raft-BFT validator consensus.' },
    { key: 'nft_issuance', label: '7. ERC-721 NFT Title Minting', icon: ShieldCheck, desc: 'Non-transferable sovereign token minted with IPFS deed metadata.' },
    { key: 'mqtt_dispatch', label: '8. MQTT Edge Dispatch & Broadcast', icon: Wifi, desc: 'Telemetry published on land/registration/status (QoS 2) to edge nodes.' }
  ];

  const getStageIndex = (status: LandApplication['status']) => {
    switch (status) {
      case 'submitted':
        return 1; // Stage 1 done, stage 2 in progress
      case 'survey_assigned':
        return 1;
      case 'survey_completed':
        return 2;
      case 'community_attestation':
        return 2;
      case 'registrar_review':
        return 4;
      case 'approved':
        return 7; // all 8 done
      case 'rejected':
        return -1;
      default:
        return 1;
    }
  };

  const currentStageIndex = getStageIndex(selectedApp.status);
  const needsAction = selectedApp.status === 'rejected' || selectedApp.notes.startsWith('CORRECTION REQUIRED');

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateApplicationStatus(
      selectedApp.id,
      'registrar_review',
      `AMENDED & RESUBMITTED: ${amendmentNote}`
    );
    addNotification({
      title: 'Application Resubmitted',
      message: `${selectedApp.applicationNumber} amended and routed back to Registrar Examination Queue.`,
      type: 'success'
    });
    setShowResubmitModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#6338F5]" />
          8-Stage Sovereign Cadastral Lifecycle Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          End-to-end audit tracking across spatial validation, community oracle, blockchain consensus, and MQTT broadcast.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applications on File */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400">Applications on File</div>
          {applications.map(app => (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedApp.id === app.id
                  ? 'bg-[#171A3B] border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-[#12163b]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-white text-xs">{app.applicationNumber}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    app.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : app.status === 'rejected'
                      ? 'bg-rose-500/20 text-rose-300'
                      : app.notes.startsWith('CORRECTION REQUIRED')
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {app.notes.startsWith('CORRECTION REQUIRED') ? 'correction required' : app.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium">{app.applicantName}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{app.district}, {app.state}</div>
              {app.tenureType && (
                <div className="text-[10px] text-emerald-400 font-mono mt-1">
                  Tenure: {app.tenureType} Right of Occupancy
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right 2 Columns: 8-Stage Timeline */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
            <div>
              <div className="text-xs text-slate-400">Application Number</div>
              <div className="text-xl font-bold font-mono text-white">{selectedApp.applicationNumber}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Date Lodged</div>
              <div className="text-xs font-mono text-slate-200">{selectedApp.dateSubmitted}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Neighbor Consensus</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                {selectedApp.attestationsCount} / {selectedApp.requiredAttestations} Confirmed
              </div>
            </div>
          </div>

          {/* Rejected or Correction Required Banner */}
          {selectedApp.status === 'rejected' && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-rose-400 uppercase font-mono">Application Rejected</div>
                <button
                  onClick={() => setShowResubmitModal(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px]"
                >
                  Appeal & Resubmit Rectified Dossier
                </button>
              </div>
              <p>{selectedApp.notes}</p>
            </div>
          )}
          {selectedApp.notes.startsWith('CORRECTION REQUIRED') && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-amber-400 uppercase font-mono">Correction Required — Action Needed</div>
                <button
                  onClick={() => setShowResubmitModal(true)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px]"
                >
                  Amend & Resubmit Documents
                </button>
              </div>
              <p>{selectedApp.notes}</p>
            </div>
          )}

          {/* Stepper Timeline: 8 Stages */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>ANAGU 8-Stage Unified Pipeline Status</span>
              <span className="text-indigo-400">
                {selectedApp.status === 'approved'
                  ? '8 of 8 Completed'
                  : selectedApp.status === 'rejected'
                  ? 'Pipeline Halted (Rejected)'
                  : needsAction
                  ? 'Paused — Correction Query Pending'
                  : `Stage ${currentStageIndex + 1} of 8 Active`}
              </span>
            </h3>

            <div className="space-y-2">
              {pipelineStages.map((stage, idx) => {
                const Icon = stage.icon;
                const isCompleted = currentStageIndex > idx || selectedApp.status === 'approved';
                const isCurrent = currentStageIndex === idx && selectedApp.status !== 'approved';

                return (
                  <div
                    key={stage.key}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                        : 'bg-[#0d122e] border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-[#6338F5] text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{stage.label}</span>
                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 uppercase">Validated</span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-indigo-300 uppercase animate-pulse">
                            Processing
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Notes & Surveyor Seal */}
          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200">Cadastral Processing Memorial</div>
            <p className="text-slate-300 leading-relaxed">{selectedApp.notes}</p>
            {selectedApp.assignedSurveyor && (
              <div className="text-[11px] text-indigo-300 pt-1 flex items-center justify-between">
                <span>Assigned Cadastral Surveyor: <strong>{selectedApp.assignedSurveyor}</strong></span>
                {selectedApp.surveyorSurconNo && (
                  <span className="font-mono text-slate-400">{selectedApp.surveyorSurconNo}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amendment / Resubmission Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#171A3B] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white">Amend & Resubmit Title Dossier</h3>
              <button onClick={() => setShowResubmitModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <form onSubmit={handleResubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Rectification Summary & Newly Attached Instruments</label>
                <textarea
                  value={amendmentNote}
                  onChange={e => setAmendmentNote(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResubmitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#6338F5] hover:bg-[#5229db] text-white font-bold"
                >
                  Resubmit to Deeds Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
