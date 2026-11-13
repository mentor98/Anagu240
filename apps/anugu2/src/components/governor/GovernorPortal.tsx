import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RevocationRecord } from '../../types';
import {
  Crown,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Layers,
  Lock,
  Receipt
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const GovernorPortal: React.FC = () => {
  const { currentRole, setCurrentRole, parcels, revocations, executeGovernorRevocation, currentUser } = useApp();

  const isGovernor = currentRole === 'governor';

  // Revocation Form State
  const [selectedParcelId, setSelectedParcelId] = useState(parcels.find(p => p.status === 'verified')?.id || parcels[0].id);
  const [revocationReason, setRevocationReason] = useState<RevocationRecord['revocationReason']>('Overriding Public Interest');
  const [gazetteRef, setGazetteRef] = useState(`LGSG/VOL-60/NO-0${Math.floor(10 + Math.random() * 90)}`);
  const [compensationAmount, setCompensationAmount] = useState(450000000);
  const [executivePasskey, setExecutivePasskey] = useState('STATE-GOV-AUTH-KEY-8849');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);

    setTimeout(() => {
      executeGovernorRevocation({
        parcelId: selectedParcelId,
        reason: revocationReason,
        gazetteRef,
        compensationAmount
      });
      setIsExecuting(false);
      setShowConfirmModal(false);
    }, 800);
  };

  const targetParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Executive Governor Land Administration Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statutory governance under the Land Use Act, 1978 · Executive Orders & Revocation Memorials
          </p>
        </div>

        {!isGovernor && (
          <button
            onClick={() => setCurrentRole('governor')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
          >
            Switch to Governor Persona
          </button>
        )}
      </div>

      {/* Access Enforcement Banner */}
      {!isGovernor && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Role-Based Access Restricted</div>
            <p className="text-slate-300 mt-0.5">
              Only the <strong>Executive Governor</strong> demo persona has constitutional authority to execute statutory title revocations. Use the switcher above to activate full executive controls.
            </p>
          </div>
        </div>
      )}

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Statutory Revocations</div>
          <div className="text-2xl font-bold font-mono text-rose-400">{revocations.length}</div>
          <div className="text-[11px] text-slate-400">Memorial entries recorded on-chain</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Compensation Assessed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₦{(revocations.reduce((acc, r) => acc + r.compensationAmount, 0) / 1000000).toFixed(0)}M
          </div>
          <div className="text-[11px] text-slate-400">State Land Valuation Board</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Governor Consent Invariants</div>
          <div className="text-2xl font-bold font-mono text-white">100% Multi-Sig</div>
          <div className="text-[11px] text-indigo-300">Section 28 Land Use Act Enforced</div>
        </div>
      </div>

      {/* Main Grid: Revocation Flow & History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Statutory Revocation Action */}
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-4 shadow-2xl">
          <div className="pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Statutory Revocation Order Protocol
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Extinguish a right of occupancy for overriding public interest or breach of statutory condition.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Target Titled Parcel</label>
              <select
                value={selectedParcelId}
                onChange={e => setSelectedParcelId(e.target.value)}
                disabled={!isGovernor}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              >
                {parcels.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.titleNumber} - {p.ownerName} ({p.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                Statutory Grounds — Land Use Act (1978) Section 28
              </label>
              <select
                value={revocationReason}
                onChange={e => setRevocationReason(e.target.value as RevocationRecord['revocationReason'])}
                disabled={!isGovernor}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
              >
                <option value="Overriding Public Interest">
                  Ground 1: Overriding Public Interest (Sec. 28(2) - Infrastructure/Highway/Public Use)
                </option>
                <option value="Breach of Statutory Condition">
                  Ground 2: Breach of Statutory Condition (Sec. 28(5) - Failure to Improve/Unapproved Use)
                </option>
              </select>
              <p className="text-[10px] text-amber-400 mt-1">
                Statutory Mandate: Lawful only for overriding public interest or breach of statutory condition.
              </p>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Official State Gazette Notice Reference</label>
              <input
                type="text"
                value={gazetteRef}
                onChange={e => setGazetteRef(e.target.value)}
                disabled={!isGovernor}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Statutory Compensation Assessment (₦)</label>
              <input
                type="number"
                value={compensationAmount}
                onChange={e => setCompensationAmount(Number(e.target.value))}
                disabled={!isGovernor}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Valued under Land Use Act Section 29 (Land and Unexhausted Improvements).
              </span>
            </div>

            {/* Smart Contract & GIS Reversion Preview */}
            <div className="p-3 rounded-xl bg-[#0a0d20] border border-slate-800 text-[10px] font-mono text-indigo-300 space-y-1">
              <div className="text-slate-400 uppercase font-semibold">On-Chain Event & Cadastre Invariant:</div>
              <div>event TitleRevoked(tokenId, "{revocationReason}", msg.sender, block.timestamp)</div>
              <div>GIS Layer State: <span className="text-rose-400 font-bold">STATE LAND (REVERTED)</span></div>
              <div>P2P Transfers: <span className="text-rose-400 font-bold">PERMANENTLY BLOCKED</span></div>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!isGovernor || targetParcel.status === 'revoked'}
              className="w-full mt-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>{targetParcel.status === 'revoked' ? 'Title Already Revoked' : 'Execute Statutory Revocation Order'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Revocation Memorials Archive */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              State Gazette Revocation Memorials
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Permanently Recorded</span>
          </div>

          <div className="space-y-3">
            {revocations.map(rev => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-[#0d122e] border border-rose-900/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-400 text-sm">{rev.orderNumber}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    EXECUTED ORDER · GIS REVERTED
                  </span>
                </div>

                <div className="text-slate-200">
                  Target: <strong className="text-white font-mono">{rev.parcelTitle}</strong> (Ex-Owner: {rev.previousOwner})
                </div>

                <div className="text-[11px] text-slate-400">
                  Grounds: <span className="text-amber-300">{rev.revocationReason}</span> · Gazette: <span className="text-indigo-300 font-mono">{rev.gazetteNoticeNumber}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                  <span>Compensation: ₦{(rev.compensationAmount / 1000000).toFixed(0)}M ({rev.compensationStatus})</span>
                  <span>Signed: {rev.signedBy} · {rev.effectiveDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#171A3B] border border-rose-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Executive Statutory Revocation
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-rose-950/30 rounded-xl border border-rose-500/40 text-rose-200 text-xs space-y-2 leading-relaxed">
              <p>
                <strong>Warning:</strong> You are about to invoke executive power under the Land Use Act to revoke Right of Occupancy for <strong>{targetParcel.titleNumber}</strong>.
              </p>
              <p>
                This action will trigger an on-chain token burn to address <code>0x00...DEAD</code> and extinguish all conveyancing rights.
              </p>
            </div>

            <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Executive Cryptographic Assent Key</label>
                <input
                  type="password"
                  value={executivePasskey}
                  onChange={e => setExecutivePasskey(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isExecuting ? 'Executing Order...' : 'Confirm & Publish Gazette Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
