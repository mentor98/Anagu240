import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Layers,
  Receipt,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Server,
  Zap,
  Activity
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const BlockchainExplorer: React.FC = () => {
  const { blocks, transactions } = useApp();
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(blocks[0]?.blockNumber || 0);
  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber) || blocks[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#6338F5]" />
          ANAGU Sovereign Blockchain Cadastre Explorer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Inspect consensus finality, real-time geodetic blocks, validator nodes, and cryptographic land transactions.
        </p>
      </div>

      {/* Explorer KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Latest Block</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">#{blocks[0]?.blockNumber}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Block Time ~3.2s</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Consensus Engine</span>
            <ShieldCheck className="w-4 h-4 text-[#13C98A]" />
          </div>
          <div className="text-xl font-bold text-white">Raft-BFT</div>
          <div className="text-[10px] text-slate-400">Crash & Byzantine Fault Tolerant</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Validator Nodes</span>
            <Server className="w-4 h-4 text-[#168BFF]" />
          </div>
          <div className="text-xl font-bold text-white">4 Sovereign Nodes</div>
          <div className="text-[10px] text-emerald-400">100% Quorum Online</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Avg Gas Per Title</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">0.0028 ETH</div>
          <div className="text-[10px] text-slate-400">Subsidized State Cadastre Fee</div>
        </div>
      </div>

      {/* Main Explorer View: Blocks & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Blocks */}
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Recent Consensus Blocks
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Auto-finalized</span>
          </div>

          <div className="space-y-3">
            {blocks.map(block => (
              <div
                key={block.blockNumber}
                onClick={() => setSelectedBlockNumber(block.blockNumber)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedBlock?.blockNumber === block.blockNumber
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                    : 'bg-[#0d122e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">#{block.blockNumber}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({block.timestamp})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {block.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate mt-1">
                  Hash: {block.hash}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Validator: {block.validator}</span>
                  <span>{block.transactionsCount} txs</span>
                </div>
              </div>
            ))}
          </div>

          {selectedBlock && (
            <div className="p-3.5 rounded-xl bg-[#0a0d20] border border-indigo-500/30 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="text-indigo-400 font-bold uppercase text-[10px]">
                Inspected Block Header #{selectedBlock.blockNumber}
              </div>
              <div className="truncate">Parent Hash: {selectedBlock.parentHash}</div>
              <div>Gas Utilization: {selectedBlock.gasUsed}</div>
            </div>
          )}
        </div>

        {/* Recent Cadastral Transactions */}
        <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Live Cadastral Transactions
            </h2>
            <span className="text-[10px] font-mono text-slate-400">{transactions.length} confirmed</span>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 4).map(tx => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 truncate max-w-[160px]">{tx.hash}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>Parcel: <strong className="text-amber-300">{tx.parcelTitle}</strong></span>
                  <span className="text-slate-400">Gas: {tx.gasFee}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  Signer: {tx.from}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
