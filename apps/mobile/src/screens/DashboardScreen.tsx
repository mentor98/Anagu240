import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { applicationsApi } from '../services/api';
import { getQueueLength } from '../services/offlineQueue';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED:             '#3B82F6',
  SPATIAL_VERIFIED:      '#06B6D4',
  OWNERSHIP_VERIFIED:    '#0D9488',
  LEGAL_VERIFIED:        '#6366F1',
  APPROVED:              '#22C55E',
  BLOCKCHAIN_REGISTERED: '#8B5CF6',
  NFT_ISSUED:            '#A855F7',
  COMPLETED:             '#10B981',
  REJECTED:              '#EF4444',
};

export function DashboardScreen() {
  const navigation   = useNavigation<Nav>();
  const [apps,       setApps]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queueLen,   setQueueLen]   = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await applicationsApi.list();
      setApps(res.data ?? []);
    } catch {
      // silent — no data shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    getQueueLength().then(setQueueLen);
  }, [load]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ApplicationDetail', { applicationId: item.id })}
    >
      <View style={styles.cardRow}>
        <Text style={styles.ownerName}>{item.ownerName}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] ?? '#9CA3AF' }]}>
          <Text style={styles.badgeText}>{item.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      <Text style={styles.cardId}>ID: {item.id}</Text>
      <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1B4F72" />
    </View>
  );

  return (
    <View style={styles.container}>
      {queueLen > 0 && (
        <View style={styles.queueBanner}>
          <Text style={styles.queueText}>
            📦 {queueLen} submission{queueLen > 1 ? 's' : ''} queued offline — will sync when connected
          </Text>
        </View>
      )}

      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={apps.length === 0 ? styles.empty : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={['#1B4F72']}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No applications yet.</Text>
            <Text style={styles.emptySubtext}>Tap ➕ to submit your first land registration.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F9FAFB' },
  list:         { padding: 16, gap: 12 },
  empty:        { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText:    { fontSize: 18, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ownerName:    { fontSize: 16, fontWeight: '600', color: '#1F2937', flex: 1 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardId:       { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace', marginBottom: 2 },
  cardDate:     { fontSize: 12, color: '#6B7280' },
  queueBanner:  { backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#FDE68A', padding: 12 },
  queueText:    { color: '#92400E', fontSize: 13, textAlign: 'center' },
});
