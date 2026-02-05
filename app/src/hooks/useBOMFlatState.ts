/**
 * useBOMFlatState
 * Hook com toda lógica do BOMFlatView (filtros, sort, resize, teclado)
 */

import { useState, useEffect, useMemo } from 'react';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { mockProdutos } from '@/data/cadastros/mockProdutos';

export type SortField = 'descPai' | 'codigoPai' | 'qtde' | 'codigoFilho' | 'descFilho' | 'unidade' | null;
export type SortOrder = 'asc' | 'desc';

export interface Filters {
  codigoPaiExpressao: string;
  codigoPaiContem: string;
  codigoPaiComeca: string;
  codigoPaiNaoComeca: string;
  codigoPaiTermina: string;
  codigoPaiNaoTermina: string;
  codigoPaiNaoContem: string;
  descPaiExpressao: string;
  descPaiContem: string;
  descPaiComeca: string;
  descPaiNaoComeca: string;
  descPaiTermina: string;
  descPaiNaoTermina: string;
  descPaiNaoContem: string;
  qtdeMin: string;
  qtdeMax: string;
  codigoFilhoExpressao: string;
  codigoFilhoContem: string;
  codigoFilhoComeca: string;
  codigoFilhoNaoComeca: string;
  codigoFilhoTermina: string;
  codigoFilhoNaoTermina: string;
  codigoFilhoNaoContem: string;
  descFilhoExpressao: string;
  descFilhoContem: string;
  descFilhoComeca: string;
  descFilhoNaoComeca: string;
  descFilhoTermina: string;
  descFilhoNaoTermina: string;
  descFilhoNaoContem: string;
  unidade: string;
  somenteComDesenho: boolean;
  somenteSemDesenho: boolean;
}

export interface ColumnWidths {
  descPai: number;
  codigoPai: number;
  qtde: number;
  codigoFilho: number;
  descFilho: number;
  unidade: number;
  desenho: number;
}

export const DEFAULT_WIDTHS: ColumnWidths = {
  descPai: 420,
  codigoPai: 260,
  qtde: 120,
  codigoFilho: 260,
  descFilho: 420,
  unidade: 90,
  desenho: 70,
};

const initialFilters: Filters = {
  codigoPaiExpressao: '',
  codigoPaiContem: '',
  codigoPaiComeca: '',
  codigoPaiNaoComeca: '',
  codigoPaiTermina: '',
  codigoPaiNaoTermina: '',
  codigoPaiNaoContem: '',
  descPaiExpressao: '',
  descPaiContem: '',
  descPaiComeca: '',
  descPaiNaoComeca: '',
  descPaiTermina: '',
  descPaiNaoTermina: '',
  descPaiNaoContem: '',
  qtdeMin: '',
  qtdeMax: '',
  codigoFilhoExpressao: '',
  codigoFilhoContem: '',
  codigoFilhoComeca: '',
  codigoFilhoNaoComeca: '',
  codigoFilhoTermina: '',
  codigoFilhoNaoTermina: '',
  codigoFilhoNaoContem: '',
  descFilhoExpressao: '',
  descFilhoContem: '',
  descFilhoComeca: '',
  descFilhoNaoComeca: '',
  descFilhoTermina: '',
  descFilhoNaoTermina: '',
  descFilhoNaoContem: '',
  unidade: '',
  somenteComDesenho: false,
  somenteSemDesenho: false,
};

function matchExpressao(valor: string, expressao: string): boolean {
  if (!expressao) return true;
  const regex = new RegExp('^' + expressao.replace(/\*/g, '.*') + '$', 'i');
  return regex.test(valor);
}

function matchText(
  value: string,
  expressao: string,
  contem: string,
  comeca: string,
  naoComeca: string,
  termina: string,
  naoTermina: string,
  naoContem: string
) {
  const v = (value || '').toUpperCase();
  if (expressao && !matchExpressao(value, expressao)) return false;
  if (naoContem && v.includes(naoContem.toUpperCase().trim())) return false;
  if (contem && !v.includes(contem.toUpperCase().trim())) return false;
  if (comeca && !v.startsWith(comeca.toUpperCase().trim())) return false;
  if (naoComeca && v.startsWith(naoComeca.toUpperCase().trim())) return false;
  if (termina && !v.endsWith(termina.toUpperCase().trim())) return false;
  if (naoTermina && v.endsWith(naoTermina.toUpperCase().trim())) return false;
  return true;
}

interface UseBOMFlatStateProps {
  clearFiltersFlag: number;
  onOpenPai?: (codigoPai: string) => void;
  selectedPai?: string;
}

