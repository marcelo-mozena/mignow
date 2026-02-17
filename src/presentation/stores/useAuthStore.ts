'use client';

import { useCallback, useSyncExternalStore } from 'react';

// --- Types ---

export type Environment = 'test' | 'staging' | 'sandbox' | 'prod';
export type SetupMode = 'organization' | 'environment';

export interface AuthState {
  userEmail: string;
  environment: Environment | '';
  setupMode: SetupMode | '';
  authToken: string;
  screen: 'login' | 'otp' | 'select-org' | 'main';
}

// --- URL Construction ---

const BASE_URLS: Record<Environment, string> = {
  test: 'https://api.platform.test.silsistemas.com.br',
  staging: 'https://api.platform.staging.silsistemas.com.br',
  sandbox: 'https://api.platform.sandbox.silsistemas.com.br',
  prod: 'https://api.platform.silsistemas.com.br',
};

export function getBaseUrl(env: Environment): string {
  return BASE_URLS[env];
}

// --- Store ---

let state: AuthState = {
  userEmail: '',
  environment: '',
  setupMode: '',
  authToken: '',
  screen: 'login',
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthState {
  return state;
}

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  emitChange();
}

function resetState() {
  state = {
    userEmail: '',
    environment: '',
    setupMode: '',
    authToken: '',
    screen: 'login',
  };
  emitChange();
}

// --- Hook ---

export function useAuthStore() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setUserEmail = useCallback((email: string) => setState({ userEmail: email }), []);
  const setEnvironment = useCallback((env: Environment) => setState({ environment: env }), []);
  const setSetupMode = useCallback((mode: SetupMode) => setState({ setupMode: mode }), []);
  const setAuthToken = useCallback((token: string) => setState({ authToken: token }), []);
  const setScreen = useCallback((screen: AuthState['screen']) => setState({ screen }), []);
  const logout = useCallback(() => resetState(), []);

  return {
    ...current,
    setUserEmail,
    setEnvironment,
    setSetupMode,
    setAuthToken,
    setScreen,
    logout,
  };
}
