/**
 * OfflineBanner — network status indicator.
 *
 * Behaviour:
 *  - Offline  → persistent yellow banner: "You are offline — submissions will be queued"
 *  - Just came back online → green banner: "Back online — syncing..." — disappears after 3 s
 *  - Online (steady state) → renders nothing
 *
 * Uses expo-network to poll connectivity every 5 seconds.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import * as Network from 'expo-network';

type BannerState = 'hidden' | 'offline' | 'reconnecting';

export function OfflineBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const wasOffline = useRef(false);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  const showBanner = (state: BannerState) => {
    setBannerState(state);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideBanner = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setBannerState('hidden'));
  };

  useEffect(() => {
    const check = async () => {
      const state  = await Network.getNetworkStateAsync();
      const online = !!state.isConnected && !!state.isInternetReachable;

      if (!online) {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        wasOffline.current = true;
        showBanner('offline');
        return;
      }

      // We are online
      if (wasOffline.current) {
        wasOffline.current = false;
        showBanner('reconnecting');
        hideTimer.current = setTimeout(() => {
          hideBanner();
        }, 3_000);
      } else if (bannerState !== 'hidden') {
        hideBanner();
      }
    };

    check(); // run immediately
    const interval = setInterval(check, 5_000);

    return () => {
      clearInterval(interval);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [bannerState]); // eslint-disable-line react-hooks/exhaustive-deps

  if (bannerState === 'hidden') return null;

  const isOffline = bannerState === 'offline';

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: isOffline ? '#FEF3C7' : '#D1FAE5', opacity: fadeAnim },
      ]}
    >
      <Text style={[styles.text, { color: isOffline ? '#92400E' : '#065F46' }]}>
        {isOffline
          ? '⚠️  You are offline — submissions will be queued'
          : '✓  Back online — syncing...'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // On Android, add top padding for the status bar
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