export function useBOMFlatState({ clearFiltersFlag, onOpenPai, selectedPai }: UseBOMFlatStateProps) {
  const relacoes = useBOMStore((s) => s.relacoes);

  const [colWidths, setColWidths] = useState<ColumnWidths>(() => {
    const saved = localStorage.getItem('bom-flat-column-widths');
    return saved ? JSON.parse(saved) : DEFAULT_WIDTHS;
  });

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resizing, setResizing] = useState<{
    column: keyof ColumnWidths;
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('bom-flat-column-widths', JSON.stringify(colWidths));
  }, [colWidths]);

  useEffect(() => {
    setFilters(initialFilters);
    setSelectedIndex(0);
  }, [clearFiltersFlag]);

  const handleMouseDown = (column: keyof ColumnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ column, startX: e.clientX, startWidth: colWidths[column] });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(50, resizing.startWidth + diff);
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

  const rows = useMemo(() => {
    const lookup = new Map(mockProdutos.map((p) => [p.codigo, p]));
    const base = relacoes.map((r) => {
      const pai = lookup.get(r.codigo_pai);
      const filho = lookup.get(r.codigo_filho);
      return {
        codigoPai: r.codigo_pai,
        descPai: pai?.descricaoCurta || pai?.descricaoCompleta || r.codigo_pai,
        codigoFilho: r.codigo_filho,
        descFilho: filho?.descricaoCurta || filho?.descricaoCompleta || r.codigo_filho,
        qtde: r.quantidade,
        ordem: r.ordem,
        unidade: filho?.unidade || 'UN',
        possuiDesenho: !!filho?.possuiDesenho,
      };
    });

    const filtered = base.filter((x) => {
      if (
        !matchText(
          x.codigoPai,
          filters.codigoPaiExpressao,
          filters.codigoPaiContem,
          filters.codigoPaiComeca,
          filters.codigoPaiNaoComeca,
          filters.codigoPaiTermina,
          filters.codigoPaiNaoTermina,
          filters.codigoPaiNaoContem
        )
      ) return false;

      if (
        !matchText(
          x.descPai,
          filters.descPaiExpressao,
          filters.descPaiContem,
          filters.descPaiComeca,
          filters.descPaiNaoComeca,
          filters.descPaiTermina,
          filters.descPaiNaoTermina,
          filters.descPaiNaoContem
        )
      ) return false;

      if (
        !matchText(
          x.codigoFilho,
          filters.codigoFilhoExpressao,
          filters.codigoFilhoContem,
          filters.codigoFilhoComeca,
          filters.codigoFilhoNaoComeca,
          filters.codigoFilhoTermina,
          filters.codigoFilhoNaoTermina,
          filters.codigoFilhoNaoContem
        )
      ) return false;

      if (
        !matchText(
          x.descFilho,
          filters.descFilhoExpressao,
          filters.descFilhoContem,
          filters.descFilhoComeca,
          filters.descFilhoNaoComeca,
          filters.descFilhoTermina,
          filters.descFilhoNaoTermina,
          filters.descFilhoNaoContem
        )
      ) return false;

      if (filters.unidade && (x.unidade || '').toUpperCase() !== filters.unidade.toUpperCase().trim()) return false;

      const min = filters.qtdeMin ? Number(String(filters.qtdeMin).replace(',', '.')) : null;
      const max = filters.qtdeMax ? Number(String(filters.qtdeMax).replace(',', '.')) : null;
      if (min != null && !Number.isNaN(min) && x.qtde < min) return false;
      if (max != null && !Number.isNaN(max) && x.qtde > max) return false;

      if (filters.somenteComDesenho && !x.possuiDesenho) return false;
      if (filters.somenteSemDesenho && x.possuiDesenho) return false;

      return true;
    });

    if (!sortField) return filtered;

    const sorted = [...filtered].sort((a: any, b: any) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), 'pt-BR');
    });

    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [relacoes, filters, sortField, sortOrder]);

  useEffect(() => {
    if (!selectedPai) return;
    const idx = rows.findIndex((r) => r.codigoPai === selectedPai);
    if (idx >= 0) setSelectedIndex(idx);
  }, [selectedPai, rows]);

  useEffect(() => {
    if (!rows.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((i) => Math.max(0, Math.min(i, rows.length - 1)));
  }, [rows.length]);

  const openSelected = () => {
    if (!onOpenPai || !rows.length) return;
    const codigoPai = rows[selectedIndex]?.codigoPai;
    if (codigoPai) onOpenPai(codigoPai);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const typing =
        ae?.tagName === 'INPUT' || ae?.tagName === 'TEXTAREA' || ae?.getAttribute('contenteditable') === 'true';

      if (e.key === 'Enter') {
        if (!rows.length) return;
        e.preventDefault();
        openSelected();
        return;
      }

      if (typing) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(rows.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [rows, selectedIndex, onOpenPai]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0);

  return {
    colWidths,
    filters,
    setFilters,
    sortField,
    sortOrder,
    selectedIndex,
    rows,
    handleMouseDown,
    handleSort,
    openSelected,
    totalWidth,
  };
}
