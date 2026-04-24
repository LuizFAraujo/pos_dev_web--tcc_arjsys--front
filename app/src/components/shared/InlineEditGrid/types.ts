/**
 * InlineEditGrid/types.ts
 */

import type { ReactNode } from 'react';

export interface InlineColumn<T> {
  key: string;
  header: string;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  required?: boolean;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'decimal';
  render?: (row: T, value: unknown) => ReactNode;
  getValue?: (row: T) => unknown;
  setValue?: (row: T, value: string) => T;
  validate?: (value: string, row: T) => string | null | undefined;
}

export interface InlineEditGridProps<T> {
  rows: T[];
  columns: InlineColumn<T>[];
  getRowId: (row: T) => string | number;
  editable: boolean;
  createEmptyRow?: (tempId: string) => T;
  onChange?: (rows: T[]) => void;
  bodyHeight?: number | string;
  emptyMessage?: string;
  showFooter?: boolean;
  footerText?: (count: number) => string;
}
