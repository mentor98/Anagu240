import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, Search, Filter, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const TransactionHistoryView: React.FC = () => {
  const { transactions } = useApp();
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(search.toLowerCase()) ||
      tx.parcelTitle.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-500" />
          On-Chain Ledger Transaction History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable cryptographic ledger logs of title registrations, cadastral survey attestations, and executive orders.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-[#171A3B] border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tx hash or parcel reference..."
            className="w-full bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Type:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-[#0d122e] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">All Types</option>
            <option value="TITLE_REGISTRATION">Title Registrations</option>
            <option value="SURVEY_ATTESTATION">Survey Attestations</option>
            <option value="REVOCATION_ORDER">Revocation Orders</option>
            <option value="COMMUNITY_SIGN">Community Signoffs</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/25 p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono min-w-[650px]">
            <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Tx Hash</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Block #</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">From</th>
                <th className="py-3 px-3">Parcel Reference</th>
                <th className="py-3 px-3">Gas Fee</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-[#0d122e] transition-colors">
                  <td className="py-3 px-3 text-indigo-400 truncate max-w-[150px]">{tx.hash}</td>
                  <td className="py-3 px-3 text-slate-200 font-sans font-medium text-[11px]">{tx.type}</td>
                  <td className="py-3 px-3 text-emerald-400">#{tx.blockNumber}</td>
                  <td className="py-3 px-3 text-slate-400">{tx.timestamp}</td>
                  <td className="py-3 px-3 text-slate-300 truncate max-w-[120px]">{tx.from}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">{tx.parcelTitle}</td>
                  <td className="py-3 px-3 text-slate-400">{tx.gasFee}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
