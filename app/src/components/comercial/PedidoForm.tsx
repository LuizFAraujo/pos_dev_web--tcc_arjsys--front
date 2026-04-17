/**
 * PedidoForm.tsx — Form inline de cadastro/edição/visualização de pedido de venda
 *
 * Abas:
 *   Pedido — Tipo de pedido (new), Cliente (autocomplete), Observação, Código/Status/Valor (readonly)
 *   Itens  — Tabela de itens. view=readonly, edit/new=editável com add/remove
 *
 * Itens são salvos via API individual (addItem/updateItem/removeItem) após salvar o cabeçalho.
 * No mode new: cria o pedido primeiro (sem itens), depois o usuário adiciona itens em edit.
 * No mode edit: itens são manipulados diretamente via API (cada ação salva imediatamente).
 *
 * Edição de itens permitida em status Aguardando ou EmAndamento.
 *
 * O submit() via ref salva apenas o cabeçalho (clienteId + observacoes + status).
 * Itens são gerenciados em tempo real na aba Itens.
 */

import { useEffect, useImperativeHandle, useState, useMemo, useCallback, forwardRef } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import { STATUS_LABELS, STATUS_COLORS } from '@/types/comercial/pedido.types';
import type { PedidoVenda, PedidoVendaFormData, ItemPedido, ItemPedidoFormData } from '@/types/comercial/pedido.types';
import type { PageMode } from '@/components/shared/PageShell';

// ─── Handle exposto via ref ───────────────────────────────────────────────────

export interface PedidoFormHandle {
  submit: () => Promise<boolean>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PedidoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  pedido: PedidoVenda | null;
  onDirty: () => void;
  onSave: (data: PedidoVendaFormData) => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TABS = ['pedido', 'itens'];

const FIELD_TAB: Record<string, string> = {
  clienteId: 'pedido',
  observacoes: 'pedido',
};

const EMPTY_FORM = { clienteId: 0, observacoes: '', statusInicial: 'EmAndamento' as 'Aguardando' | 'EmAndamento' };

// ─── Item vazio para adicionar ────────────────────────────────────────────────

interface ItemLocal {
  produtoId: number;
  produtoCodigo: string;
  produtoDescricao: string;
  quantidade: string;
  precoUnitario: string;
  produtoSearch: string;
  showDropdown: boolean;
}

const EMPTY_ITEM: ItemLocal = {
  produtoId: 0,
  produtoCodigo: '',
  produtoDescricao: '',
  quantidade: '',
  precoUnitario: '',
  produtoSearch: '',
  showDropdown: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val?: number) {
  if (val == null) return '-';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Status que permitem edição de itens */
function canEditItens(status?: string): boolean {
  return status === 'Aguardando' || status === 'EmAndamento';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const PedidoForm = forwardRef<PedidoFormHandle, PedidoFormProps>(
  function PedidoForm({ mode, pedido, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const isNew = mode === 'new';

    // ── Form state (cabeçalho) ────────────────────────────────────────────────
    const [data, setData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Cliente autocomplete ──────────────────────────────────────────────────
    const [clienteSearch, setClienteSearch] = useState('');
    const [showClienteDropdown, setShowClienteDropdown] = useState(false);

    // ── Stores ────────────────────────────────────────────────────────────────
    const clientes = useClientesStore((s) => s.clientes);
    const fetchClientes = useClientesStore((s) => s.fetchClientes);
    const produtos = useProdutosStore((s) => s.produtos);
    const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);

    const pedidoDetalhe = usePedidosStore((s) => s.pedidoDetalhe);
    const fetchPedido = usePedidosStore((s) => s.fetchPedido);
    const addItem = usePedidosStore((s) => s.addItem);
    const updateItem = usePedidosStore((s) => s.updateItem);
    const removeItem = usePedidosStore((s) => s.removeItem);

    // ── Novo item (formulário de adição) ──────────────────────────────────────
    const [newItem, setNewItem] = useState<ItemLocal>({ ...EMPTY_ITEM });
    const [itemSaving, setItemSaving] = useState(false);

    // ── Tab navigation ────────────────────────────────────────────────────────
    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'pedido',
    });

    // ── Carregar dados auxiliares ──────────────────────────────────────────────
    useEffect(() => {
      if (clientes.length === 0) fetchClientes();
      if (produtos.length === 0) fetchProdutos();
    }, [clientes.length, fetchClientes, produtos.length, fetchProdutos]);

    // ── Carregar detalhe do pedido (itens) ao abrir view/edit ─────────────────
    useEffect(() => {
      if (pedido?.id && !isNew) {
        fetchPedido(pedido.id);
      }
    }, [pedido?.id, isNew, fetchPedido]);

    // ── Reset form ao trocar de item ou modo ──────────────────────────────────
    useEffect(() => {
      setErrors({});
      setNewItem({ ...EMPTY_ITEM });
      if (pedido) {
        setData({
          clienteId: pedido.clienteId ?? 0,
          observacoes: pedido.observacoes ?? '',
          statusInicial: 'EmAndamento',
        });
        setClienteSearch(pedido.clienteNome ?? '');
      } else {
        setData({ ...EMPTY_FORM });
        setClienteSearch('');
      }
    }, [pedido, mode]);

    // ── Itens do pedido (vem do detalhe carregado) ────────────────────────────
    const itens: ItemPedido[] = useMemo(() => {
      if (isNew) return [];
      if (pedidoDetalhe?.id === pedido?.id) {
        return pedidoDetalhe?.itens ?? [];
      }
      return pedido?.itens ?? [];
    }, [isNew, pedidoDetalhe, pedido]);

    const totalGeral = useMemo(
      () => itens.reduce((sum, i) => sum + (i.subtotal ?? i.quantidade * i.precoUnitario), 0),
      [itens],
    );

    // ── Submit cabeçalho via ref ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};
        if (!data.clienteId) e.clienteId = 'Selecione um cliente';
        setErrors(e);

        if (Object.keys(e).length > 0) {
          const firstErrorField = Object.keys(e)[0];
          const targetTab = FIELD_TAB[firstErrorField];
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

        const payload: PedidoVendaFormData = {
          clienteId: data.clienteId,
          observacoes: data.observacoes?.trim() || undefined,
        };

        // No mode new, envia o status inicial escolhido
        if (isNew) {
          payload.status = data.statusInicial;
        }

        await onSave(payload);
        return true;
      },
    }));

