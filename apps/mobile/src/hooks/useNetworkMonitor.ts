/**
 * useNetworkMonitor — watches network connectivity.
 * When the device comes back online, flushes the offline queue.
 */
import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import { flushQueue, getQueueLength } from '../services/offlineQueue';
import { applicationsApi } from '../services/api';

export function useNetworkMonitor() {
  const wasOffline = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      const isOnline = !!state.isConnected && !!state.isInternetReachable;

      if (!isOnline) {
        wasOffline.current = true;
        return;
      }

      if (wasOffline.current) {
        wasOffline.current = false;
        const qLen = await getQueueLength();
        if (qLen > 0) {
          console.log(`[NetworkMonitor] Back online. Flushing ${qLen} queued items…`);
          const result = await flushQueue(async (item) => {
            if (item.type === 'APPLICATION') {
              await applicationsApi.submit(item.payload);
            }
            // Add more item.type handlers here as needed
          });
          console.log(`[NetworkMonitor] Flush complete:`, result);
        }
      }
    };

    check();
    interval = setInterval(check, 10_000); // check every 10 seconds
    return () => clearInterval(interval);
  }, []);
}
