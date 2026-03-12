/**
 * usePageMode.ts — Hook para páginas de cadastro com modos list/view/new/edit
 *
 * previousMode é um useState simples (não persiste entre trocas de aba).
 * Isso é intencional: ao trocar de aba e voltar, o modo é restaurado via
 * useTabState, mas a origem (previousMode) é resetada para 'list'.
 */

import { useState, useCallback, useEffect } from 'react';
import { useTabState } from '@/hooks/useTabState';
import type { PageMode, PageModeState } from './types';

// ─── Lock global ──────────────────────────────────────────────────────────────

const editingLock = new Map<string, string>();

function acquireLock(lockKey: string, tabId: string): boolean {
  const current = editingLock.get(lockKey);
  if (current && current !== tabId) return false;
  editingLock.set(lockKey, tabId);
  return true;
}

function releaseLock(lockKey: string, tabId: string) {
  if (editingLock.get(lockKey) === tabId) editingLock.delete(lockKey);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePageMode<T>(
  tabId: string,
  getItemId?: (item: T) => string | number,
): PageModeState<T> {
  const [mode, setMode] = useTabState<PageMode>(tabId + '-mode', 'list');
  const [editingItem, setEditingItem] = useTabState<T | null>(tabId + '-editing-item', null);

  // previousMode como useState simples — atualiza sincronamente
  const [previousMode, setPreviousMode] = useState<PageMode>('list');

  const [isDirty, setIsDirtyState] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [tabId]);

  useEffect(() => {
    return () => {
      if (editingItem && getItemId) {
        const lockKey = `${tabId.split('-')[0]}-${getItemId(editingItem)}`;
        releaseLock(lockKey, tabId);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setDirty = useCallback((dirty: boolean) => setIsDirtyState(dirty), []);

  // ─── Transições ──────────────────────────────────────────────────────────────

  const goTo = useCallback((next: PageMode, from: PageMode, item: T | null = null) => {
    setPreviousMode(from);   // atualiza previousMode ANTES do setMode
    setMode(next);
    setEditingItem(item);
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [setMode, setEditingItem]);

  const openNew = useCallback(() => goTo('new', mode, null), [goTo, mode]);
  const openView = useCallback((item: T) => goTo('view', mode, item), [goTo, mode]);

  const openEdit = useCallback((item: T) => {
    if (getItemId) {
      const lockKey = `${tabId.split('-')[0]}-${getItemId(item)}`;
      if (!acquireLock(lockKey, tabId)) throw new Error('ITEM_LOCKED');
    }
    goTo('edit', mode, item);
  }, [getItemId, tabId, goTo, mode]);

  const startEdit = useCallback(() => {
    if (!editingItem) return;
    if (getItemId) {
      const lockKey = `${tabId.split('-')[0]}-${getItemId(editingItem)}`;
      if (!acquireLock(lockKey, tabId)) throw new Error('ITEM_LOCKED');
    }
    setPreviousMode(mode);
    setMode('edit');
    setIsDirtyState(false);
  }, [editingItem, getItemId, tabId, mode, setMode]);

  // ─── Saída ───────────────────────────────────────────────────────────────────

  const backToPrevious = useCallback(() => {
    // previousMode é useState — valor sempre atual, sem stale closure
    if (previousMode === 'list' && editingItem && getItemId) {
      const lockKey = `${tabId.split('-')[0]}-${getItemId(editingItem)}`;
      releaseLock(lockKey, tabId);
    }
    setMode(previousMode);
    if (previousMode === 'list') setEditingItem(null);
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [previousMode, editingItem, getItemId, tabId, setMode, setEditingItem]);

  const requestBack = useCallback(() => {
    if (!isDirty) { backToPrevious(); return; }
    setConfirmOpen(true);
  }, [isDirty, backToPrevious]);

  const confirmDiscard = useCallback(() => backToPrevious(), [backToPrevious]);
  const cancelDiscard = useCallback(() => setConfirmOpen(false), []);

  const saveAndBack = useCallback(async (onSave: () => Promise<void>) => {
    await onSave();
    if (editingItem && getItemId) {
      const lockKey = `${tabId.split('-')[0]}-${getItemId(editingItem)}`;
      releaseLock(lockKey, tabId);
    }
    setMode('list');
    setEditingItem(null);
    setIsDirtyState(false);
    setConfirmOpen(false);
  }, [editingItem, getItemId, tabId, setMode, setEditingItem]);

  const saveAndStay = useCallback(async (onSave: () => Promise<void>) => {
    await onSave();
    setIsDirtyState(false);
  }, []);

  return {
    mode, editingItem, isDirty, setDirty,
    openNew, openView, openEdit, startEdit,
    requestBack, saveAndBack, saveAndStay,
    confirmOpen, confirmDiscard, cancelDiscard,
  };
}
