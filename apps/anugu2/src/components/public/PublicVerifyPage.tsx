import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Parcel } from '../../types';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
  MapPin,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  XCircle
} from 'lucide-react';
import { BackButton } from '../common/BackButton';
import { CadastreGoogleMap } from '../gis/CadastreGoogleMap';

export const PublicVerifyPage: React.FC = () => {
  const { parcels, setSelectedCertificateParcel } = useApp();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Initialize query from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      const match = parcels.find(
        p =>
          p.titleNumber.toLowerCase().includes(q.toLowerCase()) ||
          p.tokenHash.toLowerCase().includes(q.toLowerCase()) ||
          p.ownerNationalId.toLowerCase().includes(q.toLowerCase()) ||
          p.ownerName.toLowerCase().includes(q.toLowerCase())
      );
      if (match) setSelectedParcel(match);
    } else {
      setSelectedParcel(parcels[0]);
    }
  }, [location.search, parcels]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim().toLowerCase();
    const match = parcels.find(
      p =>
        p.titleNumber.toLowerCase().includes(trimmed) ||
        p.tokenHash.toLowerCase().includes(trimmed) ||
        p.ownerNationalId.toLowerCase().includes(trimmed) ||
        p.ownerName.toLowerCase().includes(trimmed)
    );

    if (match) {
      setSelectedParcel(match);
    } else {
      setSelectedParcel(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <BackButton to="/" label="Back to Overview" />
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#171A3B] border border-indigo-200 dark:border-indigo-500/30 text-xs font-mono text-indigo-700 dark:text-indigo-300">
            <Lock className="w-3.5 h-3.5 text-[#13C98A]" />
            <span>Public Sovereign Cadastre Verification Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Verify Land Title Deeds & Cadastral Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Instantly validate Certificates of Occupancy (C of O), survey boundary coordinates, and encumbrances directly against the state consensus ledger.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white dark:bg-[#171A3B] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-indigo-500/30 shadow-xl space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search Title Deed Ref (e.g. C-OF-O-2026-004912), NIN, or Token Hash..."
                className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#6338F5] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5229db] transition-colors whitespace-nowrap shadow-md shadow-indigo-600/30"
            >
              Verify On-Chain
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Sample records to test: </span>
            {parcels.slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setQuery(p.titleNumber);
                  setSelectedParcel(p);
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[11px] transition-colors"
              >
                {p.titleNumber} ({p.status})
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        {selectedParcel ? (
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl">
            {/* Top Status Header */}
            <div
              className={`p-6 border-b flex flex-wrap items-center justify-between gap-4 ${
                selectedParcel.status === 'revoked'
                  ? 'bg-rose-950/40 border-rose-900/50'
                  : selectedParcel.status === 'disputed'
                  ? 'bg-amber-950/40 border-amber-900/50'
                  : 'bg-emerald-950/40 border-emerald-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedParcel.status === 'revoked' ? (
                  <XCircle className="w-8 h-8 text-rose-500" />
                ) : selectedParcel.status === 'disputed' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-[#13C98A]" />
                )}
                <div>
                  <div className="text-xs uppercase font-mono font-bold tracking-wider">
                    {selectedParcel.status === 'revoked' && <span className="text-rose-400">STATUS: STATUTORILY REVOKED (TRANSFER LOCKED)</span>}
                    {selectedParcel.status === 'disputed' && <span className="text-amber-400">STATUS: CONFLICT / UNDER REVIEW</span>}
                    {selectedParcel.status === 'verified' && <span className="text-[#13C98A]">STATUS: VALID & ACTIVE TITLE DEED</span>}
                    {selectedParcel.status !== 'revoked' && selectedParcel.status !== 'disputed' && selectedParcel.status !== 'verified' && (
                      <span className="text-indigo-300">STATUS: {selectedParcel.status.replace('_', ' ').toUpperCase()}</span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
                    {selectedParcel.titleNumber}
                  </h2>
                </div>
              </div>

              {selectedParcel.certificateIssued && selectedParcel.status !== 'revoked' && (
                <button
                  onClick={() => setSelectedCertificateParcel(selectedParcel)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Inspect Official C of O</span>
                </button>
              )}
            </div>

            {/* Revocation Alert if applicable */}
            {selectedParcel.status === 'revoked' && (
              <div className="m-6 p-4 rounded-xl bg-rose-900/20 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  Statutory Revocation Memorial Recorded
                </div>
                <p>
                  This title deed was extinguished by Executive Order of the State Governor pursuant to Section 28 of the Land Use Act. No transactions or conveyances can be validated on this parcel.
                </p>
                {selectedParcel.disputeNotes && (
                  <div className="font-mono text-[11px] text-rose-300 mt-1">
                    Notice: {selectedParcel.disputeNotes}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Metadata Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-700/60 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  Parcel & Cadastre Information
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Beneficiary / Owner</span>
                    <span className="text-white font-medium">{selectedParcel.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Owner National ID (NIN)</span>
                    <span className="text-indigo-300 font-mono">{selectedParcel.ownerNationalId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">State & LGA</span>
                    <span className="text-white font-medium">{selectedParcel.state} / {selectedParcel.lga}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">District / Layout</span>
                    <span className="text-white font-medium">{selectedParcel.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Land Use Purpose</span>
                    <span className="text-white font-medium">{selectedParcel.landUse}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cadastral Area</span>
                    <span className="text-white font-mono font-bold">
                      {selectedParcel.sizeSqm.toLocaleString()} sqm ({selectedParcel.sizeHectares} Ha)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Survey Plan Ref</span>
                    <span className="text-amber-400 font-mono">{selectedParcel.surveyPlanNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Licensed Surveyor</span>
                    <span className="text-white font-medium">{selectedParcel.surveyorName}</span>
                  </div>
                </div>

                {selectedParcel.encumbrances.length > 0 && (
                  <div className="pt-2">
                    <span className="text-slate-400 block text-[11px] mb-1">Encumbrances / Easements</span>
                    <div className="space-y-1">
                      {selectedParcel.encumbrances.map((enc, i) => (
                        <div key={i} className="p-2 rounded bg-slate-900 text-amber-300 font-mono text-[11px] border border-amber-500/20">
                          {enc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cryptographic & GIS Coordinates */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-700/60 pb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#13C98A]" />
                  Geodetic Boundary Beacons (WGS-84)
                </h3>

                <div className="bg-[#0e1333] rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800 pb-1">
                    <span>Beacon ID</span>
                    <span>Latitude</span>
                    <span>Longitude</span>
                  </div>
                  {selectedParcel.coordinates.map((c, i) => (
                    <div key={i} className="flex justify-between font-mono text-[11px]">
                      <span className="text-amber-400">{c.beaconNumber}</span>
                      <span className="text-slate-300">{c.lat.toFixed(6)}°</span>
                      <span className="text-slate-300">{c.lng.toFixed(6)}°</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0e1333] rounded-xl p-3 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-400 text-[10px] uppercase">Ledger Proof</div>
                  <div>
                    <span className="text-slate-400">Token Hash: </span>
                    <span className="text-indigo-400 truncate block">{selectedParcel.tokenHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Consensus Block Height: </span>
                    <span className="text-emerald-400">#{selectedParcel.blockNumber}</span>
                  </div>
                </div>

                {/* Live Geodetic Parcel Satellite Map */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>SATELLITE BOUNDARY LOCATION</span>
                    <span className="text-emerald-400">WGS-84</span>
                  </div>
                  <CadastreGoogleMap
                    parcels={[selectedParcel]}
                    selectedParcel={selectedParcel}
                    showBeacons={true}
                    showAllParcels={false}
                    heightClass="h-[220px]"
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-[#171A3B] rounded-2xl border border-slate-800 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Record Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No titled parcel matches '{query}'. Verify that the title number is typed correctly, or test using the sample buttons above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
