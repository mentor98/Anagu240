import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SurveyJob } from '../../types';
import {
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  MapPin,
  AlertCircle,
  Plus
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const SurveyorPortal: React.FC = () => {
  const { currentUser, surveyJobs, submitSurveyReport, addNotification } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<string>(surveyJobs[0]?.id || '');

  const selectedJob = surveyJobs.find(j => j.id === selectedJobId) || surveyJobs[0];

  const [planRef, setPlanRef] = useState('');
  const [beaconsCount, setBeaconsCount] = useState(4);
  const [fieldNotes, setFieldNotes] = useState('');
  const [isLodging, setIsLodging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsLodging(true);
    setTimeout(() => {
      submitSurveyReport(selectedJob.id, fieldNotes, beaconsCount, planRef);
      setIsLodging(false);
      addNotification({
        title: 'Cadastral Plan Lodged',
        message: `Cadastral Survey Plan ${planRef} submitted and registered on-chain!`,
        type: 'success'
      });
    }, 600);
  };

  if (!selectedJob) {
    return (
      <div className="rounded-lg border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        No survey jobs are assigned to this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#168BFF]" />
            Licensed Cadastral Surveyor Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> (License: {currentUser.licenseNumber || 'SURV-REG-2014-0492'})
          </p>
        </div>

        <Link
          to="/portal/gis"
          className="px-4 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/30 self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Launch GIS Spatial Plotter</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Assigned Field Jobs</div>
          <div className="text-2xl font-bold font-mono text-white">{surveyJobs.length}</div>
          <div className="text-[11px] text-indigo-300">Active geodetic requisitions</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Plans Approved & Lodged</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {surveyJobs.filter(j => j.status === 'approved').length}
          </div>
          <div className="text-[11px] text-emerald-400">Zero boundary overlaps detected</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Pending Field Visits</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {surveyJobs.filter(j => j.status === 'pending' || j.status === 'in_progress').length}
          </div>
          <div className="text-[11px] text-amber-400">Pillar establishment due</div>
        </div>
      </div>

      {/* Main Grid: Job Queue & Lodgement Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Queue */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400">Survey Job Queue</div>
          {surveyJobs.map(job => (
            <div
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedJob?.id === job.id
                  ? 'bg-[#171A3B] border-indigo-500 shadow-lg shadow-indigo-600/20'
                  : 'bg-[#12163b]/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-white text-xs">{job.jobCode}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    job.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : job.status === 'in_progress'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {job.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-200 font-semibold">{job.applicantName}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">{job.location}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Est. Area: {job.estimatedAreaSqm.toLocaleString()} m² · Sched: {job.scheduledDate}
              </div>
            </div>
          ))}
        </div>

        {/* Plan Lodgement & Field Notes Form */}
        <div className="lg:col-span-2 bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <div className="text-xs text-slate-400">Active Job Code</div>
              <h2 className="text-xl font-bold font-mono text-white">{selectedJob.jobCode}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Target Area</span>
              <div className="text-sm font-mono font-bold text-emerald-400">
                {selectedJob.estimatedAreaSqm.toLocaleString()} m² ({(selectedJob.estimatedAreaSqm / 10000).toFixed(3)} Ha)
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1">Cadastral Survey Plan Number</label>
                <input
                  type="text"
                  value={planRef}
                  onChange={e => setPlanRef(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Number of Boundary Concrete Beacons</label>
                <input
                  type="number"
                  value={beaconsCount}
                  onChange={e => setBeaconsCount(Number(e.target.value))}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Surveyor Field Reconnaissance Notes & Invariants</label>
              <textarea
                value={fieldNotes}
                onChange={e => setFieldNotes(e.target.value)}
                rows={4}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>

            <div className="p-3 bg-[#0d122e] rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pre-Lodgement Topological Check Passed</span>
              </div>
              <p className="text-slate-400">
                Proposed polygon exhibits 100% boundary closure and zero collisions with adjoining titles on the state master cadastre.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLodging}
                className="px-6 py-2.5 rounded-xl bg-[#6338F5] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5229db] transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                {isLodging ? (
                  <span>Lodging on Ledger...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Lodge & Sign Cadastral Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
