'use client';

import { useSyncExternalStore } from 'react';

// --- Types ---

export interface RequestLogEntry {
  method: string;
  url: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  timestamp: number;
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
}

interface RequestLogState {
  current: RequestLogEntry | null;
  history: RequestLogEntry[];
}

// --- Store ---

let state: RequestLogState = { current: null, history: [] };

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): RequestLogState {
  return state;
}

export function setRequestLog(entry: RequestLogEntry) {
  // Only add to history when request is finished (not pending)
  if (entry.status !== 'pending') {
    state = { current: entry, history: [entry, ...state.history].slice(0, 200) };
  } else {
    state = { ...state, current: entry };
  }
  emitChange();
}

export function clearRequestHistory() {
  state = { ...state, history: [] };
  emitChange();
}

// --- Hooks ---

export function useRequestLog(): RequestLogEntry | null {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => state);
  return s.current;
}

export function useRequestHistory(): RequestLogEntry[] {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => state);
  return s.history;
}
