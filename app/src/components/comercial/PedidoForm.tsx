/**
 * PedidoForm.tsx — Form inline do Pedido de Venda
 *
 * Mudanças nesta versão:
 *   - submit() agora ESPERA o modal de justificativa via Promise. Quando o
 *     modal abre, o submit não retorna até o usuário confirmar/cancelar.
 *     Isso mantém o fluxo dentro do saveAndBack do usePageMode → corrige o
 *     bug "Salvar e sair não sai após justificativa" e "toast não aparece".
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
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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
  StatusPedido,
  TipoPedidoVenda,
  PedidoVendaCreateData,
  PedidoVendaUpdateData,
  ItemPedidoCreateData,
  ItemPedidoUpsertData,
} from '@/types/comercial/pedido.types';
import type { Cliente } from '@/types/admin/cliente.types';
import type { PageMode } from '@/components/shared/PageShell';

/**
 * PedidoEmProducaoBadge — Botão compacto que mostra "Pedido em produção"
 * com ícone de aviso. Clicar abre popover sobreposto com o texto completo,
 * sem empurrar o layout. Clicar fora fecha.
 */
function PedidoEmProducaoBadge() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Pedido em produção</span>
        {open ? (
          <ChevronUp className="h-3 w-3 opacity-70" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-70" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80">
          <div className="absolute -top-1.5 left-4 w-3 h-3 rotate-45 bg-popover border-l border-t border-border" />
          <div className="relative rounded-md border border-border bg-popover dark:bg-slate-900 shadow-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                Qualquer alteração será registrada no histórico e{' '}
                <strong>Engenharia</strong>, <strong>Produção</strong> e{' '}
                <strong>Almoxarifado</strong> serão notificados. Justificativa obrigatória.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface PedidoFormHandle {
  submit: () => Promise<boolean>;
}

export type PedidoFormPayload =
  | {
    kind: 'create';
    data: PedidoVendaCreateData;
  }
  | {
    kind: 'update';
    data: PedidoVendaUpdateData;
    statusPendente?: StatusPedido;
    justificativaPendente?: string;
  }
  | {
    kind: 'status-only';
    statusPendente: StatusPedido;
    justificativaPendente?: string;
  };

interface PedidoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  pedido: PedidoVenda | null;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (payload: PedidoFormPayload) => Promise<void>;
  onHelpChange?: (help: string | null) => void;
}

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

function headersIguais(a: FormHeader, b: FormHeader): boolean {
  return (
    a.clienteId === b.clienteId &&
    a.tipo === b.tipo &&
    a.dataEntrega === b.dataEntrega &&
    (a.observacoes || '') === (b.observacoes || '')
  );
}

function itensIguais(a: PedidoItemRow[], b: PedidoItemRow[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (
      x.id !== y.id ||
      Number(x.quantidade) !== Number(y.quantidade) ||
      (x.descricao || '') !== (y.descricao || '') ||
      (x.observacao || '') !== (y.observacao || '')
    ) {
      return false;
    }
  }
  return true;
}

export const PedidoForm = forwardRef<PedidoFormHandle, PedidoFormProps>(
  function PedidoForm({ mode, pedido, onDirtyChange, onSave, onHelpChange }, ref) {
    const readOnly = mode === 'view';
    const isNew = mode === 'new';

    const [header, setHeader] = useState<FormHeader>(EMPTY_HEADER);
    const [itens, setItens] = useState<PedidoItemRow[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [statusPendente, setStatusPendente] = useState<StatusPedido | null>(null);
    const [justificativaPendente, setJustificativaPendente] = useState<string>('');

    const [baselineHeader, setBaselineHeader] = useState<FormHeader>(EMPTY_HEADER);
    const [baselineItens, setBaselineItens] = useState<PedidoItemRow[]>([]);

    /**
     * Modal de justificativa em status avançado.
     * O submit aguarda esse modal via Promise. Quando o usuário confirma,
     * a Promise resolve com o resultado (true=salvou, false=cancelou).
     */
    const [justifAvancadoOpen, setJustifAvancadoOpen] = useState(false);
    /** Resolver da promise do submit, armazenado pra quando o modal fechar */
    const justifResolverRef = useRef<((ok: boolean) => void) | null>(null);
    /** Payload preparado, esperando justificativa */
    const pendingPayloadRef = useRef<PedidoVendaUpdateData | null>(null);

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } =
      useFormTabNavigation({ tabs: TABS, defaultTab: 'pedido', autoFocus: isNew });

    useEffect(() => {
      setErrors({});
      setStatusPendente(null);
      setJustificativaPendente('');
      if (pedido) {
        const novoHeader: FormHeader = {
          clienteId: pedido.clienteId ?? 0,
          clienteNome: pedido.clienteNome ?? '',
          clienteCodigo: pedido.clienteCodigo ?? '',
          tipo: pedido.tipo ?? 'Normal',
          dataEntrega: isoToDateInputValue(pedido.dataEntrega),
          observacoes: pedido.observacoes ?? '',
        };
        setHeader(novoHeader);
        setBaselineHeader(novoHeader);

        const itensFromBack = (pedido.itens ?? []).map(itemToRow);
        setItens(itensFromBack);
        setBaselineItens(itensFromBack);
      } else {
        setHeader({ ...EMPTY_HEADER });
        setBaselineHeader({ ...EMPTY_HEADER });
        setItens([]);
        setBaselineItens([]);
      }
    }, [pedido, mode]);

    const statusExibido: StatusPedido = statusPendente ?? pedido?.status ?? 'AguardandoNS';
    const statusAtualReal = pedido?.status;

    const modoAvancado =
      !isNew && statusAtualReal !== undefined && exigeJustificativa(statusAtualReal);
    const bloqueado =
      !isNew && statusAtualReal !== undefined && bloqueiaEdicao(statusAtualReal);

    const headerMudou = useMemo(
      () => !headersIguais(header, baselineHeader),
      [header, baselineHeader],
    );
    const itensMudaram = useMemo(
      () => !itensIguais(itens, baselineItens),
      [itens, baselineItens],
    );
    const statusMudou = statusPendente !== null;

    const dirtyNew = useMemo(() => {
      if (!isNew) return false;
      return (
        header.clienteId !== 0 ||
        header.dataEntrega !== '' ||
        (header.observacoes && header.observacoes.length > 0) ||
        itens.length > 0
      );
    }, [isNew, header, itens]);

    const isDirtyDerivado = isNew
      ? dirtyNew
      : headerMudou || itensMudaram || statusMudou;

    useEffect(() => {
      onDirtyChange(isDirtyDerivado);
    }, [isDirtyDerivado, onDirtyChange]);

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
      },
      [errors],
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
      },
      [errors.clienteId],
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
      },
      [errors.itens],
    );

    const handleStatusChange = useCallback(
      (novoStatus: StatusPedido, justificativa?: string) => {
        if (novoStatus === statusAtualReal) {
          setStatusPendente(null);
          setJustificativaPendente('');
          return;
        }
        setStatusPendente(novoStatus);
        setJustificativaPendente(justificativa ?? '');
      },
      [statusAtualReal],
    );

    const handleClearPendente = useCallback(() => {
      setStatusPendente(null);
      setJustificativaPendente('');
    }, []);

    const validate = useCallback((): Record<string, string> => {
      const e: Record<string, string> = {};
      if (!header.clienteId) e.clienteId = 'Selecione um cliente';
      if (!header.tipo) e.tipo = 'Selecione o tipo do pedido';
      if (itens.length === 0) e.itens = 'Pedido deve ter ao menos 1 item';
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

    /**
     * submit():
     *   - Valida
     *   - Em PV avançado com mudanças → abre modal e ESPERA justificativa via Promise
     *   - Promise resolve só depois do usuário confirmar/cancelar o modal
     *   - Mantém o fluxo dentro do saveAndBack do usePageMode
     */
    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (bloqueado) {
          toast.error(
            `Pedidos em "${STATUS_LABELS[statusAtualReal!]}" não podem ser editados.`,
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

        if (isNew) {
          try {
            const payload = buildCreatePayload();
            await onSave({ kind: 'create', data: payload });
            return true;
          } catch {
            return false;
          }
        }

        const houvePV = headerMudou || itensMudaram;
        const houveStatus = statusMudou;

        if (!houvePV && !houveStatus) {
          toast.info('Nenhuma alteração para salvar.');
          return false;
        }

        if (!houvePV && houveStatus) {
          try {
            await onSave({
              kind: 'status-only',
              statusPendente: statusPendente!,
              justificativaPendente: justificativaPendente || undefined,
            });
            return true;
          } catch {
            return false;
          }
        }

        // PV mudou em status avançado → modal aguarda Promise
        if (modoAvancado) {
          const updatePayload = buildUpdatePayload();
          pendingPayloadRef.current = updatePayload;
          setJustifAvancadoOpen(true);

          // Aguarda o modal fechar (confirmar OU cancelar)
          return await new Promise<boolean>((resolve) => {
            justifResolverRef.current = resolve;
          });
        }

        // PV mudou em status inicial — direto
        try {
          const updatePayload = buildUpdatePayload();
          await onSave({
            kind: 'update',
            data: updatePayload,
            statusPendente: statusPendente ?? undefined,
            justificativaPendente: justificativaPendente || undefined,
          });
          return true;
        } catch {
          return false;
        }
      },
    }));

    /**
     * Confirmação do modal: chama onSave e resolve a Promise do submit
     * com o resultado real (true=salvou, false=falhou).
     */
    const confirmJustifAvancado = useCallback(
      async (justif: string) => {
        const payload = pendingPayloadRef.current;
        if (!payload) {
          justifResolverRef.current?.(false);
          justifResolverRef.current = null;
          return;
        }
        const finalPayload: PedidoVendaUpdateData = {
          ...payload,
          justificativa: justif,
        };
        try {
          await onSave({
            kind: 'update',
            data: finalPayload,
            statusPendente: statusPendente ?? undefined,
            justificativaPendente: justificativaPendente || undefined,
          });
          justifResolverRef.current?.(true);
        } catch {
          justifResolverRef.current?.(false);
        } finally {
          justifResolverRef.current = null;
          pendingPayloadRef.current = null;
        }
      },
      [onSave, statusPendente, justificativaPendente],
    );

    /** Quando o modal fecha sem confirmar (cancelar / esc / clique fora) */
    const handleJustifClose = useCallback((open: boolean) => {
      setJustifAvancadoOpen(open);
      if (!open && justifResolverRef.current) {
        // Fechou sem confirmar → resolve false (submit retorna false → saveAndBack aborta)
        justifResolverRef.current(false);
        justifResolverRef.current = null;
        pendingPayloadRef.current = null;
      }
    }, []);

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full gap-0"
        >
          <div className="shrink-0 px-6 pt-4 pb-0 flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="pedido" className="px-5">Pedido</TabsTrigger>
              <TabsTrigger value="itens" className="px-5">
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
            {modoAvancado && !readOnly && <PedidoEmProducaoBadge />}
          </div>

          <TabsContent
            value="pedido"
            className="flex-1 overflow-auto mt-0 px-6 py-4"
          >
            <div
              ref={formFieldsRef}
              onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-12 gap-x-4 gap-y-4"
            >
              {/* ─────────────────────────────────────────────────────────
                  LINHA 1 — Metadados read-only do PV (apenas em edit/view)
                  Código Pedido | Tipo | Status
                  Em modo `new`, o tipo do pedido vai num bloco separado
                  abaixo (Tipo é editável só em new).
                  ────────────────────────────────────────────────────────── */}
              {!isNew && pedido && (
                <>
                  <div className="col-span-4 flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Código Pedido
                    </Label>
                    <Input
                      value={pedido.codigo || '-'}
                      readOnly
                      className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="col-span-4 flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Tipo
                    </Label>
                    <div className="h-9 flex items-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${TIPO_PV_COLORS[pedido.tipo] || ''
                          }`}
                      >
                        {TIPO_PV_LABELS[pedido.tipo] || pedido.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Status
                    </Label>
                    <div className="h-9 flex items-center gap-1.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pedido.status] || ''
                          }`}
                      >
                        {STATUS_LABELS[pedido.status] || pedido.status}
                      </span>
                      {statusPendente && statusPendente !== pedido.status && (
                        <>
                          <span className="text-amber-600 dark:text-amber-400">→</span>
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ring-2 ring-amber-300 dark:ring-amber-700 ${STATUS_COLORS[statusPendente] || ''
                              }`}
                          >
                            {STATUS_LABELS[statusPendente]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ─────────────────────────────────────────────────────────
                  Tipo do Pedido (apenas em new — editável)
                  ────────────────────────────────────────────────────────── */}
              {isNew && (
                <div
                  className="col-span-12 flex flex-col gap-1.5"
                  onFocus={() => setFocusedField('tipo')}
                  onBlur={() => setFocusedField(null)}
                >
                  <Label
                    htmlFor="tipo"
                    className={`text-xs font-medium ${errors.tipo
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
              )}

              {/* ─────────────────────────────────────────────────────────
                  LINHA 2 — Cliente + Data de Entrega (idêntica em new/edit)
                  PedidoClienteField já renderiza 2 sub-campos
                  (Código Cliente + Cliente) lado a lado internamente,
                  cada um com seu label. Aqui ele ocupa col-span-9 e
                  Data de Entrega col-span-3.
                  ────────────────────────────────────────────────────────── */}
              <div
                className="col-span-9 flex flex-col gap-1.5"
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

              {/* ─────────────────────────────────────────────────────────
                  LINHA 3 — Observações (full-width, com handle de resize)
                  ────────────────────────────────────────────────────────── */}
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
                  className={`text-sm bg-white dark:bg-slate-950 resize-y min-h-18 ${readOnly
                      ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0 resize-none'
                      : ''
                    }`}
                />
              </div>

              {/* ─────────────────────────────────────────────────────────
                  Status panel (apenas em edit — ações de status)
                  ────────────────────────────────────────────────────────── */}
              {!isNew && pedido && (
                <div className="col-span-12 mt-2">
                  <PedidoStatusPanel
                    pedido={pedido}
                    statusExibido={statusExibido}
                    temPendente={statusPendente !== null}
                    editable={mode === 'edit' && !bloqueado}
                    onStatusChange={handleStatusChange}
                    onClearPendente={handleClearPendente}
                  />
                </div>
              )}
            </div>
          </TabsContent>

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

        <JustificativaDialog
          open={justifAvancadoOpen}
          onOpenChange={handleJustifClose}
          title="Confirmar alteração em pedido em produção"
          description="Descreva o motivo da alteração. Este texto ficará registrado no histórico e será enviado nas notificações para Engenharia, Produção e Almoxarifado."
          confirmLabel="Salvar alteração"
          variant="info"
          onConfirm={confirmJustifAvancado}
        />
      </div>
    );
  },
);

