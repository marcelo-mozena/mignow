'use client';

import { useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import type { RequestLogEntry } from '@/shared/types';

export type { RequestLogEntry };

// --- Store ---

interface RequestLogState {
  current: RequestLogEntry | null;
  history: RequestLogEntry[];
}

const store = createStore<RequestLogState>({ current: null, history: [] });

export function setRequestLog(entry: RequestLogEntry) {
  const current = store.getState();
  // Only add to history when request is finished (not pending)
  if (entry.status !== 'pending') {
    store.setState({ current: entry, history: [entry, ...current.history].slice(0, 200) });
  } else {
    store.setState({ current: entry });
  }
}

export function clearRequestHistory() {
  store.setState({ history: [] });
}

// --- Hooks ---

export function useRequestLog(): RequestLogEntry | null {
  const s = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return s.current;
}

export function useRequestHistory(): RequestLogEntry[] {
  const s = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return s.history;
}
