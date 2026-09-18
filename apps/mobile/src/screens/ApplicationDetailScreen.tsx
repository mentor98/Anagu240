import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { applicationsApi } from '../services/api';
import { subscribeApplicationStatus } from '../services/supabase';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ApplicationDetail'>;

const STAGE_ORDER = [
  'SUBMITTED', 'SPATIAL_VERIFIED', 'OWNERSHIP_VERIFIED', 'LEGAL_VERIFIED',
  'APPROVED', 'BLOCKCHAIN_REGISTERED', 'NFT_ISSUED', 'COMPLETED',
];

export function ApplicationDetailScreen({ route }: Props) {
  const { applicationId } = route.params;
  const [app,     setApp]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.getOne(applicationId)
      .then((r) => setApp(r.data))
      .finally(() => setLoading(false));

    // Supabase realtime — live status push
    const channel = subscribeApplicationStatus(applicationId, (newStatus) => {
      setApp((prev: any) => prev ? { ...prev, status: newStatus } : prev);
    });

    return () => { channel.unsubscribe(); };
  }, [applicationId]);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#1B4F72" /></View>
  );

  if (!app) return (
    <View style={styles.center}><Text style={styles.errorText}>Application not found.</Text></View>
  );

  const stageIdx = STAGE_ORDER.indexOf(app.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status */}
      <View style={[styles.statusBanner, app.status === 'REJECTED' && styles.statusBannerRed]}>
        <Text style={styles.statusText}>{app.status.replace(/_/g, ' ')}</Text>
        {app.status === 'REJECTED' && app.rejectionReason && (
          <Text style={styles.rejectionText}>Reason: {app.rejectionReason}</Text>
        )}
      </View>

      {/* Pipeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pipeline Progress</Text>
        {STAGE_ORDER.map((stage, i) => (
          <View key={stage} style={styles.stageRow}>
            <View style={[
              styles.stageDot,
              i < stageIdx  && styles.stageDotDone,
              i === stageIdx && styles.stageDotActive,
            ]} />
            <Text style={[
              styles.stageLabel,
              i === stageIdx && styles.stageLabelActive,
              i < stageIdx   && styles.stageLabelDone,
            ]}>
              {stage.replace(/_/g, ' ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        {[
          ['Application ID', app.id],
          ['Owner Name',     app.ownerName],
          ['National ID',    app.nationalId],
          ['Survey Plan',    app.surveyPlanNumber ?? '—'],
          ['Submitted',      new Date(app.createdAt).toLocaleString()],
        ].map(([k, v]) => (
          <View key={k} style={styles.detailRow}>
            <Text style={styles.detailKey}>{k}</Text>
            <Text style={styles.detailValue}>{v}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F9FAFB' },
  content:           { padding: 16, gap: 12 },
  center:            { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:         { color: '#EF4444', fontSize: 16 },
  statusBanner:      { backgroundColor: '#1B4F72', borderRadius: 12, padding: 16 },
  statusBannerRed:   { backgroundColor: '#EF4444' },
  statusText:        { color: '#fff', fontSize: 18, fontWeight: '700' },
  rejectionText:     { color: '#FEE2E2', fontSize: 13, marginTop: 4 },
  card:              { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle:         { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  stageRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stageDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D1D5DB', marginRight: 10 },
  stageDotDone:      { backgroundColor: '#10B981' },
  stageDotActive:    { backgroundColor: '#1B4F72', width: 14, height: 14, borderRadius: 7 },
  stageLabel:        { fontSize: 13, color: '#9CA3AF' },
  stageLabelDone:    { color: '#10B981' },
  stageLabelActive:  { color: '#1B4F72', fontWeight: '700' },
  detailRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailKey:         { fontSize: 13, color: '#6B7280', flex: 1 },
  detailValue:       { fontSize: 13, color: '#1F2937', flex: 2, textAlign: 'right', fontFamily: 'monospace' },
});
