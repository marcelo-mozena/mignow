'use client';

import React from 'react';
import { useAuthStore } from '@/presentation/stores/useAuthStore';
import { LoginScreen } from '@/presentation/pages/LoginScreen';
import { OtpScreen } from '@/presentation/pages/OtpScreen';
import { OrgSelectionScreen } from '@/presentation/pages/OrgSelectionScreen';
import { MainScreen } from '@/presentation/pages/MainScreen';

export function AppRouter() {
  const { screen } = useAuthStore();

  switch (screen) {
    case 'login':
      return <LoginScreen />;
    case 'otp':
      return <OtpScreen />;
    case 'select-org':
      return <OrgSelectionScreen />;
    case 'main':
      return <MainScreen />;
    default:
      return <LoginScreen />;
  }
}
