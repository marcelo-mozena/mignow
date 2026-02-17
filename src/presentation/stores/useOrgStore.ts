'use client';

import { useCallback, useSyncExternalStore } from 'react';
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

let state: OrgState = {
  userName: '',
  orgs: [],
  selectedOrgId: '',
  selectedCompanyId: '',
  envSaved: false,
  envPath: '',
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): OrgState {
  return state;
}

function setState(partial: Partial<OrgState>) {
  state = { ...state, ...partial };
  emitChange();
}

export function setOrgsFromJwt(userName: string, orgs: JwtOrg[]) {
  setState({
    userName,
    orgs,
    selectedOrgId: '',
    selectedCompanyId: '',
    envSaved: false,
    envPath: '',
  });
}

export function setEnvSaved(envPath: string) {
  setState({ envSaved: true, envPath });
}

function resetOrgState() {
  state = {
    userName: '',
    orgs: [],
    selectedOrgId: '',
    selectedCompanyId: '',
    envSaved: false,
    envPath: '',
  };
  emitChange();
}

// --- Derived ---

export function getSelectedOrg(): JwtOrg | undefined {
  return state.orgs.find(o => o.id === state.selectedOrgId);
}

// --- Hook ---

export function useOrgStore() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => state);

  const setSelectedOrg = useCallback((orgId: string) => {
    setState({ selectedOrgId: orgId, selectedCompanyId: '' });
  }, []);

  const setSelectedCompany = useCallback((companyId: string) => {
    setState({ selectedCompanyId: companyId });
  }, []);

  const selectedOrg = current.orgs.find(o => o.id === current.selectedOrgId);

  const reset = useCallback(() => resetOrgState(), []);

  return {
    ...current,
    selectedOrg,
    setSelectedOrg,
    setSelectedCompany,
    reset,
  };
}
