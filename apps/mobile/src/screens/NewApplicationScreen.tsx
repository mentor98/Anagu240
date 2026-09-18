import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as Network from 'expo-network';
import { applicationsApi } from '../services/api';
import { enqueue } from '../services/offlineQueue';

interface FormState {
  ownerName:        string;
  nationalId:       string;
  surveyPlanNumber: string;
  lga:              string;
  state:            string;
  addressDesc:      string;
}

const INITIAL: FormState = {
  ownerName: '', nationalId: '', surveyPlanNumber: '',
  lga: '', state: '', addressDesc: '',
};

export function NewApplicationScreen() {
  const [form,       setForm]       = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [queued,     setQueued]     = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const update = (field: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    if (!form.ownerName || !form.nationalId || !form.lga || !form.state) {
      Alert.alert('Required Fields', 'Please fill in all required fields (*).');
      return;
    }

    setSubmitting(true);

    // Check network connectivity
    const net = await Network.getNetworkStateAsync();
    const isOnline = !!net.isConnected && !!net.isInternetReachable;

    if (!isOnline) {
      // Enqueue for later submission (Component 3B — offline queue)
      await enqueue('APPLICATION', {
        ...form,
        coordinates: [], // GPS coordinates would come from expo-location
      });
      setQueued(true);
      setSubmitting(false);
      Alert.alert(
        '📦 Saved Offline',
        'You are offline. Your application has been saved and will be submitted automatically when you reconnect.',
      );
      return;
    }

    try {
      await applicationsApi.submit({
        ...form,
        coordinates: [], // In production: from expo-location
        communityWitnesses: [],
      });
      setSubmitted(true);
      setForm(INITIAL);
    } catch (err: any) {
      // If API call fails, fall back to offline queue
      await enqueue('APPLICATION', { ...form, coordinates: [] });
      setQueued(true);
      Alert.alert('Saved to Queue', 'Could not reach the server. Submission saved for retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <View style={styles.successContainer}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successTitle}>Application Submitted!</Text>
      <Text style={styles.successText}>
        Your parcel will go through spatial verification, ownership verification,
        legal review, and registrar approval before an NFT title is issued.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => setSubmitted(false)}>
        <Text style={styles.btnText}>Submit Another</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Owner Information</Text>

      {[
        { label: 'Owner Full Name *',    key: 'ownerName',        placeholder: 'Adewale Okonkwo' },
        { label: 'National ID (NIN) *',  key: 'nationalId',       placeholder: 'NIN-VALID-001' },
        { label: 'Survey Plan Number',   key: 'surveyPlanNumber', placeholder: 'SP-001' },
      ].map(({ label, key, placeholder }) => (
        <View key={key} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={form[key as keyof FormState]}
            onChangeText={update(key as keyof FormState)}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Location</Text>

      {[
        { label: 'Local Government Area *', key: 'lga',         placeholder: 'Lagos Island' },
        { label: 'State *',                 key: 'state',       placeholder: 'Lagos' },
        { label: 'Address Description',     key: 'addressDesc', placeholder: 'Plot 1, Broad Street' },
      ].map(({ label, key, placeholder }) => (
        <View key={key} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={form[key as keyof FormState]}
            onChangeText={update(key as keyof FormState)}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      ))}

      {queued && (
        <View style={styles.queuedBanner}>
          <Text style={styles.queuedText}>
            📦 Queued offline. Will auto-submit when you reconnect.
          </Text>
        </View>
      )}

      <Text style={styles.note}>
        📍 GPS-based parcel boundary drawing coming in next sprint.
        Coordinates will be captured automatically from your device.
      </Text>

      <TouchableOpacity
        style={[styles.btn, submitting && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Submit Application</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F9FAFB' },
  content:          { padding: 20, paddingBottom: 40 },
  sectionTitle:     { fontSize: 16, fontWeight: '700', color: '#1B4F72', marginBottom: 14 },
  fieldGroup:       { marginBottom: 16 },
  label:            { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  input:            { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1F2937', backgroundColor: '#fff' },
  btn:              { backgroundColor: '#1B4F72', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnDisabled:      { opacity: 0.6 },
  btnText:          { color: '#fff', fontWeight: '700', fontSize: 16 },
  queuedBanner:     { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginVertical: 12 },
  queuedText:       { color: '#92400E', fontSize: 13 },
  note:             { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#F9FAFB' },
  successIcon:      { fontSize: 56, marginBottom: 16 },
  successTitle:     { fontSize: 22, fontWeight: '700', color: '#10B981', marginBottom: 12 },
  successText:      { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
