'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ElectronCommandBus, CommandBus } from '../../infrastructure/electron-api/CommandBus';
import { ElectronQueryBus, QueryBus } from '../../infrastructure/electron-api/QueryBus';

interface CQRSContextType {
  commandBus: CommandBus;
  queryBus: QueryBus;
}

const CQRSContext = createContext<CQRSContextType | undefined>(undefined);

interface CQRSProviderProps {
  children: ReactNode;
}

export const CQRSProvider: React.FC<CQRSProviderProps> = ({ children }) => {
  const commandBus = useMemo(() => new ElectronCommandBus(), []);
  const queryBus = useMemo(() => new ElectronQueryBus(), []);

  return <CQRSContext.Provider value={{ commandBus, queryBus }}>{children}</CQRSContext.Provider>;
};

export const useCQRS = () => {
  const context = useContext(CQRSContext);
  if (!context) {
    throw new Error('useCQRS must be used within a CQRSProvider');
  }
  return context;
};

export const useCommandBus = () => {
  const { commandBus } = useCQRS();
  return commandBus;
};

export const useQueryBus = () => {
  const { queryBus } = useCQRS();
  return queryBus;
};
