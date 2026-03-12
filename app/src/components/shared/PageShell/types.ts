/**
 * PageShell/types.ts — Tipos compartilhados da pasta PageShell
 */

import type { ReactNode } from 'react';

export interface PageShellProps {
  module?: string;
  title: string;
  /** Tag discreta exibida ao lado do título (ex: modo da página) */
  tag?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export type PageMode = 'list' | 'view' | 'new' | 'edit';

export interface PageModeState<T> {
  mode: PageMode;
  editingItem: T | null;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  openNew: () => void;
  openView: (item: T) => void;
  openEdit: (item: T) => void;
  startEdit: () => void;
  requestBack: () => void;
  saveAndBack: (onSave: () => Promise<void>) => Promise<void>;
  saveAndStay: (onSave: () => Promise<void>) => Promise<void>;
  confirmOpen: boolean;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
}
