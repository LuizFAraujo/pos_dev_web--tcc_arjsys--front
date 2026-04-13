/**
 * PageActions.tsx — Botões padrão do header por modo (list/view/new/edit)
 *
 * Renderiza automaticamente os botões corretos conforme o modo do usePageMode.
 * A página só passa callbacks e configuração específica (colunas do SearchBar, etc).
 *
 * Modos:
 *   list — SearchBar | LimparFiltros | Novo+View+Edit+Delete | Lista/Cards | extraActions | Config
 *   view — Editar + Fechar | extraActions | Config
 *   new  — Salvar e Sair + Salvar (=adicionar outro) + Cancelar | Config
 *   edit — Salvar e Sair + Salvar + Voltar p/ Visualização | Config
 *
 * Props opcionais:
 *   hideButtons — esconde botões específicos (ex: ['cards', 'delete'])
 *   extraActions — ReactNode com botões extras específicos da página
 *   searchBarOverride — substitui o SearchBar padrão por um customizado
 */

import { useMemo, useEffect, useCallback, useState } from 'react';
import {
  Plus, Pencil, Trash2, FilterX, List, LayoutGrid,
  Settings, Eye, Save, ArrowLeft, X, FilePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { SearchBar } from '@/components/shared/SearchBar';
import type { SearchColumn } from '@/components/shared/SearchBar';
import type { DataGridHandle } from '@/components/shared/DataGrid';
import type { PageModeState, FormHandle } from './types';
import type { ReactNode } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Botões que podem ser escondidos via hideButtons */
type HideableButton = 'new' | 'view' | 'edit' | 'delete' | 'cards' | 'search' | 'config';

export interface PageActionsProps<T> {
  /** Estado do usePageMode */
  page: PageModeState<T>;

  // ── list mode ─────────────────────────────────────────────────────────────

  /** Item selecionado no grid/cards — habilita View/Edit/Delete */
  activeItem?: T | null;

  /** Callback ao clicar Delete */
  onDelete?: (item: T) => void;

  /** Mensagem de toast quando item está bloqueado em outra aba */
  lockMessage?: string;

  // ── SearchBar (opção B — template monta) ──────────────────────────────────

  /** Colunas disponíveis no SearchBar */
  searchColumns?: SearchColumn[];

  /** Termo de busca atual */
  searchTerm?: string;

  /** Callback ao digitar no SearchBar */
  onSearchChange?: (value: string) => void;

  /** Colunas selecionadas no SearchBar (keys) */
  searchSelectedColumns?: string[];

  /** Callback ao mudar colunas selecionadas */
  onSearchColumnsChange?: (cols: string[]) => void;

  /** Placeholder do SearchBar */
  searchPlaceholder?: string;

  /** Largura do SearchBar (classe Tailwind, default: 'w-80') */
  searchWidth?: string;

  /** Substitui o SearchBar padrão por um customizado */
  searchBarOverride?: ReactNode;

  // ── Grid ref (para limpar filtros) ────────────────────────────────────────

  /** Ref do DataGrid — usado pelo botão Limpar Filtros */
  gridRef?: React.RefObject<DataGridHandle | null>;

  // ── View mode toggle ──────────────────────────────────────────────────────

  /** Modo de visualização atual: 'list' ou 'cards' */
  viewMode?: 'list' | 'cards';

  /** Callback ao trocar modo de visualização */
  onViewModeChange?: (mode: 'list' | 'cards') => void;

  // ── Save ───────────────────────────────────────────────────────────────────

  /** Ref do form inline — deve expor FormHandle { submit(): Promise<boolean> } */
  formRef?: React.RefObject<FormHandle | null>;

  // ── Customização ──────────────────────────────────────────────────────────

  /** Botões extras específicos da página (ex: Varredura na ProdutosPage) */
  extraActions?: ReactNode;

  /** Esconde botões específicos — ex: ['cards', 'delete'] */
  hideButtons?: HideableButton[];

  /** Tooltip do botão Novo — ex: 'Novo cliente', 'Novo produto' */
  newTooltip?: string;

  /** Tooltip do botão View — ex: 'Visualizar', personalizado por entidade */
  viewTooltip?: string;

  /** Tooltip do botão Edit — ex: 'Editar' */
  editTooltip?: string;

  /** Tooltip do botão Delete — ex: 'Excluir' */
  deleteTooltip?: string;

  /** Texto quando nenhum item selecionado — ex: 'Selecione um cliente' */
  noSelectionText?: string;
}

// ─── Separador visual entre grupos de botões ──────────────────────────────────

function Sep() {
  return <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PageActions<T>({
  page,
  activeItem,
  onDelete,
  lockMessage = 'Este item já está sendo editado em outra aba.',
  searchColumns,
  searchTerm = '',
  onSearchChange,
  searchSelectedColumns,
  onSearchColumnsChange,
  searchPlaceholder = 'Buscar...',
  searchWidth = 'w-80',
  searchBarOverride,
  gridRef,
  viewMode = 'list',
  onViewModeChange,
  formRef,
  extraActions,
  hideButtons = [],
  newTooltip = 'Novo',
  viewTooltip = 'Visualizar',
  editTooltip = 'Editar',
  deleteTooltip = 'Excluir',
  noSelectionText = 'Selecione um item',
}: PageActionsProps<T>) {

  const hide = useMemo(() => new Set(hideButtons), [hideButtons]);
  const isListMode = viewMode === 'list';
  const inForm = page.mode !== 'list';

  const [isSaving, setIsSaving] = useState(false);

  // ── Navegação interna (view/edit com tratamento de lock) ──────────────────

  const handleView = useCallback((item: T) => {
    page.openView(item);
  }, [page]);

  const handleEdit = useCallback((item: T) => {
    try { page.openEdit(item); }
    catch { toast.error(lockMessage); }
  }, [page, lockMessage]);

  const handleStartEdit = useCallback(() => {
    try { page.startEdit(); }
    catch { toast.error(lockMessage); }
  }, [page, lockMessage]);

  // ── Save interno (template cuida de try/catch/isSaving) ───────────────────

  const submitForm = useCallback(async () => {
    const ok = await formRef?.current?.submit();
    if (!ok) throw new Error('VALIDATION');
  }, [formRef]);

  const doSaveAndBack = useCallback(async () => {
    if (!formRef) return;
    setIsSaving(true);
    try {
      await page.saveAndBack(submitForm);
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [formRef, page, submitForm]);

  const doSaveAndStay = useCallback(async () => {
    if (!formRef) return;
    setIsSaving(true);
    try {
      await page.saveAndStay(submitForm);
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }, [formRef, page, submitForm]);

  const doSaveAndNew = useCallback(async () => {
    if (!formRef) return;
    setIsSaving(true);
    try {
      await page.saveAndNew(submitForm);
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }, [formRef, page, submitForm]);

  // ── Salvar a partir do dialog de confirmação (trata erro de validação) ────

  const handleSaveFromDialog = useCallback(async () => {
    try {
      await doSaveAndBack();
    } catch {
      // Erro de validação ou outro — fecha o dialog pra mostrar os campos
      page.cancelDiscard();
    }
  }, [doSaveAndBack, page]);

  // ── Dialog de confirmação (sair sem salvar) ───────────────────────────────

  const dirtyDialog = (
    <AlertDialog open={page.confirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
          <AlertDialogDescription>
            Há alterações não salvas. O que deseja fazer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={page.cancelDiscard}>Continuar editando</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
            onClick={page.confirmDiscard}>Descartar</AlertDialogAction>
          <AlertDialogAction onClick={handleSaveFromDialog} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar e Sair'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // ── Atalhos de teclado (Ctrl+S / Ctrl+Shift+S) ───────────────────────────

  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    // Só age em modos de edição (new/edit)
    if (page.mode !== 'new' && page.mode !== 'edit') return;
    if (!page.isDirty || isSaving) return;

    const isCtrlS = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
    if (!isCtrlS) return;

    e.preventDefault();

    if (e.shiftKey) {
      // Ctrl+Shift+S → Salvar e Sair
      doSaveAndBack();
    } else {
      // Ctrl+S → Salvar e permanecer
      if (page.mode === 'new') {
        doSaveAndNew();
      } else {
        doSaveAndStay();
      }
    }
  }, [page.mode, page.isDirty, isSaving, doSaveAndBack, doSaveAndStay, doSaveAndNew]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyboard]);

  // ── Botão Config (presente em todos os modos) ────────────────────────────

  const btnConfig = hide.has('config') ? null : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>Configurações</p></TooltipContent>
    </Tooltip>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LIST MODE
  // ════════════════════════════════════════════════════════════════════════════

  if (!inForm) {
    return (
      <div className="flex items-center">
        {/* SearchBar */}
        {!hide.has('search') && (
          <>
            {searchBarOverride || (
              searchColumns && onSearchChange && searchSelectedColumns && onSearchColumnsChange && (
                <SearchBar
                  value={searchTerm}
                  onChange={onSearchChange}
                  columns={searchColumns}
                  selectedColumns={searchSelectedColumns}
                  onColumnsChange={onSearchColumnsChange}
                  placeholder={searchPlaceholder}
                  className={searchWidth}
                />
              )
            )}
            <Sep />
          </>
        )}

        {/* Limpar Filtros */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8"
              disabled={inForm}
              onClick={() => { gridRef?.current?.clearAll(); onSearchChange?.(''); }}>
              <FilterX className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Limpar filtros</p></TooltipContent>
        </Tooltip>

        <Sep />

        {/* Novo / View / Edit / Delete */}
        <div className="flex items-center gap-1">
          {!hide.has('new') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="h-8 w-8" onClick={() => page.openNew()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{newTooltip}</p></TooltipContent>
            </Tooltip>
          )}

          {!hide.has('view') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  disabled={!activeItem}
                  onClick={() => { if (activeItem) handleView(activeItem); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeItem ? viewTooltip : noSelectionText}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!hide.has('edit') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  disabled={!activeItem}
                  onClick={() => { if (activeItem) handleEdit(activeItem); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeItem ? editTooltip : noSelectionText}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!hide.has('delete') && onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={!activeItem}
                  onClick={() => { if (activeItem) onDelete(activeItem); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeItem ? deleteTooltip : noSelectionText}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Lista / Cards toggle */}
        {!hide.has('cards') && onViewModeChange && (
          <>
            <Sep />
            <div className="flex items-center gap-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={isListMode ? 'secondary' : 'ghost'} size="icon"
                    className="h-7 w-7 rounded-r-none"
                    onClick={() => onViewModeChange('list')}>
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Lista</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={!isListMode ? 'secondary' : 'ghost'} size="icon"
                    className="h-7 w-7 rounded-l-none"
                    onClick={() => onViewModeChange('cards')}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Cards</p></TooltipContent>
              </Tooltip>
            </div>
          </>
        )}

        {/* Extra actions da página */}
        {extraActions && (
          <>
            <Sep />
            {extraActions}
          </>
        )}

        {/* Config */}
        {btnConfig && (
          <>
            <Sep />
            {btnConfig}
          </>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VIEW MODE
  // ════════════════════════════════════════════════════════════════════════════

  if (page.mode === 'view') {
    return (
      <div className="flex items-center">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Editar</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => page.requestBack()}>
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Fechar</p></TooltipContent>
          </Tooltip>
        </div>

        {extraActions && (
          <>
            <Sep />
            {extraActions}
          </>
        )}

        {btnConfig && (
          <>
            <Sep />
            {btnConfig}
          </>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NEW MODE
  // ════════════════════════════════════════════════════════════════════════════

  if (page.mode === 'new') {
    return (
      <>
        <div className="flex items-center">
          <div className="flex items-center gap-1">
            {/* Salvar e Sair */}
            {formRef && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-8 w-8"
                    disabled={isSaving || !page.isDirty}
                    onClick={doSaveAndBack}>
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{!page.isDirty ? 'Nenhuma alteração' : isSaving ? 'Salvando...' : 'Salvar e Sair (Ctrl+Shift+S)'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Salvar e Adicionar Outro */}
            {formRef && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    disabled={isSaving || !page.isDirty}
                    onClick={doSaveAndNew}>
                    <FilePlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{!page.isDirty ? 'Nenhuma alteração' : isSaving ? 'Salvando...' : 'Salvar e Adicionar Outro (Ctrl+S)'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Cancelar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => page.requestBack()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Cancelar</p></TooltipContent>
            </Tooltip>
          </div>

          {extraActions && (
            <>
              <Sep />
              {extraActions}
            </>
          )}

          {btnConfig && (
            <>
              <Sep />
              {btnConfig}
            </>
          )}
        </div>
        {dirtyDialog}
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EDIT MODE
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center gap-1">
          {/* Salvar e Sair */}
          {formRef && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="h-8 w-8"
                  disabled={isSaving || !page.isDirty}
                  onClick={doSaveAndBack}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{!page.isDirty ? 'Nenhuma alteração' : isSaving ? 'Salvando...' : 'Salvar e Sair (Ctrl+Shift+S)'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Salvar (permanecer editando) */}
          {formRef && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  disabled={isSaving || !page.isDirty}
                  onClick={doSaveAndStay}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{!page.isDirty ? 'Nenhuma alteração' : isSaving ? 'Salvando...' : 'Salvar (Ctrl+S)'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Voltar para Visualização */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => page.requestBack()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Voltar para Visualização</p></TooltipContent>
          </Tooltip>
        </div>

        {extraActions && (
          <>
            <Sep />
            {extraActions}
          </>
        )}

        {btnConfig && (
          <>
            <Sep />
            {btnConfig}
          </>
        )}
      </div>
      {dirtyDialog}
    </>
  );
}
