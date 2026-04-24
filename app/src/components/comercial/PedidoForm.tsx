/**
 * PedidoForm.tsx — Form inline do Pedido de Venda (v3.1)
 *
 * Mudanças v3.1:
 *   - Itens em MEMÓRIA (não persiste no POST/PUT individual; vai junto no save)
 *   - Valida itens >= 1 antes de submeter
 *   - Banner âmbar em edit + status avançado (Andamento/Concluido/AEntregar/Pausado)
 *   - Justificativa obrigatória no save em status avançado (cai no modal antes do save)
 *   - Help contextual no footer da PageShell conforme campo focado
 *   - Cliente: componente PedidoClienteField (autocomplete rico server-side)
 *   - Tipo: componente PedidoTipoPill (pills compactos)
 *   - Data de entrega: DateField (shadcn Calendar+Popover)
 *   - Submit retorna payload consolidado — caller (PedidosPage) chama
 *     createPedido/updatePedido do store.
 *
 * onSave: o form monta PedidoVendaCreateData ou PedidoVendaUpdateData e
 * delega pro caller.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { DateField } from '@/components/shared/DateField';
import { JustificativaDialog } from '@/components/shared/JustificativaDialog';
import { PedidoTipoPill, helpTipo } from './PedidoTipoPill';
import { PedidoClienteField } from './PedidoClienteField';
import { PedidoItensGrid } from './PedidoItensGrid';
import type { PedidoItemRow } from './PedidoItensGrid';
import { itemToRow } from './PedidoItensGrid';
import { PedidoStatusPanel } from './PedidoStatusPanel';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TIPO_PV_COLORS,
  TIPO_PV_LABELS,
  bloqueiaEdicao,
  exigeJustificativa,
} from '@/types/comercial/pedido.types';
import type {
  PedidoVenda,
  TipoPedidoVenda,
  PedidoVendaCreateData,
  PedidoVendaUpdateData,
  ItemPedidoCreateData,
  ItemPedidoUpsertData,
} from '@/types/comercial/pedido.types';
import type { Cliente } from '@/types/admin/cliente.types';
import type { PageMode } from '@/components/shared/PageShell';

// ═════ Handle exposto ═════

export interface PedidoFormHandle {
  submit: () => Promise<boolean>;
}

/** Payload que o caller recebe: create ou update, discriminado pela presença de id */
export type PedidoFormPayload =
  | { kind: 'create'; data: PedidoVendaCreateData }
  | { kind: 'update'; data: PedidoVendaUpdateData };

// ═════ Props ═════

interface PedidoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  pedido: PedidoVenda | null;
  onDirty: () => void;
  /** Caller recebe payload pronto e chama createPedido/updatePedido */
  onSave: (payload: PedidoFormPayload) => Promise<void>;
  /**
   * Callback opcional: o form chama esse toda vez que o help contextual do
   * footer mudar (campo focado diferente, tipo mudou, etc).
   * A page passa isso pro PageShell.footerLeft.
   */
  onHelpChange?: (help: string | null) => void;
}

// ═════ Constantes ═════

const TABS = ['pedido', 'itens'];

const FIELD_TAB: Record<string, string> = {
  clienteId: 'pedido',
  tipo: 'pedido',
  dataEntrega: 'pedido',
  observacoes: 'pedido',
  itens: 'itens',
};

interface FormHeader {
  clienteId: number;
  clienteNome?: string;
  clienteCodigo?: string;
  tipo: TipoPedidoVenda;
  dataEntrega: string;
  observacoes: string;
}

const EMPTY_HEADER: FormHeader = {
  clienteId: 0,
  clienteNome: '',
  clienteCodigo: '',
  tipo: 'Normal',
  dataEntrega: '',
  observacoes: '',
};

// ═════ Helpers ═════

