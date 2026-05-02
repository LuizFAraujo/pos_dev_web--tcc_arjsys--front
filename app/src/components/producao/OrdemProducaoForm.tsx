/**
 * OrdemProducaoForm.tsx — Form de OP (criar Master / editar / visualizar).
 *
 * Modos:
 *   - new:  cria OP Master (PV opcional + Produto Fabricado raiz + observações)
 *   - edit: edita apenas observações (back só permite isso)
 *   - view: tudo readonly + painel de status + apontamento por item + lista filhas
 *
 * Layout em grid 2 colunas alinhado (códigos à esquerda).
 */

import { useEffect, useImperativeHandle, useState, forwardRef, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrdemProducaoStore } from '@/stores/producao/ordemProducaoStore';
import {
  EVENTO_OP_LABELS,
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
  type OrdemProducao,
  type OrdemProducaoItem,
  type OrdemProducaoFilhaResumo,
  type OrdemProducaoHistorico,
  type StatusOrdemProducao,
} from '@/types/producao/ordemProducao.types';
import type { PageMode } from '@/components/shared/PageShell';
import { OrdemProducaoPedidoField } from './OrdemProducaoPedidoField';
import { OrdemProducaoProdutoField } from './OrdemProducaoProdutoField';
import { OrdemProducaoStatusPanel } from './OrdemProducaoStatusPanel';
import { ApontamentoDialog } from './ApontamentoDialog';

export interface OrdemProducaoFormHandle {
  submit: () => Promise<boolean>;
}

export interface OrdemProducaoFormData {
  pedidoVendaId?: number | null;
  produtoId: number;
  observacoes?: string;
}

interface OrdemProducaoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  ordem: OrdemProducao | null;
  /** ID da aba pai — usado pelos DataGrids internos. */
  tabId: string;
  onDirty: () => void;
  onSave: (data: OrdemProducaoFormData) => Promise<void>;
}

const TABS = ['identificacao', 'itens', 'filhas', 'historico'];

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

export const OrdemProducaoForm = forwardRef<
  OrdemProducaoFormHandle,
  OrdemProducaoFormProps
