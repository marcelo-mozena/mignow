'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { showErrorToast } from '@/presentation/utils/errorToast';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/presentation/components/ui/radio-group';
import { Spinner } from '@/presentation/components/ui/spinner';
import { SilLogo } from '@/presentation/components/ui/sil-logo';
import { useAuthStore, type SetupMode } from '@/presentation/stores/useAuthStore';
import type { Environment } from '@/shared/constants/environments';
import { sendOtp, ApiError } from '@/infrastructure/api/authApi';
import { Email } from '@/domain/value-objects/Email';

const ENVIRONMENT_OPTIONS: { value: Environment; label: string }[] = [
  { value: 'test', label: 'Test' },
  { value: 'staging', label: 'Staging' },
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'prod', label: 'Production' },
];

export function LoginScreen() {
  const {
    userEmail,
    environment,
    setupMode,
    setUserEmail,
    setEnvironment,
    setSetupMode,
    setScreen,
  } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const isEmailValid = Email.validate(userEmail);
  const isFormValid = isEmailValid && environment !== '' && setupMode !== '';

  async function handleSendOtp() {
    if (!isFormValid || !environment) return;

    setLoading(true);
    try {
      await sendOtp(environment as Environment, userEmail);
      toast.success('Código OTP enviado com sucesso!');
      setScreen('otp');
    } catch (error) {
      if (error instanceof ApiError) {
        showErrorToast(error.status, error.message, error.errorCode);
      } else {
        showErrorToast(0, 'Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <SilLogo className="h-8 text-foreground" />
          </div>
          <CardTitle className="text-2xl">SSP Migration Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendOtp();
            }}
            className="space-y-6"
          >
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
              {userEmail && !isEmailValid && (
                <p className="text-sm text-destructive">Informe um e-mail válido.</p>
              )}
            </div>

            {/* Environment */}
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select
                value={environment}
                onValueChange={val => setEnvironment(val as Environment)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Setup Mode */}
            <div className="space-y-3">
              <Label>Modo de Setup</Label>
              <RadioGroup
                value={setupMode}
                onValueChange={val => setSetupMode(val as SetupMode)}
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organization" id="org-setup" />
                  <Label htmlFor="org-setup" className="cursor-pointer font-normal">
                    Organization Setup
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="environment" id="env-setup" />
                  <Label htmlFor="env-setup" className="cursor-pointer font-normal">
                    Environment Setup
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={!isFormValid || loading}>
              {loading && <Spinner className="mr-2" />}
              Enviar OTP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
