/**
 * BOMForm.tsx - Form inline de estrutura de produto (BOM)
 *
 * === Identidade por instância ===
 * _treePath: caminho único "-1/5/12" pra expand independente
 * _produtoId: ID do produto real pra handleAddChildOf sem buscas
 *
 * === Edição em lote ===
 * QTDE/POS: duplo clique ou F2
 * Exclusão: Delete ou lixeira (toggle)
 * Adicionar: "+" no hover (qualquer nível)
 * Trocar código: duplo clique em added (preserva QTDE)
 * Anti-ciclo: global via bomFlat + toast + ⚠️
 * Erro backend: flash vermelho 3s
 * Estrutura vazia: aviso antes de salvar
 */

import { useEffect, useImperativeHandle, useMemo, useCallback, forwardRef, useRef, useState } from 'react';
import { FolderOpen, FileText, Plus, Trash2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BOMFormHandle { submit: () => Promise<boolean>; addItem: () => void; }

interface BOMFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  codigoPai: string;
  onDirty: (dirty: boolean) => void;
  onSave: () => Promise<void>;
  tabId: string;
}

interface BomTreeItemNum extends BomTreeItem {
  _rowNum: number;
  children: BomTreeItemNum[];
  _bomItemId: number;
  _treePath: string;
  _produtoId: number;
}

interface NewRowState {
  tempId: number;
  parentProductId: number;
  parentTreePath: string;
  posicao: number;
  confirmed: boolean;
  initialCode?: string;
  preservedQtde?: number;
  reopenOriginal?: { produtoFilhoId: number; codigo: string; descricao: string; unidade: string; temDocumento: boolean; };
}

interface ZeroQtdeInfo { addedIds: number[]; changedIds: number[]; codigos: string[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatQtde(q: number): string { return q.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }); }
function formatPos(p: number): string { return String(p).padStart(4, '0'); }
function calcProximaPosicao(m: number): number { return (Math.floor(m / 10) + 1) * 10; }

function getStatusRowClasses(status: BomRowStatus): string {
  switch (status) {
    case 'added': return 'bg-emerald-50 dark:bg-emerald-950/30';
    case 'changed': return 'bg-amber-50 dark:bg-amber-950/30';
    case 'deleted': return 'bg-red-50 dark:bg-red-950/30 line-through decoration-red-800/50 dark:decoration-red-400/50 decoration-2';
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
  return (
    <div className="flex items-center justify-center gap-0.5">
      <Tooltip><TooltipTrigger asChild><button type="button" onClick={async (e) => { e.stopPropagation(); try { await abrirPasta(produto.id); } catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro'); } }} className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"><FolderOpen className="h-3.5 w-3.5" /></button></TooltipTrigger><TooltipContent><p>Abrir pasta</p></TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><button type="button" onClick={async (e) => { e.stopPropagation(); try { await abrirDocumento(produto.id, 'pdf'); } catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro'); } }} className="inline-flex items-center justify-center h-6 w-6 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"><FileText className="h-3.5 w-3.5" /></button></TooltipTrigger><TooltipContent><p>Abrir documento</p></TooltipContent></Tooltip>
    </div>
  );
}

// ─── EditableCell ─────────────────────────────────────────────────────────────

interface EditableCellProps { displayValue: string; editValue: string; onConfirm: (v: string) => void; enabled: boolean; displayClassName?: string; align?: 'left' | 'center' | 'right'; cellId: string; activeCellId: string | null; onActivate: (id: string | null) => void; }

function EditableCell({ displayValue, editValue, onConfirm, enabled, displayClassName, align = 'right', cellId, activeCellId, onActivate }: EditableCellProps) {
  const ref = useRef<HTMLInputElement>(null);
  const isActive = activeCellId === cellId;
  useEffect(() => { if (isActive && ref.current) { ref.current.value = editValue; ref.current.focus(); ref.current.select(); } }, [isActive, editValue]);
  const confirm = useCallback(() => { onConfirm(ref.current?.value || ''); onActivate(null); }, [onConfirm, onActivate]);
  if (isActive) return <input ref={ref} type="text" onBlur={confirm} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); confirm(); } if (e.key === 'Escape') { e.stopPropagation(); onActivate(null); } }} onClick={(e) => e.stopPropagation()} className={`w-full h-6 px-1 text-sm bg-white dark:bg-slate-950 border border-blue-400 dark:border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} />;
  return <div onDoubleClick={(e) => { e.stopPropagation(); if (enabled) onActivate(cellId); }} className={`w-full h-6 px-1 flex items-center rounded ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'} ${enabled ? 'border border-transparent hover:border-slate-300 dark:hover:border-slate-600 cursor-text' : ''} ${displayClassName || ''}`} title={enabled ? 'Duplo clique ou F2 para editar' : undefined}><span className="truncate">{displayValue}</span></div>;
}

// ─── BomCodeAutocomplete ──────────────────────────────────────────────────────

