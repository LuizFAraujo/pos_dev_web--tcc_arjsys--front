/**
 * PageShell/types.ts - Tipos compartilhados
 */

import type { ReactNode } from 'react';

export interface PageShellProps {
  module?: string;
  title: string;
  tag?: string;
  extraTag?: string;
  mode?: PageMode;
  headerRight?: ReactNode;
  /**
   * Footer completo (substitui o footer automático).
   * Compat com pages antigas - prefira `footerLeft` + `mode`.
   */
  footer?: ReactNode;
  /**
   * Slot livre à esquerda do footer. Em modo new/edit, os atalhos de teclado
   * ficam à direita e o que vier aqui à esquerda (help contextual, status do
   * form, dicas por campo focado).
   */
  footerLeft?: ReactNode;
  children: ReactNode;
}

export interface FormHandle {
  submit: () => Promise<boolean>;
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
  saveAndNew: (onSave: () => Promise<void>) => Promise<void>;
  resetKey: number;
  confirmOpen: boolean;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
}