    // ── Setter com limpa erro + onDirty ───────────────────────────────────────
    const set = useCallback((field: string, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
      onDirty();
    }, [errors, onDirty]);

    // ── Cliente autocomplete logic ────────────────────────────────────────────
    const clientesFiltrados = useMemo(() => {
      if (!clienteSearch) return (clientes || []).slice(0, 10);
      const term = clienteSearch.toLowerCase();
      return (clientes || [])
        .filter((c) =>
          (c.nome || '').toLowerCase().includes(term) ||
          (c.cpfCnpj || '').toLowerCase().includes(term)
        )
        .slice(0, 10);
    }, [clientes, clienteSearch]);

    const handleClienteSelect = useCallback((c: { id: number; nome: string }) => {
      set('clienteId', c.id);
      setClienteSearch(c.nome);
      setShowClienteDropdown(false);
    }, [set]);

    const handleClienteClear = useCallback(() => {
      set('clienteId', 0);
      setClienteSearch('');
      setShowClienteDropdown(false);
    }, [set]);

    // ── Produto autocomplete para novo item ───────────────────────────────────
    const produtosFiltrados = useMemo(() => {
      if (!newItem.produtoSearch) return (produtos || []).filter((p) => p.ativo).slice(0, 10);
      const term = newItem.produtoSearch.toLowerCase();
      return (produtos || [])
        .filter((p) => p.ativo && (
          p.codigo.toLowerCase().includes(term) ||
          p.descricao.toLowerCase().includes(term)
        ))
        .slice(0, 10);
    }, [produtos, newItem.produtoSearch]);

    const handleProdutoSelect = useCallback((p: { id: number; codigo: string; descricao: string }) => {
      setNewItem((prev) => ({
        ...prev,
        produtoId: p.id,
        produtoCodigo: p.codigo,
        produtoDescricao: p.descricao,
        produtoSearch: `${p.codigo} - ${p.descricao}`,
        showDropdown: false,
      }));
    }, []);

    // ── Adicionar item ────────────────────────────────────────────────────────
    const handleAddItem = useCallback(async () => {
      if (!pedido?.id) {
        toast.error('Salve o pedido primeiro antes de adicionar itens.');
        return;
      }
      if (!newItem.produtoId) {
        toast.error('Selecione um produto.');
        return;
      }
      const qtd = parseFloat(newItem.quantidade.replace(',', '.'));
      const preco = parseFloat(newItem.precoUnitario.replace(',', '.'));
      if (!qtd || qtd <= 0) {
        toast.error('Quantidade deve ser maior que zero.');
        return;
      }
      if (!preco || preco < 0) {
        toast.error('Preço unitário inválido.');
        return;
      }

      setItemSaving(true);
      try {
        const itemData: ItemPedidoFormData = {
          produtoId: newItem.produtoId,
          quantidade: qtd,
          precoUnitario: preco,
        };
        await addItem(pedido.id, itemData);
        setNewItem({ ...EMPTY_ITEM });
        toast.success('Item adicionado.');
      } catch {
        toast.error('Erro ao adicionar item.');
      } finally {
        setItemSaving(false);
      }
    }, [pedido?.id, newItem, addItem]);

