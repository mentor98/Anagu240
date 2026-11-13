import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Terminal, Users, Receipt, Cpu, ShieldCheck, CheckCircle2, Lock, Server } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const SysAdminPortal: React.FC = () => {
  const { auditLogs, blocks } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'audit' | 'nodes'>('audit');

  useEffect(() => {
    if (location.pathname.endsWith('/users')) setActiveTab('users');
    else if (location.pathname.endsWith('/permissions')) setActiveTab('matrix');
    else if (location.pathname.endsWith('/consensus')) setActiveTab('nodes');
    else if (location.pathname.endsWith('/audit')) setActiveTab('audit');
  }, [location.pathname]);

  const mockUsers = [
    { name: 'Chief Emeka Adeleke', role: 'Citizen / Landowner', nin: 'NIN-7749-2810-9421', status: 'KYC Verified', wallet: '0x71C...B8e9' },
    { name: 'Surv. Amina Bello, FNIS', role: 'Licensed Surveyor', nin: 'NIN-8821-3940-1102', status: 'Council Licensed', wallet: '0x32A...F41d' },
    { name: 'Barr. Folake Adebayo', role: 'Deeds Registrar', nin: 'NIN-4491-1029-7733', status: 'State Officer', wallet: '0x9E5...7c22' },
    { name: 'Engr. David K. Okon', role: 'Land Administrator', nin: 'NIN-1920-4820-5591', status: 'Ministry Admin', wallet: '0x44B...1890' },
    { name: 'His Excellency Dr. B. A. Al-Hassan', role: 'Executive Governor', nin: 'NIN-0001-9928-1120', status: 'Executive Assent', wallet: '0x1A0...0001' }
  ];

  const permissionMatrix = [
    { action: 'Register Land Application', citizen: true, surveyor: false, registrar: false, admin: false, governor: false },
    { action: 'Lodge Cadastral Survey Plan & Beacons', citizen: false, surveyor: true, registrar: false, admin: true, governor: false },
    { action: 'Review Deeds & Mint C of O Token', citizen: false, surveyor: false, registrar: true, admin: false, governor: false },
    { action: 'Execute Statutory Revocation Order', citizen: false, surveyor: false, registrar: false, admin: false, governor: true },
    { action: 'Modify Consensus Node Parameters', citizen: false, surveyor: false, registrar: false, admin: false, governor: false, sysadmin: true }
  ];

  const consensusNodes = [
    { id: 'Node-01', agency: 'Lagos State Sovereign Bureau of Lands', region: 'eu-west / Lagos-1', role: 'Leader (Raft-BFT)', latency: '18ms', uptime: '99.98%', status: 'ONLINE' },
    { id: 'Node-02', agency: 'Surveyors Council of Nigeria (SURCON)', region: 'Abuja-Central', role: 'Validator Quorum', latency: '24ms', uptime: '99.95%', status: 'ONLINE' },
    { id: 'Node-03', agency: 'Federal High Court Probate & Deeds', region: 'Abuja-Judiciary', role: 'Validator Quorum', latency: '29ms', uptime: '99.97%', status: 'ONLINE' },
    { id: 'Node-04', agency: 'Federal Ministry Land Geo-Cluster', region: 'Multi-Zone Replica', role: 'PostGIS Spatial Oracle', latency: '21ms', uptime: '99.99%', status: 'ONLINE' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-[#6338F5]" />
          System Administration & Audit Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Identity management, role-based access control (RBAC), consensus nodes, and tamper-evident cryptographic audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#171A3B] rounded-xl border border-slate-200 dark:border-slate-800 self-start overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Immutable Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'users' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Directory & KYC
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'matrix' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'nodes' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Consensus Nodes
        </button>
      </div>

      {/* TAB 1: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Cryptographic Audit Log
            </h2>
            <span className="text-[10px] font-mono text-emerald-400">SHA-256 Chained Hashes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Log Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#0d122e] transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-sans font-medium">{log.actor}</div>
                      <div className="text-[10px] text-indigo-400 capitalize">{log.actorRole}</div>
                    </td>
                    <td className="py-2.5 px-3 text-amber-300 font-bold">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans max-w-xs">{log.details}</td>
                    <td className="py-2.5 px-3 text-emerald-400 truncate max-w-[120px]">{log.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700/60">
            <Users className="w-4 h-4 text-indigo-400" />
            Verified Persona Directory
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Full Legal Name</th>
                  <th className="py-2.5 px-3">System Role</th>
                  <th className="py-2.5 px-3">National ID (NIN)</th>
                  <th className="py-2.5 px-3">Wallet Address</th>
                  <th className="py-2.5 px-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mockUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-[#0d122e] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">{u.name}</td>
                    <td className="py-2.5 px-3 text-indigo-300">{u.role}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{u.nin}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{u.wallet}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-700/60">
            <Lock className="w-4 h-4 text-amber-400" />
            Statutory Roles & Access Control Matrix (RBAC)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Protocol Action</th>
                  <th className="py-3 px-3 text-center">Citizen</th>
                  <th className="py-3 px-3 text-center">Surveyor</th>
                  <th className="py-3 px-3 text-center">Registrar</th>
                  <th className="py-3 px-3 text-center">Admin</th>
                  <th className="py-3 px-3 text-center">Governor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {permissionMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0d122e]">
                    <td className="py-3 px-3 text-white font-sans font-semibold">{item.action}</td>
                    <td className="py-3 px-3 text-center">{item.citizen ? '✓ Allowed' : '— Blocked'}</td>
                    <td className="py-3 px-3 text-center">{item.surveyor ? '✓ Allowed' : '— Blocked'}</td>
                    <td className="py-3 px-3 text-center">{item.registrar ? '✓ Allowed' : '— Blocked'}</td>
                    <td className="py-3 px-3 text-center">{item.admin ? '✓ Allowed' : '— Blocked'}</td>
                    <td className="py-3 px-3 text-center text-amber-400">{item.governor ? '✓ Assent Only' : '— Blocked'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONSENSUS NODES */}
      {activeTab === 'nodes' && (
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#168BFF]" />
              Raft-BFT Sovereign Validator Quorum (Block #{blocks[0]?.blockNumber})
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              4 / 4 VALIDATORS IN QUORUM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consensusNodes.map(node => (
              <div key={node.id} className="p-4 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    {node.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {node.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-200">{node.agency}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span>{node.role}</span>
                  <span className="text-indigo-300">{node.latency} · {node.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
