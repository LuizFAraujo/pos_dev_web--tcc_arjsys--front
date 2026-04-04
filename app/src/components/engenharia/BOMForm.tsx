/**
 * BOMForm.tsx — Form inline de estrutura de produto (BOM)
 *
 * Usa DataGridTree. Coluna # com numeração fixa.
 * sortable: false em todas. Filtros mantidos.
 *
 * === Edição em lote (mode edit/new) ===
 *
 * Ativação de edição:
 *   - Duplo clique ou F2 na célula QTDE/POS → ativa input
 *   - Enter/Tab confirma, Esc cancela
 *   - Campos aparecem como caixa mas travados até ativar
 *
 * Marcar/desmarcar exclusão:
 *   - Tecla Delete na linha selecionada (toggle)
 *   - Nunca no nó raiz (nível 1)
 *
 * Visual por status:
 *   added   → fundo verde claro (linha nova, não salva)
 *   changed → fundo amarelo claro (qtde/pos alterada)
 *   deleted → fundo vermelho claro + riscado no código (tom vermelho mais escuro)
 *   clean   → visual normal
 *
 * Formatação:
 *   POS → 4 dígitos zero-padded (0010), fonte menor
 *   QTDE → pt-BR 3 decimais com milhar (1.234,500)
 *
 * Salvar:
 *   - Processa deletes, updates (qtde+pos), creates
 *   - Reordena filhos por POS dentro de cada nível/pai
 *   - isDirty ativa o ConfirmCloseDialog ao fechar aba
 *
 * Rodapé:
 *   - Dicas de teclas e cliques pra edição
 */

import { useEffect, useImperativeHandle, useMemo, useCallback, forwardRef, useRef, useState } from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useTabState } from '@/hooks/useTabState';
import { useBomEditState } from '@/hooks/useBomEditState';
import { DataGridTree } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import type { PageMode } from '@/components/shared/PageShell';
import type { BomTreeItem } from '@/types/engenharia/bom.types';
import type { BomRowStatus } from '@/hooks/useBomEditState';

// ─── Types internos ───────────────────────────────────────────────────────────

export interface BOMFormHandle {
  submit: () => Promise<boolean>;
}

interface BOMFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  codigoPai: string;
  onDirty: () => void;
  onSave: () => Promise<void>;
  tabId: string;
}

/** BomTreeItem com _rowNum pra numeração sequencial na tree */
interface BomTreeItemNum extends BomTreeItem {
  _rowNum: number;
  children: BomTreeItemNum[];
}

// ─── Formatação ───────────────────────────────────────────────────────────────

/** QTDE: pt-BR com 3 decimais e separador de milhar (ex: 1.234,500) */
function formatQtde(q: number): string {
  return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

/** POS: 4 dígitos zero-padded (ex: 0010, 0032) */
function formatPos(p: number): string {
  return String(p).padStart(4, '0');
}

// ─── Visual por status ────────────────────────────────────────────────────────

/**
 * Classes CSS de fundo por status de edição.
 * Retornadas via rowClassName pro DataGridTree.
 * Nota: 'deleted' não tem line-through aqui — o riscado é aplicado
 * especificamente na coluna CÓDIGO (tom vermelho mais escuro).
 */
function getStatusBgClasses(status: BomRowStatus): string {
  switch (status) {
    case 'added': return 'bg-emerald-50 dark:bg-emerald-950/30';
    case 'changed': return 'bg-amber-50 dark:bg-amber-950/30';
    case 'deleted': return 'bg-red-50 dark:bg-red-950/30';
    default: return '';
  }
}

// ─── TreeDocButtons ───────────────────────────────────────────────────────────

function TreeDocButtons({ item }: { item: BomTreeItemNum }) {
  const abrirPasta = useProdutosStore((s) => s.abrirPasta);
  const abrirDocumento = useProdutosStore((s) => s.abrirDocumento);
  const produtos = useProdutosStore((s) => s.produtos);
  const produto = produtos.find((p) => p.codigo === item.codigo);

  if (!produto || !item.temDocumento) return <span className="text-muted-foreground">-</span>;

  const handlePasta = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await abrirPasta(produto.id); }
    catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta'); }
  };

  const handleDoc = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await abrirDocumento(produto.id, 'pdf'); }
    catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento'); }
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={handlePasta}
            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer">
            <FolderOpen className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir pasta</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={handleDoc}
            className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
            <FileText className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent><p>Abrir documento</p></TooltipContent>
      </Tooltip>
    </div>
  );
}

// ─── EditableCell — Input com ativação por duplo clique ou F2 ─────────────────

