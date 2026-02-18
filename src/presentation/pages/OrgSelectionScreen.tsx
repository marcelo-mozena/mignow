'use client';

import React, { useState } from 'react';
import { Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Label } from '@/presentation/components/ui/label';
import { useAuthStore } from '@/presentation/stores/useAuthStore';
import { useOrgStore } from '@/presentation/stores/useOrgStore';

export function OrgSelectionScreen() {
  const { setScreen } = useAuthStore();
  const { orgs, userName, companyNames, setSelectedOrg, setSelectedCompany } = useOrgStore();

  const [orgId, setOrgId] = useState('');
  const [companyId, setCompanyId] = useState('');

  const selectedOrg = orgs.find(o => o.id === orgId);
  const companies = selectedOrg?.companies ?? [];

  function handleOrgChange(value: string) {
    setOrgId(value);
    setCompanyId('');
  }

  function handleContinue() {
    if (!orgId || !companyId) return;
    setSelectedOrg(orgId);
    setSelectedCompany(companyId);
    setScreen('main');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Selecionar Contexto</CardTitle>
          <CardDescription>
            {userName ? (
              <>
                Bem-vindo, <strong>{userName}</strong>. Selecione a organização e empresa para
                continuar.
              </>
            ) : (
              'Selecione a organização e empresa para continuar.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Select */}
          <div className="space-y-2">
            <Label>Organização</Label>
            <Select value={orgId} onValueChange={handleOrgChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a organização..." />
              </SelectTrigger>
              <SelectContent>
                {orgs.map(org => (
                  <SelectItem key={org.id} value={org.id} className="text-sm">
                    {org.nome ?? org.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company Select — only after selecting org */}
          {orgId && companies.length > 0 && (
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c} value={c} className="text-sm">
                      {companyNames[c] ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Continue Button */}
          <Button className="w-full gap-2" onClick={handleContinue} disabled={!orgId || !companyId}>
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
