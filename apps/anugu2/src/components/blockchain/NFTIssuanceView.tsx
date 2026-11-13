import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, ShieldCheck, Lock, ExternalLink, QrCode, FileCheck, Layers } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const NFTIssuanceView: React.FC = () => {
  const { parcels, setSelectedCertificateParcel } = useApp();
  const [selectedToken, setSelectedToken] = useState(parcels[0]);

  const issuedTokens = parcels.filter(p => p.certificateIssued);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          NFT Title Deed & Issuance Registry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically registered ERC-721 Certificate of Occupancy (C of O) tokens anchored to state land gazette.
        </p>
      </div>

      {/* Protocol Architecture Notice */}
      <div className="p-4 rounded-xl bg-[#171A3B] border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white">Registry-Controlled Smart Contract Architecture</div>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            Unlike standard crypto collectibles, ANAGU NFT Title Deeds enforce statutory restrictions in smart contract logic: tokens cannot be transferred directly peer-to-peer. Every assignment requires Registrar validation, tax verification, and Executive Governor consent pursuant to Section 22 of the Land Use Act.
          </p>
        </div>
      </div>

      {/* Grid of Minted NFT Deeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issuedTokens.map(parcel => (
          <div
            key={parcel.id}
            className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 overflow-hidden shadow-xl flex flex-col justify-between"
          >
            {/* Top Certificate Preview Strip */}
            <div className="p-5 bg-gradient-to-b from-[#1c214c] to-[#171A3B] border-b border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  ERC-721 TITLE DEED
                </span>
                <span className="text-xs font-mono text-emerald-400">Block #{parcel.blockNumber}</span>
              </div>
              <h2 className="text-base font-bold text-white font-mono">{parcel.titleNumber}</h2>
              <div className="text-xs text-slate-300">
                Grantee: <strong className="text-white">{parcel.ownerName}</strong>
              </div>
            </div>

            {/* Token Body */}
            <div className="p-5 space-y-3 text-xs">
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-slate-400">Token Hash Digest:</div>
                <div className="text-indigo-300 truncate">{parcel.tokenHash}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0d122e] text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cadastral Area</span>
                  <span className="text-white font-bold">{parcel.sizeSqm.toLocaleString()} m²</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Zoning</span>
                  <span className="text-indigo-300">{parcel.landUse}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {parcel.district}, {parcel.lga}, {parcel.state} State
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-[#12163b] border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedCertificateParcel(parcel)}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Award className="w-4 h-4" />
                <span>View Full Certificate (C of O)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
