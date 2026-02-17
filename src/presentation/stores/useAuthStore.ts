'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { createStore } from './createStore';

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

const store = createStore<AuthState>({
  userEmail: '',
  environment: '',
  setupMode: '',
  authToken: '',
  screen: 'login',
});

// --- Hook ---

export function useAuthStore() {
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const setUserEmail = useCallback((email: string) => store.setState({ userEmail: email }), []);
  const setEnvironment = useCallback((env: Environment) => store.setState({ environment: env }), []);
  const setSetupMode = useCallback((mode: SetupMode) => store.setState({ setupMode: mode }), []);
  const setAuthToken = useCallback((token: string) => store.setState({ authToken: token }), []);
  const setScreen = useCallback((screen: AuthState['screen']) => store.setState({ screen }), []);
  const logout = useCallback(() => store.reset(), []);

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
