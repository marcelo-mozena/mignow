'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import type { JwtOrg } from '@/shared/utils/jwt';

// --- Types ---

export interface OrgState {
  userName: string;
  orgs: JwtOrg[];
  selectedOrgId: string;
  selectedCompanyId: string;
  envSaved: boolean;
  envPath: string;
}

// --- Store ---

const store = createStore<OrgState>({
  userName: '',
  orgs: [],
  selectedOrgId: '',
  selectedCompanyId: '',
  envSaved: false,
  envPath: '',
});

export function setOrgsFromJwt(userName: string, orgs: JwtOrg[]) {
  store.setState({
    userName,
    orgs,
    selectedOrgId: '',
    selectedCompanyId: '',
    envSaved: false,
    envPath: '',
  });
}

export function setEnvSaved(envPath: string) {
  store.setState({ envSaved: true, envPath });
}

// --- Derived ---

export function getSelectedOrg(): JwtOrg | undefined {
  const s = store.getState();
  return s.orgs.find(o => o.id === s.selectedOrgId);
}

// --- Hook ---

export function useOrgStore() {
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const setSelectedOrg = useCallback((orgId: string) => {
    store.setState({ selectedOrgId: orgId, selectedCompanyId: '' });
  }, []);

  const setSelectedCompany = useCallback((companyId: string) => {
    store.setState({ selectedCompanyId: companyId });
  }, []);

  const selectedOrg = current.orgs.find(o => o.id === current.selectedOrgId);

  const reset = useCallback(() => store.reset(), []);

  return {
    ...current,
    selectedOrg,
    setSelectedOrg,
    setSelectedCompany,
    reset,
  };
}
