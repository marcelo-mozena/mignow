'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Loader2,
  Search,
  Upload,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';

// --- Types ---

import type { ValidationError } from '@/shared/types';

export type { ValidationError };

export interface ImportOption {
  value: string;
  label: string;
}

type ImportStep =
  | 'select'
  | 'attach'
  | 'validate'
  | 'validating'
  | 'validated'
  | 'importing'
  | 'imported';

interface ImportTabProps {
  /** Options for the dropdown */
  options: ImportOption[];
  /** Called when the user clicks "Validar" */
  onValidate?: (dataType: string, file: File) => Promise<ValidationError[]>;
  /** Called when the user clicks "Importar" */
  onImport?: (dataType: string, file: File) => Promise<void>;
}

// --- Component ---

export function ImportTab({ options, onValidate, onImport }: ImportTabProps) {
  const [selectedData, setSelectedData] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<ImportStep>('select');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStep: ImportStep = (() => {
    if (
      step === 'validating' ||
      step === 'importing' ||
      step === 'validated' ||
      step === 'imported'
    )
      return step;
    if (!selectedData) return 'select';
    if (!file) return 'attach';
    return 'validate';
  })();

  const handleDataSelect = useCallback((value: string) => {
    setSelectedData(value);
    setFile(null);
    setErrors([]);
    setStep('select');
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setErrors([]);
    setStep('validate');
  }, []);

  const handleValidate = useCallback(async () => {
    if (!file || !selectedData) return;
    setStep('validating');
    setErrors([]);
    try {
      const result = onValidate ? await onValidate(selectedData, file) : [];
      setErrors(result);
      setStep(result.length > 0 ? 'validate' : 'validated');
    } catch {
      setErrors([{ field: 'Geral', error: 'Erro inesperado ao validar o arquivo.' }]);
      setStep('validate');
    }
  }, [file, selectedData, onValidate]);

  const handleImport = useCallback(async () => {
    if (!file || !selectedData) return;
    setStep('importing');
    try {
      if (onImport) await onImport(selectedData, file);
      setStep('imported');
    } catch {
      setErrors([{ field: 'Geral', error: 'Erro inesperado ao importar o arquivo.' }]);
      setStep('validate');
    }
  }, [file, selectedData, onImport]);

  const handleReset = useCallback(() => {
    setSelectedData('');
    setFile(null);
    setErrors([]);
    setStep('select');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const selectedLabel = options.find(o => o.value === selectedData)?.label;

  // --- Search & Pagination for errors ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredErrors = useMemo(() => {
    if (!searchTerm.trim()) return errors;
    const term = searchTerm.toLowerCase();
    return errors.filter(
      err =>
        (err.row !== undefined && String(err.row).includes(term)) ||
        err.field.toLowerCase().includes(term) ||
        err.error.toLowerCase().includes(term)
    );
  }, [errors, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredErrors.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedErrors = filteredErrors.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset page when search or errors change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Row: dropdown + file + buttons */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Dropdown */}
        <div className="w-64 space-y-1.5">
          <label className="text-sm font-medium text-foreground">Dados para importar</label>
          <Select value={selectedData} onValueChange={handleDataSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File input — appears after selecting data */}
        {selectedData && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Arquivo</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <FileUp className="h-4 w-4" />
                {file ? 'Trocar arquivo' : 'Anexar arquivo'}
              </Button>
              {file && (
                <span className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {file.name}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {/* Action buttons — appear after attaching file */}
        {file && selectedData && (
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleValidate}
              disabled={currentStep === 'validating' || currentStep === 'importing'}
              className="gap-1.5"
            >
              {currentStep === 'validating' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Validar
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={currentStep !== 'validated'}
              className="gap-1.5"
            >
              {currentStep === 'importing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Importar
            </Button>
          </div>
        )}
      </div>

      {/* Success message */}
      {currentStep === 'imported' && (
        <div className="flex items-center gap-3 rounded-md border border-bp-green-2/40 bg-bp-green-1/20 p-4 text-bp-green-5">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Importação de &quot;{selectedLabel}&quot; concluída com sucesso!
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Nova importação
          </Button>
        </div>
      )}

      {/* Validated OK message */}
      {currentStep === 'validated' && errors.length === 0 && (
        <div className="flex items-center gap-3 rounded-md border border-bp-green-2/40 bg-bp-green-1/20 p-4 text-bp-green-5">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Arquivo validado com sucesso. Clique em &quot;Importar&quot; para prosseguir.
          </p>
        </div>
      )}

      {/* Validation errors table */}
      {errors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {errors.length} erro{errors.length > 1 ? 's' : ''} encontrado
              {errors.length > 1 ? 's' : ''} na validação
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar erros..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="rounded-md border border-destructive/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                  <TableHead className="w-[80px] font-semibold text-destructive">Linha</TableHead>
                  <TableHead className="w-[200px] font-semibold text-destructive">Campo</TableHead>
                  <TableHead className="font-semibold text-destructive">Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedErrors.length > 0 ? (
                  paginatedErrors.map((err, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{err.row ?? '—'}</TableCell>
                      <TableCell className="font-medium">{err.field}</TableCell>
                      <TableCell>{err.error}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      Nenhum erro encontrado para &quot;{searchTerm}&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Mostrando {filteredErrors.length > 0 ? (safePage - 1) * pageSize + 1 : 0}–
              {Math.min(safePage * pageSize, filteredErrors.length)} de {filteredErrors.length}
              {searchTerm.trim() && ` (total: ${errors.length})`}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
