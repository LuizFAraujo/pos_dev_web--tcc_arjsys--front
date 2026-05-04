/**
 * usePageMode.ts - Hook para páginas de cadastro com modos list/view/new/edit
 *
 * Lock de edição:
 *   - editLock: Map<lockKey, tabId> - só uma aba pode editar um item por vez
 *   - Visualização nunca é bloqueada
 *   - Lock usa tabType como prefixo (comum entre abas do mesmo tipo)
 *
 * TODO: Lock robusto (view + edição, cross-window) será implementado via backend
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTabState } from '@/hooks/useTabState';
import { useTabsStore } from '@/stores/tabsStore';
import type { PageMode, PageModeState } from './types';

// ─── Lock global ──────────────────────────────────────────────────────────────

/** Lock exclusivo de edição: lockKey → tabId */
const editLock = new Map<string, string>();

function acquireEdit(lockKey: string, tabId: string): boolean {
  const current = editLock.get(lockKey);
  if (current && current !== tabId) return false;
  editLock.set(lockKey, tabId);
  return true;
}

function releaseEdit(lockKey: string, tabId: string) {
  if (editLock.get(lockKey) === tabId) editLock.delete(lockKey);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePageMode<T>(
  tabId: string,
  getItemId?: (item: T) => string | number,
  /** Tipo da aba (ex: 'adm-clientes') - prefixo do lock entre abas do mesmo tipo */
  tabType?: string,
): PageModeState<T> {
  const [mode, setMode] = useTabState<PageMode>(tabId + '-mode', 'list');
  const [editingItem, setEditingItem] = useTabState<T | null>(tabId + '-editing-item', null);

  const [previousMode, setPreviousMode] = useState<PageMode>('list');
  const [isDirty, setIsDirtyState] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const lockPrefix = tabType || tabId;

  // Ref pro cleanup acessar valor atual
  const editingItemRef = useRef(editingItem);
  editingItemRef.current = editingItem;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [tabId]);

  // Re-registra lock ao montar (componente remonta ao trocar de aba no workspace)
  // Usa refs pra acessar valores atuais, não os do primeiro render
  useEffect(() => {
    const item = editingItemRef.current;
    const currentMode = modeRef.current;
    if (item && getItemId && currentMode === 'edit') {
      const lockKey = `${lockPrefix}-${getItemId(item)}`;
      acquireEdit(lockKey, tabId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup ao desmontar - libera lock só se a aba foi realmente fechada
  // (trocar de aba ativa desmonta/remonta, mas a aba continua existindo no store)
  useEffect(() => {
    const tid = tabId;
    const prefix = lockPrefix;
    return () => {
      // Delay mínimo pra dar tempo do tabsStore atualizar após closeTab
      setTimeout(() => {
        const tabExists = useTabsStore.getState().tabs.some((t) => t.id === tid);
        if (!tabExists) {
          // Aba foi realmente fechada - libera lock
          const item = editingItemRef.current;
          if (item && getItemId) {
            const lockKey = `${prefix}-${getItemId(item)}`;
            releaseEdit(lockKey, tid);
          }
        }
      }, 50);
    };
  }, [tabId, lockPrefix, getItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDirty = useCallback((dirty: boolean) => setIsDirtyState(dirty), []);

  // ─── Helper ───────────────────────────────────────────────────────────────

  const getLockKey = useCallback((item: T): string | null => {
    if (!getItemId) return null;
    return `${lockPrefix}-${getItemId(item)}`;
  }, [getItemId, lockPrefix]);

  // ─── Transições ──────────────────────────────────────────────────────────────

  const goTo = useCallback((next: PageMode, from: PageMode, item: T | null = null) => {
    setPreviousMode(from);
    setMode(next);
    setEditingItem(item);
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [setMode, setEditingItem]);

  const openNew = useCallback(() => goTo('new', mode, null), [goTo, mode]);

  const openView = useCallback((item: T) => {
    goTo('view', mode, item);
  }, [goTo, mode]);

  const openEdit = useCallback((item: T) => {
    const lockKey = getLockKey(item);
    if (lockKey && !acquireEdit(lockKey, tabId)) throw new Error('ITEM_LOCKED');
    goTo('edit', mode, item);
  }, [getLockKey, tabId, goTo, mode]);

  const startEdit = useCallback(() => {
    if (!editingItem) return;
    const lockKey = getLockKey(editingItem);
    if (lockKey && !acquireEdit(lockKey, tabId)) throw new Error('ITEM_LOCKED');
    setPreviousMode(mode);
    setMode('edit');
    setIsDirtyState(false);
  }, [editingItem, getLockKey, tabId, mode, setMode]);

  // ─── Saída ───────────────────────────────────────────────────────────────────

  const backToPrevious = useCallback(() => {
    if (editingItem && getItemId) {
      const lockKey = `${lockPrefix}-${getItemId(editingItem)}`;
      if (previousMode === 'list') {
        // Voltando pra lista: limpa lock
        releaseEdit(lockKey, tabId);
      } else {
        // Voltando pra view (vindo de edit): libera lock de edição
        releaseEdit(lockKey, tabId);
      }
    }

    setMode(previousMode);

    if (previousMode === 'list') {
      setEditingItem(null);
    } else {
      setPreviousMode('list');
    }

    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [previousMode, editingItem, getItemId, lockPrefix, tabId, setMode, setEditingItem]);

  const requestBack = useCallback(() => {
    if (!isDirty) { backToPrevious(); return; }
    setConfirmOpen(true);
  }, [isDirty, backToPrevious]);

  const confirmDiscard = useCallback(() => backToPrevious(), [backToPrevious]);
  const cancelDiscard  = useCallback(() => setConfirmOpen(false), []);

  const saveAndBack = useCallback(async (onSave: () => Promise<void>) => {
    const wasNew = mode === 'new';
    await onSave();
    if (editingItem && getItemId) {
      const lockKey = `${lockPrefix}-${getItemId(editingItem)}`;
      releaseEdit(lockKey, tabId);
    }
    setMode('list');
    setEditingItem(null);
    setPreviousMode('list');
    setIsDirtyState(false);
    setConfirmOpen(false);
    toast.success(wasNew ? 'Registro adicionado.' : 'Registro atualizado.');
  }, [mode, editingItem, getItemId, lockPrefix, tabId, setMode, setEditingItem]);

  const saveAndStay = useCallback(async (onSave: () => Promise<void>) => {
    await onSave();
    setIsDirtyState(false);
    toast.success('Registro atualizado.');
  }, []);

  const saveAndNew = useCallback(async (onSave: () => Promise<void>) => {
    await onSave();
    setEditingItem(null);
    setIsDirtyState(false);
    setConfirmOpen(false);
    setResetKey((k) => k + 1);
    toast.success('Registro adicionado. Adicione outro.');
  }, [setEditingItem]);

  return {
    mode, editingItem, isDirty, setDirty,
    openNew, openView, openEdit, startEdit,
    requestBack, saveAndBack, saveAndStay, saveAndNew,
    resetKey,
    confirmOpen, confirmDiscard, cancelDiscard,
  };
}
