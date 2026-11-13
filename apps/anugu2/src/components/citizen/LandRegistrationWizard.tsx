import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LandUse, TenureType } from '../../types';
import {
  FilePlus,
  Landmark,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Compass,
  Users
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const LandRegistrationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, registerLandApplication } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Tenure & Classification
  const [tenureType, setTenureType] = useState<TenureType>('Statutory');
  const [landUse, setLandUse] = useState<LandUse>('Residential');
  const [historicalRef, setHistoricalRef] = useState('Deed of Conveyance Vol. 144 / Page 82 registered at Lagos Deeds Registry');
  const [notes, setNotes] = useState('Cornerpiece residential parcel inherited with family allotment documentation.');

  // STEP 2: Location & Spatial Coordinates
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Eti-Osa');
  const [district, setDistrict] = useState('Ikate Elegushi Cadastral Layout');
  const [estimatedAreaSqm, setEstimatedAreaSqm] = useState(1800);
  const [beacons, setBeacons] = useState([
    { beacon: 'BC-01', lat: '6.4382', lng: '3.4715', easting: '547120.4', northing: '712400.8' },
    { beacon: 'BC-02', lat: '6.4389', lng: '3.4721', easting: '547180.2', northing: '712410.5' },
    { beacon: 'BC-03', lat: '6.4384', lng: '3.4728', easting: '547190.6', northing: '712330.1' },
    { beacon: 'BC-04', lat: '6.4377', lng: '3.4722', easting: '547130.0', northing: '712320.4' }
  ]);

  // STEP 3: Boundary Neighbors & Surveyor Linkage
  const [northNeighbor, setNorthNeighbor] = useState('Chief Alhaji T. Balogun (Plot 18, Ikate)');
  const [southNeighbor, setSouthNeighbor] = useState('Engr. Mrs. Kemi Olatunji (Plot 20, Ikate)');
  const [eastNeighbor, setEastNeighbor] = useState('Proposed 15m Cadastral Access Road');
  const [westNeighbor, setWestNeighbor] = useState('Eti-Osa Local Government Primary Drain Reserve');
  const [surveyorSurconNo, setSurveyorSurconNo] = useState('SURCON/REG/2014/0492');
  const [surveyorName, setSurveyorName] = useState('Surv. Amina Bello, FNIS');

  // STEP 4: Legal Documents
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Family_Deed_of_Assignment_Signed.pdf', size: '2.4 MB', type: 'application/pdf' },
    { name: 'Approved_Perimeter_Survey_Plan.pdf', size: '3.8 MB', type: 'application/pdf' },
    { name: 'Official_Treasury_Receipt_2026.pdf', size: '820 KB', type: 'application/pdf' }
  ]);

  // STEP 5: Review & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [swornDeclarationAccepted, setSwornDeclarationAccepted] = useState(true);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || 'application/pdf'
        }
      ]);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swornDeclarationAccepted) return;
    setIsSubmitting(true);

    setTimeout(() => {
      registerLandApplication({
        applicantName: currentUser.name,
        applicantPhone: currentUser.phone || '+234 803 555 0192',
        applicantEmail: currentUser.email,
        tenureType,
        state,
        lga,
        district,
        landUse,
        estimatedAreaSqm,
        northNeighbor,
        southNeighbor,
        eastNeighbor,
        westNeighbor,
        surveyorSurconNo,
        assignedSurveyor: surveyorName,
        notes: `${notes} [Historical Ref: ${historicalRef}]`,
        documents: uploadedFiles.map(f => ({
          ...f,
          uploadedAt: new Date().toISOString().substring(0, 10)
        }))
      });

      setIsSubmitting(false);
      navigate('/portal/applications');
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-[#6338F5]" />
          Land Parcel Onboarding Wizard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Lodge statutory or customary land parcel into the 8-Stage ANAGU Cadastral Pipeline pursuant to the Land Use Act (1978).
        </p>
      </div>

      {/* Authenticated Applicant Badge */}
      <div className="p-3.5 rounded-xl bg-[#171A3B] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-white font-medium flex items-center gap-2">
              <span>Lodging as: {currentUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {currentUser.nationalId}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{currentUser.email} · {currentUser.phone || '+234 803 555 0192'}</div>
          </div>
        </div>
        <div className="text-right text-[11px] text-indigo-300 font-mono">
          Identity Tier 3 Pre-Verified
        </div>
      </div>

      {/* 5-Step Progress Indicator */}
      <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#171A3B] rounded-2xl border border-slate-800 text-[11px]">
        {[
          { step: 1, label: '1. Tenure & Class' },
          { step: 2, label: '2. Location & Beacons' },
          { step: 3, label: '3. Boundaries & Survey' },
          { step: 4, label: '4. Legal Deeds' },
          { step: 5, label: '5. Review & Swear' }
        ].map(item => (
          <div
            key={item.step}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl font-semibold transition-all text-center ${
              currentStep === item.step
                ? 'bg-[#6338F5] text-white shadow'
                : currentStep > item.step
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'text-slate-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                currentStep === item.step
                  ? 'bg-white text-[#6338F5]'
                  : currentStep > item.step
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {item.step}
            </span>
            <span className="hidden md:inline truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Wizard Form Panels */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-6 sm:p-8 shadow-2xl">
        {/* STEP 1: TENURE CLAIM & CLASSIFICATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <Landmark className="w-4 h-4 text-[#6338F5]" />
              Step 1: Land Tenure Claim & Legal Classification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 text-xs font-medium">Tenure Regime</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0d122e] rounded-xl border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setTenureType('Statutory')}
                    className={`py-2 rounded-lg font-semibold transition-colors ${
                      tenureType === 'Statutory' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Statutory C of O
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenureType('Customary')}
                    className={`py-2 rounded-lg font-semibold transition-colors ${
                      tenureType === 'Customary' ? 'bg-[#6338F5] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Customary / Communal
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {tenureType === 'Statutory'
                    ? 'State Government statutory grant under Land Use Act (1978) Section 5.'
                    : 'Indigenous customary landholder rights verified via Traditional Council & Family Trustees.'}
                </p>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 text-xs font-medium">Designated Land Use</label>
                <select
                  value={landUse}
                  onChange={e => setLandUse(e.target.value as LandUse)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Government Reserve">Government Reserve</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-medium">
                Root of Title / Historical Memorial Reference
              </label>
              <input
                type="text"
                value={historicalRef}
                onChange={e => setHistoricalRef(e.target.value)}
                placeholder="e.g. Deed of Assignment / Chieftaincy Family Grant / Gazette Notice"
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-medium">Parcel Background & Acquisition History</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <span>Proceed to Location & Beacons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SPATIAL LOCATION & WGS 84 BEACONS */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <MapPin className="w-4 h-4 text-[#168BFF]" />
              Step 2: Geographic Parcel Location & WGS 84 Cadastral Beacons
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">State Jurisdiction</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Lagos">Lagos State</option>
                  <option value="FCT Abuja">Federal Capital Territory (Abuja)</option>
                  <option value="Ogun">Ogun State</option>
                  <option value="Rivers">Rivers State</option>
                  <option value="Kano">Kano State</option>
                  <option value="Kaduna">Kaduna State</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Local Government Area (LGA)</label>
                <input
                  type="text"
                  value={lga}
                  onChange={e => setLga(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Cadastral Layout / District</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Estimated Area (Square Metres)</label>
                <input
                  type="number"
                  value={estimatedAreaSqm}
                  onChange={e => setEstimatedAreaSqm(Number(e.target.value))}
                  className="w-full bg-[#0d122e] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Calculated Metric Dimensions</label>
                <div className="w-full bg-[#0d122e] border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold flex items-center justify-between">
                  <span>{(estimatedAreaSqm / 10000).toFixed(3)} Hectares</span>
                  <span className="text-slate-400 text-[11px] font-normal">Approx. {(estimatedAreaSqm / 648).toFixed(1)} Standard Plots</span>
                </div>
              </div>
            </div>

            {/* WGS 84 Beacon Coordinate Entry Table */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cadastral Boundary Beacons (WGS 84 / EPSG:4326)</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">PostGIS Validated 0.5m Tolerance</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0d122e]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800 bg-[#12163b]/50">
                    <tr>
                      <th className="py-2 px-3">Beacon ID</th>
                      <th className="py-2 px-3">Latitude (°N)</th>
                      <th className="py-2 px-3">Longitude (°E)</th>
                      <th className="py-2 px-3">Easting (m)</th>
                      <th className="py-2 px-3">Northing (m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
                    {beacons.map((b, i) => (
                      <tr key={b.beacon} className="hover:bg-[#15193d]">
                        <td className="py-2 px-3 text-indigo-400 font-bold">{b.beacon}</td>
                        <td className="py-2 px-3 text-slate-200">{b.lat}</td>
                        <td className="py-2 px-3 text-slate-200">{b.lng}</td>
                        <td className="py-2 px-3 text-slate-400">{b.easting}</td>
                        <td className="py-2 px-3 text-slate-400">{b.northing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <span>Proceed to Boundaries & Survey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BOUNDARY NEIGHBORS & SURVEYOR ACCREDITATION */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <Users className="w-4 h-4 text-[#13C98A]" />
              Step 3: Perimeter Abutting Neighbors & Surveyor Accreditation
            </h2>
            <p className="text-xs text-slate-400">
              Provide declarations for the four abutting perimeter boundaries for the statutory 21-day community attestation window.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-mono font-bold text-[11px] block">North Boundary (Cardinal 0°)</span>
                <input
                  type="text"
                  value={northNeighbor}
                  onChange={e => setNorthNeighbor(e.target.value)}
                  placeholder="Adjacent Landowner Name / Plot #"
                  className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-mono font-bold text-[11px] block">South Boundary (Cardinal 180°)</span>
                <input
                  type="text"
                  value={southNeighbor}
                  onChange={e => setSouthNeighbor(e.target.value)}
                  placeholder="Adjacent Landowner Name / Plot #"
                  className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-mono font-bold text-[11px] block">East Boundary (Cardinal 90°)</span>
                <input
                  type="text"
                  value={eastNeighbor}
                  onChange={e => setEastNeighbor(e.target.value)}
                  placeholder="Adjacent Landowner / Road Name"
                  className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d122e] border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-mono font-bold text-[11px] block">West Boundary (Cardinal 270°)</span>
                <input
                  type="text"
                  value={westNeighbor}
                  onChange={e => setWestNeighbor(e.target.value)}
                  placeholder="Adjacent Landowner / Natural Boundary"
                  className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>

            {/* Accredited Geomatics Surveyor Link */}
            <div className="p-4 rounded-xl bg-[#0d122e] border border-indigo-500/30 space-y-3 text-xs">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Accredited Geomatics Cadastral Surveyor</span>
                <span className="text-[10px] text-emerald-400 font-mono">SURCON Reg Validated</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Surveyor Name</label>
                  <input
                    type="text"
                    value={surveyorName}
                    onChange={e => setSurveyorName(e.target.value)}
                    className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">SURCON License Seal Number</label>
                  <input
                    type="text"
                    value={surveyorSurconNo}
                    onChange={e => setSurveyorSurconNo(e.target.value)}
                    className="w-full bg-[#12163b] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <span>Proceed to Legal Instruments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LEGAL DEEDS & DOCUMENTS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <Upload className="w-4 h-4 text-amber-400" />
              Step 4: Upload Legal Instruments & Proof of Title
            </h2>

            {/* Drag & Drop Area */}
            <label className="block p-7 border-2 border-dashed border-indigo-500/40 rounded-2xl bg-[#0d122e] text-center cursor-pointer hover:border-indigo-400 transition-colors">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Click or drag documents to simulate IPFS staging</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Deed of Conveyance, Survey Plan, Chieftaincy Letter, Treasury Receipt (PDF up to 25MB)
              </p>
              <input type="file" onChange={handleAddFile} className="hidden" />
            </label>

            {/* Attached Documents List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Staged Documents ({uploadedFiles.length}):</div>
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0d122e] border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-white truncate">{file.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">({file.size})</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>IPFS Staged</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl bg-[#6338F5] text-white text-xs font-semibold hover:bg-[#5229db] flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <span>Review & Final Swear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & STATUTORY SWORN DECLARATION */}
        {currentStep === 5 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-[#13C98A]" />
              Step 5: Final Review & Statutory Lodgement
            </h2>

            {/* Summary Review Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0d122e] border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Lodging Applicant</span>
                <span className="text-white font-medium">{currentUser.name}</span>
                <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">{currentUser.nationalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tenure Classification & Use</span>
                <span className="text-white font-medium">{tenureType} Right of Occupancy · {landUse}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location & Cadastral Area</span>
                <span className="text-white font-medium">{district}, {lga}, {state}</span>
                <span className="text-emerald-400 font-mono text-[11px] block mt-0.5">{estimatedAreaSqm.toLocaleString()} m² ({(estimatedAreaSqm / 10000).toFixed(3)} Ha)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Accredited Surveyor</span>
                <span className="text-white font-medium">{surveyorName}</span>
                <span className="text-indigo-300 font-mono text-[10px] block mt-0.5">{surveyorSurconNo}</span>
              </div>
            </div>

            {/* Abutting Boundary Summary */}
            <div className="p-3 rounded-xl bg-[#12163b]/60 border border-slate-800 text-[11px] space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Registered Perimeter Neighbors:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div><span className="text-indigo-400">N:</span> {northNeighbor}</div>
                <div><span className="text-indigo-400">S:</span> {southNeighbor}</div>
                <div><span className="text-indigo-400">E:</span> {eastNeighbor}</div>
                <div><span className="text-indigo-400">W:</span> {westNeighbor}</div>
              </div>
            </div>

            {/* Statutory Sworn Affirmation */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Statutory Sworn Declaration under Land Use Act (1978)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                I solemnly declare that the boundaries, tenure claims, and instruments submitted herein are authentic, free from undisclosed encumbrances, and true to the best of my knowledge under penalty of perjury. I acknowledge that boundary verification is subject to PostGIS spatial geometry validation and the 21-day neighbor attestation period.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={swornDeclarationAccepted}
                  onChange={e => setSwornDeclarationAccepted(e.target.checked)}
                  className="w-4 h-4 text-[#6338F5] rounded border-slate-700 bg-[#0d122e]"
                />
                <span className="text-xs text-white font-semibold">
                  I accept and execute this statutory declaration with sovereign digital signature.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !swornDeclarationAccepted}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6338F5] to-[#168BFF] text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Dispatching to 8-Stage Pipeline...</span>
                ) : (
                  <>
                    <span>Confirm & Lodge Title Application</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
