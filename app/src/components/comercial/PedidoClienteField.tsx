/**
 * PedidoClienteField.tsx — Seletor de cliente com autocomplete rico
 *
 * FIX v2:
 *   - autoComplete="off" (desativa autocomplete nativo do navegador)
 *   - Dropdown só abre ao digitar ou ao clicar na lupa (nunca abre
 *     automaticamente só por foco)
 *
 * Nota: o redesenho completo (campos Código/Nome ligados + modal de pesquisa)
 * fica pra Etapa 2. Aqui é só consertar os 2 bugs críticos.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientesStore } from '@/stores/admin/clientesStore';
import type { Cliente } from '@/types/admin/cliente.types';

interface PedidoClienteFieldProps {
  id?: string;
  label?: string;
  value: number;
  displayName?: string;
  displayCodigo?: string;
  onChange: (clienteId: number, cliente?: Cliente) => void;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
}

const DEBOUNCE_MS = 300;

export function PedidoClienteField({
  id = 'clienteId',
  label = 'Cliente',
  value,
  displayName,
  displayCodigo,
  onChange,
  readOnly = false,
  required = false,
  error,
}: PedidoClienteFieldProps) {
  const clientes = useClientesStore((s) => s.clientes);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clientes.length === 0) void fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce de busca — só dispara se o dropdown estiver aberto
  useEffect(() => {
    if (!open) return;
    const term = search.trim();
    const t = window.setTimeout(() => {
      void fetchClientes(term || undefined);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, open, fetchClientes]);

  // Direção do dropdown
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setDropUp(spaceBelow < 260 && spaceAbove > spaceBelow);
  }, [open]);

  const handleSelect = useCallback(
    (c: Cliente) => {
      onChange(c.id, c);
      setSearch('');
      setOpen(false);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(0);
    setSearch('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onChange]);

  const hasSelected = value > 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full">
      {label && (
        <Label
          htmlFor={id}
          className={`text-xs font-medium ${
            error
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
          {required && ' *'}
        </Label>
      )}

      {hasSelected && !readOnly ? (
        /* Selecionado — chip com botão X */
        <div className="relative">
          <div
            className={`flex items-center gap-2 h-9 px-3 pr-9 rounded-md border bg-white dark:bg-slate-950 ${
              error ? 'border-red-400 dark:border-red-500' : 'border-input'
            }`}
          >
            {displayCodigo && (
              <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-muted rounded px-1.5 py-0.5 shrink-0">
                {displayCodigo}
              </span>
            )}
            <span className="text-sm text-foreground truncate">
              {displayName || '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
            title="Limpar seleção"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : readOnly ? (
        /* Readonly view */
        <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-white dark:bg-slate-950 border-input">
          {displayCodigo && (
            <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-muted rounded px-1.5 py-0.5 shrink-0">
              {displayCodigo}
            </span>
          )}
          <span className="text-sm text-foreground truncate">
            {displayName || '—'}
          </span>
        </div>
      ) : (
        /* Input de busca */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id={id}
            ref={inputRef}
            placeholder="Código, nome, CPF/CNPJ ou cidade"
            /* Desativa autocomplete nativo do browser */
            autoComplete="off"
            name="pedido-cliente-search"
            data-1p-ignore
            data-lpignore="true"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              /* Abre dropdown só quando o usuário DIGITA */
              if (e.target.value.length > 0) setOpen(true);
            }}
            /* REMOVIDO: onFocus que abria automaticamente.
               Pra abrir sem digitar, o usuário clica explicitamente (mousedown). */
            onMouseDown={() => {
              if (!open) setOpen(true);
            }}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            className={`h-9 text-sm bg-white dark:bg-slate-950 pl-9 ${
              error
                ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-400/30'
                : ''
            }`}
          />

          {open && (
            <div
              className={`absolute z-50 w-full rounded-lg border bg-popover shadow-md ${
                dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
              style={{ maxHeight: 240, overflowY: 'auto' }}
            >
              {clientes.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground italic">
                  Nenhum cliente encontrado
                </p>
              ) : (
                clientes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-muted/60 transition-colors border-b border-border/50 last:border-b-0 flex flex-col gap-0.5"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(c)}
                  >
                    <div className="flex items-center gap-2">
                      {c.codigo && (
                        <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-muted rounded px-1.5 py-0.5 shrink-0">
                          {c.codigo}
                        </span>
                      )}
                      <span className="text-sm font-medium truncate">{c.nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {c.cidade && <span>{c.cidade}</span>}
                      {c.cpfCnpj && (
                        <>
                          {c.cidade && <span>·</span>}
                          <span className="font-mono">{c.cpfCnpj}</span>
                        </>
                      )}
                      {c.telefone && (
                        <>
                          {(c.cidade || c.cpfCnpj) && <span>·</span>}
                          <span className="font-mono">{c.telefone}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
