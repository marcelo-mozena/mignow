'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { showErrorToast } from '@/presentation/utils/errorToast';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/presentation/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/presentation/components/ui/input-otp';
import { Spinner } from '@/presentation/components/ui/spinner';
import { SilLogo } from '@/presentation/components/ui/sil-logo';
import { useAuthStore } from '@/presentation/stores/useAuthStore';
import type { Environment } from '@/shared/constants/environments';
import {
  setOrgsFromJwt,
  setEnvSaved,
  updateOrgNames,
  updateCompanyNames,
} from '@/presentation/stores/useOrgStore';
import {
  validateToken,
  fetchOrganizacoes,
  fetchEmpresas,
  ApiError,
} from '@/infrastructure/api/authApi';
import { decodeJwt } from '@/shared/utils/jwt';

export function OtpScreen() {
  const { userEmail, environment, setupMode, setAuthToken, setScreen, logout } = useAuthStore();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isOtpValid = otpCode.length === 6;

  async function handleValidate() {
    if (!isOtpValid || environment === '') return;

    setLoading(true);
    try {
      const response = await validateToken(
        environment as Environment,
        userEmail,
        otpCode,
        setupMode === 'environment'
      );
      setAuthToken(response.access_token);

      // Decode JWT and extract organizations
      const jwt = decodeJwt(response.access_token);
      setOrgsFromJwt(jwt.name, jwt.orgs);

      // Fetch org names from API to enrich display
      if (jwt.orgs.length > 0) {
        try {
          const orgDtos = await fetchOrganizacoes(
            environment as Environment,
            response.access_token,
            jwt.orgs[0].id
          );
          const nameMap: Record<string, string> = {};
          for (const dto of orgDtos) {
            nameMap[dto.identificacao_api] = dto.nome;
          }
          updateOrgNames(nameMap);
          // Fetch company names in parallel
          try {
            const empresaDtos = await fetchEmpresas(
              environment as Environment,
              response.access_token,
              jwt.orgs[0].id
            );
            const companyMap: Record<string, string> = {};
            for (const dto of empresaDtos) {
              companyMap[dto.identificacao_api] = dto.nome;
            }
            updateCompanyNames(companyMap);
          } catch (empErr) {
            console.warn('[Empresa] Could not fetch company names:', empErr);
            toast.warning('Não foi possível carregar os nomes das empresas.');
          }
        } catch (orgErr) {
          console.warn('[Org] Could not fetch organization names:', orgErr);
          toast.warning('Não foi possível carregar os nomes das organizações.');
        }
      }

      // Save orgs to .env file via Electron IPC
      try {
        if (window.electron) {
          const result = (await window.electron.ipcRenderer.invoke('env:saveOrgs', {
            orgs: jwt.orgs,
            userName: jwt.name,
            userEmail: jwt.sub,
            environment,
          })) as { path: string };
          setEnvSaved(result.path);
          console.log('[JWT] Orgs saved to:', result.path);
        }
      } catch (envError) {
        console.warn('[JWT] Could not save .env file (non-Electron?):', envError);
      }

      toast.success('Autenticado com sucesso!');
      setScreen('select-org');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          showErrorToast(error.status, error.message, error.errorCode);
          logout();
          return;
        }
        showErrorToast(error.status, error.message, error.errorCode);
      } else {
        showErrorToast(0, 'Erro inesperado. Tente novamente.');
      }
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setScreen('login');
  }

  function handleBack() {
    setScreen('login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <SilLogo className="h-8 text-foreground" />
          </div>
          <CardTitle className="text-2xl">Verificação OTP</CardTitle>
          <CardDescription>Código de verificação enviado para seu WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleValidate();
            }}
            className="space-y-6"
          >
            {/* OTP Input */}
            <div className="space-y-2">
              <Label>Código de Verificação</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={loading}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Validate Button */}
            <Button type="submit" className="w-full" disabled={!isOtpValid || loading}>
              {loading && <Spinner className="mr-2" />}
              Validar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="link" onClick={handleResend} disabled={loading} className="text-sm">
            Reenviar código OTP
          </Button>
          <Button variant="ghost" onClick={handleBack} disabled={loading} className="text-sm">
            Voltar ao login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
