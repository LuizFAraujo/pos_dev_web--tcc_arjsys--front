/**
 * PedidoClienteField.tsx — Seletor de cliente com autocomplete rico
 *
 * Características:
 *   - Dropdown mostra: [CLI-0042] Nome · cidade · CPF/CNPJ · telefone
 *   - Busca server-side via ?busca= (debounce 300ms)
 *   - Altura do dropdown limitada (evita bater na barra de tarefas)
 *   - Posicionamento automático: abre pra cima se não tiver espaço embaixo
 *   - Uma vez selecionado, mostra "CLI-0042 · Nome" compacto com ✕ pra limpar
 *   - Busca aceita: nome, código, cidade, CPF/CNPJ
 *
 * Nota: o campo codigo só vem preenchido após o back v3.1 estar aplicado.
 * Se vier vazio, o componente mostra só o nome (degradação graciosa).
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
  /** ID do cliente selecionado (0 = nenhum) */
  value: number;
  /** Nome do cliente selecionado (pra exibir enquanto o store não tem) */
  displayName?: string;
  /** Código do cliente selecionado (ex: CLI-0042) — quando disponível */
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
  /** Direção do dropdown: 'down' (default) ou 'up' se espaço abaixo for pequeno */
  const [dropUp, setDropUp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega lista inicial uma vez
  useEffect(() => {
    if (clientes.length === 0) void fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce na busca server-side quando o usuário digita com dropdown aberto
  useEffect(() => {
    if (!open) return;
    const term = search.trim();
    const t = window.setTimeout(() => {
      // Manda a busca pro back; se vazio, traz tudo
      void fetchClientes(term || undefined);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search, open, fetchClientes]);

  // Detecta espaço disponível quando o dropdown abre
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Se abaixo tem menos de 260px mas acima tem mais, inverte
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

  // Renderização: quando tem cliente selecionado, mostra chip compacto;
  // quando não tem, mostra input de busca com dropdown
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
        /* Modo selecionado — chip compacto com botão X */
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
            placeholder="Buscar por código, nome, CPF/CNPJ ou cidade..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
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
