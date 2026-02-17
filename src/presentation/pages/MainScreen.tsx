'use client';

import React from 'react';
import { Building2, LogOut, Mail, Server, Settings } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Separator } from '@/presentation/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { ImportTab, type ImportOption } from '@/presentation/components/features/import/ImportTab';
import { SilLogo } from '@/presentation/components/ui/sil-logo';
import { useImport } from '@/presentation/hooks/useImport';
import { useAuthStore } from '@/presentation/stores/useAuthStore';
import { useOrgStore } from '@/presentation/stores/useOrgStore';

// --- Import options per tab ---

const DADOS_MESTRE_OPTIONS: ImportOption[] = [
  { value: 'veiculos', label: 'Veículos' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'fornecedores', label: 'Fornecedores' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'centros-custo', label: 'Centros de Custo' },
  { value: 'plano-contas', label: 'Plano de Contas' },
];

const TORRE_CONTROLE_OPTIONS: ImportOption[] = [
  { value: 'rotas', label: 'Rotas' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'motoristas', label: 'Motoristas' },
  { value: 'pontos-entrega', label: 'Pontos de Entrega' },
];

const FRIGORIFICO_OPTIONS: ImportOption[] = [
  { value: 'animais', label: 'Animais' },
  { value: 'lotes', label: 'Lotes' },
  { value: 'abates', label: 'Abates' },
  { value: 'cortes', label: 'Cortes' },
];

const ENVIRONMENT_LABELS: Record<string, string> = {
  test: 'Test',
  staging: 'Staging',
  sandbox: 'Sandbox',
  prod: 'Production',
};

const SETUP_MODE_LABELS: Record<string, string> = {
  organization: 'Organization Setup',
  environment: 'Environment Setup',
};

const ENVIRONMENT_BADGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  test: 'secondary',
  staging: 'outline',
  sandbox: 'secondary',
  prod: 'destructive',
};

export function MainScreen() {
  const { userEmail, environment, setupMode, logout, setScreen } = useAuthStore();
  const {
    userName,
    orgs,
    selectedOrgId,
    selectedCompanyId,
    selectedOrg,
    setSelectedOrg,
    setSelectedCompany,
  } = useOrgStore();
  const { onValidate, onImport } = useImport();

  const companies = selectedOrg?.companies ?? [];

  function handleOrgChange(value: string) {
    setSelectedOrg(value);
  }

  function handleCompanyChange(value: string) {
    setSelectedCompany(value);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SilLogo className="h-5 text-foreground" />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">SSP Migration Wizard</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <Mail className="h-3 w-3" />
              {userEmail}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <Server className="h-3 w-3" />
              {ENVIRONMENT_LABELS[environment] ?? environment}
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs font-normal">
              <Settings className="h-3 w-3" />
              {SETUP_MODE_LABELS[setupMode] ?? setupMode}
            </Badge>
          </div>
        </div>

        {/* Org / Company selectors */}
        <div className="border-t">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Organização:</span>
              <Select value={selectedOrgId} onValueChange={handleOrgChange}>
                <SelectTrigger className="h-8 w-[260px] text-xs">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((org, idx) => (
                    <SelectItem key={org.id} value={org.id} className="text-xs">
                      Org {idx + 1} — {org.id.substring(0, 8)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrgId && companies.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Empresa:</span>
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className="h-8 w-[260px] text-xs">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c, idx) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        Empresa {idx + 1} — {c.substring(0, 8)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Import Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Importação de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dados-mestre">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="dados-mestre">Dados Mestre</TabsTrigger>
                <TabsTrigger value="torre-controle">Torre de Controle</TabsTrigger>
                <TabsTrigger value="frigorifico">Frigorífico</TabsTrigger>
              </TabsList>

              <TabsContent value="dados-mestre" className="mt-6">
                <ImportTab
                  options={DADOS_MESTRE_OPTIONS}
                  onValidate={onValidate}
                  onImport={onImport}
                />
              </TabsContent>

              <TabsContent value="torre-controle" className="mt-6">
                <ImportTab
                  options={TORRE_CONTROLE_OPTIONS}
                  onValidate={onValidate}
                  onImport={onImport}
                />
              </TabsContent>

              <TabsContent value="frigorifico" className="mt-6">
                <ImportTab
                  options={FRIGORIFICO_OPTIONS}
                  onValidate={onValidate}
                  onImport={onImport}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
