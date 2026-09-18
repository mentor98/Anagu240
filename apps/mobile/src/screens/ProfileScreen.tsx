import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabaseSignOut } from '../services/supabase';
import { useAuthStore } from '../services/auth-store';

export function ProfileScreen() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabaseSignOut();
          // auth-store clears automatically via onAuthStateChange
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
        </Text>
      </View>
      <Text style={styles.name}>{user?.fullName ?? '—'}</Text>
      <Text style={styles.email}>{user?.email ?? '—'}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{user?.role ?? 'CITIZEN'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Account Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>User ID</Text>
          <Text style={styles.infoVal} numberOfLines={1} ellipsizeMode="middle">{user?.id ?? '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Auth Provider</Text>
          <Text style={styles.infoVal}>Supabase</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Project</Text>
          <Text style={styles.infoVal}>wcykxpsbtbsoxxmitslk</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F9FAFB', alignItems: 'center', padding: 32 },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1B4F72', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  avatarText:  { fontSize: 32, fontWeight: '700', color: '#fff' },
  name:        { fontSize: 22, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  email:       { fontSize: 14, color: '#6B7280', marginTop: 4 },
  roleBadge:   { backgroundColor: '#1B4F72', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, marginTop: 10 },
  roleText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  infoCard:    { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 32, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  infoTitle:   { fontSize: 14, fontWeight: '700', color: '#4B5563', marginBottom: 14 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoKey:     { fontSize: 13, color: '#9CA3AF' },
  infoVal:     { fontSize: 13, color: '#1F2937', fontFamily: 'monospace', flex: 1, textAlign: 'right' },
  signOutBtn:  { marginTop: 32, width: '100%', backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  signOutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