>(function OrdemProducaoForm({ mode, ordem: ordemProp, tabId, onDirty, onSave }, ref) {
  const readOnly = mode === 'view';
  const isNew = mode === 'new';
  const isEdit = mode === 'edit';

  // ─── Live data: lê do store pra refletir status/itens atualizados após
  // ações (status panel, apontamento). Evita usar snapshot stale do prop.
  const ordens = useOrdemProducaoStore((s) => s.ordens);
  const historico = useOrdemProducaoStore((s) => s.historico);
  const fetchHistorico = useOrdemProducaoStore((s) => s.fetchHistorico);
  const alterarStatus = useOrdemProducaoStore((s) => s.alterarStatus);

  // Mudança de status pendente (entra em vigor só no Salvar).
  const [statusPendente, setStatusPendente] = useState<{
    status: StatusOrdemProducao;
    justificativa?: string;
  } | null>(null);

  const ordem = useMemo(() => {
    if (!ordemProp) return null;
    return ordens.find((o) => o.id === ordemProp.id) ?? ordemProp;
  }, [ordens, ordemProp]);

  useEffect(() => {
    if (!isNew && ordem?.id) void fetchHistorico(ordem.id);
  }, [isNew, ordem?.id, fetchHistorico]);

  const historicoOrdem = useMemo(
    () => (ordem ? historico.filter((h) => h.ordemProducaoId === ordem.id) : []),
    [historico, ordem],
  );

  const [pedidoVendaId, setPedidoVendaId] = useState<number | null>(null);
  const [pedidoDisplay, setPedidoDisplay] = useState<{
    codigo: string | null;
    clienteCodigo: string | null;
    clienteNome: string | null;
  }>({ codigo: null, clienteCodigo: null, clienteNome: null });
  const [estoque, setEstoque] = useState(false);

  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [produtoDisplay, setProdutoDisplay] = useState<{
    codigo: string | null;
    descricao: string | null;
  }>({ codigo: null, descricao: null });

  const [observacoes, setObservacoes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Quando true, Produto vem do NS do PV — campo bloqueado pra evitar inconsistência. */
  const [produtoLockedByNs, setProdutoLockedByNs] = useState(false);
  const [nsHint, setNsHint] = useState<string | null>(null);
  /** ok = produto vinculado (emerald) · warn = falta NS em PreVenda (amber) · info = PV Normal sem produto (slate) */
  const [nsHintSeverity, setNsHintSeverity] = useState<'ok' | 'warn' | 'info'>('ok');


  // Apontamento
  const [apontOpen, setApontOpen] = useState(false);
  const [itemAponto, setItemAponto] = useState<OrdemProducaoItem | null>(null);

  // Linhas selecionadas nos grids internos (itens / filhas) — local ao form,
  // resetam ao trocar de OP. Histórico não tem seleção (read-only).
  const [itemSelecionado, setItemSelecionado] = useState<OrdemProducaoItem | null>(null);

  const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } =
    useFormTabNavigation({ tabs: TABS, defaultTab: 'identificacao' });

  useEffect(() => {
    setErrors({});
    setProdutoLockedByNs(false);
    setNsHint(null);
    setStatusPendente(null);
    setItemSelecionado(null);
    if (ordem) {
      setPedidoVendaId(ordem.pedidoVendaId ?? null);
      setEstoque(ordem.ehEstoque);
      setPedidoDisplay({
        codigo: ordem.pedidoVendaCodigo ?? null,
        clienteCodigo: ordem.clienteCodigo ?? null,
        clienteNome: ordem.clienteNome ?? null,
      });
      setProdutoId(ordem.produtoId);
      setProdutoDisplay({
        codigo: ordem.produtoCodigo ?? null,
        descricao: ordem.produtoDescricao ?? null,
      });
      setObservacoes(ordem.observacoes ?? '');
    } else {
      setPedidoVendaId(null);
      setEstoque(false);
      setPedidoDisplay({ codigo: null, clienteCodigo: null, clienteNome: null });
      setProdutoId(null);
      setProdutoDisplay({ codigo: null, descricao: null });
      setObservacoes('');
    }
  }, [ordem, mode]);

  // ─── Colunas dos DataGrids internos ──────────────────────────────────────
  const colunasItens: GridColumn<OrdemProducaoItem>[] = useMemo(
    () => [
      {
        key: 'produtoCodigo',
        header: 'CÓDIGO',
        width: 180,
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'produtoDescricao',
        header: 'DESCRIÇÃO',
        width: 360,
        filterType: 'text',
      },
      {
        key: 'produtoUnidade',
        header: 'UN.',
        width: 70,
        contentAlign: 'center',
        filterType: 'text',
      },
      {
        key: 'quantidadePlanejada',
        header: 'PLANEJADO',
        width: 110,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'quantidadeProduzida',
        header: 'PRODUZIDO',
        width: 110,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'quantidadeFaltante',
        header: 'FALTANTE',
        width: 100,
        contentAlign: 'right',
        filterType: 'number',
        className: 'font-mono',
      },
      {
        key: 'percentualConcluido',
        header: '%',
        width: 80,
        contentAlign: 'center',
        className: 'font-mono',
        render: (it) => `${Number(it.percentualConcluido ?? 0).toFixed(0)}%`,
      },
    ],
    [],
  );

  const colunasFilhas: GridColumn<OrdemProducaoFilhaResumo>[] = useMemo(
    () => [
      {
        key: 'codigo',
        header: 'CÓDIGO',
        width: 180,
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'produtoCodigo',
        header: 'CÓD. PRODUTO',
        width: 140,
        filterType: 'text',
        className: 'font-mono',
      },
      {
        key: 'produtoDescricao',
        header: 'PRODUTO',
        width: 320,
        filterType: 'text',
      },
      {
        key: 'status',
        header: 'STATUS',
        width: 130,
        contentAlign: 'center',
        filterType: 'text',
        render: (f) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_OP_COLORS[f.status] || ''
            }`}
          >
            {STATUS_OP_LABELS[f.status] || f.status}
          </span>
        ),
      },
      {
        key: 'percentualConcluido',
        header: '%',
        width: 80,
        contentAlign: 'center',
        className: 'font-mono',
        render: (f) => `${Number(f.percentualConcluido ?? 0).toFixed(0)}%`,
      },
    ],
    [],
  );

  // Histórico: tipo estendido pra suportar a linha sintética "(pendente)".
  type HistoricoLinha = OrdemProducaoHistorico & { isPendente?: boolean };

  const linhasHistorico: HistoricoLinha[] = useMemo(() => {
    const arr: HistoricoLinha[] = [];
    if (statusPendente && ordem) {
      arr.push({
        id: -1,
        ordemProducaoId: ordem.id,
        evento: 'Criada',
        statusAnterior: ordem.status,
        statusNovo: statusPendente.status,
        justificativa: statusPendente.justificativa ?? null,
        detalhe: null,
        dataHora: new Date().toISOString(),
        isPendente: true,
      });
    }
    const sorted = [...historicoOrdem].sort(
      (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
    );
    arr.push(...sorted);
    return arr;
  }, [historicoOrdem, statusPendente, ordem]);

  const colunasHistorico: GridColumn<HistoricoLinha>[] = useMemo(
    () => [
      {
        key: 'dataHora',
        header: 'DATA/HORA',
        width: 130,
        contentAlign: 'center',
        filterType: 'text',
        render: (h) =>
          h.isPendente ? (
            <span className="font-mono text-xs text-amber-700 dark:text-amber-400">
              (pendente)
            </span>
          ) : (
            <span className="font-mono text-xs">{formatDateTime(h.dataHora)}</span>
          ),
      },
      {
        key: 'evento',
        header: 'EVENTO',
        width: 160,
        filterType: 'text',
        render: (h) =>
          h.isPendente ? (
            <span className="italic text-amber-700 dark:text-amber-400">
              Mudança a aplicar
            </span>
          ) : (
            <span>{EVENTO_OP_LABELS[h.evento] || h.evento}</span>
          ),
      },
      {
        key: 'transicao',
        header: 'DE → PARA',
        width: 200,
        filterType: 'text',
        render: (h) =>
          h.statusAnterior || h.statusNovo ? (
            <span
              className={`font-mono ${
                h.isPendente ? 'text-amber-700 dark:text-amber-400' : ''
              }`}
            >
              {h.statusAnterior ? STATUS_OP_LABELS[h.statusAnterior] : '—'}
              {' → '}
              {h.statusNovo ? STATUS_OP_LABELS[h.statusNovo] : '—'}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: 'justificativa',
        header: 'JUSTIFICATIVA / DETALHE',
        width: 360,
        filterType: 'text',
        render: (h) =>
          h.justificativa || h.detalhe ? (
            <span>
              {h.justificativa}
              {h.detalhe && (
                <span className="text-muted-foreground italic"> [{h.detalhe}]</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  const podeApontarSelecionado =
    isEdit &&
    !!ordem &&
    ordem.status === 'Andamento' &&
    !!itemSelecionado &&
    itemSelecionado.quantidadeFaltante > 0;

  /** Texto explicando por que Apontar está disponível ou não. */
  const hintApontar = (() => {
    if (!isEdit) return 'Apontamento disponível apenas em modo edição.';
    if (!ordem) return '';
    if (ordem.status !== 'Andamento') {
      // Pendente Em Andamento ainda não salvo → instrui a salvar antes
      if (statusPendente?.status === 'Andamento') {
        return 'Status "Em Andamento" está pendente. Salve antes de apontar.';
      }
      return 'OP não está em "Em Andamento". Mude o status e salve antes de apontar.';
    }
    if (!itemSelecionado) return 'Selecione um item para apontar.';
    if (itemSelecionado.quantidadeFaltante <= 0) return 'Item já está 100% produzido.';
    return 'Pronto. Clique em Apontar para registrar produção.';
  })();

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const e: Record<string, string> = {};

      if (isNew) {
        if (!estoque && !pedidoVendaId) {
          e.pedidoVendaId =
            'Selecione um pedido ou marque "OP de estoque (sem PV)".';
        }
        if (!produtoId) e.produtoId = 'Selecione o produto raiz.';
      }

      setErrors(e);
      if (Object.keys(e).length > 0) {
        toast.error('Corrija os campos destacados.');
        return false;
      }

      // Persistência: 1) cria/edita observações; 2) aplica mudança de status
      // pendente (se houver). Status pendente só faz sentido em edit/view de
      // OP existente — em new o status é sempre Pendente recém-criado.
      await onSave({
        pedidoVendaId: estoque ? null : pedidoVendaId,
        produtoId: produtoId ?? ordem?.produtoId ?? 0,
        observacoes: observacoes.trim(),
      });

      if (!isNew && ordem && statusPendente) {
        try {
          await alterarStatus(
            ordem.id,
            statusPendente.status,
            statusPendente.justificativa,
          );
          setStatusPendente(null);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao alterar status';
          toast.error(message);
          return false;
        }
      }

      return true;
    },
  }));

  const clearErr = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full gap-0"
      >
        <div className="shrink-0 px-6 pt-4 pb-0">
          <TabsList>
            <TabsTrigger value="identificacao">Identificação</TabsTrigger>
            {!isNew && (
              <TabsTrigger value="itens">
                Itens {ordem?.itens?.length ? `(${ordem.itens.length})` : ''}
              </TabsTrigger>
            )}
            {!isNew && ordem?.ehMaster && (
              <TabsTrigger value="filhas">
                Filhas {ordem?.filhas?.length ? `(${ordem.filhas.length})` : ''}
              </TabsTrigger>
            )}
            {!isNew && (
              <TabsTrigger value="historico">
                Histórico {historicoOrdem.length ? `(${historicoOrdem.length})` : ''}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ────── Aba Identificação ────── */}
        <TabsContent
          value="identificacao"
          className="flex-1 overflow-auto mt-0 px-6 py-5"
        >
          {/* Painel de status (só fora do new). Botões só em modo edit.
              Status efetivo = pendente (se houver) ou real. */}
          {!isNew && ordem && (
            <div className="mb-5">
              <OrdemProducaoStatusPanel
                ordem={ordem}
                statusExibido={statusPendente?.status ?? ordem.status}
                temPendente={!!statusPendente}
                editable={isEdit}
                onStatusChange={(novo, justificativa) => {
                  setStatusPendente({ status: novo, justificativa });
                  onDirty();
                }}
                onClearPendente={() => setStatusPendente(null)}
              />
            </div>
          )}

          <div
            ref={formFieldsRef}
            onKeyDown={handleFieldsKeyDown}
            className="grid gap-x-3 gap-y-5"
            style={{ gridTemplateColumns: '240px minmax(0, 1fr)' }}
          >
            {/* Código (existente) | Status (existente) — só fora do new */}
            {!isNew && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Código OP
                  </Label>
                  <Input
                    value={ordem?.codigo ?? ''}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Tipo
                  </Label>
                  <Input
                    value={
                      ordem?.ehMaster
                        ? ordem?.ehEstoque
                          ? 'Master (Estoque)'
                          : 'Master'
                        : 'Filha'
                    }
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
              </>
            )}

            {/* Linha PV — checkbox estoque + campo */}
            {isNew && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Modo
                  </Label>
                  <label className="h-9 flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={estoque}
                      onCheckedChange={(c) => {
                        const next = !!c;
                        setEstoque(next);
                        if (next) {
                          setPedidoVendaId(null);
                          setPedidoDisplay({
                            codigo: null,
                            clienteCodigo: null,
                            clienteNome: null,
                          });
                          // Sem PV → sem NS → produto livre
                          setProdutoLockedByNs(false);
                          setNsHint(null);
                          setProdutoId(null);
                          setProdutoDisplay({ codigo: null, descricao: null });
                        }
                        clearErr('pedidoVendaId');
                        clearErr('produtoId');
                        onDirty();
                      }}
                    />
                    OP de estoque (sem PV)
                  </label>
                </div>
                <OrdemProducaoPedidoField
                  value={pedidoVendaId}
                  displayCodigo={pedidoDisplay.codigo}
                  onChange={async (pid, pedido) => {
                    setPedidoVendaId(pid);
                    if (pedido) {
                      setPedidoDisplay({
                        codigo: pedido.codigo ?? null,
                        clienteCodigo: pedido.clienteCodigo ?? null,
                        clienteNome: pedido.clienteNome ?? null,
                      });
                    } else {
                      setPedidoDisplay({
                        codigo: null,
                        clienteCodigo: null,
                        clienteNome: null,
                      });
                    }
                    clearErr('pedidoVendaId');
                    clearErr('produtoId');
                    onDirty();

                    // Lê o Projeto liberado pela Engenharia direto do PV.
                    if (pid && pedido) {
                      if (pedido.produtoBomId && pedido.produtoBomCodigo) {
                        setProdutoId(pedido.produtoBomId);
                        setProdutoDisplay({
                          codigo: pedido.produtoBomCodigo,
                          descricao: pedido.produtoBomDescricao ?? null,
                        });
                        setProdutoLockedByNs(true);
                        setNsHint(
                          `Projeto liberado pela Engenharia: ${pedido.produtoBomCodigo}.`,
                        );
                        setNsHintSeverity('ok');
                      } else {
                        setProdutoId(null);
                        setProdutoDisplay({ codigo: null, descricao: null });
                        setProdutoLockedByNs(true);
                        setNsHint(
                          'Engenharia ainda não liberou o Projeto deste PV. Acesse Engenharia → Liberação de Projetos antes de criar a OP.',
                        );
                        setNsHintSeverity('warn');
                      }
                    } else {
                      setProdutoLockedByNs(false);
                      setNsHint(null);
                    }
                  }}
                  disabled={estoque}
                  error={errors.pedidoVendaId}
                />
              </>
            )}

            {/* Quando não é new: PV readonly */}
            {!isNew && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Pedido de Venda
                  </Label>
                  <Input
                    value={ordem?.pedidoVendaCodigo ?? '— (Estoque)'}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cliente
                  </Label>
                  <Input
                    value={
                      ordem?.clienteNome
                        ? `${ordem.clienteCodigo ?? ''} — ${ordem.clienteNome}`
                        : '—'
                    }
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
              </>
            )}

            {/* Cód. Cliente | Cliente — só no new mostra derivado do PV */}
            {isNew && (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cód. Cliente
                  </Label>
                  <Input
                    value={pedidoDisplay.clienteCodigo ?? ''}
                    readOnly
                    placeholder={estoque ? '—' : ''}
                    className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cliente
                  </Label>
                  <Input
                    value={pedidoDisplay.clienteNome ?? ''}
                    readOnly
                    placeholder={estoque ? '— (sem PV)' : 'Selecione um pedido'}
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
              </>
            )}

            {/* Linha Produto */}
            {isNew ? (
              <>
                <OrdemProducaoProdutoField
                  value={produtoId}
                  displayCodigo={produtoDisplay.codigo}
                  onChange={(pid, prod) => {
                    setProdutoId(pid);
                    if (prod) {
                      setProdutoDisplay({
                        codigo: prod.codigo ?? null,
                        descricao: prod.descricao ?? null,
                      });
                    } else {
                      setProdutoDisplay({ codigo: null, descricao: null });
                    }
                    clearErr('produtoId');
                    onDirty();
                  }}
                  readOnly={produtoLockedByNs}
                  error={errors.produtoId}
                />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Produto
                  </Label>
                  <Input
                    value={produtoDisplay.descricao ?? ''}
                    readOnly
                    placeholder="Selecione um produto fabricado"
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
                {nsHint && (
                  <div
                    className={`text-xs ${
                      nsHintSeverity === 'ok'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : nsHintSeverity === 'warn'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}
                    style={{ gridColumn: '1 / -1' }}
                  >
                    {nsHint}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cód. Produto
                  </Label>
                  <Input
                    value={ordem?.produtoCodigo ?? ''}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Produto
                  </Label>
                  <Input
                    value={ordem?.produtoDescricao ?? ''}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                    tabIndex={-1}
                  />
                </div>
              </>
            )}

            {/* Observações */}
            <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Observações
              </Label>
              <Textarea
                value={observacoes}
                readOnly={readOnly}
                onChange={(e) => {
                  setObservacoes(e.target.value);
                  onDirty();
                }}
                rows={3}
                className="text-sm bg-white dark:bg-slate-950"
                placeholder={readOnly ? '' : 'Anotações sobre esta OP...'}
              />
            </div>
          </div>
        </TabsContent>

        {/* ────── Aba Itens ────── */}
        {!isNew && (
          <TabsContent
            value="itens"
            className="flex-1 overflow-auto mt-0 px-6 py-3"
          >
            <div className="flex flex-col h-full">
              {/* Toolbar com botão Apontar agindo na linha selecionada */}
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <p className="text-[11px] text-muted-foreground italic">
                  {hintApontar}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!podeApontarSelecionado}
                  onClick={() => {
                    if (!itemSelecionado) return;
                    setItemAponto(itemSelecionado);
                    setApontOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Apontar
                </Button>
              </div>

              <div className="flex-1 min-h-[300px]">
                <DataGrid<OrdemProducaoItem>
                  tabId={`${tabId}-op-itens`}
                  storageId="op-itens"
                  columns={colunasItens}
                  data={ordem?.itens ?? []}
                  emptyTitle="Esta ordem não possui itens"
                  onSelect={(item) => setItemSelecionado(item)}
                  onActivate={(item) => {
                    if (
                      isEdit &&
                      ordem?.status === 'Andamento' &&
                      item.quantidadeFaltante > 0
                    ) {
                      setItemAponto(item);
                      setApontOpen(true);
                    }
                  }}
                  activateOnDoubleClick
                />
              </div>
            </div>
          </TabsContent>
        )}

        {/* ────── Aba Filhas ────── */}
        {!isNew && ordem?.ehMaster && (
          <TabsContent
            value="filhas"
            className="flex-1 overflow-auto mt-0 px-6 py-3"
          >
            <div className="flex-1 min-h-[300px] h-full">
              <DataGrid<OrdemProducaoFilhaResumo>
                tabId={`${tabId}-op-filhas`}
                storageId="op-filhas"
                columns={colunasFilhas}
                data={ordem?.filhas ?? []}
                emptyTitle="Esta OP Master não possui filhas"
              />
            </div>
          </TabsContent>
        )}
        {/* ────── Aba Histórico ────── */}
        {!isNew && (
          <TabsContent
            value="historico"
            className="flex-1 overflow-auto mt-0 px-6 py-3"
          >
            <div className="flex-1 min-h-[300px] h-full">
              <DataGrid<HistoricoLinha>
                tabId={`${tabId}-op-historico`}
                storageId="op-historico"
                columns={colunasHistorico}
                data={linhasHistorico}
                emptyTitle="Nenhum evento registrado"
              />
            </div>
          </TabsContent>
        )}
      </Tabs>

      <ApontamentoDialog
        open={apontOpen}
        onOpenChange={(o) => {
          setApontOpen(o);
          if (!o) setItemAponto(null);
        }}
        ordemId={ordem?.id ?? 0}
        item={itemAponto}
      />
    </div>
  );
});
