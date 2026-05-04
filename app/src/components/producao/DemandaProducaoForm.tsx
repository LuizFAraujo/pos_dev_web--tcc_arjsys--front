/**
 * DemandaProducaoForm.tsx - Form de tela cheia da Demanda de Produção.
 *
 * View: dados da OP+produto (read-only) + aba Histórico (DataGrid).
 * Edit: campo Quantidade Produzida editável (NumberStepper); recalcula
 * faltante/% ao vivo. Salvar valida no back via /apontar com delta.
 * Redução exige justificativa.
 *
 * Histórico filtrado por item da OP - eventos da OP (status) + apontamentos
 * só deste item.
 */

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  forwardRef,
} from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { JustificativaDialog } from '@/components/shared/JustificativaDialog';
import { NumberStepper } from '@/components/shared/NumberStepper';
import {
  EVENTO_OP_LABELS,
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
  type OrdemProducaoHistorico,
} from '@/types/producao/ordemProducao.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';
import { useOrdemProducaoStore } from '@/stores/producao/ordemProducaoStore';
import { useDemandaStore } from '@/stores/producao/demandaStore';
import { apiGet, ApiError } from '@/lib/api';
import type { DemandaItem } from '@/types/producao/demanda.types';
import type { PageMode } from '@/components/shared/PageShell';

export interface DemandaProducaoFormHandle {
  submit: () => Promise<boolean>;
}

interface Props {
  mode: Extract<PageMode, 'view' | 'edit' | 'new'>;
  item: DemandaItem | null;
  tabId: string;
  /** Sinaliza dirty pra page (true ao alterar, false ao limpar). */
  onDirtyChange: (dirty: boolean) => void;
}

const TABS = ['identificacao', 'historico'];