    // ── Remover item ──────────────────────────────────────────────────────────
    const handleRemoveItem = useCallback(async (itemId: number) => {
      if (!pedido?.id) return;
      try {
        await removeItem(pedido.id, itemId);
        toast.success('Item removido.');
      } catch {
        toast.error('Erro ao remover item.');
      }
    }, [pedido?.id, removeItem]);

    // ── Condição de edição de itens ───────────────────────────────────────────
    const canEdit = mode === 'edit' && canEditItens(pedido?.status);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-0">

          <div className="shrink-0 px-6 pt-4 pb-0">
            <TabsList>
              <TabsTrigger value="pedido">Pedido</TabsTrigger>
              <TabsTrigger value="itens">
                Itens{!isNew && itens.length > 0 ? ` (${itens.length})` : ''}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Aba Pedido ──────────────────────────────────────────────────── */}
          <TabsContent value="pedido" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">

              {/* Tipo de pedido (só no new) */}
              {isNew && (
                <div className="flex flex-col gap-1.5 col-span-3">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Tipo do Pedido</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusInicial"
                        value="EmAndamento"
                        checked={data.statusInicial === 'EmAndamento'}
                        onChange={() => set('statusInicial', 'EmAndamento')}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">Venda realizada</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statusInicial"
                        value="Aguardando"
                        checked={data.statusInicial === 'Aguardando'}
                        onChange={() => set('statusInicial', 'Aguardando')}
                        className="accent-yellow-600"
                      />
                      <span className="text-sm">Venda futura (pré-pedido)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Código (readonly, só em edit/view) */}
              {!isNew && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Código</Label>
                  <Input
                    value={pedido?.codigo || '-'}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              )}

              {/* Status (readonly badge, só em edit/view) */}
              {!isNew && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</Label>
                  <div className="h-9 flex items-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pedido?.status ?? 'Aguardando'] || ''}`}>
                      {STATUS_LABELS[pedido?.status ?? 'Aguardando'] || pedido?.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Valor total (readonly, só em edit/view) */}
              {!isNew && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Valor Total</Label>
                  <div className="h-9 flex items-center">
                    <span className="font-mono font-semibold text-green-700 dark:text-green-400">
                      {formatCurrency(totalGeral || pedido?.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Cliente (autocomplete) */}
              <div className="flex flex-col gap-1.5 col-span-3">
                <Label htmlFor="clienteId" className={`text-xs font-medium ${errors.clienteId ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  Cliente *
                </Label>
                {readOnly ? (
                  <Input
                    value={clienteSearch || pedido?.clienteNome || '-'}
                    readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="clienteId"
                      placeholder="Buscar cliente por nome ou CPF/CNPJ..."
                      value={clienteSearch}
                      onChange={(e) => {
                        setClienteSearch(e.target.value);
                        setShowClienteDropdown(true);
                        if (!e.target.value) set('clienteId', 0);
                      }}
                      onFocus={() => { if (!data.clienteId) setShowClienteDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowClienteDropdown(false), 200)}
                      className={`h-9 text-sm bg-white dark:bg-slate-950 pl-9 ${
                        errors.clienteId ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-400/30' : ''
                      }`}
                    />

                    {showClienteDropdown && data.clienteId === 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-md">
                        {clientesFiltrados.length > 0 ? clientesFiltrados.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleClienteSelect(c)}
                          >
                            <span className="font-medium">{c.nome}</span>
                            {c.cpfCnpj && <span className="ml-2 text-muted-foreground">({c.cpfCnpj})</span>}
                          </button>
                        )) : (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                        )}
                      </div>
                    )}

                    {data.clienteId > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliente selecionado: <span className="font-medium">{clienteSearch}</span>
                        <button type="button" className="ml-2 text-destructive hover:underline"
                          onClick={handleClienteClear}>
                          Limpar
                        </button>
                      </p>
                    )}
                  </div>
                )}
                {errors.clienteId && (
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
                    {errors.clienteId}
                  </p>
                )}
              </div>

              {/* Observação */}
              <div className="flex flex-col gap-1.5 col-span-3">
                <Label htmlFor="observacoes" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Observação
                </Label>
                <Textarea
                  id="observacoes"
                  value={data.observacoes}
                  onChange={(e) => set('observacoes', e.target.value)}
                  readOnly={readOnly}
                  rows={3}
                  placeholder="Observações sobre o pedido..."
                  className={`text-sm bg-white dark:bg-slate-950 ${
                    readOnly ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0' : ''
                  }`}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Aba Itens ───────────────────────────────────────────────────── */}
          <TabsContent value="itens" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div className="space-y-4">

              {/* Mensagem para new mode */}
              {isNew && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  Salve o pedido primeiro para poder adicionar itens.
                </div>
              )}

              {/* Formulário de adição de item (edit mode, status Aguardando ou EmAndamento) */}
              {canEdit && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Adicionar item</p>
                  <div className="grid grid-cols-12 gap-3 items-end">

                    {/* Produto (autocomplete) — 5 cols */}
                    <div className="col-span-5 relative">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Produto</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Buscar produto..."
                          value={newItem.produtoSearch}
                          onChange={(e) => {
                            setNewItem((prev) => ({
                              ...prev,
                              produtoSearch: e.target.value,
                              showDropdown: true,
                              produtoId: 0,
                              produtoCodigo: '',
                              produtoDescricao: '',
                            }));
                          }}
                          onFocus={() => { if (!newItem.produtoId) setNewItem((prev) => ({ ...prev, showDropdown: true })); }}
                          onBlur={() => setTimeout(() => setNewItem((prev) => ({ ...prev, showDropdown: false })), 200)}
                          className="h-8 text-xs bg-white dark:bg-slate-950 pl-8"
                        />
                        {newItem.showDropdown && newItem.produtoId === 0 && (
                          <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-md">
                            {produtosFiltrados.length > 0 ? produtosFiltrados.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-muted/50 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleProdutoSelect(p)}
                              >
                                <span className="font-mono">{p.codigo}</span>
                                <span className="ml-2">{p.descricao}</span>
                              </button>
                            )) : (
                              <p className="px-3 py-1.5 text-xs text-muted-foreground">Nenhum produto encontrado</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantidade — 2 cols */}
                    <div className="col-span-2">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Qtde</Label>
                      <Input
                        type="text"
                        placeholder="0"
                        value={newItem.quantidade}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, quantidade: e.target.value }))}
                        className="h-8 text-xs bg-white dark:bg-slate-950 text-right font-mono"
                      />
                    </div>

                    {/* Preço unitário — 3 cols */}
                    <div className="col-span-3">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Preço Unit. (R$)</Label>
                      <Input
                        type="text"
                        placeholder="0,00"
                        value={newItem.precoUnitario}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, precoUnitario: e.target.value }))}
                        className="h-8 text-xs bg-white dark:bg-slate-950 text-right font-mono"
                      />
                    </div>

                    {/* Botão adicionar — 2 cols */}
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        className="h-8 w-full text-xs"
                        disabled={itemSaving || !newItem.produtoId}
                        onClick={handleAddItem}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {itemSaving ? 'Adicionando...' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de itens */}
              {itens.length > 0 ? (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Código</th>
                        <th className="p-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Descrição</th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Qtde</th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Preço Unit.</th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Total</th>
                        {canEdit && <th className="p-2.5 w-10" />}
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item) => (
                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 text-xs font-mono">{item.produtoCodigo || '-'}</td>
                          <td className="p-2.5 text-xs">{item.produtoDescricao || '-'}</td>
                          <td className="p-2.5 text-xs text-right font-mono">{item.quantidade}</td>
                          <td className="p-2.5 text-xs text-right font-mono">{formatCurrency(item.precoUnitario)}</td>
                          <td className="p-2.5 text-xs text-right font-mono font-medium">
                            {formatCurrency(item.subtotal ?? item.quantidade * item.precoUnitario)}
                          </td>
                          {canEdit && (
                            <td className="p-2.5 text-center">
                              <Button
                                variant="ghost" size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t bg-muted/30">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-xs font-medium text-right">
                          Total Geral:
                        </td>
                        <td className="p-2.5 text-xs text-right font-mono font-semibold text-green-700 dark:text-green-400">
                          {formatCurrency(totalGeral)}
                        </td>
                        {canEdit && <td />}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                !isNew && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Nenhum item neste pedido.
                  </div>
                )
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    );
  }
);