interface BomCodeAutocompleteProps {
  onConfirm: (produtoId: number, codigo: string, descricao: string, unidade: string, temDocumento: boolean) => void;
  onCancel: () => void; excludeProductIds: Set<number>; circularIds: Set<number>;
  onDescriptionChange?: (descricao: string, isCircular: boolean) => void;
  initialValue?: string;
}

function BomCodeAutocomplete({ onConfirm, onCancel, excludeProductIds, circularIds, onDescriptionChange, initialValue = '' }: BomCodeAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const skipRef = useRef(false);
  const [, setCodigo] = useState(initialValue);
  const produtos = useProdutosStore((s) => s.produtos);

  useEffect(() => { setTimeout(() => { if (inputRef.current) { inputRef.current.value = initialValue; inputRef.current.focus(); if (initialValue) inputRef.current.select(); } }, 50); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialValue && onDescriptionChange) { const m = produtos.find((p) => p.codigo.toLowerCase() === initialValue.toLowerCase()); if (m) onDescriptionChange(m.descricao, circularIds.has(m.id) || excludeProductIds.has(m.id)); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setCodigo(val);
    if (skipRef.current) { skipRef.current = false; onDescriptionChange?.('', false); return; }
    if (val.length > 0 && inputRef.current) {
      const allMatch = produtos.find((p) => p.codigo.toLowerCase().startsWith(val.toLowerCase()));
      if (allMatch) { inputRef.current.value = allMatch.codigo; inputRef.current.setSelectionRange(val.length, allMatch.codigo.length); setCodigo(allMatch.codigo); onDescriptionChange?.(allMatch.descricao, circularIds.has(allMatch.id) || excludeProductIds.has(allMatch.id)); }
      else { onDescriptionChange?.('', false); }
    } else { onDescriptionChange?.('', false); }
  }, [produtos, circularIds, excludeProductIds, onDescriptionChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Backspace' || e.key === 'Delete') { skipRef.current = true; return; }
    if (e.key === 'Tab' || e.key === 'Enter') {
      const v = (inputRef.current?.value || '').trim().toLowerCase(); if (!v) return;
      const m = produtos.find((p) => p.codigo.toLowerCase() === v);
      if (!m) return;
      if (circularIds.has(m.id)) { e.preventDefault(); toast.error(`Referência circular: ${m.codigo} já é pai desta estrutura.`); return; }
      if (excludeProductIds.has(m.id)) { e.preventDefault(); toast.error(`${m.codigo} já existe nesta estrutura ou causaria conflito.`); return; }
      e.preventDefault(); onConfirm(m.id, m.codigo, m.descricao, m.unidade, m.temDocumento);
    }
    if (e.key === 'Escape') onCancel();
  }, [produtos, excludeProductIds, circularIds, onConfirm, onCancel]);

  return (
    <div className="relative flex items-center w-full">
      <input ref={inputRef} type="text" placeholder="Código..." onChange={handleChange} onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()} autoComplete="off"
        className="w-full h-6 px-1 pr-6 text-sm font-mono bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-500 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-blue-900 dark:text-blue-300" />
      <button type="button" onClick={(e) => { e.stopPropagation(); onCancel(); }}
        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"><span className="text-xs">✕</span></button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BOMForm
// ═════════════════════════════════════════════════════════════════════════════

export const BOMForm = forwardRef<BOMFormHandle, BOMFormProps>(
  function BOMForm({ mode, codigoPai, onDirty, onSave, tabId }, ref) {
    const isEditing = mode === 'edit' || mode === 'new';

    const bomFlat = useBOMStore((s) => s.bomFlat);
    const fetchBomFlat = useBOMStore((s) => s.fetchBomFlat);
    const createBomItem = useBOMStore((s) => s.createBomItem);
    const updateBomItem = useBOMStore((s) => s.updateBomItem);
    const deleteBomItem = useBOMStore((s) => s.deleteBomItem);
    const produtos = useProdutosStore((s) => s.produtos);
    const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);

    const editState = useBomEditState();
    const [activeCellId, setActiveCellId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<BomTreeItemNum | null>(null);
    const [newRow, setNewRow] = useState<NewRowState | null>(null);
    const newRowRef = useRef<NewRowState | null>(null);
    newRowRef.current = newRow;
    const [autocompleteDesc, setAutocompleteDesc] = useState('');
    const [autocompleteIsCircular, setAutocompleteIsCircular] = useState(false);
    const [zeroQtdeDialog, setZeroQtdeDialog] = useState<ZeroQtdeInfo | null>(null);
    const [emptyStructureDialog, setEmptyStructureDialog] = useState(false);
    const [errorItemIds, setErrorItemIds] = useState<Set<number>>(new Set());
    const saveResolveRef = useRef<((r: boolean) => void) | null>(null);
    const [expandedKeys, setExpandedKeys] = useTabState<string[]>(tabId + '-tree-exp', []);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (bomFlat.length === 0) fetchBomFlat(); if (produtos.length === 0) fetchProdutos(); }, [bomFlat.length, fetchBomFlat, produtos.length, fetchProdutos]);
    const didExpandRef = useRef(false);
    useEffect(() => { if (codigoPai && !didExpandRef.current) { didExpandRef.current = true; setExpandedKeys((p) => p.includes(codigoPai) ? p : [...p, codigoPai]); } }, [codigoPai, setExpandedKeys]);
    useEffect(() => { onDirty(editState.hasPendingChanges); }, [editState.hasPendingChanges, onDirty]);
    const prevModeRef = useRef(mode);
    useEffect(() => { if ((prevModeRef.current === 'edit' || prevModeRef.current === 'new') && mode === 'view') { editState.resetPending(); setNewRow(null); newRowRef.current = null; setActiveCellId(null); } prevModeRef.current = mode; }, [mode, editState]);

    const produtoPai = produtos.find((p) => p.codigo === codigoPai);
    const paiId = produtoPai?.id;

    // ── Anti-ciclo global ─────────────────────────────────────────────────────

    const getAncestorIds = useCallback((produtoId: number): Set<number> => {
      const a = new Set<number>();
      function walk(id: number) { bomFlat.filter((b) => b.produtoFilhoId === id).forEach((p) => { if (!a.has(p.produtoPaiId)) { a.add(p.produtoPaiId); walk(p.produtoPaiId); } }); }
      walk(produtoId); return a;
    }, [bomFlat]);

    const getExcludeAndCircularIds = useCallback((parentProductId: number) => {
      const exclude = new Set<number>(); const circular = new Set<number>();
      bomFlat.filter((b) => b.produtoPaiId === parentProductId).forEach((b) => exclude.add(b.produtoFilhoId));
      editState.pendingAdds.filter((a) => a.produtoPaiId === parentProductId && a.produtoFilhoId > 0).forEach((a) => exclude.add(a.produtoFilhoId));
      exclude.add(parentProductId);
      getAncestorIds(parentProductId).forEach((id) => { exclude.add(id); circular.add(id); });
      return { exclude, circular };
    }, [bomFlat, editState.pendingAdds, getAncestorIds]);

    const newRowIds = useMemo(() => {
      if (!newRow) return { exclude: new Set<number>(), circular: new Set<number>() };
      return getExcludeAndCircularIds(newRow.parentProductId);
    }, [newRow, getExcludeAndCircularIds]);

    // ── Keyboard ──────────────────────────────────────────────────────────────

    useEffect(() => {
      if (!isEditing) return;
      const el = containerRef.current; if (!el) return;
      const onKey = (e: KeyboardEvent) => {
        if (activeCellId || newRowRef.current) return;
        if (e.key === 'Delete' && selectedItem && selectedItem.nivel > 1) {
          e.preventDefault();
          if (selectedItem.id <= -100) editState.removeAddedItem(selectedItem.id);
          else editState.toggleDelete(selectedItem.id);
        }
        if (e.key === 'F2' && selectedItem && selectedItem.nivel > 1) {
          e.preventDefault();
          if (editState.getRowStatus(selectedItem) !== 'deleted') setActiveCellId(`qtde-${selectedItem.id}`);
        }
      };
      el.addEventListener('keydown', onKey); return () => el.removeEventListener('keydown', onKey);
    }, [isEditing, activeCellId, selectedItem, editState]);

    // ── Adicionar item ────────────────────────────────────────────────────────

    const doAddItem = useCallback((parentProductId: number, _parentCodigo: string, parentTreePath: string) => {
      const irm = bomFlat.filter((b) => b.produtoPaiId === parentProductId);
      const irmA = editState.pendingAdds.filter((a) => a.produtoPaiId === parentProductId);
      const maior = Math.max(...irm.map((b) => b.posicao), ...irmA.map((a) => a.posicao), 0);
      const pos = calcProximaPosicao(maior);
      const tempId = editState.addItem({ produtoPaiId: parentProductId, produtoFilhoId: 0, codigo: '', descricao: '', unidade: '', quantidade: 0, posicao: pos, temDocumento: false });
      if (!expandedKeys.includes(parentTreePath)) setExpandedKeys((p) => [...p, parentTreePath]);
      setNewRow({ tempId, parentProductId, parentTreePath, posicao: pos, confirmed: false });
      setAutocompleteDesc(''); setAutocompleteIsCircular(false);
    }, [bomFlat, editState, expandedKeys, setExpandedKeys]);

    const canAdd = useCallback(() => {
      const nr = newRowRef.current;
      if (!nr) return true;
      if (nr.confirmed) { setNewRow(null); newRowRef.current = null; setActiveCellId(null); return true; }
      return false;
    }, []);

    const handleAddItem = useCallback(() => {
      if (!paiId || !canAdd()) return;
      doAddItem(paiId, codigoPai, '-1');
    }, [paiId, codigoPai, doAddItem, canAdd]);

    const handleAddChildOf = useCallback((item: BomTreeItemNum) => {
      if (!paiId || !canAdd()) return;
      if (item._produtoId > 0) doAddItem(item._produtoId, item.codigo, item._treePath);
    }, [paiId, doAddItem, canAdd]);

    const handleToggleDelete = useCallback((item: BomTreeItemNum) => {
      if (item.nivel <= 1) return;
      if (item.id <= -100) editState.removeAddedItem(item.id);
      else editState.toggleDelete(item.id);
    }, [editState]);

    const handleReopenAutocomplete = useCallback((item: BomTreeItemNum) => {
      if (!isEditing || item.id > -100) return;
      const added = editState.pendingAdds.find((a) => a.tempId === item.id);
      if (!added || added.produtoFilhoId <= 0) return;
      const { produtoPaiId, posicao, quantidade, codigo: oldCodigo } = added;
      const reopenOriginal = { produtoFilhoId: added.produtoFilhoId, codigo: added.codigo, descricao: added.descricao, unidade: added.unidade, temDocumento: added.temDocumento };
      editState.removeAddedItem(item.id);
      const tempId = editState.addItem({ produtoPaiId, produtoFilhoId: 0, codigo: '', descricao: '', unidade: '', quantidade, posicao, temDocumento: false });
      const pathParts = item._treePath.split('/'); pathParts.pop();
      const parentTreePath = pathParts.join('/') || '-1';
      setNewRow({ tempId, parentProductId: produtoPaiId, parentTreePath, posicao, confirmed: false, initialCode: oldCodigo, preservedQtde: quantidade, reopenOriginal });
      setAutocompleteDesc(''); setAutocompleteIsCircular(false);
    }, [isEditing, editState]);

    // ── Autocomplete ──────────────────────────────────────────────────────────

    const handleAutocompleteConfirm = useCallback((produtoId: number, codigo: string, descricao: string, unidade: string, temDocumento: boolean) => {
      const nr = newRowRef.current; if (!nr) return;
      const qtde = nr.preservedQtde ?? 0;
      editState.removeAddedItem(nr.tempId);
      const newTempId = editState.addItem({ produtoPaiId: nr.parentProductId, produtoFilhoId: produtoId, codigo, descricao, unidade, quantidade: qtde, posicao: nr.posicao, temDocumento });
      const updated = { ...nr, tempId: newTempId, confirmed: true, initialCode: undefined, preservedQtde: undefined, reopenOriginal: undefined };
      setNewRow(updated); newRowRef.current = updated;
      setAutocompleteDesc(''); setAutocompleteIsCircular(false);
      if (!qtde) setTimeout(() => setActiveCellId(`qtde-${newTempId}`), 100);
    }, [editState]);

    const handleAutocompleteCancel = useCallback(() => {
      const nr = newRowRef.current; if (!nr) return;
      if (nr.reopenOriginal) {
        editState.removeAddedItem(nr.tempId);
        const restoredTempId = editState.addItem({ produtoPaiId: nr.parentProductId, produtoFilhoId: nr.reopenOriginal.produtoFilhoId, codigo: nr.reopenOriginal.codigo, descricao: nr.reopenOriginal.descricao, unidade: nr.reopenOriginal.unidade, quantidade: nr.preservedQtde ?? 0, posicao: nr.posicao, temDocumento: nr.reopenOriginal.temDocumento });
        const restored = { ...nr, tempId: restoredTempId, confirmed: true, reopenOriginal: undefined, initialCode: undefined, preservedQtde: undefined };
        setNewRow(restored); newRowRef.current = restored;
      } else {
        editState.removeAddedItem(nr.tempId); setNewRow(null); newRowRef.current = null;
      }
      setAutocompleteDesc(''); setAutocompleteIsCircular(false);
    }, [editState]);

    useEffect(() => { if (newRow?.confirmed && activeCellId === null) { setNewRow(null); newRowRef.current = null; } }, [newRow, activeCellId]);

    // ── Salvar ────────────────────────────────────────────────────────────────

    const doSave = useCallback(async (ignoreAddIds: number[] = [], ignoreChangeIds: number[] = []): Promise<boolean> => {
      const ops = editState.getPendingOperations();
      const igA = new Set(ignoreAddIds); const igC = new Set(ignoreChangeIds);
      const failedIds = new Set<number>();
      try {
        for (const id of ops.deletes) await deleteBomItem(id);
        for (const c of ops.changes) { if (igC.has(c.bomItemId)) continue; const o = bomFlat.find((b) => b.id === c.bomItemId); if (o) await updateBomItem(c.bomItemId, { produtoPaiId: o.produtoPaiId, produtoFilhoId: o.produtoFilhoId, quantidade: c.quantidadeNova, posicao: c.posicaoNova }); }
        for (const a of ops.adds) {
          if (igA.has(a.tempId)) continue;
          if (a.produtoFilhoId > 0) {
            try { await createBomItem({ produtoPaiId: a.produtoPaiId, produtoFilhoId: a.produtoFilhoId, quantidade: a.quantidade, posicao: a.posicao }); }
            catch (itemErr: any) {
              const msg = itemErr?.body?.erro || itemErr?.message || '';
              if (msg.toLowerCase().includes('circular') || msg.toLowerCase().includes('ciclo')) { failedIds.add(a.tempId); toast.error(`Referência circular: ${a.codigo} rejeitado pelo servidor.`); }
              else throw itemErr;
            }
          }
        }
        if (failedIds.size > 0) { setErrorItemIds(failedIds); setTimeout(() => setErrorItemIds(new Set()), 3000); return false; }
        editState.resetPending(); setNewRow(null); newRowRef.current = null;
        await fetchBomFlat(); await onSave(); return true;
      } catch (err: any) { toast.error(err?.body?.erro || err?.message || 'Erro ao salvar'); return false; }
    }, [editState, bomFlat, deleteBomItem, updateBomItem, createBomItem, fetchBomFlat, onSave]);

    // ── Dialog QTDE 0 ─────────────────────────────────────────────────────────

    const handleZeroRemoveAndSave = useCallback(async () => {
      if (!zeroQtdeDialog) return; setZeroQtdeDialog(null);
      const ops = editState.getPendingOperations();
      const rem = ops.adds.filter((a) => a.produtoFilhoId > 0 && !zeroQtdeDialog.addedIds.includes(a.tempId));
      const remC = ops.changes.filter((c) => !zeroQtdeDialog.changedIds.includes(c.bomItemId));
      if (rem.length === 0 && remC.length === 0 && ops.deletes.length === 0) {
        editState.resetPending(); setNewRow(null); newRowRef.current = null; await onSave();
        if (saveResolveRef.current) { saveResolveRef.current(true); saveResolveRef.current = null; } return;
      }
      const r = await doSave(zeroQtdeDialog.addedIds, zeroQtdeDialog.changedIds);
      if (saveResolveRef.current) { saveResolveRef.current(r); saveResolveRef.current = null; }
    }, [zeroQtdeDialog, editState, doSave, onSave]);

    const handleZeroCancel = useCallback(() => { setZeroQtdeDialog(null); if (saveResolveRef.current) { saveResolveRef.current(false); saveResolveRef.current = null; } }, []);

    // ── Dialog estrutura vazia ────────────────────────────────────────────────

    const handleEmptyStructureConfirm = useCallback(async () => {
      setEmptyStructureDialog(false);
      const result = await doSave();
      if (saveResolveRef.current) { saveResolveRef.current(result); saveResolveRef.current = null; }
    }, [doSave]);

    const handleEmptyStructureCancel = useCallback(() => {
      setEmptyStructureDialog(false);
      if (saveResolveRef.current) { saveResolveRef.current(false); saveResolveRef.current = null; }
    }, []);

    // ── Submit ────────────────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const nr = newRowRef.current;
        if (nr && !nr.confirmed) { editState.removeAddedItem(nr.tempId); setNewRow(null); newRowRef.current = null; }
        if (!editState.hasPendingChanges) { await onSave(); return true; }
        const ops = editState.getPendingOperations();

        // Validação QTDE 0
        const az = ops.adds.filter((a) => a.produtoFilhoId > 0 && a.quantidade === 0);
        const cz = ops.changes.filter((c) => c.quantidadeNova === 0);
        if (az.length > 0 || cz.length > 0) {
          const codigos: string[] = []; az.forEach((a) => codigos.push(a.codigo));
          cz.forEach((c) => { const i = bomFlat.find((b) => b.id === c.bomItemId); if (i) codigos.push(i.produtoFilhoCodigo || `ID ${c.bomItemId}`); });
          return new Promise<boolean>((resolve) => { saveResolveRef.current = resolve; setZeroQtdeDialog({ addedIds: az.map((a) => a.tempId), changedIds: cz.map((c) => c.bomItemId), codigos }); });
        }

        // Verificação estrutura vazia
        const filhosBanco = bomFlat.filter((b) => b.produtoPaiId === paiId);
        const addsConfirmados = ops.adds.filter((a) => a.produtoFilhoId > 0);
        const filhosRestantes = filhosBanco.length - ops.deletes.length + addsConfirmados.length;
        if (filhosRestantes <= 0) {
          return new Promise<boolean>((resolve) => { saveResolveRef.current = resolve; setEmptyStructureDialog(true); });
        }

        return await doSave();
      },
      addItem: handleAddItem,
    }));

    // ── Tree ──────────────────────────────────────────────────────────────────

    const treeData = useMemo((): BomTreeItemNum[] => {
      if (!paiId) return [];
      const idsPai = new Set(bomFlat.map((r) => r.produtoPaiId));
      editState.pendingAdds.forEach((a) => idsPai.add(a.produtoPaiId));
      const getEffPos = (id: number, p: number) => { const c = editState.pendingChanges.get(id); return c ? c.posicaoNova : p; };

      function getFilhos(parentProductId: number, _parentBomItemId: number, parentPath: string, nivel: number, visitedIds: Set<number> = new Set()): BomTreeItemNum[] {
        if (visitedIds.has(parentProductId)) return [];
        const pathVisited = new Set(visitedIds); pathVisited.add(parentProductId);

        const banco = bomFlat.filter((r) => r.produtoPaiId === parentProductId).map((r): BomTreeItemNum => {
          const path = `${parentPath}/${r.id}`;
          return { id: r.id, codigo: r.produtoFilhoCodigo || '', descricao: r.produtoFilhoDescricao || '', unidade: r.produtoFilhoUnidade || 'UN', tipo: r.produtoFilhoTipo || '', quantidade: r.quantidade, posicao: r.posicao, nivel, temDocumento: r.produtoFilhoTemDocumento || false, hasChildren: idsPai.has(r.produtoFilhoId), children: [], _rowNum: 0, _bomItemId: r.id, _treePath: path, _produtoId: r.produtoFilhoId };
        });
        banco.forEach((n) => { if (n.hasChildren) n.children = getFilhos(bomFlat.find((b) => b.id === n.id)!.produtoFilhoId, n.id, n._treePath, nivel + 1, pathVisited); });

        const novos = editState.pendingAdds
          .filter((a) => a.produtoPaiId === parentProductId)
          .filter((a) => { if (newRowRef.current && a.tempId === newRowRef.current.tempId) return parentPath === newRowRef.current.parentTreePath; return true; })
          .map((a): BomTreeItemNum => {
            const path = `${parentPath}/${a.tempId}`;
            const hasKids = a.produtoFilhoId > 0 && idsPai.has(a.produtoFilhoId);
            const node: BomTreeItemNum = { id: a.tempId, codigo: a.codigo || '(novo)', descricao: a.descricao, unidade: a.unidade, tipo: '', quantidade: a.quantidade, posicao: a.posicao, nivel, temDocumento: a.temDocumento, hasChildren: hasKids, children: [], _rowNum: 0, _bomItemId: a.tempId, _treePath: path, _produtoId: a.produtoFilhoId };
            if (hasKids) node.children = getFilhos(a.produtoFilhoId, a.tempId, path, nivel + 1, pathVisited);
            return node;
          });

        const todos = [...banco, ...novos];
        todos.sort((a, b) => { const pA = a.id > 0 ? getEffPos(a.id, a.posicao) : a.posicao; const pB = b.id > 0 ? getEffPos(b.id, b.posicao) : b.posicao; return pA !== pB ? pA - pB : (a.codigo || '').localeCompare(b.codigo || '', 'pt-BR'); });
        return todos;
      }

      const root: BomTreeItemNum = { id: -1, codigo: codigoPai, descricao: produtoPai?.descricao || '', unidade: produtoPai?.unidade || 'UN', tipo: produtoPai?.tipo || '', quantidade: 0, posicao: 0, nivel: 1, temDocumento: produtoPai?.temDocumento || false, hasChildren: true, children: getFilhos(paiId, -1, '-1', 2), _rowNum: 0, _bomItemId: -1, _treePath: '-1', _produtoId: paiId };
      let seq = 0;
      (function rn(ns: BomTreeItemNum[]) { for (const n of ns) { seq++; n._rowNum = seq; if (n.children.length > 0) rn(n.children); } })([root]);
      return [root];
    }, [bomFlat, paiId, codigoPai, produtoPai, editState.pendingAdds, editState.pendingChanges, newRow]);

    const allNodes = useMemo(() => { const n: BomTreeItemNum[] = []; (function w(is: BomTreeItemNum[]) { for (const i of is) { n.push(i); if (i.children.length > 0) w(i.children); } })(treeData); return n; }, [treeData]);

    const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);
    const isNodeExpanded = useCallback((n: BomTreeItemNum) => expandedSet.has(n._treePath), [expandedSet]);
    const handleToggle = useCallback((n: BomTreeItemNum) => { setExpandedKeys((p) => p.includes(n._treePath) ? p.filter((k) => k !== n._treePath) : [...p, n._treePath]); }, [setExpandedKeys]);

    useEffect(() => { if (codigoPai && !expandedKeys.includes('-1')) setExpandedKeys((p) => [...p, '-1']); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleQtdeConfirm = useCallback((item: BomTreeItemNum, raw: string) => { const v = parseFloat(raw.replace(',', '.')); if (isNaN(v) || v < 0) return; if (item.id <= -100) editState.changeAddedQuantidade(item.id, v); else { const o = bomFlat.find((b) => b.id === item.id); if (o) editState.changeQuantidade(item.id, o.quantidade, v, o.posicao); } }, [bomFlat, editState]);
    const handlePosConfirm = useCallback((item: BomTreeItemNum, raw: string) => { const v = parseInt(raw, 10); if (isNaN(v) || v < 0) return; if (item.id <= -100) editState.changeAddedPosicao(item.id, v); else { const o = bomFlat.find((b) => b.id === item.id); if (o) editState.changePosicao(item.id, o.posicao, v, o.quantidade); } }, [bomFlat, editState]);
    const getEffQtde = useCallback((i: BomTreeItemNum): number => { if (i.id <= -100) return i.quantidade; const c = editState.pendingChanges.get(i.id); return c ? c.quantidadeNova : i.quantidade; }, [editState.pendingChanges]);
    const getEffPos = useCallback((i: BomTreeItemNum): number => { if (i.id <= -100) return i.posicao; const c = editState.pendingChanges.get(i.id); return c ? c.posicaoNova : i.posicao; }, [editState.pendingChanges]);

    const rowClassName = useCallback((i: BomTreeItemNum) => {
      if (!isEditing) return '';
      if (errorItemIds.has(i.id)) return 'bg-red-200 dark:bg-red-900/50 animate-pulse';
      return getStatusRowClasses(editState.getRowStatus(i));
    }, [isEditing, editState, errorItemIds]);

    const handleSelect = useCallback((i: BomTreeItemNum | null) => { setSelectedItem(i); }, []);
    const pendingCount = useMemo(() => editState.pendingAdds.filter((a) => a.produtoFilhoId > 0).length + editState.pendingChanges.size + editState.pendingDeletes.size, [editState.pendingAdds, editState.pendingChanges, editState.pendingDeletes]);

    // ── Colunas ───────────────────────────────────────────────────────────────

    const columns: GridColumn<BomTreeItemNum>[] = useMemo(() => [
      { key: '_rowNum', header: '#', width: 45, minWidth: 40, contentAlign: 'center', sortable: false, filterType: false as const, render: (i) => <span className="text-slate-400 text-xs">{i._rowNum}</span> },
      { key: 'nivel', header: 'NÍVEL', width: 60, minWidth: 50, contentAlign: 'center', sortable: false, render: (i) => <span className="font-bold text-slate-800 dark:text-slate-200">{i.nivel}</span> },
      {
        key: 'posicao', header: 'POS.', width: 70, minWidth: 55, contentAlign: 'center', sortable: false,
        render: (item) => { if (item.nivel === 1) return <span className="text-slate-600">-</span>; const st = editState.getRowStatus(item); const ep = getEffPos(item); if (isEditing && st !== 'deleted') return <EditableCell cellId={`pos-${item.id}`} activeCellId={activeCellId} onActivate={setActiveCellId} displayValue={formatPos(ep)} editValue={String(ep)} onConfirm={(r) => handlePosConfirm(item, r)} enabled align="center" displayClassName="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums" />; return <div className="w-full h-6 px-1 flex items-center justify-center rounded"><span className="truncate text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">{formatPos(ep)}</span></div>; }
      },
      {
        key: 'quantidade', header: 'QTDE', width: 110, minWidth: 80, contentAlign: 'right', sortable: false, filterType: 'number',
        render: (item) => { if (item.nivel === 1) return <span className="text-slate-600">-</span>; const st = editState.getRowStatus(item); const eq = getEffQtde(item); if (isEditing && st !== 'deleted') return <EditableCell cellId={`qtde-${item.id}`} activeCellId={activeCellId} onActivate={setActiveCellId} displayValue={formatQtde(eq)} editValue={String(eq)} onConfirm={(r) => handleQtdeConfirm(item, r)} enabled align="right" displayClassName="font-bold text-emerald-700 dark:text-emerald-400" />; return <div className="w-full h-6 px-1 flex items-center justify-end rounded"><span className="truncate font-bold text-emerald-700 dark:text-emerald-400">{formatQtde(eq)}</span></div>; }
      },
      {
        key: 'codigo', header: 'CÓDIGO', width: 300, minWidth: 180, sortable: false,
        render: (item) => {
          if (newRow && item.id === newRow.tempId && !newRow.confirmed) return <BomCodeAutocomplete onConfirm={handleAutocompleteConfirm} onCancel={handleAutocompleteCancel} excludeProductIds={newRowIds.exclude} circularIds={newRowIds.circular} onDescriptionChange={(d, c) => { setAutocompleteDesc(d); setAutocompleteIsCircular(c); }} initialValue={newRow.initialCode} />;
          const status = editState.getRowStatus(item); const isDel = status === 'deleted'; const isAdd = status === 'added';
          return (
            <div className="flex items-center gap-0.5 w-full">
              {isEditing && item.nivel > 1 && !(newRow && item.id === newRow.tempId) && (isDel
                ? <Tooltip><TooltipTrigger asChild><button type="button" onClick={(e) => { e.stopPropagation(); handleToggleDelete(item); }} className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded transition-colors text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"><Undo2 className="h-3 w-3" /></button></TooltipTrigger><TooltipContent><p>Desfazer exclusão de {item.codigo}</p></TooltipContent></Tooltip>
                : <Tooltip><TooltipTrigger asChild><button type="button" onClick={(e) => { e.stopPropagation(); handleToggleDelete(item); }} className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded transition-colors text-red-400 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 className="h-3 w-3" /></button></TooltipTrigger><TooltipContent><p>{isAdd ? `Remover ${item.codigo}` : `Marcar exclusão de ${item.codigo}`}</p></TooltipContent></Tooltip>
              )}
              <span onDoubleClick={(e) => { if (isEditing && isAdd && item.id <= -100) { e.stopPropagation(); handleReopenAutocomplete(item); } }}
                className={`font-mono truncate flex-1 ${item.nivel === 1 ? 'font-semibold text-blue-900 dark:text-blue-300' : 'text-blue-900 dark:text-blue-300'} ${isEditing && isAdd && item.id <= -100 ? 'cursor-pointer' : ''}`}
                title={isEditing && isAdd && item.id <= -100 ? 'Duplo clique para trocar produto' : undefined}>{item.codigo}</span>
              {isEditing && !isDel && !(newRow && item.id === newRow.tempId) && item._produtoId > 0 && (
                <Tooltip><TooltipTrigger asChild><button type="button" onClick={(e) => { e.stopPropagation(); handleAddChildOf(item); }} className="shrink-0 inline-flex items-center justify-center h-5 w-5 rounded transition-colors text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 opacity-0 group-hover:opacity-100 cursor-pointer"><Plus className="h-3 w-3" /></button></TooltipTrigger><TooltipContent><p>Adicionar filho em {item.codigo}</p></TooltipContent></Tooltip>
              )}
            </div>);
        }
      },
      {
        key: 'descricao', header: 'DESCRIÇÃO', width: 500, minWidth: 200, sortable: false,
        render: (item) => {
          if (newRow && item.id === newRow.tempId && !newRow.confirmed) {
            if (autocompleteDesc) {
              return autocompleteIsCircular
                ? <span className="font-semibold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1"><span className="text-base">⚠</span> {autocompleteDesc}</span>
                : <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{autocompleteDesc}</span>;
            }
            return <span className="text-muted-foreground italic text-xs">descrição atualiza ao digitar</span>;
          }
          return <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{item.descricao}</span>;
        }
      },
      { key: 'unidade', header: 'UN', width: 70, minWidth: 55, contentAlign: 'center', sortable: false, render: (i) => <span className="text-slate-600">{i.unidade}</span> },
      { key: 'temDocumento', header: 'DOC.', width: 90, minWidth: 80, contentAlign: 'center', sortable: false, render: (i) => <TreeDocButtons item={i} /> },
    ], [isEditing, editState, activeCellId, newRow, newRowIds, autocompleteDesc, autocompleteIsCircular, getEffQtde, getEffPos, handleQtdeConfirm, handlePosConfirm, handleAutocompleteConfirm, handleAutocompleteCancel, handleAddChildOf, handleToggleDelete, handleReopenAutocomplete]);

    if (!codigoPai) return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Nenhum produto selecionado</div>;

    return (
      <div ref={containerRef} className="h-full flex flex-col overflow-hidden">
        <DataGridTree<BomTreeItemNum>
          tabId={tabId + '-bomtree'} storageId="bom-tree" columns={columns} data={allNodes} rootNodes={treeData}
          getChildren={(n) => n.children || []} getKey={(n) => n._treePath}
          getLevel={(n) => n.nivel} hasChildren={(n) => n.hasChildren}
          isExpanded={isNodeExpanded} onToggle={handleToggle}
          codeColumnKey="codigo" indentPx={16}
          emptyTitle="Estrutura vazia" emptyDescription="Adicione itens à estrutura"
          rowClassName={rowClassName} onSelect={handleSelect}
          footerExtra={isEditing ? (
            <span className="flex items-center gap-3 ml-auto text-[11px]">
              {pendingCount > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium">{pendingCount} {pendingCount === 1 ? 'alteração' : 'alterações'}</span>}
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">F2</kbd> ou duplo clique editar</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Del</kbd> marcar exclusão</span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Enter</kbd> confirma · <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Esc</kbd> cancela</span>
            </span>
          ) : undefined}
        />

        {/* Dialog QTDE 0 */}
        <AlertDialog open={!!zeroQtdeDialog}><AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Itens com quantidade zero</AlertDialogTitle><AlertDialogDescription>Os seguintes itens estão com quantidade 0,000:</AlertDialogDescription></AlertDialogHeader>
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">{zeroQtdeDialog?.codigos.map((c, i) => <p key={i} className="font-mono text-sm font-semibold">{c}</p>)}</div>
          <AlertDialogDescription>Deseja remover esses itens e continuar salvando, ou voltar para corrigir as quantidades?</AlertDialogDescription>
          <AlertDialogFooter><AlertDialogCancel onClick={handleZeroCancel}>Voltar e corrigir</AlertDialogCancel><AlertDialogAction onClick={handleZeroRemoveAndSave} className="bg-red-600 text-white hover:bg-red-700">Remover e salvar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent></AlertDialog>

        {/* Dialog estrutura vazia */}
        <AlertDialog open={emptyStructureDialog}>
          <AlertDialogContent>

            <AlertDialogHeader>
              <AlertDialogTitle>Estrutura ficará vazia</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os itens de <span className="font-mono font-semibold">{codigoPai}</span> serão removidos.
                Você poderá adicionar novos itens em seguida. Se sair sem adicionar, a estrutura deixará de existir.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogDescription className="text-destructive font-medium">
              ⚠️ Esta ação não pode ser desfeita.
            </AlertDialogDescription>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleEmptyStructureCancel}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleEmptyStructureConfirm}>Continuar</AlertDialogAction>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>

      </div>
    );
  }
);
