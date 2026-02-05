/**
 * BOMTreeView - COMPLETO COM RESIZE
 * Mostra estrutura de 1 pai com todas funcionalidades do Flat
 */

import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useBOMStore, buildTreeBOM } from '@/stores/engenharia/bomStore';
import { mockProdutos } from '@/data/cadastros/mockProdutos';
import { BOMTreeNode } from './BOMTreeNode';

interface BOMTreeViewProps {
  expandedProducts: string[];
  expandedItems: Record<string, string[]>;
  onToggleProduct: (codigo: string) => void;
  onToggleItem: (produtoPai: string, codigoItem: string) => void;
  clearFiltersFlag: number;
  codigoPaiFocus?: string;
}

interface ColumnWidths {
  nivel: number;
  ordem: number;
  qtde: number;
  codigo: number;
  descricao: number;
  unidade: number;
  desenho: number;
}

const DEFAULT_WIDTHS: ColumnWidths = {
  nivel: 60,
  ordem: 60,
  qtde: 100,
  codigo: 260,
  descricao: 500,
  unidade: 70,
  desenho: 60,
};

function getProdutoInfo(codigo: string) {
  const produto = mockProdutos.find((p) => p.codigo === codigo);
  return {
    descricao: produto?.descricaoCurta || codigo,
    unidade: produto?.unidade || 'UN',
  };
}

export function BOMTreeView({
  expandedProducts,
  expandedItems,
  onToggleProduct,
  onToggleItem,
  clearFiltersFlag,
  codigoPaiFocus,
}: BOMTreeViewProps) {
  const relacoes = useBOMStore((s) => s.relacoes);

  const [colWidths, setColWidths] = useState<ColumnWidths>(() => {
    const saved = localStorage.getItem('bom-tree-column-widths');
    return saved ? JSON.parse(saved) : DEFAULT_WIDTHS;
  });

  const [resizing, setResizing] = useState<{
    column: keyof ColumnWidths;
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('bom-tree-column-widths', JSON.stringify(colWidths));
  }, [colWidths]);

  const handleMouseDown = (column: keyof ColumnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ column, startX: e.clientX, startWidth: colWidths[column] });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(40, resizing.startWidth + diff);
      setColWidths((prev) => ({ ...prev, [resizing.column]: newWidth }));
    };

    const handleMouseUp = () => setResizing(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const codigoPai = codigoPaiFocus || '';

  const treeData = useMemo(() => {
    if (!codigoPai) return [];
    return buildTreeBOM(relacoes, codigoPai);
  }, [relacoes, codigoPai]);

  const isExpandedProduct = expandedProducts.includes(codigoPai);
  const expandedItemsArray = expandedItems[codigoPai] || [];

  let globalRowIndex = 0;
  const produtoInfo = getProdutoInfo(codigoPai);

  if (!codigoPai) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        Nenhum pai selecionado
      </div>
    );
  }

  const totalWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden font-mono text-[12px]">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: `${totalWidth}px` }}>
          <thead className="sticky top-0 z-10 bg-slate-600 text-[11px] font-semibold uppercase text-white">
            <tr>
              <th style={{ width: `${colWidths.nivel}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Nível</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('nivel', e)} />
              </th>

              <th style={{ width: `${colWidths.ordem}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Ordem</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('ordem', e)} />
              </th>

              <th style={{ width: `${colWidths.qtde}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Qtde</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('qtde', e)} />
              </th>

              <th style={{ width: `${colWidths.codigo}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Código</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('codigo', e)} />
              </th>

              <th style={{ width: `${colWidths.descricao}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Descrição</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('descricao', e)} />
              </th>

              <th style={{ width: `${colWidths.unidade}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-r border-slate-300 px-2 py-2">
                <span>Unid.</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('unidade', e)} />
              </th>

              <th style={{ width: `${colWidths.desenho}px` }} className="relative h-8.5 overflow-hidden whitespace-nowrap border-b-2 border-slate-300 px-2 py-2">
                <span>Des.</span>
                <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-slate-400" onMouseDown={(e) => handleMouseDown('desenho', e)} />
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              className={`cursor-pointer hover:bg-slate-300 ${globalRowIndex % 2 === 0 ? 'bg-slate-100' : 'bg-white'}`}
              onClick={() => onToggleProduct(codigoPai)}
            >
              <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-800">1</td>
              <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center text-slate-600">-</td>
              <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center text-slate-600">-</td>

              <td className="border-b border-r border-slate-200 px-2 py-1.5">
                <div className="flex items-center gap-1">
                  {isExpandedProduct ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}
                  <span className="font-semibold text-blue-900">{codigoPai}</span>
                </div>
              </td>

              <td className="truncate border-b border-r border-slate-200 px-2 py-1.5 font-semibold uppercase text-slate-800">{produtoInfo.descricao}</td>
              <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center text-slate-600">{produtoInfo.unidade}</td>
              <td className="border-b border-slate-200 px-2 py-1.5 text-center text-slate-400">-</td>
            </tr>

            {isExpandedProduct &&
              treeData.map((item) => {
                const itemRowIndex = globalRowIndex++;
                return (
                  <BOMTreeNode
                    key={item.codigo}
                    item={item}
                    depth={0}
                    produtoPai={codigoPai}
                    expandedItems={expandedItemsArray}
                    onToggleItem={onToggleItem}
                    rowIndex={itemRowIndex}
                    getNextRowIndex={() => globalRowIndex++}
                    onDoubleClick={(c) => alert(`Abrir: ${c}`)}
                  />
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
