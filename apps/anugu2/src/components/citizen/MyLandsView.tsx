import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Parcel } from '../../types';
import {
  MapPin,
  Award,
  Search,
  Filter,
  FilePlus,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const MyLandsView: React.FC = () => {
  const { parcels, currentUser, setSelectedCertificateParcel } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLandUse, setFilterLandUse] = useState<string>('all');

  const myParcels = parcels.filter(p => p.ownerId === currentUser.id);

  const filtered = myParcels.filter(p => {
    const matchesSearch =
      p.titleNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.district.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesUse = filterLandUse === 'all' || p.landUse === filterLandUse;

    return matchesSearch && matchesStatus && matchesUse;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#6338F5]" />
            My Titled Land Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage your sovereign titled parcels, geodetic boundaries, and digital Certificates of Occupancy.
          </p>
        </div>

        <Link
          to="/portal/register-land"
          className="px-4 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>Register New Land</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by title deed ref, district or state..."
            className="w-full bg-[#0d122e] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#0d122e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Active</option>
              <option value="community_review">Community Review</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Land Use:</span>
            <select
              value={filterLandUse}
              onChange={e => setFilterLandUse(e.target.value)}
              className="bg-[#0d122e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="all">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Mixed Use">Mixed Use</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parcels Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#171A3B] rounded-2xl border border-slate-800 space-y-3">
          <p className="text-sm text-slate-400">No titled parcels match your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(parcel => (
            <div
              key={parcel.id}
              className="bg-[#171A3B] rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-xl"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
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
                  <div className="font-medium text-white">{parcel.district}</div>
                  <div className="text-slate-400">{parcel.lga}, {parcel.state} State</div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0d122e] text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Area</span>
                    <span className="text-white font-bold">{parcel.sizeSqm.toLocaleString()} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Zoning</span>
                    <span className="text-indigo-300">{parcel.landUse}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beacons</span>
                    <span className="text-amber-400">{parcel.coordinates.length} Pillars</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valuation</span>
                    <span className="text-emerald-400 font-bold">₦{(parcel.marketValuation / 1000000).toFixed(0)}M</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-[#12163b] border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  to={`/portal/lands/${parcel.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Deed</span>
                </Link>

                {parcel.certificateIssued && (
                  <button
                    onClick={() => setSelectedCertificateParcel(parcel)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>C of O Certificate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
