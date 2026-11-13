import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Parcel,
  LandApplication,
  BlockchainBlock,
  BlockchainTransaction,
  SurveyJob,
  CommunityAttestation,
  RevocationRecord,
  AuditLog,
  SystemNotification
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PARCELS,
  INITIAL_APPLICATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_BLOCKS,
  INITIAL_SURVEY_JOBS,
  INITIAL_COMMUNITY_ATTESTATIONS,
  INITIAL_REVOCATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  // Theme & Role
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  toggleTheme: () => void;
  currentRole: UserRole;
  setCurrentRole: (r: UserRole) => void;
  currentUser: User;

  // Data & State
  parcels: Parcel[];
  applications: LandApplication[];
  transactions: BlockchainTransaction[];
  blocks: BlockchainBlock[];
  surveyJobs: SurveyJob[];
  communityAttestations: CommunityAttestation[];
  revocations: RevocationRecord[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];

  // Mutations
  registerLandApplication: (data: Partial<LandApplication>) => string;
  updateApplicationStatus: (appId: string, newStatus: LandApplication['status'], notes?: string) => void;
  signNeighborAttestation: (attestationId: string, neighborName: string, status: 'confirmed' | 'disputed', comment?: string) => void;
  submitSurveyReport: (jobId: string, notes: string, beaconsPlaced: number, planRef: string) => void;
  approveTitleDeed: (appId: string) => Parcel;
  executeGovernorRevocation: (revocationData: {
    parcelId: string;
    reason: RevocationRecord['revocationReason'];
    gazetteRef: string;
    compensationAmount: number;
  }) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Offline / Sync Simulation
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // Active Certificate Modal State
  selectedCertificateParcel: Parcel | null;
  setSelectedCertificateParcel: (parcel: Parcel | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [applications, setApplications] = useState<LandApplication[]>(INITIAL_APPLICATIONS);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>(INITIAL_TRANSACTIONS);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);
  const [surveyJobs, setSurveyJobs] = useState<SurveyJob[]>(INITIAL_SURVEY_JOBS);
  const [communityAttestations, setCommunityAttestations] = useState<CommunityAttestation[]>(INITIAL_COMMUNITY_ATTESTATIONS);
  const [revocations, setRevocations] = useState<RevocationRecord[]>(INITIAL_REVOCATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // Offline Simulation
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(2);

  // Active Certificate Modal
  const [selectedCertificateParcel, setSelectedCertificateParcel] = useState<Parcel | null>(null);

  // Always keep document root dark
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  // ── Supabase auth state listener ─────────────────────────────────────────
  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const roleVal = (meta.role as string || 'citizen').toLowerCase() as UserRole;
        setCurrentRole(roleVal);
        // Merge real user data into the mock user object
        const realUser: User = {
          ...INITIAL_USERS[roleVal] || INITIAL_USERS.citizen,
          id: u.id,
          name: meta.full_name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          role: roleVal,
          phone: meta.phone || '',
          verified: true,
        };
        // We update the mock user via currentUser getter
        INITIAL_USERS._live = realUser;
      }
    });

    // Listen for sign-in/sign-out
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const roleVal = (meta.role as string || 'citizen').toLowerCase() as UserRole;
        setCurrentRole(roleVal);
        const realUser: User = {
          ...INITIAL_USERS[roleVal] || INITIAL_USERS.citizen,
          id: u.id,
          name: meta.full_name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          role: roleVal,
          phone: meta.phone || '',
          verified: true,
        };
        INITIAL_USERS._live = realUser;
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const toggleTheme = () => {
    // no-op (dark mode enforced)
  };

  const currentUser = (INITIAL_USERS as Record<string, User>)['_live'] || INITIAL_USERS[currentRole] || INITIAL_USERS.citizen;

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const logAuditEvent = (action: string, targetId: string, targetType: AuditLog['targetType'], details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser.name,
      actorRole: currentRole,
      action,
      targetId,
      targetType,
      details,
      ipAddress: '197.210.8.' + Math.floor(Math.random() * 200 + 10),
      hash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const registerLandApplication = (data: Partial<LandApplication>): string => {
    const newId = `app-00${applications.length + 1}`;
    const appNum = `ANAGU-APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp: LandApplication = {
      id: newId,
      applicationNumber: appNum,
      applicantName: data.applicantName || currentUser.name,
      applicantId: currentUser.id,
      applicantPhone: data.applicantPhone || currentUser.phone || '+234 800 000 0000',
      applicantEmail: data.applicantEmail || currentUser.email,
      tenureType: data.tenureType || 'Statutory',
      state: data.state || 'Lagos',
      lga: data.lga || 'Ikeja',
      district: data.district || 'Central Business District',
      landUse: data.landUse || 'Residential',
      estimatedAreaSqm: data.estimatedAreaSqm || 1200,
      northNeighbor: data.northNeighbor,
      southNeighbor: data.southNeighbor,
      eastNeighbor: data.eastNeighbor,
      westNeighbor: data.westNeighbor,
      surveyorSurconNo: data.surveyorSurconNo,
      assignedSurveyor: data.assignedSurveyor,
      status: 'submitted',
      dateSubmitted: new Date().toISOString().substring(0, 10),
      lastUpdated: new Date().toISOString().substring(0, 10),
      attestationsCount: 0,
      requiredAttestations: 4,
      notes: data.notes || 'Application logged via Citizen Portal. Pending cadastral surveyor dispatch.',
      documents: data.documents || [
        { name: 'Deed_of_Conveyance.pdf', type: 'application/pdf', size: '2.1 MB', uploadedAt: new Date().toISOString().substring(0, 10) },
        { name: 'Survey_Beacon_Receipt.pdf', type: 'application/pdf', size: '850 KB', uploadedAt: new Date().toISOString().substring(0, 10) }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Create a new survey job
    const newJob: SurveyJob = {
      id: `job-${Date.now()}`,
      jobCode: `SRV-JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
      parcelId: newId,
      applicantName: newApp.applicantName,
      location: `${newApp.district}, ${newApp.lga}, ${newApp.state}`,
      landUse: newApp.landUse,
      estimatedAreaSqm: newApp.estimatedAreaSqm,
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
      status: 'pending'
    };
    setSurveyJobs(prev => [newJob, ...prev]);

    logAuditEvent('TITLE_APPLICATION_SUBMITTED', newId, 'Application', `Applicant ${newApp.applicantName} filed ${appNum}`);
    addNotification({
      title: 'Application Lodged',
      message: `Your land application ${appNum} has been received and queued for surveyor assignment.`,
      type: 'success'
    });

    return newId;
  };

  const updateApplicationStatus = (appId: string, newStatus: LandApplication['status'], notes?: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            status: newStatus,
            lastUpdated: new Date().toISOString().substring(0, 10),
            notes: notes || app.notes
          };
        }
        return app;
      })
    );
    logAuditEvent('APPLICATION_STATUS_UPDATE', appId, 'Application', `Status updated to ${newStatus}`);
  };

  const signNeighborAttestation = (attestationId: string, neighborName: string, status: 'confirmed' | 'disputed', comment?: string) => {
    setCommunityAttestations(prev =>
      prev.map(item => {
        if (item.id === attestationId) {
          const updatedNeighbors = item.neighborAttestations.map(neighbor => {
            if (neighbor.neighborName === neighborName) {
              return {
                ...neighbor,
                status,
                comment: comment || neighbor.comment,
                date: new Date().toISOString().substring(0, 10)
              };
            }
            return neighbor;
          });
          return { ...item, neighborAttestations: updatedNeighbors };
        }
        return item;
      })
    );

    logAuditEvent('COMMUNITY_ATTESTATION_SIGNED', attestationId, 'Parcel', `Neighbor ${neighborName} signed boundary as ${status}`);
    addNotification({
      title: 'Neighbor Signoff Recorded',
      message: `${neighborName} submitted boundary confirmation for attestation ${attestationId}.`,
      type: 'info'
    });
  };

  const submitSurveyReport = (jobId: string, notes: string, beaconsPlaced: number, planRef: string) => {
    setSurveyJobs(prev =>
      prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'approved',
            surveyorNotes: notes,
            beaconsPlaced,
            cadastralPlanRef: planRef
          };
        }
        return j;
      })
    );

    // Also update any matching application to community_attestation
    setApplications(prev =>
      prev.map(app => {
        if (app.status === 'survey_assigned' || app.status === 'submitted') {
          return {
            ...app,
            status: 'community_attestation',
            assignedSurveyor: currentUser.name,
            surveyReportDate: new Date().toISOString().substring(0, 10),
            notes: `Cadastral survey completed under plan ${planRef}. Boundary notice active for neighbor sign-off.`
          };
        }
        return app;
      })
    );

    // Record on-chain transaction
    const newTx: BlockchainTransaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'SURVEY_ATTESTATION',
      blockNumber: blocks[0]?.blockNumber ? blocks[0].blockNumber + 1 : 1861005,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      from: currentUser.walletAddress,
      to: '0xCadastreContract',
      parcelTitle: planRef,
      parcelId: jobId,
      status: 'confirmed',
      gasFee: '0.0021 ETH',
      signerRole: 'surveyor',
      signature: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setTransactions(prev => [newTx, ...prev]);

    logAuditEvent('CADASTRAL_SURVEY_SUBMITTED', jobId, 'Parcel', `Cadastral plan ${planRef} submitted with ${beaconsPlaced} beacons`);
    addNotification({
      title: 'Survey Plan Lodged',
      message: `Survey plan ${planRef} has been validated against topological rules and committed.`,
      type: 'success'
    });
  };

  const approveTitleDeed = (appId: string): Parcel => {
    const targetApp = applications.find(a => a.id === appId) || applications[0];
    const newTitleNumber = `C-OF-O-2026-00${Math.floor(5000 + Math.random() * 4999)}`;
    const tokenHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newParcel: Parcel = {
      id: `pcl-${Date.now()}`,
      titleNumber: newTitleNumber,
      tokenHash,
      ownerName: targetApp.applicantName,
      ownerId: targetApp.applicantId,
      ownerNationalId: 'NIN-8891-2094-1102',
      state: targetApp.state,
      lga: targetApp.lga,
      district: targetApp.district,
      landUse: targetApp.landUse,
      sizeSqm: targetApp.estimatedAreaSqm,
      sizeHectares: Number((targetApp.estimatedAreaSqm / 10000).toFixed(3)),
      status: 'verified',
      dateRegistered: new Date().toISOString().substring(0, 10),
      coordinates: [
        { id: 'bp-new-1', beaconNumber: 'SC/NEW/01', lat: 6.442, lng: 3.481 },
        { id: 'bp-new-2', beaconNumber: 'SC/NEW/02', lat: 6.443, lng: 3.483 },
        { id: 'bp-new-3', beaconNumber: 'SC/NEW/03', lat: 6.441, lng: 3.484 },
        { id: 'bp-new-4', beaconNumber: 'SC/NEW/04', lat: 6.440, lng: 3.482 }
      ],
      surveyPlanNumber: `SPN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      surveyorName: targetApp.assignedSurveyor || 'Surv. Amina Bello, FNIS',
      marketValuation: 195000000,
      encumbrances: [],
      ipfsDocumentHash: 'Qm' + Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      certificateIssued: true,
      blockNumber: blocks[0]?.blockNumber ? blocks[0].blockNumber + 1 : 1861005
    };

    setParcels(prev => [newParcel, ...prev]);

    // Update application
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: 'approved',
              notes: `Approved by Registrar ${currentUser.name}. Certificate of Occupancy ${newTitleNumber} issued.`
            }
          : a
      )
    );

    // Add minting transaction
    const mintTx: BlockchainTransaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'TITLE_REGISTRATION',
      blockNumber: blocks[0]?.blockNumber ? blocks[0].blockNumber + 1 : 1861005,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      from: currentUser.walletAddress,
      to: `0xUserWallet (${targetApp.applicantName})`,
      parcelTitle: newTitleNumber,
      parcelId: newParcel.id,
      status: 'confirmed',
      gasFee: '0.0034 ETH',
      signerRole: 'registrar',
      signature: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setTransactions(prev => [mintTx, ...prev]);

    logAuditEvent('TITLE_DEED_APPROVED', newParcel.id, 'Parcel', `Issued C of O ${newTitleNumber} to ${targetApp.applicantName}`);
    addNotification({
      title: 'Title Deed Approved & Minted',
      message: `Certificate of Occupancy ${newTitleNumber} has been minted onto the blockchain registry.`,
      type: 'success'
    });

    return newParcel;
  };

  const executeGovernorRevocation = (revocationData: {
    parcelId: string;
    reason: RevocationRecord['revocationReason'];
    gazetteRef: string;
    compensationAmount: number;
  }) => {
    const targetParcel = parcels.find(p => p.id === revocationData.parcelId);
    if (!targetParcel) return;

    const orderNum = `REV-ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRevocation: RevocationRecord = {
      id: `rev-${Date.now()}`,
      orderNumber: orderNum,
      parcelId: targetParcel.id,
      parcelTitle: targetParcel.titleNumber,
      previousOwner: targetParcel.ownerName,
      revocationReason: revocationData.reason,
      gazetteNoticeNumber: revocationData.gazetteRef,
      effectiveDate: new Date().toISOString().substring(0, 10),
      compensationStatus: revocationData.compensationAmount > 0 ? 'Determined' : 'Not Applicable',
      compensationAmount: revocationData.compensationAmount,
      signedBy: `${currentUser.name} (${currentUser.organization || 'Executive Governor'})`,
      status: 'executed'
    };

    setRevocations(prev => [newRevocation, ...prev]);

    // Update parcel status
    setParcels(prev =>
      prev.map(p =>
        p.id === targetParcel.id
          ? {
              ...p,
              status: 'revoked',
              encumbrances: [...p.encumbrances, `Statutory Revocation Order ${orderNum}`],
              disputeNotes: `Title revoked by State Governor under Gazette Ref: ${revocationData.gazetteRef}. Reason: ${revocationData.reason}.`
            }
          : p
      )
    );

    // Add burn transaction to blockchain
    const burnTx: BlockchainTransaction = {
      id: `tx-${Date.now()}`,
      hash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'REVOCATION_ORDER',
      blockNumber: blocks[0]?.blockNumber ? blocks[0].blockNumber + 1 : 1861005,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      from: currentUser.walletAddress,
      to: '0x000000000000000000000000000000000000DEAD',
      parcelTitle: targetParcel.titleNumber,
      parcelId: targetParcel.id,
      status: 'confirmed',
      gasFee: '0.0052 ETH',
      signerRole: 'governor',
      signature: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setTransactions(prev => [burnTx, ...prev]);

    logAuditEvent('STATUTORY_REVOCATION_EXECUTED', targetParcel.id, 'Revocation', `Order ${orderNum} executed. Reason: ${revocationData.reason}`);
    addNotification({
      title: 'Executive Revocation Executed',
      message: `Title ${targetParcel.titleNumber} has been revoked by executive order. Memorial entry recorded on-chain.`,
      type: 'warning'
    });
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => {
      const next = !prev;
      addNotification({
        title: next ? 'Simulated Offline Mode Enabled' : 'Online Reconnected',
        message: next
          ? 'MQTT edge broker cached transactions locally in IndexedDB queue.'
          : 'Local edge cache synchronized 2 queued cadastral events to validator nodes.',
        type: next ? 'warning' : 'success'
      });
      return next;
    });
  };

  const syncOfflineQueue = () => {
    setOfflineQueueCount(0);
    addNotification({
      title: 'MQTT Cache Synchronized',
      message: 'All queued edge field notes and beacon telemetries committed to consensus network.',
      type: 'success'
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        currentRole,
        setCurrentRole,
        currentUser,
        parcels,
        applications,
        transactions,
        blocks,
        surveyJobs,
        communityAttestations,
        revocations,
        auditLogs,
        notifications,
        registerLandApplication,
        updateApplicationStatus,
        signNeighborAttestation,
        submitSurveyReport,
        approveTitleDeed,
        executeGovernorRevocation,
        markNotificationRead,
        addNotification,
        isOfflineMode,
        toggleOfflineMode,
        offlineQueueCount,
        syncOfflineQueue,
        selectedCertificateParcel,
        setSelectedCertificateParcel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
