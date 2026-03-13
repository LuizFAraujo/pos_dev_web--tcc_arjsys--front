/**
 * ClientesPage.tsx — Página de clientes com modos list/view/new/edit
 *
 * Botões do header são gerenciados pelo PageActions (template).
 * Esta página cuida apenas do conteúdo específico:
 * - Colunas do grid e SearchBar
 * - Form inline (ClienteForm)
 * - Callbacks de CRUD
 * - Card customizado
 */

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell, usePageMode, PageActions } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn, DataGridHandle } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { CardGridHandle } from '@/components/shared/CardGrid';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import { ClienteForm } from '@/components/admin/ClienteForm';
import type { ClienteFormHandle } from '@/components/admin/ClienteForm';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'contatoComercial', label: 'Contato' },
];

const DEFAULT_SEARCH_COLS = ['nome'];

function ClienteCard({ cliente }: { cliente: Cliente }) {
  return (
    <div className="p-4">
      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
        {cliente.nome || '-'}
      </p>
      <p className="text-xs text-muted-foreground font-mono mt-1">{cliente.cpfCnpj || '-'}</p>
      {cliente.razaoSocial && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{cliente.razaoSocial}</p>
      )}
      {cliente.cidade && (
        <p className="text-xs text-muted-foreground mt-1">
          {cliente.cidade}{cliente.estado ? '/' + cliente.estado : ''}
        </p>
      )}
    </div>
  );
}

