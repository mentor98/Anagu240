/**
 * StatusBadge — React Native pill badge showing application/title status.
 *
 * Covers all states from the registration pipeline plus REVOKED/CANCELLED.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusColor = {
  bg:   string;
  text: string;
  label: string;
};

const STATUS_MAP: Record<string, StatusColor> = {
  SUBMITTED:              { bg: '#EFF6FF', text: '#1D4ED8', label: 'Submitted' },
  SPATIAL_VERIFIED:       { bg: '#ECFDF5', text: '#065F46', label: 'Spatial Verified' },
  OWNERSHIP_VERIFIED:     { bg: '#ECFDF5', text: '#065F46', label: 'Ownership Verified' },
  LEGAL_VERIFIED:         { bg: '#ECFDF5', text: '#065F46', label: 'Legal Verified' },
  APPROVED:               { bg: '#F0FDF4', text: '#166534', label: 'Approved' },
  BLOCKCHAIN_REGISTERED:  { bg: '#EDE9FE', text: '#5B21B6', label: 'On Blockchain' },
  NFT_ISSUED:             { bg: '#FAF5FF', text: '#7E22CE', label: 'NFT Issued' },
  COMPLETED:              { bg: '#F0FDF4', text: '#14532D', label: 'Completed' },
  REJECTED:               { bg: '#FEF2F2', text: '#991B1B', label: 'Rejected' },
  CANCELLED:              { bg: '#F9FAFB', text: '#6B7280', label: 'Cancelled' },
  REVOKED:                { bg: '#FFF7ED', text: '#9A3412', label: 'Revoked' },
};

const DEFAULT_COLOR: StatusColor = { bg: '#F3F4F6', text: '#374151', label: 'Unknown' };

interface StatusBadgeProps {
  status: string;
  /** Optionally override the display label. */
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = STATUS_MAP[status] ?? DEFAULT_COLOR;
  const displayLabel = label ?? colors.label;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
