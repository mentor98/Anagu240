import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

export const SimulationBanner: React.FC = () => {
  const { isOfflineMode, toggleOfflineMode, offlineQueueCount, syncOfflineQueue } = useApp();

  return (
    <div className="bg-slate-100 dark:bg-[#0c102b] border-b border-slate-200 dark:border-indigo-500/20 text-xs text-slate-600 dark:text-slate-300 py-1.5 px-3 sm:px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">DEMO SIMULATION</span>
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-500">·</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 text-[11px]">
            Cryptographic titles, GIS validations & smart contract states are simulated locally
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-[11px]">
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
              isOfflineMode
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Toggle offline cadastral caching simulation"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span>Offline ({offlineQueueCount} queued)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span>MQTT Online</span>
              </>
            )}
          </button>

          {isOfflineMode && offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Flush</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3 h-3 text-[#13C98A]" />
            <span>Raft-BFT (4 Nodes)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
