import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandApplication } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Award,
  User,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const RegistrarPortal: React.FC = () => {
  const { applications, approveTitleDeed, updateApplicationStatus, setSelectedCertificateParcel, currentUser, addNotification } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string>((applications[1] || applications[0])?.id || '');
  const [isApproving, setIsApproving] = useState(false);
  const [queryNote, setQueryNote] = useState('Please resubmit certified Survey Plan bearing SURCON seal and treasury receipt.');
  const [showQueryModal, setShowQueryModal] = useState<'correction' | 'reject' | null>(null);

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0];
  const pendingQueue = applications.filter(a => a.status === 'registrar_review' || a.status === 'community_attestation');

  if (!selectedApp) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        No land applications are awaiting registrar review.
      </div>
    );
  }

  const handleApprove = () => {
    if (!selectedApp) return;
    setIsApproving(true);
    setTimeout(() => {
      const mintedParcel = approveTitleDeed(selectedApp.id);
      setIsApproving(false);
      setSelectedCertificateParcel(mintedParcel);
    }, 700);
  };

  const handleDecisionNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQueryModal || !selectedApp) return;

    if (showQueryModal === 'reject') {
      updateApplicationStatus(selectedApp.id, 'rejected', `REJECTED BY REGISTRAR (${currentUser.name}): ${queryNote}`);
      addNotification({
        title: 'Application Rejected',
        message: `Application ${selectedApp.applicationNumber} rejected due to statutory defect.`,
        type: 'error'
      });
    } else {
      updateApplicationStatus(selectedApp.id, 'submitted', `CORRECTION REQUIRED (${currentUser.name}): ${queryNote}`);
      addNotification({
        title: 'Correction Query Dispatched',
        message: `Correction notice dispatched for ${selectedApp.applicationNumber}.`,
        type: 'warning'
      });
    }
    setShowQueryModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-[#6338F5]" />
          Deeds Registrar Examination & Approval Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Logged in as <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> (Deeds Registrar, State Bureau of Lands)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Application Queue */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400">
            Pending Deeds Examination Queue ({pendingQueue.length})
          </div>

          {applications.map(app => (
            <div
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedApp?.id === app.id
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
                      : app.status === 'registrar_review'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}
                >
                  {app.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-200 font-semibold">{app.applicantName}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{app.district}, {app.state}</div>
            </div>
          ))}
        </div>

        {/* Right 2 Columns: Application Examination Dossier */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div>
              <div className="text-xs text-slate-400">Dossier Under Review</div>
              <h2 className="text-xl font-bold font-mono text-white">{selectedApp.applicationNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Status</span>
              <div className="text-xs font-mono font-bold uppercase text-indigo-300">
                {selectedApp.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {(selectedApp.status === 'rejected' || selectedApp.notes.startsWith('CORRECTION REQUIRED')) && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              selectedApp.status === 'rejected'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            }`}>
              <div className="font-bold font-mono uppercase">
                {selectedApp.status === 'rejected' ? 'Statutory Rejection Recorded' : 'Correction Query Active'}
              </div>
              <p>{selectedApp.notes}</p>
            </div>
          )}

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Statutory Examination Criteria
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0d122e] border border-emerald-500/30 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">NIN Identity Authenticated</div>
                  <div className="text-[10px] text-slate-400">Biometric match verified against NIMC API</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d122e] border border-emerald-500/30 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">PostGIS Spatial Check Cleared</div>
                  <div className="text-[10px] text-slate-400">ST_IsValid & 0.5m buffer non-overlapping</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d122e] border border-emerald-500/30 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Neighbor Attestations Complete</div>
                  <div className="text-[10px] text-slate-400">4/4 Boundary neighbors signed with 0 disputes</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d122e] border border-emerald-500/30 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Stamp Duty & Tax Clearance</div>
                  <div className="text-[10px] text-slate-400">Internal Revenue receipts validated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Documents */}
          <div className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-white">Attached Legal Instruments:</div>
            <div className="space-y-1 text-slate-300 font-mono text-[11px]">
              {selectedApp.documents.map((d, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-indigo-300">{d.name}</span>
                  <span className="text-slate-400">{d.size} · {d.uploadedAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowQueryModal('correction')}
                className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold"
              >
                Request Correction
              </button>
              <button
                onClick={() => setShowQueryModal('reject')}
                className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold"
              >
                Reject Application
              </button>
            </div>

            {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6338F5] to-[#13C98A] text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                {isApproving ? (
                  <span>Minting C of O Token...</span>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Approve & Mint Certificate of Occupancy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Query / Rejection Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#171A3B] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${showQueryModal === 'reject' ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>{showQueryModal === 'reject' ? 'Reject Title Application' : 'Issue Registry Correction Query'}</span>
              </h3>
              <button onClick={() => setShowQueryModal(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <form onSubmit={handleDecisionNoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Statutory Registrar Notes</label>
                <textarea
                  value={queryNote}
                  onChange={e => setQueryNote(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white font-bold ${
                    showQueryModal === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {showQueryModal === 'reject' ? 'Confirm Rejection' : 'Dispatch Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