export function ClientesPage({ tab }: ClientesPageProps) {
  const gridRef = useRef<DataGridHandle>(null);
  const cardGridRef = useRef<CardGridHandle>(null);
  const formRef = useRef<ClienteFormHandle>(null);

  const [searchTerm, setSearchTerm] = useTabState(tab.id + '-search', '');
  const [searchCols, setSearchCols] = useTabState<string[]>(tab.id + '-search-cols', DEFAULT_SEARCH_COLS);
  const [viewMode, setViewMode] = useTabState<'list' | 'cards'>(tab.id + '-view', 'list');
  const [selectedItem, setSelectedItem] = useState<Cliente | null>(null);
  const [selectedCardId, setSelectedCardId] = useTabState<number | null>(tab.id + '-card-sel', null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteDelete, setClienteDelete] = useState<Cliente | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const page = usePageMode<Cliente>(tab.id, (c) => String(c.id));

  const clientes = useClientesStore((s) => s.clientes);
  const isLoading = useClientesStore((s) => s.isLoading);
  const error = useClientesStore((s) => s.error);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return clientes || [];
    const term = searchTerm.toLowerCase();
    return (clientes || []).filter((c) =>
      searchCols.some((col) => {
        const val = (c as any)[col];
        return val && String(val).toLowerCase().includes(term);
      }),
    );
  }, [clientes, searchTerm, searchCols]);

  const selectedCard = useMemo(
    () => filtrados.find((c) => c.id === selectedCardId) ?? null,
    [filtrados, selectedCardId],
  );

  const activeItem = viewMode === 'list' ? selectedItem : selectedCard;
  const inForm = page.mode !== 'list';

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: ClienteFormData) => {
    if (page.mode === 'edit' && page.editingItem) {
      await updateCliente(page.editingItem.id, data);
    } else {
      await createCliente(data);
    }
  }, [page.mode, page.editingItem, updateCliente, createCliente]);

  const doSaveAndBack = useCallback(async () => {
    setIsSaving(true);
    try {
      await page.saveAndBack(async () => {
        const ok = await formRef.current?.submit();
        if (!ok) throw new Error('VALIDATION');
      });
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }, [page]);

  const doSaveAndStay = useCallback(async () => {
    setIsSaving(true);
    try {
      await page.saveAndStay(async () => {
        const ok = await formRef.current?.submit();
        if (!ok) throw new Error('VALIDATION');
      });
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }, [page]);

  const doSaveAndNew = useCallback(async () => {
    setIsSaving(true);
    try {
      await page.saveAndNew(async () => {
        const ok = await formRef.current?.submit();
        if (!ok) throw new Error('VALIDATION');
      });
    } catch (e: any) {
      if (e?.message !== 'VALIDATION') toast.error('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }, [page]);

  // ─── Navegação ───────────────────────────────────────────────────────────────

  const handleView = useCallback((c: Cliente) => page.openView(c), [page]);

  const handleEdit = useCallback((c: Cliente) => {
    try { page.openEdit(c); }
    catch { toast.error('Este cliente já está sendo editado em outra aba.'); }
  }, [page]);

  const handleStartEdit = useCallback(() => {
    try { page.startEdit(); }
    catch { toast.error('Este cliente já está sendo editado em outra aba.'); }
  }, [page]);

  const handleDelete = useCallback((c: Cliente) => {
    setClienteDelete(c);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!clienteDelete) return;
    await deleteCliente(clienteDelete.id);
    if (clienteDelete.id === selectedCardId) setSelectedCardId(null);
    setDeleteDialogOpen(false);
    setClienteDelete(null);
    toast.success('Registro excluído.');
  }, [clienteDelete, deleteCliente, selectedCardId, setSelectedCardId]);

  const handleViewMode = useCallback((mode: 'list' | 'cards') => {
    setViewMode(mode);
    if (mode === 'list') { setSelectedCardId(null); cardGridRef.current?.clearSelection(); }
    else setSelectedItem(null);
  }, [setViewMode, setSelectedCardId]);

  // ─── Tag de modo ──────────────────────────────────────────────────────────────

  const modeTag = useMemo(() => {
    if (page.mode === 'view') return 'visualização';
    if (page.mode === 'edit') return 'edição';
    if (page.mode === 'new') return 'novo';
    return undefined;
  }, [page.mode]);

  // ─── Colunas ─────────────────────────────────────────────────────────────────

  const columns: GridColumn<Cliente>[] = useMemo(() => [
    {
      key: 'nome', header: 'Nome', width: 200, minWidth: 120,
      render: (c) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nome || '-'}</span>
      ),
    },
    {
      key: 'cpfCnpj', header: 'CPF/CNPJ', width: 170, minWidth: 130,
      contentAlign: 'center', className: 'font-mono', filterType: 'exact',
    },
    { key: 'razaoSocial', header: 'Razão Social', width: 220, minWidth: 120 },
    {
      key: 'cidade', header: 'Cidade/UF', width: 150, minWidth: 80,
      render: (c) => (c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-'),
    },
    { key: 'telefone', header: 'Telefone', width: 140, minWidth: 100, contentAlign: 'center' },
    {
      key: 'contatoComercial', header: 'Contato', width: 200, minWidth: 100,
      contentAlign: 'center', headerAlign: 'center',
      render: (c) => c.contatoComercial || '-',
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageShell module="Admin" title="Clientes" tag={modeTag}
      headerRight={
        <PageActions
          page={page}
          activeItem={activeItem}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStartEdit={handleStartEdit}
          searchColumns={SEARCH_COLUMNS}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchSelectedColumns={searchCols}
          onSearchColumnsChange={setSearchCols}
          gridRef={gridRef}
          viewMode={viewMode}
          onViewModeChange={handleViewMode}
          onSaveAndBack={doSaveAndBack}
          onSaveAndStay={doSaveAndStay}
          onSaveAndNew={doSaveAndNew}
          isSaving={isSaving}
          newTooltip="Novo cliente"
          noSelectionText="Selecione um cliente"
        />
      }
    >

      {!inForm && (
        viewMode === 'list' ? (
          <DataGrid
            ref={gridRef} tabId={tab.id} storageId="clientes"
            columns={columns} data={filtrados}
            loading={isLoading} loadingText="Carregando clientes..."
            emptyTitle="Nenhum cliente encontrado" emptyDescription="Crie o primeiro cliente"
            onSelect={(item) => setSelectedItem(item as Cliente | null)}
            onActivate={(item) => handleView(item as Cliente)}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        ) : (
          <CardGrid
            ref={cardGridRef} data={filtrados} selectedId={selectedCardId}
            onSelect={(c) => setSelectedCardId(c?.id ?? null)}
            loading={isLoading} loadingText="Carregando clientes..."
            emptyTitle="Nenhum cliente encontrado" emptyDescription="Crie o primeiro cliente"
            renderCard={(c) => <ClienteCard cliente={c} />}
            emptyAction={
              <Button onClick={() => page.openNew()}>
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
              </Button>
            }
          />
        )
      )}

      {inForm && (
        <ClienteForm
          key={page.resetKey}
          ref={formRef}
          mode={page.mode as 'view' | 'new' | 'edit'}
          cliente={page.editingItem}
          onDirty={() => page.setDirty(true)}
          onSave={handleSave}
        />
      )}

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
            <AlertDialogAction onClick={doSaveAndBack} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar e Sair'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteClienteDialog
        open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
        cliente={clienteDelete} onConfirm={handleDeleteConfirm}
      />

    </PageShell>
  );
}
