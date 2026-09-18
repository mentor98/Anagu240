/**
 * Anagu Mobile — Offline Queue Service
 *
 * Component 3B requirement: supports offline data capture with later
 * synchronisation for low-connectivity field conditions.
 *
 * Flow:
 *  1. If device is offline when user submits, enqueue() stores the
 *     submission in AsyncStorage.
 *  2. useNetworkMonitor() watches for network reconnection.
 *  3. On reconnect, flushQueue() iterates the queue and submits each item.
 *  4. Successfully submitted items are removed; failed items are retried
 *     up to MAX_ATTEMPTS times.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY    = 'anagu_offline_queue';
const MAX_ATTEMPTS = 5;

export interface QueuedSubmission {
  id:        string;
  type:      string;             // 'APPLICATION' | 'DOCUMENT_UPLOAD' | etc.
  payload:   Record<string, unknown>;
  queuedAt:  number;             // Unix ms
  attempts:  number;
}

/** Add an item to the offline queue. */
export async function enqueue(
  type: string,
  payload: Record<string, unknown>,
): Promise<QueuedSubmission> {
  const queue = await getQueue();
  const item: QueuedSubmission = {
    id:       `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    queuedAt: Date.now(),
    attempts: 0,
  };
  queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.log(`[OfflineQueue] Queued item ${item.id} (${type})`);
  return item;
}

/** Read the current queue without modifying it. */
export async function getQueue(): Promise<QueuedSubmission[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as QueuedSubmission[]) : [];
}

/** Get the number of items waiting in the queue. */
export async function getQueueLength(): Promise<number> {
  return (await getQueue()).length;
}

/**
 * Flush the queue by submitting each item via submitFn.
 * Returns counts of how many were flushed vs permanently failed.
 */
export async function flushQueue(
  submitFn: (item: QueuedSubmission) => Promise<void>,
): Promise<{ flushed: number; failed: number; remaining: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { flushed: 0, failed: 0, remaining: 0 };

  let flushed = 0;
  let failed  = 0;
  const remaining: QueuedSubmission[] = [];

  for (const item of queue) {
    try {
      await submitFn(item);
      flushed++;
      console.log(`[OfflineQueue] Flushed item ${item.id}`);
    } catch (err) {
      item.attempts++;
      if (item.attempts < MAX_ATTEMPTS) {
        remaining.push(item);
        console.warn(`[OfflineQueue] Item ${item.id} failed (attempt ${item.attempts}/${MAX_ATTEMPTS})`);
      } else {
        failed++;
        console.error(`[OfflineQueue] Item ${item.id} permanently failed after ${MAX_ATTEMPTS} attempts`);
      }
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { flushed, failed, remaining: remaining.length };
}

/** Clear the entire queue (for testing / development). */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
