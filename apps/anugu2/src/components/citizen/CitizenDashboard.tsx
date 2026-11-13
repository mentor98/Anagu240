import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Award,
  Clock,
  Receipt,
  FilePlus,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser, parcels, applications, transactions, setSelectedCertificateParcel } = useApp();

  const myParcels = parcels.filter(p => p.ownerId === currentUser.id);
  const myApplications = applications.filter(a => a.applicantId === currentUser.id);

  const totalValuation = myParcels.reduce((acc, p) => acc + (p.status !== 'revoked' ? p.marketValuation : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Strip */}
      <div className="bg-gradient-to-r from-[#171A3B] to-[#12163b] rounded-2xl p-6 border border-indigo-500/25 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#13C98A]" />
            <span>Sovereign Citizen Cadastre Vault</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            National ID: <span className="font-mono text-indigo-300">{currentUser.nationalId}</span> · Wallet: <span className="font-mono text-slate-300">{currentUser.walletAddress}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/portal/register-land"
            className="px-4 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FilePlus className="w-4 h-4" />
            <span>Register New Parcel</span>
          </Link>
          <Link
            to="/portal/gis"
            className="px-4 py-2.5 rounded-xl bg-[#0d122e] border border-slate-700 text-slate-200 text-xs font-semibold hover:border-indigo-500 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#13C98A]" />
            <span>Open GIS</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Title Deeds</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {myParcels.filter(p => p.status === 'verified').length}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Cryptographically Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Land Portfolio Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ₦{(totalValuation / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-400">
            Estimated market asset value
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Applications</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {myApplications.filter(a => a.status !== 'approved' && a.status !== 'rejected').length}
          </div>
          <div className="text-[11px] text-indigo-300">
            In survey or community attestation
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Guarded Beacons</span>
            <MapPin className="w-4 h-4 text-[#168BFF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {myParcels.reduce((acc, p) => acc + p.coordinates.length, 0)}
          </div>
          <div className="text-[11px] text-slate-400">
            WGS-84 Pillars recorded on ledger
          </div>
        </div>
      </div>

      {/* Main Grid: My Land Titles & Active Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Land Titles */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/20 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6338F5]" />
              My Titled Land Assets
            </h2>
            <Link
              to="/portal/my-lands"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {myParcels.map(parcel => (
              <div
                key={parcel.id}
                className="p-4 rounded-xl bg-[#0d122e] border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{parcel.titleNumber}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        parcel.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : parcel.status === 'community_review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {parcel.district}, {parcel.lga}, {parcel.state} State · <span className="text-indigo-300">{parcel.landUse}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Area: {parcel.sizeSqm.toLocaleString()} m² ({parcel.sizeHectares} Ha) · Valuation: ₦{(parcel.marketValuation / 1000000).toFixed(0)}M
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {parcel.certificateIssued && (
                    <button
                      onClick={() => setSelectedCertificateParcel(parcel)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>C of O</span>
                    </button>
                  )}
                  <Link
                    to={`/portal/lands/${parcel.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Application Tracker */}
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/20 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Application Tracker
            </h2>
            <Link
              to="/portal/applications"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Details
            </Link>
          </div>

          <div className="space-y-4">
            {myApplications.map(app => (
              <div key={app.id} className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{app.applicationNumber}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {app.district}, {app.state}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Neighbor Attestations:</span>
                    <span className="text-emerald-400">{app.attestationsCount} / {app.requiredAttestations}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#6338F5] to-[#13C98A] h-full"
                      style={{ width: `${(app.attestationsCount / app.requiredAttestations) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-snug pt-1">
                  {app.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent On-Chain Ledger Events */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/20 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Recent Blockchain Ledger Transactions
          </h2>
          <Link
            to="/portal/explorer"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Full Block Explorer
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Transaction Hash</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Block</th>
                <th className="py-2.5 px-3">Parcel Ref</th>
                <th className="py-2.5 px-3">Signer Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {transactions.slice(0, 4).map(tx => (
                <tr key={tx.id} className="hover:bg-[#0d122e] transition-colors">
                  <td className="py-2.5 px-3 text-indigo-400 truncate max-w-[140px]">{tx.hash}</td>
                  <td className="py-2.5 px-3 text-slate-200">{tx.type}</td>
                  <td className="py-2.5 px-3 text-emerald-400">#{tx.blockNumber}</td>
                  <td className="py-2.5 px-3 text-amber-300">{tx.parcelTitle}</td>
                  <td className="py-2.5 px-3 text-slate-300 capitalize">{tx.signerRole}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
