import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NetworkDegradationMode } from '../../types';
import {
  Activity,
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
  CheckCircle2,
  Database,
  Radio,
  Sliders,
  Send,
  PlusCircle
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

export const MonitoringView: React.FC = () => {
  const { isOfflineMode, toggleOfflineMode, offlineQueueCount, syncOfflineQueue, addNotification } = useApp();

  // Network degradation mode based on Linux tc benchmark from PDF
  const [networkMode, setNetworkMode] = useState<NetworkDegradationMode>('normal');
  const [mqttTopic] = useState('land/registration/status');
  const [mqttQos, setMqttQos] = useState<1 | 2>(2);

  // Field offline queue simulation items
  const [localQueue, setLocalQueue] = useState([
    { id: 'q-101', beacon: 'BC-FIELD-09', lat: 6.4389, lng: 3.4721, time: '10:42:15 AM', status: 'Queued Locally' },
    { id: 'q-102', beacon: 'BC-FIELD-10', lat: 6.4392, lng: 3.4728, time: '10:44:02 AM', status: 'Queued Locally' }
  ]);

  const getLatencyAndPacketLoss = () => {
    switch (networkMode) {
      case 'severe':
        return { latency: '524ms', loss: '25% Packet Drop', color: 'text-rose-400' };
      case 'moderate':
        return { latency: '228ms', loss: '10% Packet Drop', color: 'text-amber-400' };
      default:
        return { latency: '24ms', loss: '0% Packet Loss', color: 'text-emerald-400' };
    }
  };

  const netStats = getLatencyAndPacketLoss();

  const handleQueueOfflineBeacon = () => {
    const newIdx = localQueue.length + 1;
    const newBeacon = {
      id: `q-${Date.now()}`,
      beacon: `BC-FIELD-${10 + newIdx}`,
      lat: Number((6.438 + Math.random() * 0.005).toFixed(4)),
      lng: Number((3.471 + Math.random() * 0.005).toFixed(4)),
      time: new Date().toLocaleTimeString(),
      status: 'Queued Locally'
    };
    setLocalQueue(prev => [...prev, newBeacon]);
    addNotification({
      title: 'Beacon Cached Offline',
      message: `Pillar ${newBeacon.beacon} logged in local IndexedDB edge storage.`,
      type: 'info'
    });
  };

  const handleFlushQueue = () => {
    syncOfflineQueue();
    setLocalQueue([]);
    addNotification({
      title: 'Edge Queue Flushed',
      message: 'All cached cadastral beacons transmitted via MQTT topic land/registration/status.',
      type: 'success'
    });
  };

  const nodes = [
    { name: 'Node-01 (Lagos Sovereign Cluster)', ip: '102.89.44.10', role: 'Leader Validator', cpu: '28%', status: 'Online' },
    { name: 'Node-02 (Surveyors Registration Council)', ip: '105.112.18.22', role: 'Follower', cpu: '19%', status: 'Online' },
    { name: 'Node-03 (Federal Ministry of Housing)', ip: '197.210.9.14', role: 'Follower', cpu: '22%', status: 'Online' },
    { name: 'Node-04 (Abuja National Geo-Data Center)', ip: '102.91.88.90', role: 'Follower', cpu: '25%', status: 'Online' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackButton to="/portal/dashboard" label="Back to Dashboard" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#13C98A]" />
            Consensus Cluster & MQTT Telemetry Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Raft-BFT node consensus, MQTT edge broker throughput, and rural surveyor offline queue.
          </p>
        </div>

        <button
          onClick={toggleOfflineMode}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            isOfflineMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10'
              : 'bg-[#171A3B] text-slate-200 border-slate-700 hover:border-indigo-500'
          }`}
        >
          {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
          <span>{isOfflineMode ? 'Edge Disconnected (Offline Cache Active)' : 'Simulate Offline Field Survey'}</span>
        </button>
      </div>

      {/* Cluster Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Consensus Nodes</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">4 / 4</div>
          <div className="text-[10px] text-slate-400">100% Operational Quorum</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">MQTT Broker Rate</div>
          <div className="text-2xl font-bold font-mono text-white">14,290 msg/s</div>
          <div className="text-[10px] text-indigo-300 font-mono">Topic: {mqttTopic}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Edge Local Cache</div>
          <div className="text-2xl font-bold font-mono text-white">
            {isOfflineMode ? 'Buffering' : 'Synced'}
          </div>
          <div className="text-[10px] text-amber-300">
            {localQueue.length} field events queued in storage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#171A3B] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Roundtrip Latency ({networkMode.toUpperCase()})</div>
          <div className={`text-2xl font-bold font-mono ${netStats.color}`}>{netStats.latency}</div>
          <div className="text-[10px] text-slate-400 font-mono">{netStats.loss}</div>
        </div>
      </div>

      {/* Network Degradation Benchmark Control Strip (Linux tc emulation) */}
      <div className="p-4 rounded-2xl bg-[#171A3B] border border-indigo-500/25 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#6338F5]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Network Degradation Simulation (Linux Traffic Control 'tc' Model)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">PDF Objective iii Evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setNetworkMode('normal')}
            className={`p-3 rounded-xl border text-left transition-all ${
              networkMode === 'normal'
                ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                : 'bg-[#0d122e] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Profile 1: Normal Network</span>
              <span className="text-[10px] text-emerald-400 font-mono">&lt;30ms / 0% loss</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Standard metropolitan urban connectivity with instant edge relay.</p>
          </button>

          <button
            type="button"
            onClick={() => setNetworkMode('moderate')}
            className={`p-3 rounded-xl border text-left transition-all ${
              networkMode === 'moderate'
                ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                : 'bg-[#0d122e] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Profile 2: Moderate Degradation</span>
              <span className="text-[10px] text-amber-400 font-mono">200ms / 10% loss</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Suburban 3G/edge cellular link with intermittent dropped packets.</p>
          </button>

          <button
            type="button"
            onClick={() => setNetworkMode('severe')}
            className={`p-3 rounded-xl border text-left transition-all ${
              networkMode === 'severe'
                ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                : 'bg-[#0d122e] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Profile 3: Severe Degradation</span>
              <span className="text-[10px] text-rose-400 font-mono">500ms / 25% loss</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Remote rural boundary traverse with heavy packet loss & buffer retry.</p>
          </button>
        </div>
      </div>

      {/* MQTT Message Schema & Payload Inspector */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            MQTT Telemetry Broker & Live Payload Inspector
          </h2>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Quality of Service:</span>
            <button
              onClick={() => setMqttQos(1)}
              className={`px-2 py-0.5 rounded font-mono ${mqttQos === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              QoS 1 (At Least Once)
            </button>
            <button
              onClick={() => setMqttQos(2)}
              className={`px-2 py-0.5 rounded font-mono ${mqttQos === 2 ? 'bg-[#6338F5] text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              QoS 2 (Exactly Once)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#0a0d20] border border-slate-800 space-y-2">
            <div className="text-slate-400 font-sans font-semibold text-[11px] flex items-center justify-between">
              <span>Active Broadcast Topic</span>
              <span className="text-emerald-400">BROKER ACTIVE</span>
            </div>
            <div className="p-2 rounded bg-[#12163b] text-indigo-300 font-bold">
              {mqttTopic}
            </div>
            <div className="text-[11px] text-slate-400 font-sans pt-1">
              Subscribed Clients: Web Cadastre Console, Android Surveyor PWA, Registrar Node, National Title Archive.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0d20] border border-slate-800 space-y-2">
            <div className="text-slate-400 font-sans font-semibold text-[11px] flex items-center justify-between">
              <span>Live Dispatched JSON Payload (QoS {mqttQos})</span>
              <span className="text-indigo-400">SHA-256 Signed</span>
            </div>
            <pre className="p-2.5 rounded bg-[#12163b] text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
{`{
  "topic": "${mqttTopic}",
  "applicationId": "ANAGU-APP-2026-8849",
  "parcelId": "pcl-001",
  "stage": "SPATIAL_VERIFICATION_COMPLETE",
  "status": "APPROVED",
  "qos": ${mqttQos},
  "timestamp": ${Math.floor(Date.now() / 1000)},
  "latencyProfile": "${networkMode}",
  "signature": "0x8f2a994c...18de29b1"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Offline Edge Queue Inspector & Field Simulation */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Field Surveyor Edge Local Queue (IndexedDB Buffer)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleQueueOfflineBeacon}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Log Offline Beacon</span>
            </button>
            {localQueue.length > 0 && (
              <button
                onClick={handleFlushQueue}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Flush & Replay Queue ({localQueue.length})</span>
              </button>
            )}
          </div>
        </div>

        {localQueue.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-[#0d122e] rounded-xl border border-slate-800">
            No pending cadastral items in local edge storage. All survey data synchronized with cluster.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0d122e]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800 bg-[#12163b]/50">
                <tr>
                  <th className="py-2.5 px-3">Queue ID</th>
                  <th className="py-2.5 px-3">Beacon Pillar</th>
                  <th className="py-2.5 px-3">Latitude</th>
                  <th className="py-2.5 px-3">Longitude</th>
                  <th className="py-2.5 px-3">Logged Time</th>
                  <th className="py-2.5 px-3">Buffer State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {localQueue.map(item => (
                  <tr key={item.id} className="hover:bg-[#15193d]">
                    <td className="py-2 px-3 text-slate-400">{item.id}</td>
                    <td className="py-2 px-3 text-indigo-400 font-bold">{item.beacon}</td>
                    <td className="py-2 px-3 text-slate-200">{item.lat}</td>
                    <td className="py-2 px-3 text-slate-200">{item.lng}</td>
                    <td className="py-2 px-3 text-slate-400">{item.time}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Validator Nodes Table */}
      <div className="bg-[#171A3B] rounded-2xl border border-indigo-500/25 p-5 shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700/60">
          <Server className="w-4 h-4 text-indigo-400" />
          Raft-BFT Consensus Validator Nodes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Node Identifier</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Consensus Role</th>
                <th className="py-2.5 px-3">CPU Load</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {nodes.map((node, i) => (
                <tr key={i} className="hover:bg-[#0d122e] transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">{node.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{node.ip}</td>
                  <td className="py-2.5 px-3 text-indigo-300">{node.role}</td>
                  <td className="py-2.5 px-3 text-slate-300">{node.cpu}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{node.status}</span>
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
