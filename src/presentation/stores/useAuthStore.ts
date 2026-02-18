'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import type { Environment } from '@/shared/constants/environments';

// Re-export for backwards compatibility
export type { Environment };
export { getBaseUrl } from '@/shared/constants/environments';

export type SetupMode = 'organization' | 'environment';

export interface AuthState {
  userEmail: string;
  environment: Environment | '';
  setupMode: SetupMode | '';
  authToken: string;
  screen: 'login' | 'otp' | 'select-org' | 'main';
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
  const setEnvironment = useCallback(
    (env: Environment) => store.setState({ environment: env }),
    []
  );
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
