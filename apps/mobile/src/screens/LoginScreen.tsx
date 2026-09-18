import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabaseSignIn } from '../services/supabase';

export function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await supabaseSignIn(email.trim(), password);
      // Auth state change in auth-store.ts handles navigation automatically
    } catch (err: any) {
      Alert.alert('Login Failed', err.message ?? 'Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.brand}>Anagu</Text>
        <Text style={styles.subtitle}>Land Administration Framework</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Secured by Supabase Auth{'\n'}
          https://wcykxpsbtbsoxxmitslk.supabase.co
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B4F72' },
  inner:     { flex: 1, justifyContent: 'center', padding: 24 },
  brand:     { fontSize: 40, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle:  { fontSize: 14, color: '#93C5FD', textAlign: 'center', marginBottom: 32, marginTop: 4 },
  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  title:     { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  label:     { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  input:     { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1F2937', marginBottom: 16 },
  btn:       { backgroundColor: '#1B4F72', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  note:      { color: '#93C5FD', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
