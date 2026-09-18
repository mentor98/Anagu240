import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { titlesApi } from '../services/api';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TitleDetail'>;

export function TitleDetailScreen({ route }: Props) {
  const { tokenId } = route.params;
  const [title,   setTitle]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    titlesApi.getOne(tokenId).then((r) => setTitle(r.data)).finally(() => setLoading(false));
  }, [tokenId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1B4F72" /></View>;
  if (!title)  return <View style={styles.center}><Text style={styles.errorText}>Title not found.</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.header, title.isRevoked && styles.headerRevoked]}>
        <Text style={styles.headerLabel}>Token #{title.tokenId}</Text>
        <Text style={styles.headerStatus}>{title.isRevoked ? '🔴 REVOKED' : '✅ ACTIVE'}</Text>
      </View>

      {title.isRevoked && (
        <View style={styles.revokedCard}>
          <Text style={styles.revokedTitle}>Statutorily Revoked</Text>
          <Text style={styles.revokedText}>Ground: {title.revocationGround?.replace(/_/g, ' ')}</Text>
          <Text style={styles.revokedText}>By: {title.revokedByAddress}</Text>
          <Text style={styles.revokedText}>Date: {title.revokedAt ? new Date(title.revokedAt).toLocaleString() : '—'}</Text>
          <Text style={styles.revokedNote}>Land Use Act (1978), Section 28</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Title Details</Text>
        {[
          ['Owner Address',  title.ownerAddress],
          ['Parcel ID',      title.parcelId],
          ['Tx Hash',        title.txHash],
          ['Block Number',   title.blockNumber ?? '—'],
          ['Issued At',      new Date(title.issuedAt).toLocaleString()],
        ].map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.rowKey}>{k}</Text>
            <Text style={styles.rowVal} numberOfLines={1} ellipsizeMode="middle">{v}</Text>
          </View>
        ))}
      </View>

      {title.tokenUri && (
        <TouchableOpacity style={styles.linkBtn} onPress={() => Linking.openURL(title.tokenUri)}>
          <Text style={styles.linkBtnText}>View Token Metadata →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F9FAFB' },
  content:       { padding: 16, gap: 12 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:     { color: '#EF4444', fontSize: 16 },
  header:        { backgroundColor: '#1B4F72', borderRadius: 14, padding: 20 },
  headerRevoked: { backgroundColor: '#7F1D1D' },
  headerLabel:   { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerStatus:  { fontSize: 15, color: '#A5F3FC', marginTop: 4 },
  revokedCard:   { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  revokedTitle:  { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 6 },
  revokedText:   { fontSize: 13, color: '#B91C1C', marginBottom: 3 },
  revokedNote:   { fontSize: 11, color: '#EF4444', marginTop: 6, fontStyle: 'italic' },
  card:          { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  row:           { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowKey:        { fontSize: 12, color: '#6B7280', width: 110 },
  rowVal:        { fontSize: 12, color: '#1F2937', flex: 1, fontFamily: 'monospace' },
  linkBtn:       { backgroundColor: '#1B4F72', borderRadius: 10, padding: 14, alignItems: 'center' },
  linkBtnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});