interface EditableCellProps {
  /** Valor formatado pra exibição (ex: "0010", "2,000") */
  displayValue: string;
  /** Valor raw pra edição (ex: "10", "2") */
  editValue: string;
  /** Callback ao confirmar edição */
  onConfirm: (rawValue: string) => void;
  /** Se a célula está habilitada pra edição (false em view ou deleted) */
  enabled: boolean;
  /** Classes extras no display (ex: fonte menor pra POS) */
  displayClassName?: string;
  /** Alinhamento do texto */
  align?: 'left' | 'center' | 'right';
  /** ID único pra controle de qual célula está ativa */
  cellId: string;
  /** Célula atualmente em edição (controlado pelo pai) */
  activeCellId: string | null;
  /** Callback pra setar a célula ativa */
  onActivate: (cellId: string | null) => void;
}

function EditableCell({
  displayValue, editValue, onConfirm, enabled,
  displayClassName, align = 'right', cellId,
  activeCellId, onActivate,
}: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = activeCellId === cellId;

  // Foca o input quando ativa
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.value = editValue;
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive, editValue]);

  const handleConfirm = useCallback(() => {
    const raw = inputRef.current?.value || '';
    onConfirm(raw);
    onActivate(null);
  }, [onConfirm, onActivate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      onActivate(null);
    }
  }, [handleConfirm, onActivate]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (enabled) onActivate(cellId);
  }, [enabled, cellId, onActivate]);

  // Modo ativo — input visível
  if (isActive) {
    return (
      <input
        ref={inputRef}
        type="text"
        onBlur={handleConfirm}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={`w-full h-6 px-1 text-sm bg-white dark:bg-slate-950
          border border-blue-400 dark:border-blue-500 rounded
          focus:outline-none focus:ring-1 focus:ring-blue-500
          ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      />
    );
  }

  // Modo inativo — display com borda sutil (indica editável)
  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`w-full h-6 px-1 flex items-center rounded
        ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}
        ${enabled ? 'border border-transparent hover:border-slate-300 dark:hover:border-slate-600 cursor-text' : ''}
        ${displayClassName || ''}`}
      title={enabled ? 'Duplo clique ou F2 para editar' : undefined}
    >
      <span className="truncate">{displayValue}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BOMForm — Componente principal
// ═════════════════════════════════════════════════════════════════════════════

export const BOMForm = forwardRef<BOMFormHandle, BOMFormProps>(
  function BOMForm({ mode, codigoPai, onDirty, onSave, tabId }, ref) {

    const isEditing = mode === 'edit' || mode === 'new';

    // ── Stores ────────────────────────────────────────────────────────────────
    const bomFlat = useBOMStore((s) => s.bomFlat);
    const fetchBomFlat = useBOMStore((s) => s.fetchBomFlat);
    const createBomItem = useBOMStore((s) => s.createBomItem);
    const updateBomItem = useBOMStore((s) => s.updateBomItem);
    const deleteBomItem = useBOMStore((s) => s.deleteBomItem);
    const produtos = useProdutosStore((s) => s.produtos);

    // ── Estado de edição em lote ──────────────────────────────────────────────
    const editState = useBomEditState();

    // ── Célula em edição (qual input está ativo) ──────────────────────────────
    const [activeCellId, setActiveCellId] = useState<string | null>(null);

    // ── Linha selecionada (pra tecla Delete e F2) ─────────────────────────────
    const [selectedItem, setSelectedItem] = useState<BomTreeItemNum | null>(null);

    // ── Tree expand/collapse ──────────────────────────────────────────────────
    const [expandedKeys, setExpandedKeys] = useTabState<string[]>(tabId + '-tree-exp', []);

    // ── Ref do container pra capturar teclas ──────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Carregar dados iniciais ───────────────────────────────────────────────
    useEffect(() => {
      if (bomFlat.length === 0) fetchBomFlat();
    }, [bomFlat.length, fetchBomFlat]);

    // ── Expandir nó pai na montagem ───────────────────────────────────────────
    const didExpandRef = useRef(false);
    useEffect(() => {
      if (codigoPai && !didExpandRef.current) {
        didExpandRef.current = true;
        setExpandedKeys((prev) => prev.includes(codigoPai) ? prev : [...prev, codigoPai]);
      }
    }, [codigoPai, setExpandedKeys]);

    // ── Notificar dirty ao pai quando há pendências ───────────────────────────
    useEffect(() => {
      if (editState.hasPendingChanges) onDirty();
    }, [editState.hasPendingChanges, onDirty]);

    // ── Keyboard: Delete (toggle exclusão) e F2 (ativar edição) ───────────────
    useEffect(() => {
      if (!isEditing) return;
      const el = containerRef.current;
      if (!el) return;

      const onKey = (e: KeyboardEvent) => {
        // Ignorar se um input está ativo
        if (activeCellId) return;

        // Delete — toggle marcar/desmarcar exclusão na linha selecionada
        if (e.key === 'Delete' && selectedItem && selectedItem.nivel > 1) {
          e.preventDefault();
          if (selectedItem.id < 0) {
            // Linha nova — remove direto
            editState.removeAddedItem(selectedItem.id);
          } else {
            // Linha existente — toggle delete
            editState.toggleDelete(selectedItem.id);
          }
        }

        // F2 — ativar edição de QTDE na linha selecionada
        if (e.key === 'F2' && selectedItem && selectedItem.nivel > 1) {
          e.preventDefault();
          const status = editState.getRowStatus(selectedItem);
          if (status !== 'deleted') {
            setActiveCellId(`qtde-${selectedItem.id}`);
          }
        }
      };

      el.addEventListener('keydown', onKey);
      return () => el.removeEventListener('keydown', onKey);
    }, [isEditing, activeCellId, selectedItem, editState]);

    // ── Submit (salvar em lote) ───────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (!editState.hasPendingChanges) {
          await onSave();
          return true;
        }

        const ops = editState.getPendingOperations();

        try {
          // 1. Deletes
          for (const id of ops.deletes) {
            await deleteBomItem(id);
          }

          // 2. Updates (alterações de quantidade e/ou posição)
          for (const change of ops.changes) {
            const original = bomFlat.find((b) => b.id === change.bomItemId);
            if (original) {
              await updateBomItem(change.bomItemId, {
                produtoPaiId: original.produtoPaiId,
                produtoFilhoId: original.produtoFilhoId,
                quantidade: change.quantidadeNova,
                posicao: change.posicaoNova,
              });
            }
          }

          // 3. Creates (linhas novas)
          for (const add of ops.adds) {
            await createBomItem({
              produtoPaiId: add.produtoPaiId,
              produtoFilhoId: add.produtoFilhoId,
              quantidade: add.quantidade,
              posicao: add.posicao,
            });
          }

          editState.resetPending();
          await fetchBomFlat();
          await onSave();
          return true;
        } catch (err: any) {
          toast.error(err?.body?.erro || err?.message || 'Erro ao salvar estrutura');
          return false;
        }
      },
    }));

    // ── Produto pai ───────────────────────────────────────────────────────────
    const produtoPai = produtos.find((p) => p.codigo === codigoPai);
    const paiId = produtoPai?.id;

    // ── Construir tree com _rowNum (inclui linhas novas) ──────────────────────

    const treeData = useMemo((): BomTreeItemNum[] => {
      if (!paiId) return [];
      const idsPai = new Set(bomFlat.map((r) => r.produtoPaiId));

      function getFilhos(parentId: number, nivel: number): BomTreeItemNum[] {
        // Filhos do banco
        const filhosBanco = bomFlat
          .filter((r) => r.produtoPaiId === parentId)
          .map((r) => {
            const node: BomTreeItemNum = {
              id: r.id, codigo: r.produtoFilhoCodigo || '', descricao: r.produtoFilhoDescricao || '',
              unidade: r.produtoFilhoUnidade || 'UN', tipo: r.produtoFilhoTipo || '',
              quantidade: r.quantidade, posicao: r.posicao, nivel,
              temDocumento: r.produtoFilhoTemDocumento || false,
              hasChildren: idsPai.has(r.produtoFilhoId),
              children: [], _rowNum: 0,
            };
            if (node.hasChildren) node.children = getFilhos(r.produtoFilhoId, nivel + 1);
            return node;
          });

        // Linhas novas (pendingAdds) pra este pai
        const filhosNovos = editState.pendingAdds
          .filter((a) => a.produtoPaiId === parentId)
          .map((a) => {
            const node: BomTreeItemNum = {
              id: a.tempId, codigo: a.codigo, descricao: a.descricao,
              unidade: a.unidade, tipo: '', quantidade: a.quantidade,
              posicao: a.posicao, nivel,
              temDocumento: a.temDocumento,
              hasChildren: false, children: [], _rowNum: 0,
            };
            return node;
          });

        return [...filhosBanco, ...filhosNovos];
      }

      const root: BomTreeItemNum = {
        id: -1, codigo: codigoPai, descricao: produtoPai?.descricao || '',
        unidade: produtoPai?.unidade || 'UN', tipo: produtoPai?.tipo || '',
        quantidade: 0, posicao: 0, nivel: 1,
        temDocumento: produtoPai?.temDocumento || false,
        hasChildren: true, children: getFilhos(paiId, 2), _rowNum: 0,
      };

      // Numerar sequencialmente (tree inteira)
      let seq = 0;
      function renumber(nodes: BomTreeItemNum[]) {
        for (const n of nodes) { seq++; n._rowNum = seq; if (n.children.length > 0) renumber(n.children); }
      }
      renumber([root]);

      return [root];
    }, [bomFlat, paiId, codigoPai, produtoPai, editState.pendingAdds]);

    // ── allNodes: tree inteira flat (pra prop data) ───────────────────────────

    const allNodes = useMemo(() => {
      const nodes: BomTreeItemNum[] = [];
      function walk(items: BomTreeItemNum[]) {
        for (const item of items) { nodes.push(item); if (item.children.length > 0) walk(item.children); }
      }
      walk(treeData);
      return nodes;
    }, [treeData]);

    // ── Expand set + handlers ─────────────────────────────────────────────────

    const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);

    const isNodeExpanded = useCallback((node: BomTreeItemNum) => expandedSet.has(node.codigo), [expandedSet]);

    const handleToggle = useCallback((node: BomTreeItemNum) => {
      setExpandedKeys((prev) =>
        prev.includes(node.codigo)
          ? prev.filter((k) => k !== node.codigo)
          : [...prev, node.codigo]
      );
    }, [setExpandedKeys]);

    // ── Handlers de edição ────────────────────────────────────────────────────

    /** Confirma alteração de QTDE (linha existente ou nova) */
    const handleQtdeConfirm = useCallback((item: BomTreeItemNum, rawValue: string) => {
      const parsed = parseFloat(rawValue.replace(',', '.'));
      if (isNaN(parsed) || parsed < 0) return; // Inválido — ignora

      if (item.id < 0) {
        editState.changeAddedQuantidade(item.id, parsed);
      } else {
        const original = bomFlat.find((b) => b.id === item.id);
        if (original) {
          editState.changeQuantidade(item.id, original.quantidade, parsed, original.posicao);
        }
      }
    }, [bomFlat, editState]);

    /** Confirma alteração de POS (linha existente ou nova) */
    const handlePosConfirm = useCallback((item: BomTreeItemNum, rawValue: string) => {
      const parsed = parseInt(rawValue, 10);
      if (isNaN(parsed) || parsed < 0) return; // Inválido — ignora

      if (item.id < 0) {
        editState.changeAddedPosicao(item.id, parsed);
      } else {
        const original = bomFlat.find((b) => b.id === item.id);
        if (original) {
          editState.changePosicao(item.id, original.posicao, parsed, original.quantidade);
        }
      }
    }, [bomFlat, editState]);

    // ── Valores efetivos (considera pendingChanges) ───────────────────────────

    const getEffectiveQtde = useCallback((item: BomTreeItemNum): number => {
      if (item.id < 0) return item.quantidade;
      const change = editState.pendingChanges.get(item.id);
      return change ? change.quantidadeNova : item.quantidade;
    }, [editState.pendingChanges]);

    const getEffectivePos = useCallback((item: BomTreeItemNum): number => {
      if (item.id < 0) return item.posicao;
      const change = editState.pendingChanges.get(item.id);
      return change ? change.posicaoNova : item.posicao;
    }, [editState.pendingChanges]);

    // ── rowClassName — visual por status de edição ────────────────────────────

    const rowClassName = useCallback((item: BomTreeItemNum) => {
      if (!isEditing) return '';
      return getStatusBgClasses(editState.getRowStatus(item));
    }, [isEditing, editState]);

    // ── onSelect — rastreia linha selecionada pra tecla Delete/F2 ─────────────

    const handleSelect = useCallback((item: BomTreeItemNum | null) => {
      setSelectedItem(item);
    }, []);

    // ── Colunas ───────────────────────────────────────────────────────────────

    const columns: GridColumn<BomTreeItemNum>[] = useMemo(() => [
      {
        key: '_rowNum', header: '#', width: 45, minWidth: 40,
        contentAlign: 'center', sortable: false, filterType: false as const,
        render: (item) => <span className="text-slate-400 text-xs">{item._rowNum}</span>,
      },
      {
        key: 'nivel', header: 'NÍVEL', width: 60, minWidth: 50,
        contentAlign: 'center', sortable: false,
        render: (item) => <span className="font-bold text-slate-800 dark:text-slate-200">{item.nivel}</span>,
      },
      {
        key: 'posicao', header: 'POS.', width: 70, minWidth: 55,
        contentAlign: 'center', sortable: false,
        render: (item) => {
          if (item.nivel === 1) return <span className="text-slate-600">-</span>;
          const status = editState.getRowStatus(item);
          const effectivePos = getEffectivePos(item);

          if (isEditing && status !== 'deleted') {
            return (
              <EditableCell
                cellId={`pos-${item.id}`}
                activeCellId={activeCellId}
                onActivate={setActiveCellId}
                displayValue={formatPos(effectivePos)}
                editValue={String(effectivePos)}
                onConfirm={(raw) => handlePosConfirm(item, raw)}
                enabled
                align="center"
                displayClassName="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums"
              />
            );
          }
          return (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {formatPos(effectivePos)}
            </span>
          );
        },
      },
      {
        key: 'quantidade', header: 'QTDE', width: 110, minWidth: 80,
        contentAlign: 'right', sortable: false, filterType: 'number',
        render: (item) => {
          if (item.nivel === 1) return <span className="text-slate-600">-</span>;
          const status = editState.getRowStatus(item);
          const effectiveQtde = getEffectiveQtde(item);

          if (isEditing && status !== 'deleted') {
            return (
              <EditableCell
                cellId={`qtde-${item.id}`}
                activeCellId={activeCellId}
                onActivate={setActiveCellId}
                displayValue={formatQtde(effectiveQtde)}
                editValue={String(effectiveQtde)}
                onConfirm={(raw) => handleQtdeConfirm(item, raw)}
                enabled
                align="right"
                displayClassName="font-bold text-emerald-700 dark:text-emerald-400"
              />
            );
          }
          return (
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {formatQtde(effectiveQtde)}
            </span>
          );
        },
      },
      {
        key: 'codigo', header: 'CÓDIGO', width: 260, minWidth: 150, sortable: false,
        render: (item) => {
          const isDeleted = isEditing && editState.getRowStatus(item) === 'deleted';
          return (
            <span className={`font-mono
              ${item.nivel === 1 ? 'font-semibold text-blue-900 dark:text-blue-300' : 'text-blue-900 dark:text-blue-300'}
              ${isDeleted ? 'line-through decoration-red-400 dark:decoration-red-500 decoration-2' : ''}`}>
              {item.codigo}
            </span>
          );
        },
      },
      {
        key: 'descricao', header: 'DESCRIÇÃO', width: 500, minWidth: 200, sortable: false,
        render: (item) => {
          const isDeleted = isEditing && editState.getRowStatus(item) === 'deleted';
          return (
            <span className={`font-semibold uppercase text-slate-800 dark:text-slate-200
              ${isDeleted ? 'line-through decoration-red-300 dark:decoration-red-600 decoration-1' : ''}`}>
              {item.descricao}
            </span>
          );
        },
      },
      {
        key: 'unidade', header: 'UN', width: 70, minWidth: 55,
        contentAlign: 'center', sortable: false,
        render: (item) => <span className="text-slate-600">{item.unidade}</span>,
      },
      {
        key: 'temDocumento', header: 'DOC.', width: 90, minWidth: 80,
        contentAlign: 'center', sortable: false,
        render: (item) => <TreeDocButtons item={item} />,
      },
    ], [isEditing, editState, activeCellId, getEffectiveQtde, getEffectivePos, handleQtdeConfirm, handlePosConfirm]);

    // ── Render ────────────────────────────────────────────────────────────────

    if (!codigoPai) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nenhum produto selecionado
        </div>
      );
    }

    return (
      <div ref={containerRef} className="h-full flex flex-col overflow-hidden">
        <DataGridTree<BomTreeItemNum>
          tabId={tabId + '-bomtree'}
          storageId="bom-tree"
          columns={columns}
          data={allNodes}
          rootNodes={treeData}
          getChildren={(node) => node.children || []}
          getKey={(node) => `${node._rowNum}-${node.codigo}`}
          getLevel={(node) => node.nivel}
          hasChildren={(node) => node.hasChildren}
          isExpanded={isNodeExpanded}
          onToggle={handleToggle}
          codeColumnKey="codigo"
          indentPx={16}
          emptyTitle="Estrutura vazia"
          emptyDescription="Adicione itens à estrutura"
          rowClassName={rowClassName}
          onSelect={handleSelect}
          footerExtra={isEditing ? (
            <span className="flex items-center gap-3 ml-auto text-[11px]">
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">F2</kbd> ou duplo clique editar</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Del</kbd> marcar exclusão</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Enter</kbd> confirma · <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Esc</kbd> cancela</span>
            </span>
          ) : undefined}
        />
      </div>
    );
  }
);
