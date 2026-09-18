/**
 * PipelineProgress — vertical list of the 8 registration pipeline stages.
 *
 * Each row shows:
 *  ●  Stage label
 *
 * Dot colour:
 *  - Completed stage  → green  (#16A34A)
 *  - Current stage    → primary blue (#1B4F72)
 *  - Future stage     → gray   (#D1D5DB)
 *
 * Props:
 *  currentStatus  — the ApplicationStatus string from the backend
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PipelineStage, ApplicationStatus } from '../types';

// The ordered stage keys as a plain array for index lookups
const STAGE_KEYS = PipelineStage.map((s) => s.key);

const REJECTED_STATUSES = new Set([
  ApplicationStatus.REJECTED,
  ApplicationStatus.CANCELLED,
]);

function getStageIndex(status: string): number {
  const idx = STAGE_KEYS.indexOf(status as ApplicationStatus);
  return idx === -1 ? -1 : idx;
}

interface PipelineProgressProps {
  currentStatus: string;
}

export function PipelineProgress({ currentStatus }: PipelineProgressProps) {
  const currentIdx    = getStageIndex(currentStatus);
  const isTerminalBad = REJECTED_STATUSES.has(currentStatus as ApplicationStatus);

  return (
    <View style={styles.container}>
      {PipelineStage.map((stage, idx) => {
        let dotColor: string;
        let labelColor: string;

        if (isTerminalBad) {
          // All stages gray when rejected/cancelled
          dotColor   = '#D1D5DB';
          labelColor = '#9CA3AF';
        } else if (currentIdx === -1) {
          dotColor   = '#D1D5DB';
          labelColor = '#9CA3AF';
        } else if (idx < currentIdx) {
          // Completed
          dotColor   = '#16A34A';
          labelColor = '#15803D';
        } else if (idx === currentIdx) {
          // Active
          dotColor   = '#1B4F72';
          labelColor = '#1B4F72';
        } else {
          // Future
          dotColor   = '#D1D5DB';
          labelColor = '#9CA3AF';
        }

        const isLast = idx === PipelineStage.length - 1;

        return (
          <View key={stage.key} style={styles.row}>
            {/* Dot + connector column */}
            <View style={styles.dotColumn}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: idx < currentIdx ? '#16A34A' : '#E5E7EB' },
                  ]}
                />
              )}
            </View>

            {/* Stage info */}
            <View style={styles.labelColumn}>
              <Text style={[styles.stepText, { color: labelColor }]}>
                Step {stage.step}
              </Text>
              <Text
                style={[
                  styles.labelText,
                  { color: labelColor },
                  idx === currentIdx && styles.labelActive,
                ]}
              >
                {stage.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  dotColumn: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginTop: 2,
  },
  connector: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: 0,
  },
  labelColumn: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 8,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 1,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
