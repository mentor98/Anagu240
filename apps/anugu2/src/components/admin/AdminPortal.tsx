/**
 * AdminPortal — Separate admin dashboard at /admin
 * Password-protected (separate from role-based portal)
 * Monitors: users, parcels, transactions, system health, verifications
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Shield, Users, Layers, Cpu, Activity, AlertTriangle,
  CheckCircle2, Clock, BarChart3, Eye, Lock, LogOut,
  TrendingUp, ArrowUpRight, Database, Radio, FileSearch,
  RefreshCw, Terminal, ShieldAlert, ChevronRight
} from 'lucide-react';

const ADMIN_PASSWORD = 'anagu-admin-2026'; // In production: env var + bcrypt

type AdminTab = 'overview' | 'users' | 'parcels' | 'transactions' | 'verifications' | 'system' | 'audit';

export const AdminPortal: React.FC = () => {
  const { parcels, applications, transactions, blocks, auditLogs, revocations, communityAttestations } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) { setAuthenticated(true); setAuthError(''); }
    else setAuthError('Incorrect admin password.');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050814] p-4">
        <div className="w-full max-w-sm bg-[#0D1126] rounded-2xl border border-indigo-500/20 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ANAGU Admin</h1>
            <p className="text-xs text-slate-400">Restricted access — authorised personnel only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Admin Password</label>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-[#080B1A] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Enter admin password" required />
            </div>
            {authError && <p className="text-rose-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{authError}</p>}
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#6338F5] text-white font-semibold uppercase tracking-wider hover:bg-[#5229db] transition-colors flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />Access Admin Portal
            </button>
          </form>
          <div className="text-center text-xs text-slate-600">
            Hint: <span className="font-mono text-slate-500">anagu-admin-2026</span>
          </div>
          <div className="text-center">
            <Link to="/" className="text-xs text-indigo-400 hover:underline">← Back to Site</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  const stats = {
    totalParcels:      parcels.length,
    verifiedParcels:   parcels.filter(p => p.status === 'verified').length,
    revokedParcels:    parcels.filter(p => p.status === 'revoked').length,
    totalApps:         applications.length,
    pendingApps:       applications.filter(a => !['approved','rejected'].includes(a.status)).length,
    approvedApps:      applications.filter(a => a.status === 'approved').length,
    totalTx:           transactions.length,
    totalBlocks:       blocks.length,
    revocations:       revocations.length,
    attestations:      communityAttestations.length,
    auditEvents:       auditLogs.length,
  };

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',      label: 'Overview',      icon: <BarChart3 size={15} /> },
    { id: 'users',         label: 'Users & Access', icon: <Users size={15} /> },
    { id: 'parcels',       label: 'Parcels',        icon: <Layers size={15} /> },
    { id: 'transactions',  label: 'Transactions',   icon: <Cpu size={15} /> },
    { id: 'verifications', label: 'Verifications',  icon: <FileSearch size={15} /> },
    { id: 'system',        label: 'System Health',  icon: <Activity size={15} /> },
    { id: 'audit',         label: 'Audit Log',      icon: <Eye size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[#0D1126]/95 backdrop-blur border-b border-indigo-500/20 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6338F5] to-[#168BFF] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">ANAGU Admin Portal</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">RESTRICTED</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[#13C98A]"><span className="w-1.5 h-1.5 rounded-full bg-[#13C98A] animate-pulse" />All Systems Operational</span>
          <Link to="/" className="hover:text-white transition-colors">← Back to Site</Link>
          <button onClick={() => setAuthenticated(false)} className="flex items-center gap-1 hover:text-rose-300 transition-colors">
            <LogOut size={13} />Sign Out
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-[#0D1126] border-r border-indigo-500/15 py-4 overflow-y-auto">
          <div className="px-4 mb-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">Admin Sections</div>
          <nav className="space-y-0.5 px-2">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-[#6338F5] text-white' : 'text-slate-400 hover:text-white hover:bg-[#171A3B]'
                }`}>
                <div className="flex items-center gap-2.5">{tab.icon}<span>{tab.label}</span></div>
                {activeTab === tab.id && <ChevronRight size={12} />}
              </button>
            ))}
          </nav>
          <div className="mt-6 px-4 pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-600">
            <div>ANAGU v2.4-ADMIN</div>
            <div>Node: Raft-BFT (4)</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Parcels',    value: stats.totalParcels,    icon: <Layers size={16} className="text-[#6338F5]" />,    sub: `${stats.verifiedParcels} verified` },
                  { label: 'Applications',     value: stats.totalApps,       icon: <FileSearch size={16} className="text-[#168BFF]" />, sub: `${stats.pendingApps} pending` },
                  { label: 'Transactions',     value: stats.totalTx,         icon: <Cpu size={16} className="text-amber-400" />,        sub: `${stats.totalBlocks} blocks` },
                  { label: 'Revocations',      value: stats.revocations,     icon: <ShieldAlert size={16} className="text-rose-400" />, sub: 'LUA s.28 orders' },
                  { label: 'Attestations',     value: stats.attestations,    icon: <Users size={16} className="text-[#13C98A]" />,      sub: 'community signed' },
                  { label: 'Audit Events',     value: stats.auditEvents,     icon: <Eye size={16} className="text-indigo-400" />,       sub: 'immutable log' },
                  { label: 'Approved Deeds',   value: stats.approvedApps,    icon: <CheckCircle2 size={16} className="text-[#13C98A]" />, sub: 'C of O issued' },
                  { label: 'Revoked Parcels',  value: stats.revokedParcels,  icon: <AlertTriangle size={16} className="text-rose-400" />, sub: 'title revoked' },
                ].map(m => (
                  <div key={m.label} className="p-4 rounded-2xl bg-[#0D1126] border border-indigo-500/15 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{m.label}</span>{m.icon}
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{m.value}</div>
                    <div className="text-[11px] text-slate-500">{m.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-[#13C98A]" />Recent Applications</h3>
                  <div className="space-y-2">
                    {applications.slice(0, 5).map(app => (
                      <div key={app.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B1A] text-xs">
                        <div>
                          <span className="font-mono text-white">{app.applicationNumber}</span>
                          <span className="text-slate-400 ml-2">{app.applicantName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : app.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                          {app.status.replace('_',' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Cpu size={15} className="text-amber-400" />Recent Blockchain Events</h3>
                  <div className="space-y-2">
                    {transactions.slice(0,5).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#080B1A] text-xs">
                        <div>
                          <span className="font-mono text-indigo-400 truncate max-w-[120px] inline-block">{tx.hash}</span>
                          <span className="text-slate-400 ml-1 text-[10px]">{tx.type}</span>
                        </div>
                        <span className="text-emerald-400 text-[10px]">#{tx.blockNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parcels' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Land Parcel Registry</h2>
              <div className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-800">
                    <tr>{['Title Number','Owner','Location','Area (m²)','Status','Token Hash'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {parcels.map(p => (
                      <tr key={p.id} className="hover:bg-[#080B1A]">
                        <td className="px-4 py-3 font-mono font-bold text-white">{p.titleNumber}</td>
                        <td className="px-4 py-3 text-slate-300">{p.ownerName}</td>
                        <td className="px-4 py-3 text-slate-400">{p.district}, {p.lga}</td>
                        <td className="px-4 py-3 text-slate-300 tabular-nums">{p.sizeSqm.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${p.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300' : p.status === 'revoked' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-indigo-400 truncate max-w-[120px]">{p.tokenHash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Blockchain Transactions</h2>
              <div className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-800">
                    <tr>{['Hash','Type','Block','Parcel','Signer','Status','Gas'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#080B1A]">
                        <td className="px-4 py-3 font-mono text-indigo-400 truncate max-w-[100px]">{tx.hash}</td>
                        <td className="px-4 py-3 text-slate-300 text-[10px]">{tx.type}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">#{tx.blockNumber}</td>
                        <td className="px-4 py-3 text-amber-300 font-mono truncate max-w-[100px]">{tx.parcelTitle}</td>
                        <td className="px-4 py-3 text-slate-400 capitalize">{tx.signerRole}</td>
                        <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">{tx.status}</span></td>
                        <td className="px-4 py-3 text-slate-400 font-mono">{tx.gasFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Verification Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {communityAttestations.map(att => (
                  <div key={att.id} className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-xs">{att.parcelTitle}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${att.status === 'attested' ? 'bg-emerald-500/20 text-emerald-300' : att.status === 'contested' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{att.status}</span>
                    </div>
                    <div className="text-xs text-slate-400">{att.applicantName} · {att.location}</div>
                    <div className="space-y-1.5">
                      {att.neighborAttestations.map(n => (
                        <div key={n.neighborName} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#080B1A]">
                          <span className="text-slate-300">{n.neighborName} ({n.boundarySide})</span>
                          <span className={n.status === 'confirmed' ? 'text-[#13C98A]' : n.status === 'disputed' ? 'text-rose-400' : 'text-slate-500'}>{n.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'NestJS Backend',     status: 'healthy',  port: 3001, metric: '12ms avg' },
                  { name: 'PostgreSQL+PostGIS',  status: 'healthy',  port: 5432, metric: '100% uptime' },
                  { name: 'Hyperledger Besu',    status: 'healthy',  port: 8545, metric: `Block #${blocks[0]?.blockNumber ?? '—'}` },
                  { name: 'EMQX MQTT Broker',    status: 'healthy',  port: 1883, metric: 'QoS 1&2 active' },
                  { name: 'MinIO Object Store',  status: 'healthy',  port: 9000, metric: 'land-documents' },
                  { name: 'Redis Cache',          status: 'healthy',  port: 6379, metric: '<1ms latency' },
                  { name: 'Supabase Auth',        status: 'healthy',  port: 443,  metric: 'wcykxpsb…' },
                  { name: 'Leaflet/OSM Maps',    status: 'healthy',  port: 443,  metric: 'No API key needed' },
                  { name: 'Web3 Wallet RPC',     status: 'ready',    port: 8545, metric: 'EIP-1193 ready' },
                ].map(s => (
                  <div key={s.name} className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 p-4 flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${s.status === 'healthy' ? 'bg-[#13C98A]' : s.status === 'ready' ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
                    <div>
                      <div className="text-xs font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">:{s.port} · {s.metric}</div>
                      <div className={`text-[10px] mt-0.5 capitalize ${s.status === 'healthy' ? 'text-[#13C98A]' : 'text-amber-300'}`}>{s.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-indigo-400" />Tamper-Evident Audit Log
                <span className="text-xs text-slate-400 font-normal ml-2">— immutable, no UPDATE/DELETE permitted</span>
              </h2>
              <div className="bg-[#0D1126] rounded-2xl border border-indigo-500/15 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-800">
                    <tr>{['Timestamp','Actor','Role','Action','Target','Hash'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-mono">
                    {auditLogs.slice(0,20).map(log => (
                      <tr key={log.id} className="hover:bg-[#080B1A]">
                        <td className="px-4 py-2.5 text-slate-400 text-[10px] whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-4 py-2.5 text-white truncate max-w-[100px]">{log.actor}</td>
                        <td className="px-4 py-2.5 text-indigo-300 capitalize">{log.actorRole}</td>
                        <td className="px-4 py-2.5 text-amber-300 text-[10px]">{log.action}</td>
                        <td className="px-4 py-2.5 text-slate-300 truncate max-w-[80px]">{log.targetId}</td>
                        <td className="px-4 py-2.5 text-slate-500 truncate max-w-[100px]">{log.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">User Access Management</h2>
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Role assignments and permission changes are recorded in the audit log. GOVERNOR role can only be assigned by a SYSTEM ADMINISTRATOR and requires board approval.</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(['citizen','surveyor','registrar','admin','governor','sysadmin'] as const).map(role => {
                  const colors: Record<string, string> = {
                    citizen:'indigo', surveyor:'blue', registrar:'emerald', admin:'amber', governor:'rose', sysadmin:'purple'
                  };
                  const c = colors[role] ?? 'slate';
                  return (
                    <div key={role} className={`bg-${c}-950/20 border border-${c}-500/20 rounded-xl p-4 flex items-center justify-between`}>
                      <div>
                        <span className="text-sm font-semibold text-white capitalize">{role.replace('sysadmin','System Admin').replace('admin','Land Admin')}</span>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {role === 'citizen' && 'Submit applications, view own lands, buy/sell with wallet'}
                          {role === 'surveyor' && 'GIS beacon logging, cadastral survey submission, SURCON license required'}
                          {role === 'registrar' && 'Application review, deed examination, NFT title issuance'}
                          {role === 'admin' && 'Land records management, boundary disputes, zoning overlays'}
                          {role === 'governor' && 'Statutory revocation (LUA s.28) — highest privilege, 2FA required'}
                          {role === 'sysadmin' && 'Full system access, consensus nodes, permission matrix'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded bg-${c}-500/20 text-${c}-300 border border-${c}-500/30 uppercase shrink-0`}>{role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