function isoToDateInputValue(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

function dateInputToIso(val: string): string | undefined {
  if (!val) return undefined;
  const d = new Date(val + 'T00:00:00');
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

// ═════ Componente ═════

export const PedidoForm = forwardRef<PedidoFormHandle, PedidoFormProps>(
  function PedidoForm({ mode, pedido, onDirty, onSave, onHelpChange }, ref) {
    const readOnly = mode === 'view';
    const isNew = mode === 'new';

    // ── State: header + itens em memória ────────────────────────────────────
    const [header, setHeader] = useState<FormHeader>(EMPTY_HEADER);
    const [itens, setItens] = useState<PedidoItemRow[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Baseline pra comparar "mudou algo" (importante na decisão do dirty)
    const baselineItensJson = useRef<string>('[]');

    // Justificativa pendente (usada em PUT em status avançado)
    const [justifOpen, setJustifOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState<PedidoVendaUpdateData | null>(
      null,
    );

    // ── Tab navigation ───────────────────────────────────────────────────────
    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } =
      useFormTabNavigation({ tabs: TABS, defaultTab: 'pedido' });

    // ── Reset ao trocar item/modo ───────────────────────────────────────────
    useEffect(() => {
      setErrors({});
      if (pedido) {
        setHeader({
          clienteId: pedido.clienteId ?? 0,
          clienteNome: pedido.clienteNome ?? '',
          clienteCodigo: pedido.clienteCodigo ?? '',
          tipo: pedido.tipo ?? 'Normal',
          dataEntrega: isoToDateInputValue(pedido.dataEntrega),
          observacoes: pedido.observacoes ?? '',
        });
        const itensFromBack = (pedido.itens ?? []).map(itemToRow);
        setItens(itensFromBack);
        baselineItensJson.current = JSON.stringify(itensFromBack);
      } else {
        setHeader({ ...EMPTY_HEADER });
        setItens([]);
        baselineItensJson.current = '[]';
      }
    }, [pedido, mode]);

    // ── Derivados ────────────────────────────────────────────────────────────
    const statusAtual = pedido?.status;
    const modoAvancado =
      !isNew && statusAtual !== undefined && exigeJustificativa(statusAtual);
    const bloqueado =
      !isNew && statusAtual !== undefined && bloqueiaEdicao(statusAtual);

    // ── Dirty: qualquer mudança em itens também dispara ─────────────────────
    const markDirty = useCallback(() => onDirty(), [onDirty]);

    // ── Help contextual ──────────────────────────────────────────────────────
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const helpText = useMemo(() => {
      if (readOnly) return null;
      if (focusedField === 'tipo' || (isNew && !focusedField)) return helpTipo(header.tipo);
      if (focusedField === 'clienteId')
        return 'Busca por código (CLI-), nome, CPF/CNPJ ou cidade.';
      if (focusedField === 'dataEntrega')
        return 'Data combinada de entrega. Pode ficar em branco.';
      if (focusedField === 'observacoes')
        return 'Observações livres sobre o pedido (visível em relatórios).';
      if (activeTab === 'itens')
        return `${itens.length} ${itens.length === 1 ? 'item' : 'itens'}. Pedido sem itens não pode ser salvo.`;
      return null;
    }, [readOnly, focusedField, isNew, header.tipo, activeTab, itens.length]);

    useEffect(() => {
      onHelpChange?.(helpText);
    }, [helpText, onHelpChange]);

    // ── Setters dos campos ───────────────────────────────────────────────────
    const setHeaderField = useCallback(
      <K extends keyof FormHeader>(field: K, value: FormHeader[K]) => {
        setHeader((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field as string];
            return next;
          });
        }
        markDirty();
      },
      [errors, markDirty],
    );

    const handleClienteChange = useCallback(
      (id: number, c?: Cliente) => {
        setHeader((prev) => ({
          ...prev,
          clienteId: id,
          clienteNome: c?.nome ?? (id === 0 ? '' : prev.clienteNome),
          clienteCodigo: c?.codigo ?? (id === 0 ? '' : prev.clienteCodigo),
        }));
        if (errors.clienteId) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.clienteId;
            return next;
          });
        }
        markDirty();
      },
      [errors.clienteId, markDirty],
    );

    const handleItensChange = useCallback(
      (rows: PedidoItemRow[]) => {
        setItens(rows);
        if (errors.itens) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.itens;
            return next;
          });
        }
        // Dirty só se mudou em relação ao baseline
        const json = JSON.stringify(rows);
        if (json !== baselineItensJson.current) markDirty();
      },
      [errors.itens, markDirty],
    );

    // ── Validação ────────────────────────────────────────────────────────────
    const validate = useCallback((): Record<string, string> => {
      const e: Record<string, string> = {};
      if (!header.clienteId) e.clienteId = 'Selecione um cliente';
      if (!header.tipo) e.tipo = 'Selecione o tipo do pedido';
      if (itens.length === 0) e.itens = 'Pedido deve ter ao menos 1 item';
      // Valida itens individuais (quantidade > 0, descrição)
      for (const it of itens) {
        if (!it.descricao || !it.descricao.trim()) {
          e.itens = 'Todos os itens devem ter descrição';
          break;
        }
        if (!(Number(it.quantidade) > 0)) {
          e.itens = 'Todos os itens devem ter quantidade maior que zero';
          break;
        }
      }
      return e;
    }, [header, itens]);

    // ── Montagem dos payloads ────────────────────────────────────────────────
    const buildCreatePayload = useCallback((): PedidoVendaCreateData => {
      const itensOut: ItemPedidoCreateData[] = itens.map((r) => ({
        quantidade: Number(r.quantidade),
        descricao: r.descricao.trim(),
        observacao: r.observacao?.trim() || undefined,
      }));
      return {
        clienteId: header.clienteId,
        tipo: header.tipo,
        dataEntrega: dateInputToIso(header.dataEntrega),
        observacoes: header.observacoes?.trim() || undefined,
        itens: itensOut,
      };
    }, [header, itens]);

    const buildUpdatePayload = useCallback(
      (justificativa?: string): PedidoVendaUpdateData => {
        const itensOut: ItemPedidoUpsertData[] = itens.map((r) => {
          const idNumeric = typeof r.id === 'number' ? r.id : undefined;
          return {
            id: idNumeric,
            quantidade: Number(r.quantidade),
            descricao: r.descricao.trim(),
            observacao: r.observacao?.trim() || undefined,
          };
        });
        return {
          clienteId: header.clienteId,
          tipo: header.tipo,
          dataEntrega: dateInputToIso(header.dataEntrega),
          observacoes: header.observacoes?.trim() || undefined,
          itens: itensOut,
          justificativa: justificativa?.trim() || undefined,
        };
      },
      [header, itens],
    );

    // ── Submit via ref ───────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (bloqueado) {
          toast.error(
            `Pedidos em "${STATUS_LABELS[statusAtual!]}" não podem ser editados.`,
          );
          return false;
        }

        const e = validate();
        setErrors(e);

        if (Object.keys(e).length > 0) {
          const firstErrorField = Object.keys(e)[0];
          const targetTab = FIELD_TAB[firstErrorField] ?? 'pedido';
          if (targetTab) {
            setActiveTab(targetTab);
            requestAnimationFrame(() => {
              setTimeout(() => {
                document.getElementById(firstErrorField)?.focus();
              }, 50);
            });
          }
          toast.error('Corrija os campos destacados.');
          return false;
        }

        // new: sempre POST direto
        if (isNew) {
          const payload = buildCreatePayload();
          await onSave({ kind: 'create', data: payload });
          return true;
        }

        // edit: se status avançado, pede justificativa antes
        const updatePayload = buildUpdatePayload();
        if (modoAvancado) {
          setPendingPayload(updatePayload);
          setJustifOpen(true);
          return false; // não salva ainda — o confirmJustif salva depois
        }

        await onSave({ kind: 'update', data: updatePayload });
        return true;
      },
    }));

    // ── Ao confirmar justificativa, salva efetivamente ────────────────────
    const confirmJustif = useCallback(
      async (justif: string) => {
        if (!pendingPayload) return;
        const finalPayload: PedidoVendaUpdateData = {
          ...pendingPayload,
          justificativa: justif,
        };
        await onSave({ kind: 'update', data: finalPayload });
      },
      [pendingPayload, onSave],
    );

    // ═════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════════════════════════════

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full gap-0"
        >
          <div className="shrink-0 px-6 pt-4 pb-0 flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="pedido">Pedido</TabsTrigger>
              <TabsTrigger value="itens">
                Itens{' '}
                {itens.length > 0 && (
                  <span
                    className={
                      errors.itens
                        ? 'ml-1 text-red-500'
                        : 'ml-1 text-muted-foreground'
                    }
                  >
                    ({itens.length})
                  </span>
                )}
                {errors.itens && itens.length === 0 && (
                  <span className="ml-1 text-red-500">!</span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ══ Aba Pedido ══ */}
          <TabsContent
            value="pedido"
            className="flex-1 overflow-auto mt-0 px-6 py-4"
          >
            {/* Banner status avançado */}
            {modoAvancado && !readOnly && (
              <div className="mb-4 rounded-md border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Pedido em produção
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                    Alterações nos itens serão registradas no histórico e{' '}
                    <strong>Engenharia</strong>, <strong>Produção</strong> e{' '}
                    <strong>Almoxarifado</strong> serão notificados. Justificativa obrigatória.
                  </p>
                </div>
              </div>
            )}

            <div
              ref={formFieldsRef}
              onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-12 gap-x-4 gap-y-4"
            >
              {/* Linha 1: Tipo (new) / Código + Tipo + Status (edit/view) */}
              {isNew ? (
                <div
                  className="col-span-12 flex flex-col gap-1.5"
                  onFocus={() => setFocusedField('tipo')}
                  onBlur={() => setFocusedField(null)}
                >
                  <Label
                    htmlFor="tipo"
                    className={`text-xs font-medium ${
                      errors.tipo
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Tipo do Pedido *
                  </Label>
                  <PedidoTipoPill
                    id="tipo"
                    value={header.tipo}
                    onChange={(t) => setHeaderField('tipo', t)}
                    disabled={readOnly}
                    error={errors.tipo}
                  />
                  {errors.tipo && (
                    <p className="text-xs text-red-500 dark:text-red-400">{errors.tipo}</p>
                  )}
                </div>
              ) : (
                pedido && (
                  <>
                    <div className="col-span-3 flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Código
                      </Label>
                      <Input
                        value={pedido.codigo || '-'}
                        readOnly
                        className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="col-span-3 flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Tipo
                      </Label>
                      <div className="h-9 flex items-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            TIPO_PV_COLORS[pedido.tipo] || ''
                          }`}
                        >
                          {TIPO_PV_LABELS[pedido.tipo] || pedido.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Status
                      </Label>
                      <div className="h-9 flex items-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[pedido.status] || ''
                          }`}
                        >
                          {STATUS_LABELS[pedido.status] || pedido.status}
                        </span>
                      </div>
                    </div>

                    <div
                      className="col-span-3 flex flex-col gap-1.5"
                      onFocus={() => setFocusedField('dataEntrega')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <DateField
                        id="dataEntrega"
                        label="Data de Entrega"
                        value={header.dataEntrega}
                        onChange={(v) => setHeaderField('dataEntrega', v)}
                        readOnly={readOnly}
                        showToday={false}
                      />
                    </div>
                  </>
                )
              )}

              {/* Data de Entrega isolada no modo new */}
              {isNew && (
                <div
                  className="col-span-4 flex flex-col gap-1.5"
                  onFocus={() => setFocusedField('dataEntrega')}
                  onBlur={() => setFocusedField(null)}
                >
                  <DateField
                    id="dataEntrega"
                    label="Data de Entrega"
                    value={header.dataEntrega}
                    onChange={(v) => setHeaderField('dataEntrega', v)}
                    readOnly={readOnly}
                    showToday={false}
                  />
                </div>
              )}

              {/* Cliente (linha cheia) */}
              <div
                className={`${isNew ? 'col-span-8' : 'col-span-12'} flex flex-col gap-1.5`}
                onFocus={() => setFocusedField('clienteId')}
                onBlur={() => setFocusedField(null)}
              >
                <PedidoClienteField
                  id="clienteId"
                  label="Cliente"
                  required
                  value={header.clienteId}
                  displayName={header.clienteNome}
                  displayCodigo={header.clienteCodigo}
                  onChange={handleClienteChange}
                  readOnly={readOnly}
                  error={errors.clienteId}
                />
              </div>

              {/* Observações */}
              <div
                className="col-span-12 flex flex-col gap-1.5"
                onFocus={() => setFocusedField('observacoes')}
                onBlur={() => setFocusedField(null)}
              >
                <Label
                  htmlFor="observacoes"
                  className="text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  value={header.observacoes}
                  onChange={(e) => setHeaderField('observacoes', e.target.value)}
                  readOnly={readOnly}
                  rows={3}
                  placeholder="Observações sobre o pedido..."
                  className={`text-sm bg-white dark:bg-slate-950 resize-none ${
                    readOnly
                      ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0'
                      : ''
                  }`}
                />
              </div>

              {/* Status panel (só se PV já existe) */}
              {!isNew && pedido && (
                <div className="col-span-12 mt-2">
                  <PedidoStatusPanel pedido={pedido} editable={mode === 'edit' && !bloqueado} />
                </div>
              )}
            </div>
          </TabsContent>

          {/* ══ Aba Itens ══ */}
          <TabsContent
            value="itens"
            className="flex-1 overflow-auto mt-0 px-6 py-4"
          >
            {errors.itens && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-2 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
                {errors.itens}
              </p>
            )}
            <PedidoItensGrid
              rows={itens}
              editable={!readOnly && !bloqueado}
              onChange={handleItensChange}
            />
          </TabsContent>
        </Tabs>

        {/* Dialog de justificativa (status avançado) */}
        <JustificativaDialog
          open={justifOpen}
          onOpenChange={(o) => {
            setJustifOpen(o);
            if (!o) setPendingPayload(null);
          }}
          title="Confirmar alteração em pedido em produção"
          description="Descreva o motivo da alteração. Este texto ficará registrado no histórico e será enviado nas notificações para Engenharia, Produção e Almoxarifado."
          confirmLabel="Salvar alteração"
          variant="info"
          onConfirm={confirmJustif}
        />
      </div>
    );
  },
);
