import React from 'react';
import { MapPinOff } from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#171A3B] rounded-2xl border border-slate-200 dark:border-indigo-500/30 p-8 shadow-2xl text-center space-y-4">
        <MapPinOff className="w-12 h-12 text-[#6338F5] mx-auto" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">404</h1>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cadastral Boundary Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          The requested route or deed memorial is not registered on the ANAGU ledger grid.
        </p>

        <div className="pt-2">
          <BackButton to="/" label="Return to Cadastre Overview" className="py-2.5 px-4 text-xs font-bold" />
        </div>
      </div>
    </div>
  );
};
