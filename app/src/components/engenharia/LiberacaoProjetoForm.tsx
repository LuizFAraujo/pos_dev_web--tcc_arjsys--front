/**
 * LiberacaoProjetoForm.tsx - Form de Liberação de Projeto (BOM) num PV.
 *
 * Modos:
 *   - view: tudo readonly
 *   - edit: PV/Cliente readonly; Produto BOM editável (picker reaproveitado
 *           de Produção, que já filtra Fabricados)
 *
 * Layout em grid 2 colunas (240px | 1fr).
 */

import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TIPO_PV_COLORS,
  TIPO_PV_LABELS,
  type PedidoVenda,
} from '@/types/comercial/pedido.types';
import type { PageMode } from '@/components/shared/PageShell';
import { OrdemProducaoProdutoField } from '@/components/producao/OrdemProducaoProdutoField';

export interface LiberacaoProjetoFormHandle {
  submit: () => Promise<boolean>;
}

interface Props {
  mode: Extract<PageMode, 'view' | 'edit' | 'new'>;
  pedido: PedidoVenda | null;
  onDirty: () => void;
  onSave: (produtoBomId: number | null) => Promise<void>;
}

const TABS = ['identificacao'];

export const LiberacaoProjetoForm = forwardRef<LiberacaoProjetoFormHandle, Props>(
  function LiberacaoProjetoForm({ mode, pedido, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';

    const [produtoId, setProdutoId] = useState<number | null>(null);
    const [produtoDisplay, setProdutoDisplay] = useState<{
      codigo: string | null;
      descricao: string | null;
    }>({ codigo: null, descricao: null });

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } =
      useFormTabNavigation({ tabs: TABS, defaultTab: 'identificacao' });

    useEffect(() => {
      if (pedido) {
        setProdutoId(pedido.produtoBomId ?? null);
        setProdutoDisplay({
          codigo: pedido.produtoBomCodigo ?? null,
          descricao: pedido.produtoBomDescricao ?? null,
        });
      } else {
        setProdutoId(null);
        setProdutoDisplay({ codigo: null, descricao: null });
      }
    }, [pedido, mode]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (!pedido) {
          toast.error('Nenhum pedido selecionado.');
          return false;
        }
        await onSave(produtoId ?? null);
        return true;
      },
    }));

    if (!pedido) {
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Selecione um pedido para visualizar.
        </div>
      );
    }

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
            </TabsList>
          </div>

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
              {/* Linha 1: Código PV | Tipo PV */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Código PV
                </Label>
                <Input
                  value={pedido.codigo}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tipo / Status
                </Label>
                <div className="h-9 flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      TIPO_PV_COLORS[pedido.tipo] || ''
                    }`}
                  >
                    {TIPO_PV_LABELS[pedido.tipo] || pedido.tipo}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[pedido.status] || ''
                    }`}
                  >
                    {STATUS_LABELS[pedido.status] || pedido.status}
                  </span>
                </div>
              </div>

              {/* Linha 2: Cód. Cliente | Cliente */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Cód. Cliente
                </Label>
                <Input
                  value={pedido.clienteCodigo ?? ''}
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
                  value={pedido.clienteNome ?? ''}
                  readOnly
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              {/* Linha 3: Código BOM (Projeto) | Descrição */}
              <OrdemProducaoProdutoField
                label="Projeto BOM"
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
                  onDirty();
                }}
                readOnly={readOnly}
              />

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Descrição do Projeto
                </Label>
                <Input
                  value={produtoDisplay.descricao ?? ''}
                  readOnly
                  placeholder={
                    readOnly
                      ? produtoDisplay.descricao
                        ? ''
                        : 'Sem projeto liberado'
                      : 'Selecione um produto fabricado com BOM'
                  }
                  className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                />
              </div>

              {/* Hint */}
              <div
                className="text-xs text-muted-foreground"
                style={{ gridColumn: '1 / -1' }}
              >
                {readOnly
                  ? produtoId
                    ? 'Projeto liberado. Produção pode criar OP usando este pedido.'
                    : 'Pedido sem projeto. Entre em modo edição para liberar.'
                  : 'Para limpar a liberação, deixe o campo Projeto BOM em branco e salve.'}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
);
