/**
 * InlineEditGrid.tsx - Grid flat com edição inline por linha
 *
 * Visual coeso com o DataGrid (headers uppercase, zebra, hover, borda fina)
 * mas simplificado pra 3-50 linhas editáveis dentro de um form (itens de PV,
 * parcelas, apontamentos, etc).
 *
 * Recursos:
 *   - Clicar no lápis ou na linha entra em modo edit
 *   - Enter confirma, Esc cancela
 *   - Linha temporária (id `new-*`) cancelada é removida
 *   - Validação por coluna (retorno string = erro)
 *   - Opera em memória - caller decide quando persistir
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Trash2, Plus, Check, X as XIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shared/AppTooltip';
import type { InlineColumn, InlineEditGridProps } from './types';

function colWidth<T>(c: InlineColumn<T>): string | undefined {
  if (c.width == null) return undefined;
  return typeof c.width === 'number' ? `${c.width}px` : c.width;
}

function alignClass<T>(c: InlineColumn<T>): string {
  return c.align === 'right'
    ? 'text-right'
    : c.align === 'center'
      ? 'text-center'
      : 'text-left';
}

function defaultGet<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function defaultSet<T>(row: T, key: string, value: string): T {
  return { ...row, [key]: value } as T;
}

function valueToInputString(v: unknown, type: InlineColumn<unknown>['inputType']): string {
  if (v == null) return '';
  if (type === 'decimal' || type === 'number') {
    return String(v).replace('.', ',');
  }
  return String(v);
}

function inputStringToValue(
  s: string,
  type: InlineColumn<unknown>['inputType'],
): string | number {
  if (type === 'number') {
    const n = parseInt(s.replace(',', '.'), 10);
    return Number.isNaN(n) ? 0 : n;
  }
  if (type === 'decimal') {
    const n = parseFloat(s.replace(',', '.'));
    return Number.isNaN(n) ? 0 : n;
  }
  return s;
}

export function InlineEditGrid<T>({
  rows,
  columns,
  getRowId,
  editable,
  createEmptyRow,
  onChange,
  bodyHeight,
  emptyMessage = 'Nenhum item.',
  showFooter = true,
  footerText,
}: InlineEditGridProps<T>) {
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId !== null) {
      requestAnimationFrame(() => firstInputRef.current?.focus());
    }
  }, [editingId]);

  const startEditRow = useCallback(
    (row: T) => {
      if (!editable) return;
      const id = getRowId(row);
      const values: Record<string, string> = {};
      columns.forEach((c) => {
        const raw = (c.getValue ?? ((r: T) => defaultGet(r, c.key)))(row);
        values[c.key] = valueToInputString(raw, c.inputType);
      });
      setEditValues(values);
      setEditErrors({});
      setEditingId(id);
    },
    [columns, editable, getRowId],
  );

  const cancelEdit = useCallback(() => {
    if (editingId != null && String(editingId).startsWith('new-')) {
      const next = rows.filter((r) => getRowId(r) !== editingId);
      onChange?.(next);
    }
    setEditingId(null);
    setEditValues({});
    setEditErrors({});
  }, [editingId, getRowId, onChange, rows]);

  const saveEdit = useCallback(() => {
    if (editingId == null) return;

    const errors: Record<string, string> = {};
    for (const c of columns) {
      const raw = editValues[c.key] ?? '';
      if (c.required && !raw.trim()) {
        errors[c.key] = `${c.header} é obrigatório`;
      } else if (c.validate) {
        const currentRow = rows.find((r) => getRowId(r) === editingId);
        if (currentRow) {
          const msg = c.validate(raw, currentRow);
          if (msg) errors[c.key] = msg;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error('Corrija os campos destacados.');
      return;
    }

    const idx = rows.findIndex((r) => getRowId(r) === editingId);
    if (idx === -1) return;

    let updatedRow = rows[idx];
    for (const c of columns) {
      const raw = editValues[c.key] ?? '';
      const coerced = inputStringToValue(raw, c.inputType);
      if (c.inputType === 'number' || c.inputType === 'decimal') {
        updatedRow = {
          ...(updatedRow as Record<string, unknown>),
          [c.key]: coerced,
        } as T;
      } else {
        updatedRow = (c.setValue ?? ((r: T, v: string) => defaultSet(r, c.key, v)))(
          updatedRow,
          String(coerced),
        );
      }
    }

    const next = [...rows];
    next[idx] = updatedRow;
    onChange?.(next);
    setEditingId(null);
    setEditValues({});
    setEditErrors({});
  }, [columns, editValues, editingId, getRowId, onChange, rows]);

  const addRow = useCallback(() => {
    if (!editable || !createEmptyRow) return;
    const tempId = `new-${nanoid(8)}`;
    const empty = createEmptyRow(tempId);
    const next = [...rows, empty];
    onChange?.(next);

    const values: Record<string, string> = {};
    columns.forEach((c) => {
      const raw = (c.getValue ?? ((r: T) => defaultGet(r, c.key)))(empty);
      values[c.key] = valueToInputString(raw, c.inputType);
    });
    setEditValues(values);
    setEditErrors({});
    setEditingId(tempId);
  }, [columns, createEmptyRow, editable, onChange, rows]);

  const removeRow = useCallback(
    (row: T) => {
      const id = getRowId(row);
      if (editingId === id) {
        setEditingId(null);
        setEditValues({});
        setEditErrors({});
      }
      const next = rows.filter((r) => getRowId(r) !== id);
      onChange?.(next);
    },
    [editingId, getRowId, onChange, rows],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit],
  );

  const renderCellDisplay = useCallback((row: T, c: InlineColumn<T>) => {
    const raw = (c.getValue ?? ((r: T) => defaultGet(r, c.key)))(row);
    if (c.render) return c.render(row, raw);
    if (raw == null || raw === '') {
      return <span className="text-muted-foreground/60">-</span>;
    }
    if (c.inputType === 'decimal') {
      const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
      return Number.isNaN(n)
        ? '-'
        : n.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
    }
    if (c.inputType === 'number') {
      const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
      return Number.isNaN(n) ? '-' : n.toLocaleString('pt-BR');
    }
    return String(raw);
  }, []);

  const footerLabel = useMemo(() => {
    if (footerText) return footerText(rows.length);
    if (rows.length === 0) return 'Nenhum item';
    return `${rows.length} ${rows.length === 1 ? 'item' : 'itens'}`;
  }, [footerText, rows.length]);

  const bodyStyle: React.CSSProperties = {};
  if (bodyHeight != null) {
    bodyStyle.maxHeight = typeof bodyHeight === 'number' ? `${bodyHeight}px` : bodyHeight;
    bodyStyle.overflowY = 'auto';
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-white dark:bg-slate-950">
      <div style={bodyStyle}>
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 ${alignClass(c)}`}
                  style={{
                    width: colWidth(c),
                    minWidth: c.minWidth ? `${c.minWidth}px` : undefined,
                  }}
                >
                  {c.header}
                  {c.required && <span className="text-red-500 ml-0.5">*</span>}
                </th>
              ))}
              {editable && <th className="w-20" />}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (editable ? 1 : 0)}
                  className="px-3 py-8 text-center text-sm text-muted-foreground italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {rows.map((row, idx) => {
              const id = getRowId(row);
              const isEditing = editingId === id;

              return (
                <tr
                  key={String(id)}
                  className={`border-t transition-colors ${
                    isEditing
                      ? 'bg-blue-50/60 dark:bg-blue-900/10'
                      : idx % 2 === 0
                        ? ''
                        : 'bg-muted/20'
                  } ${!isEditing ? 'hover:bg-muted/40' : ''}`}
                >
                  {columns.map((c, colIdx) => {
                    const err = isEditing ? editErrors[c.key] : undefined;
                    return (
                      <td
                        key={c.key}
                        className={`px-3 py-1.5 text-xs ${alignClass(c)}`}
                        style={{
                          width: colWidth(c),
                          minWidth: c.minWidth ? `${c.minWidth}px` : undefined,
                        }}
                      >
                        {isEditing ? (
                          <Input
                            ref={colIdx === 0 ? firstInputRef : undefined}
                            type="text"
                            inputMode={
                              c.inputType === 'number' || c.inputType === 'decimal'
                                ? 'decimal'
                                : undefined
                            }
                            placeholder={c.placeholder}
                            value={editValues[c.key] ?? ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [c.key]: e.target.value,
                              }))
                            }
                            onKeyDown={handleKey}
                            className={`h-7 text-xs bg-white dark:bg-slate-950 ${
                              c.align === 'right' ? 'text-right font-mono' : ''
                            } ${c.align === 'center' ? 'text-center' : ''} ${
                              err ? 'border-red-400 focus-visible:ring-red-400/30' : ''
                            }`}
                          />
                        ) : (
                          renderCellDisplay(row, c)
                        )}
                        {err && (
                          <p className="text-[10px] text-red-500 mt-0.5">{err}</p>
                        )}
                      </td>
                    );
                  })}

                  {editable && (
                    <td className="px-1 py-1 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={saveEdit}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Confirmar (Enter)</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={cancelEdit}
                              >
                                <XIcon className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancelar (Esc)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => startEditRow(row)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar linha</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => removeRow(row)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remover</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showFooter || (editable && createEmptyRow)) && (
        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">{footerLabel}</span>
          {editable && createEmptyRow && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5"
              onClick={addRow}
              disabled={editingId !== null}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
