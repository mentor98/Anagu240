import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Award,
  Layers,
  ShieldCheck,
  FileText,
  User,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Send,
  Lock,
  ExternalLink
} from 'lucide-react';
import { BackButton } from '../common/BackButton';
import { CadastreGoogleMap } from '../gis/CadastreGoogleMap';

export const LandDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parcels, setSelectedCertificateParcel, currentRole, addNotification } = useApp();

  const parcel = parcels.find(p => p.id === id) || parcels[0];
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerNIN, setBuyerNIN] = useState('');
  const [buyerWallet, setBuyerWallet] = useState('');
  const [agreedConsideration, setAgreedConsideration] = useState('');

  if (!parcel) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        This parcel is not available in your account.
      </div>
    );
  }

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      title: 'Registry Transfer Application Lodged',
      message: `Registry-Controlled Transfer Lodged for ${parcel.titleNumber}! Application sent to Deeds Registry for Notary Vetting & Governor's Consent.`,
      type: 'success'
    });
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton to="/portal/my-lands" label="Back to My Lands" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono">{parcel.titleNumber}</h1>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                  parcel.status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {parcel.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Token ID: <span className="font-mono text-indigo-400">{parcel.tokenHash}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {parcel.certificateIssued && (
            <button
              onClick={() => setSelectedCertificateParcel(parcel)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              <span>Digital Certificate (C of O)</span>
            </button>
          )}

          {parcel.status === 'verified' && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#6338F5] hover:bg-[#5229db] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
              <span>Registry Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + GIS Geometry Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details and Beacons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cadastre Overview Card */}
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <MapPin className="w-4 h-4 text-[#6338F5]" />
              Cadastral Identity & Location
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Beneficiary Owner</span>
                <span className="text-white font-medium">{parcel.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">National Identification (NIN)</span>
                <span className="text-indigo-300 font-mono">{parcel.ownerNationalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Geographic District</span>
                <span className="text-white font-medium">{parcel.district}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">LGA & State</span>
                <span className="text-white font-medium">{parcel.lga}, {parcel.state}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cadastral Area</span>
                <span className="text-white font-mono font-bold">
                  {parcel.sizeSqm.toLocaleString()} m² ({parcel.sizeHectares} Ha)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approved Land Use</span>
                <span className="text-white font-medium">{parcel.landUse}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Survey Plan Ref</span>
                <span className="text-amber-400 font-mono">{parcel.surveyPlanNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Licensed Surveyor</span>
                <span className="text-slate-300">{parcel.surveyorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registration Date</span>
                <span className="text-slate-300">{parcel.dateRegistered}</span>
              </div>
            </div>
          </div>

          {/* Beacon Coordinates Table */}
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#13C98A]" />
                Geodetic Perimeter Beacons (WGS-84)
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Differential GPS Confirmed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[11px] text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="py-2 px-3">Beacon Pillar Ref</th>
                    <th className="py-2 px-3">Latitude (°N)</th>
                    <th className="py-2 px-3">Longitude (°E)</th>
                    <th className="py-2 px-3">UTM Easting</th>
                    <th className="py-2 px-3">UTM Northing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parcel.coordinates.map((coord, i) => (
                    <tr key={coord.id || i} className="hover:bg-[#0d122e]">
                      <td className="py-2 px-3 text-amber-400 font-bold">{coord.beaconNumber}</td>
                      <td className="py-2 px-3 text-slate-200">{coord.lat.toFixed(6)}°</td>
                      <td className="py-2 px-3 text-slate-200">{coord.lng.toFixed(6)}°</td>
                      <td className="py-2 px-3 text-slate-400">{coord.easting || '552,140'} m</td>
                      <td className="py-2 px-3 text-slate-400">{coord.northing || '711,920'} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Encumbrances & Memorials */}
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Encumbrances & Statutory Memorials
            </h2>
            {parcel.encumbrances.length === 0 ? (
              <p className="text-xs text-emerald-400 font-medium">
                ✓ Clean Title: Zero liens, mortgages, or statutory easements recorded against this deed.
              </p>
            ) : (
              <div className="space-y-2">
                {parcel.encumbrances.map((enc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                    {enc}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: SVG Geometry & IPFS Hash */}
        <div className="space-y-6">
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#168BFF]" />
                Cadastral Boundary Map (WGS-84)
              </h2>
              <span className="text-[10px] font-mono text-emerald-400">EPSG:4326</span>
            </div>

            {/* Live Satellite / Roadmap Parcel Boundary Map */}
            <CadastreGoogleMap
              parcels={[parcel]}
              selectedParcel={parcel}
              showBeacons={true}
              showAllParcels={false}
              heightClass="h-[230px]"
              compact={true}
            />

            <Link
              to="/portal/gis"
              className="block w-full py-2 text-center rounded-xl bg-[#0d122e] border border-slate-700 text-slate-200 hover:border-indigo-500 text-xs font-semibold transition-colors"
            >
              Open in Full GIS Spatial Engine
            </Link>
          </div>

          {/* Cryptographic Ledger Invariants */}
          <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 space-y-3 text-xs font-mono">
            <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              Cryptographic Invariants
            </h3>
            <div>
              <span className="text-slate-400 text-[10px] block">Smart Contract Standard</span>
              <span className="text-white">ERC-721-STATE-CADASTRE</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">IPFS Document CID</span>
              <span className="text-indigo-300 break-all">{parcel.ipfsDocumentHash}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Block Height</span>
              <span className="text-emerald-400">#{parcel.blockNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registry-Controlled Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#171A3B] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#6338F5]" />
                Apply for Registry-Controlled Transfer
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Statutory Notice:</strong> Under the Land Use Act, direct peer-to-peer NFT conveyances are blocked by protocol smart contracts. Title transfer requires Deeds Registry verification, Stamp Duty clearance, and Governor's Consent.
              </span>
            </div>

            <form onSubmit={handleInitiateTransfer} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Purchaser / Assignee Full Legal Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="e.g. Alh. Farouk Dantata"
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Purchaser National ID (NIN) or RC Number</label>
                <input
                  type="text"
                  value={buyerNIN}
                  onChange={e => setBuyerNIN(e.target.value)}
                  placeholder="e.g. NIN-9912-3849-0012"
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Agreed Consideration (Transaction Value in ₦)</label>
                <input
                  type="text"
                  value={agreedConsideration}
                  onChange={e => setAgreedConsideration(e.target.value)}
                  placeholder="e.g. 350,000,000"
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#6338F5] text-white font-bold hover:bg-[#5229db]"
                >
                  Submit Transfer Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
