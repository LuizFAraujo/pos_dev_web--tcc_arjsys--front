/**
 * BOMForm.tsx — Form inline de estrutura de produto (BOM)
 *
 * Usa DataGridTree. Coluna # com numeração fixa.
 * sortable: false em todas. Filtros mantidos.
 * Flatten é feito aqui (não no DataGridTree) pra garantir reatividade ao expand.
 */

import { useEffect, useImperativeHandle, useMemo, useCallback, forwardRef, useRef } from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useTabState } from '@/hooks/useTabState';
import { DataGridTree } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import type { PageMode } from '@/components/shared/PageShell';
import type { BomTreeItem } from '@/types/engenharia/bom.types';

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

function formatQtde(q: number) {
  return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

interface BomTreeItemNum extends BomTreeItem {
  _rowNum: number;
  children: BomTreeItemNum[];
}

// ── Doc buttons ───────────────────────────────────────────────────────────────

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

// ── Componente ────────────────────────────────────────────────────────────────

export const BOMForm = forwardRef<BOMFormHandle, BOMFormProps>(
  function BOMForm({ mode: _mode, codigoPai, onDirty: _onDirty, onSave, tabId }, ref) {

    const bomFlat = useBOMStore((s) => s.bomFlat);
    const fetchBomFlat = useBOMStore((s) => s.fetchBomFlat);
    const produtos = useProdutosStore((s) => s.produtos);

    const [expandedKeys, setExpandedKeys] = useTabState<string[]>(tabId + '-tree-exp', []);

    useEffect(() => {
      if (bomFlat.length === 0) fetchBomFlat();
    }, [bomFlat.length, fetchBomFlat]);



    // useEffect(() => {
    //   if (codigoPai) {
    //     setExpandedKeys((prev) => prev.includes(codigoPai) ? prev : [...prev, codigoPai]);
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [codigoPai]);

    const didExpandRef = useRef(false);

    useEffect(() => {
      if (codigoPai && !didExpandRef.current) {
        didExpandRef.current = true;
        setExpandedKeys((prev) => prev.includes(codigoPai) ? prev : [...prev, codigoPai]);
      }
    }, [codigoPai, setExpandedKeys]);


    useImperativeHandle(ref, () => ({
      submit: async () => { await onSave(); return true; },
    }));

    const produtoPai = produtos.find((p) => p.codigo === codigoPai);
    const paiId = produtoPai?.id;

    // ── Construir tree com _rowNum ────────────────────────────────────────────

    const treeData = useMemo((): BomTreeItemNum[] => {
      if (!paiId) return [];
      const idsPai = new Set(bomFlat.map((r) => r.produtoPaiId));

      function getFilhos(parentId: number, nivel: number): BomTreeItemNum[] {
        return bomFlat
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
    }, [bomFlat, paiId, codigoPai, produtoPai]);

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
        key: 'posicao', header: 'POS.', width: 60, minWidth: 50,
        contentAlign: 'center', sortable: false,
        render: (item) => <span className="text-slate-600">{item.nivel === 1 ? '-' : item.posicao}</span>,
      },
      {
        key: 'quantidade', header: 'QTDE', width: 100, minWidth: 70,
        contentAlign: 'right', sortable: false, filterType: 'number',
        render: (item) => item.nivel === 1
          ? <span className="text-slate-600">-</span>
          : <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatQtde(item.quantidade)}</span>,
      },
      {
        key: 'codigo', header: 'CÓDIGO', width: 260, minWidth: 150, sortable: false,
        render: (item) => (
          <span className={`font-mono ${item.nivel === 1 ? 'font-semibold text-blue-900 dark:text-blue-300' : 'text-blue-900 dark:text-blue-300'}`}>
            {item.codigo}
          </span>
        ),
      },
      {
        key: 'descricao', header: 'DESCRIÇÃO', width: 500, minWidth: 200, sortable: false,
        render: (item) => (
          <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{item.descricao}</span>
        ),
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
    ], []);

    if (!codigoPai) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nenhum produto selecionado
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col overflow-hidden">
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
        />
      </div>
    );
  }
);
