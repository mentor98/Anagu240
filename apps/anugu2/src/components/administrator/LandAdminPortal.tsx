import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Landmark, Search, Filter, ShieldCheck, MapPin, Eye, Award, Clock } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const LandAdminPortal: React.FC = () => {
  const { parcels, setSelectedCertificateParcel } = useApp();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (location.pathname.endsWith('/disputes')) setStatusFilter('revoked');
    else setStatusFilter('all');
  }, [location.pathname]);

  const filtered = parcels.filter(p => {
    const matchSearch =
      p.titleNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-6 h-6 text-[#168BFF]" />
          Land Administrator Master Cadastre Registry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Federal & State Cadastre Supervision · Chain of Custody & Boundary Ledger
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search master titles, owner names or districts..."
            className="w-full bg-[#0d122e] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0d122e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="all">All Titles</option>
            <option value="verified">Verified Active</option>
            <option value="community_review">Community Review</option>
            <option value="revoked">Statutorily Revoked</option>
          </select>
        </div>
      </div>

      {/* Master Registry Table */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Title Deed Ref</th>
                <th className="py-3 px-3">Owner / Beneficiary</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Land Use</th>
                <th className="py-3 px-3">Cadastral Area</th>
                <th className="py-3 px-3">Valuation</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(parcel => (
                <tr key={parcel.id} className="hover:bg-[#0d122e] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">{parcel.titleNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{parcel.ownerName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{parcel.ownerNationalId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {parcel.district}, {parcel.state}
                  </td>
                  <td className="py-3 px-3 text-indigo-300">{parcel.landUse}</td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {parcel.sizeSqm.toLocaleString()} m² ({parcel.sizeHectares} Ha)
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400">
                    ₦{(parcel.marketValuation / 1000000).toFixed(0)}M
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        parcel.status === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : parcel.status === 'community_review'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {parcel.certificateIssued && (
                      <button
                        onClick={() => setSelectedCertificateParcel(parcel)}
                        className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[11px]"
                      >
                        C of O
                      </button>
                    )}
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