function formatarDataHora(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

export const DemandaProducaoForm = forwardRef<DemandaProducaoFormHandle, Props>(
  function DemandaProducaoForm({ mode, item, tabId, onDirtyChange }, ref) {
    const isEdit = mode === 'edit';
    const apontar = useOrdemProducaoStore((s) => s.apontar);
    const patchItem = useDemandaStore((s) => s.patchItem);

    const [produzidoStr, setProduzidoStr] = useState('');
    const [committed, setCommitted] = useState<number>(0);
    const [historico, setHistorico] = useState<OrdemProducaoHistorico[]>([]);
    const [justOpen, setJustOpen] = useState(false);
    const [justResolver, setJustResolver] = useState<
      ((v: string | null) => void) | null
    >(null);

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } =
      useFormTabNavigation({ tabs: TABS, defaultTab: 'identificacao' });

    useEffect(() => {
      if (item) {
        setProduzidoStr(String(item.quantidadeProduzida));
        setCommitted(item.quantidadeProduzida);
      }
    }, [item, mode]);

    // Histórico filtrado por item
    useEffect(() => {
      if (!item) return;
      let cancel = false;
      void (async () => {
        try {
          const url = `/api/producao/OrdemProducao/${item.ordemProducaoId}/itens/${item.ordemProducaoItemId}/historico`;
          const raw = await apiGet<unknown>(url);
          const lista = Array.isArray(raw)
            ? (raw as OrdemProducaoHistorico[])
            : [];
          if (!cancel) setHistorico(lista);
        } catch (err) {
          if (!cancel) {
            const m =
              err instanceof ApiError ? err.message : 'Erro ao carregar histórico';
            toast.error(m);
          }
        }
      })();
      return () => {
        cancel = true;
      };
    }, [item]);

    const produzidoNum = useMemo(() => {
      const n = parseFloat(produzidoStr.replace(',', '.'));
      return Number.isNaN(n) ? committed : n;
    }, [produzidoStr, committed]);

    const dirty = produzidoNum !== committed;

    useEffect(() => {
      onDirtyChange(dirty);
    }, [dirty, onDirtyChange]);

    const faltanteCalc = useMemo(() => {
      if (!item) return 0;
      return item.quantidadePlanejada - produzidoNum;
    }, [item, produzidoNum]);

    const pctCalc = useMemo(() => {
      if (!item || item.quantidadePlanejada <= 0) return 0;
      return Math.round((produzidoNum / item.quantidadePlanejada) * 100);
    }, [item, produzidoNum]);

    const opNaoAndamento = item ? item.statusOp !== 'Andamento' : true;

    const validar = (): string | null => {
      if (!item) return 'Item inválido.';
      if (opNaoAndamento)
        return 'OP precisa estar em Andamento para registrar produção.';
      if (Number.isNaN(produzidoNum)) return 'Quantidade inválida.';
      if (produzidoNum < 0)
        return 'Quantidade produzida não pode ser negativa.';
      if (produzidoNum > item.quantidadePlanejada)
        return `Quantidade ultrapassa o planejado (${item.quantidadePlanejada}).`;
      return null;
    };

    const pedirJustificativa = (): Promise<string | null> =>
      new Promise((resolve) => {
        setJustResolver(() => resolve);
        setJustOpen(true);
      });

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (!item) return false;
        if (!dirty) return true;

        const erro = validar();
        if (erro) {
          toast.error(erro);
          return false;
        }
        const delta = produzidoNum - committed;
        if (delta === 0) return true;

        let justificativa: string | undefined;
        if (delta < 0) {
          const just = await pedirJustificativa();
          if (!just) return false;
          justificativa = just;
        }

        try {
          await apontar(item.ordemProducaoId, item.ordemProducaoItemId, {
            quantidade: delta,
            observacao: justificativa,
          });
          setCommitted(produzidoNum);

          // Atualização cirúrgica (sem refetch + sem flicker).
          // Mantém linha mesmo a 100% pra histórico visual.
          const novoFaltante = item.quantidadePlanejada - produzidoNum;
          const novoPct =
            item.quantidadePlanejada > 0
              ? Math.round(
                  (produzidoNum / item.quantidadePlanejada) * 10000,
                ) / 100
              : 0;
          patchItem(item.ordemProducaoItemId, {
            quantidadeProduzida: produzidoNum,
            quantidadeFaltante: novoFaltante,
            percentualConcluido: novoPct,
          });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao salvar';
          toast.error(message);
          return false;
        }
      },
    }));

    if (!item) {
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Selecione uma linha da demanda para visualizar.
        </div>
      );
    }

    const colunasHist: GridColumn<OrdemProducaoHistorico>[] = [
      {
        key: 'dataHora',
        header: 'DATA/HORA',
        width: 170,
        filterType: 'text',
        className: 'font-mono text-xs',
        render: (h) => formatarDataHora(h.dataHora),
      },
      {
        key: 'evento',
        header: 'EVENTO',
        width: 130,
        filterType: 'text',
        render: (h) => EVENTO_OP_LABELS[h.evento] || h.evento,
      },
      {
        key: 'detalhe',
        header: 'DETALHE',
        width: 280,
        filterType: 'text',
        className: 'font-mono text-xs',
        render: (h) => h.detalhe ?? '-',
      },
      {
        key: 'justificativa',
        header: 'JUSTIFICATIVA',
        width: 280,
        filterType: 'text',
        render: (h) => h.justificativa ?? '-',
      },
    ];

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
              <TabsTrigger value="historico">
                Histórico {historico.length ? `(${historico.length})` : ''}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Aba Identificação */}
          <TabsContent
            value="identificacao"
            className="flex-1 overflow-auto mt-0 px-6 py-5"
          >
            <div
              ref={formFieldsRef}
              onKeyDown={handleFieldsKeyDown}
              className="grid gap-x-3 gap-y-5"
              style={{ gridTemplateColumns: '240px minmax(0, 1fr)' }}
            >
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  OP
                </Label>
                <Input
                  value={item.ordemProducaoCodigo}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Status OP
                </Label>
                <div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_OP_COLORS[item.statusOp] || ''
                    }`}
                  >
                    {STATUS_OP_LABELS[item.statusOp] || item.statusOp}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cód. Produto
                </Label>
                <Input
                  value={item.produtoCodigo}
                  readOnly
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Descrição
                </Label>
                <Input
                  value={item.produtoDescricao}
                  readOnly
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tipo
                </Label>
                <Input
                  value={TIPO_PRODUTO_LABELS[item.tipoProduto] || item.tipoProduto}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Unidade
                </Label>
                <Input
                  value={item.produtoUnidade}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Planejado
                </Label>
                <Input
                  value={String(item.quantidadePlanejada)}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Produzido {isEdit ? '*' : ''}
                </Label>
                <NumberStepper
                  value={produzidoStr}
                  onChange={setProduzidoStr}
                  min={0}
                  max={item.quantidadePlanejada}
                  step={1}
                  disabled={!isEdit || opNaoAndamento}
                  readOnly={!isEdit || opNaoAndamento}
                  className="max-w-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Faltante
                </Label>
                <Input
                  value={String(faltanteCalc)}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  % concluído
                </Label>
                <Input
                  value={`${pctCalc}%`}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              {isEdit && opNaoAndamento && (
                <div
                  className="text-xs text-amber-700 dark:text-amber-400"
                  style={{ gridColumn: '1 / -1' }}
                >
                  OP não está em Andamento. Mude o status na tela de OP antes
                  de registrar produção.
                </div>
              )}
              {isEdit && dirty && (
                <div
                  className="text-xs text-amber-700 dark:text-amber-400"
                  style={{ gridColumn: '1 / -1' }}
                >
                  Alterações não salvas - clique em Salvar para registrar.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent
            value="historico"
            className="flex-1 overflow-auto mt-0 px-6 py-3"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-75">
                <DataGrid<OrdemProducaoHistorico>
                  tabId={`${tabId}-demanda-historico`}
                  storageId="demanda-historico"
                  columns={colunasHist}
                  data={historico}
                  emptyTitle="Sem registros no histórico"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <JustificativaDialog
          open={justOpen}
          onOpenChange={(o) => {
            setJustOpen(o);
            if (!o && justResolver) {
              justResolver(null);
              setJustResolver(null);
            }
          }}
          title="Reduzir quantidade produzida"
          description="A nova quantidade é menor que a atual. Informe o motivo (registrado no histórico)."
          placeholder="Ex.: contagem corrigida após inspeção..."
          confirmLabel="Confirmar redução"
          variant="warning"
          onConfirm={(just) => {
            justResolver?.(just);
            setJustResolver(null);
          }}
        />
      </div>
    );
  },
);
