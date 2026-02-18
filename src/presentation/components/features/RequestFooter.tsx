'use client';

import React, { useState } from 'react';
import { Eye, Copy, Check, History, Loader2, Trash2 } from 'lucide-react';
import {
  useRequestLog,
  useRequestHistory,
  clearRequestHistory,
  type RequestLogEntry,
} from '@/presentation/stores/useRequestLogStore';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';

const methodColors: Record<string, string> = {
  GET: 'bg-bp-blue-3',
  POST: 'bg-bp-green-3',
  PUT: 'bg-bp-gold-3',
  PATCH: 'bg-bp-orange-3',
  DELETE: 'bg-bp-red-3',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  );
}

function JsonPanel({ title, data }: { title: string; data: unknown }) {
  const text = data !== undefined ? JSON.stringify(data, null, 2) : '—';

  return (
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {data !== undefined && <CopyButton text={text} />}
      </div>
      <pre className="flex-1 overflow-auto rounded-md border bg-muted/50 p-3 text-xs font-mono whitespace-pre-wrap break-all max-h-[60vh]">
        {text}
      </pre>
    </div>
  );
}

export function RequestFooter() {
  const entry = useRequestLog();
  const history = useRequestHistory();
  const [detailOpen, setDetailOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RequestLogEntry | null>(null);

  if (!entry) return null;

  const activeEntry = selectedEntry ?? entry;
  const activeMethodColor = methodColors[activeEntry.method] ?? 'bg-bp-gray-1';
  const footerMethodColor = methodColors[entry.method] ?? 'bg-bp-gray-1';

  function openDetail(e: RequestLogEntry) {
    setSelectedEntry(e);
    setHistoryOpen(false);
    setDetailOpen(true);
  }

  function handleDetailClose(open: boolean) {
    setDetailOpen(open);
    if (!open) setSelectedEntry(null);
  }

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-border bg-[#2E3192] px-4 py-1.5 text-xs text-white font-mono shadow-lg">
        {/* Left side: status indicator + method + url */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Spinning loader while pending, status code badge when done */}
          {entry.status === 'pending' ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-bp-light-gray-5" />
          ) : entry.statusCode !== undefined ? (
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 border-0 px-1.5 py-0 text-[10px] font-bold tabular-nums',
                entry.statusCode < 400
                  ? 'bg-bp-green-1 text-bp-green-5'
                  : 'bg-bp-red-1 text-bp-red-5'
              )}
            >
              {entry.statusCode}
            </Badge>
          ) : null}

          {/* HTTP method */}
          <Badge
            className={cn(
              'shrink-0 border-0 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-white',
              footerMethodColor
            )}
          >
            {entry.method}
          </Badge>

          {/* URL */}
          <span className="truncate text-bp-gray-4">{entry.url}</span>
        </div>

        {/* Right side: Detalhes + Histórico */}
        <div className="flex shrink-0 items-center gap-1">
          {entry.status !== 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-bp-light-gray-5 hover:text-white"
              onClick={() => {
                setSelectedEntry(null);
                setDetailOpen(true);
              }}
            >
              Detalhes
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-[10px] text-bp-light-gray-5 hover:text-white"
            onClick={() => setHistoryOpen(true)}
          >
            Histórico
            {history.length > 0 && (
              <Badge
                variant="outline"
                className="ml-0.5 h-4 shrink-0 border-bp-gray-3 bg-bp-gray-3 px-1.5 py-0 text-[9px] font-semibold text-white"
              >
                {history.length}
              </Badge>
            )}
          </Button>
        </div>
      </footer>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={handleDetailClose}>
        <DialogContent className="max-w-6xl w-[90vw] h-[75vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-mono">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
                  activeMethodColor
                )}
              >
                {activeEntry.method}
              </span>
              <span className="truncate">{activeEntry.url}</span>
              {activeEntry.statusCode !== undefined && (
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    activeEntry.statusCode < 400
                      ? 'bg-bp-green-1 text-bp-green-5'
                      : 'bg-bp-red-1 text-bp-red-5'
                  )}
                >
                  {activeEntry.statusCode}
                </span>
              )}
              <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                {new Date(activeEntry.timestamp).toLocaleString('pt-BR')}
              </span>
            </DialogTitle>
          </DialogHeader>
          {/* Request Headers */}
          {activeEntry.requestHeaders && Object.keys(activeEntry.requestHeaders).length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Headers</h3>
                <CopyButton
                  text={Object.entries(activeEntry.requestHeaders)
                    .map(
                      ([k, v]) => `${k}: ${k.toLowerCase() === 'authorization' ? '[REDACTED]' : v}`
                    )
                    .join('\n')}
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-muted/50 px-3 py-2 text-xs font-mono">
                {Object.entries(activeEntry.requestHeaders).map(([key, value]) => (
                  <span key={key}>
                    <span className="text-muted-foreground">{key}:</span>{' '}
                    <span className="break-all">
                      {key.toLowerCase() === 'authorization'
                        ? `${value.substring(0, 20)}...`
                        : value}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-1 gap-4 overflow-hidden">
            <JsonPanel title="Request (enviado)" data={activeEntry.requestBody} />
            <JsonPanel title="Response (recebido)" data={activeEntry.responseBody} />
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-[60rem] w-[80vw] h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Requests
                <span className="text-xs font-normal text-muted-foreground">
                  ({history.length})
                </span>
              </span>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={clearRequestHistory}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto rounded-md border">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Nenhuma request registrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Horário</TableHead>
                    <TableHead className="w-[70px]">Método</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-[70px]">Status</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h, i) => (
                    <TableRow
                      key={`${h.timestamp}-${i}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(h)}
                    >
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(h.timestamp).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white',
                            methodColors[h.method] ?? 'bg-bp-gray-1'
                          )}
                        >
                          {h.method}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[300px]">
                        {h.url.replace(/^https?:\/\/[^/]+/, '')}
                      </TableCell>
                      <TableCell>
                        {h.statusCode !== undefined && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                              h.statusCode < 400
                                ? 'bg-bp-green-1 text-bp-green-5'
                                : 'bg-bp-red-1 text-bp-red-5'
                            )}
                          >
                            {h.statusCode}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
