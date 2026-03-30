/**
 * PageShell/types.ts — Tipos compartilhados da pasta PageShell
 */

import type { ReactNode } from 'react';

export interface PageShellProps {
  module?: string;
  title: string;
  /** Tag discreta exibida ao lado do título (ex: modo da página) */
  tag?: string;
  extraTag?: string;
  /** Modo da página — se passado sem tag, gera tag automaticamente */
  mode?: PageMode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Interface genérica que todo form inline deve expor via forwardRef */
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
  /** Salva e reseta para novo cadastro (modo new → limpa form, permanece em new) */
  saveAndNew: (onSave: () => Promise<void>) => Promise<void>;
  /** Chave de reset — incrementa a cada saveAndNew para forçar remount do form */
  resetKey: number;
  confirmOpen: boolean;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
}
