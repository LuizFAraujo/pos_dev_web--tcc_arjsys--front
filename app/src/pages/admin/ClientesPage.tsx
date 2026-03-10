/**
 * ClientesPage.tsx — Página de listagem de clientes
 *
 * Header buttons (esq → dir):
 * [Search+ColSelector] | [LimparFiltrosColunas] | [Adicionar] [Editar] [Excluir] | [Lista/Cards] | [Config]
 *
 * No modo cards, a seleção é controlada via useTabState (selectedCardId).
 * Os botões Editar/Excluir do header usam o item selecionado.
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, FilterX, List, LayoutGrid, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn, DataGridHandle } from '@/components/shared/DataGrid';
import { CardGrid } from '@/components/shared/CardGrid';
import type { CardGridHandle } from '@/components/shared/CardGrid';
import { SearchBar } from '@/components/shared/SearchBar';
import type { SearchColumn } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { ClienteFormModal } from '@/components/admin/ClienteFormModal';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import type { Cliente } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

// Colunas disponíveis pra pesquisa
const SEARCH_COLUMNS: SearchColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'contatoComercial', label: 'Contato' },
];

const DEFAULT_SEARCH_COLS = ['nome'];

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Ações por linha no DataGrid (modo lista) */
function ClienteGridActions({
  cliente,
  onEdit,
  onDelete,
}: {
  cliente: Cliente;
  onEdit: (c: Cliente) => void;
  onDelete: (c: Cliente) => void;
}) {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(cliente)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar cliente</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600"
            onClick={() => onDelete(cliente)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Excluir cliente</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/**
 * Conteúdo interno de um card de cliente.
 * Sem botões — ações ficam nos botões do header da página.
 */
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
          {cliente.cidade}
          {cliente.estado ? '/' + cliente.estado : ''}
        </p>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function ClientesPage({ tab }: ClientesPageProps) {
  const gridRef = useRef<DataGridHandle>(null);
  const cardGridRef = useRef<CardGridHandle>(null);

  const [searchTerm, setSearchTerm] = useTabState(tab.id + '-search', '');
  const [searchCols, setSearchCols] = useTabState<string[]>(
    tab.id + '-search-cols',
    DEFAULT_SEARCH_COLS,
  );
  const [viewMode, setViewMode] = useTabState<'list' | 'cards'>(tab.id + '-view', 'list');

  // ID do card selecionado no modo cards — persistido por aba
  const [selectedCardId, setSelectedCardId] = useTabState<number | null>(
    tab.id + '-card-sel',
    null,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteDelete, setClienteDelete] = useState<Cliente | null>(null);

  const clientes = useClientesStore((s) => s.clientes);
  const isLoading = useClientesStore((s) => s.isLoading);
  const error = useClientesStore((s) => s.error);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Busca geral — filtra nas colunas selecionadas
  const filtrados = useMemo(() => {
    if (!searchTerm) return clientes || [];
    const term = searchTerm.toLowerCase();
    return (clientes || []).filter((c) =>
      searchCols.some((col) => {
        const val = (c as Record<string, unknown>)[col];
        return val && String(val).toLowerCase().includes(term);
      }),
    );
  }, [clientes, searchTerm, searchCols]);

  // Item atualmente selecionado no modo cards
  const selectedCard = useMemo(
    () => filtrados.find((c) => c.id === selectedCardId) ?? null,
    [filtrados, selectedCardId],
  );

  // Handlers de edição/exclusão — usados tanto pelo grid quanto pelo header (cards)
  const handleEdit = (c: Cliente) => {
    setClienteEdit(c);
    setModalOpen(true);
  };

  const handleDelete = (c: Cliente) => {
    setClienteDelete(c);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clienteDelete) return;
    await deleteCliente(clienteDelete.id);
    // Se o card deletado estava selecionado, limpa seleção
    if (clienteDelete.id === selectedCardId) setSelectedCardId(null);
    setDeleteDialogOpen(false);
    setClienteDelete(null);
  };

  // Ao trocar de modo, limpa seleção de card
  const handleViewMode = (mode: 'list' | 'cards') => {
    setViewMode(mode);
    if (mode === 'list') {
      setSelectedCardId(null);
      cardGridRef.current?.clearSelection();
    }
  };

  const isListMode = viewMode === 'list';

  // Colunas do DataGrid (modo lista)
  const columns: GridColumn<Cliente>[] = useMemo(
    () => [
      {
        key: 'nome',
        header: 'Nome',
        width: 200,
        minWidth: 120,
        render: (c) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nome || '-'}</span>
        ),
      },
      {
        key: 'cpfCnpj',
        header: 'CPF/CNPJ',
        width: 170,
        minWidth: 130,
        contentAlign: 'center',
        className: 'font-mono',
        filterType: 'exact',
      },
      { key: 'razaoSocial', header: 'Razão Social', width: 220, minWidth: 120 },
      {
        key: 'cidade',
        header: 'Cidade/UF',
        width: 150,
        minWidth: 80,
        render: (c) => (c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-'),
      },
      {
        key: 'telefone',
        header: 'Telefone',
        width: 140,
        minWidth: 100,
        contentAlign: 'center',
      },
      {
        key: 'contatoComercial',
        header: 'Contato',
        width: 200,
        minWidth: 100,
        contentAlign: 'center',
        headerAlign: 'center',
        render: (c) => c.contatoComercial || '-',
      },
      {
        key: 'acoes',
        header: 'Ações',
        width: 80,
        minWidth: 80,
        sortable: false,
        filterType: false,
        resizable: false,
        contentAlign: 'center',
        headerAlign: 'center',
        render: (c) => (
          <ClienteGridActions cliente={c} onEdit={handleEdit} onDelete={handleDelete} />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageShell
      module="Admin"
      title="Clientes"
      headerRight={
        <div className="flex items-center">

          {/* GRUPO 1: Search com seletor de colunas */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            columns={SEARCH_COLUMNS}
            selectedColumns={searchCols}
            onColumnsChange={setSearchCols}
            placeholder="Buscar..."
            className="w-80"
          />

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* GRUPO 2: Limpar filtros (só no modo lista) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={!isListMode}
                onClick={() => {
                  gridRef.current?.clearAll();
                  setSearchTerm('');
                }}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Limpar filtros das colunas</p>
            </TooltipContent>
          </Tooltip>

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* GRUPO 3: CRUD */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setClienteEdit(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Novo cliente</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!isListMode && !selectedCard}
                  onClick={() => {
                    if (selectedCard) handleEdit(selectedCard);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar{!isListMode && !selectedCard ? ' (selecione um card)' : ''}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  disabled={!isListMode && !selectedCard}
                  onClick={() => {
                    if (selectedCard) handleDelete(selectedCard);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir{!isListMode && !selectedCard ? ' (selecione um card)' : ''}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* GRUPO 4: Toggle Lista/Cards */}
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isListMode ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-r-none"
                  onClick={() => handleViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lista</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!isListMode ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-l-none"
                  onClick={() => handleViewMode('cards')}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cards</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* GRUPO 5: Config */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {}}>
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>

        </div>
      }
    >
      {/* ── Modo lista ──────────────────────────────────────────────────── */}
      {isListMode ? (
        <DataGrid
          ref={gridRef}
          tabId={tab.id}
          storageId="clientes"
          columns={columns}
          data={filtrados}
          loading={isLoading}
          loadingText="Carregando clientes..."
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Crie o primeiro cliente"
          emptyAction={
            <Button
              onClick={() => {
                setClienteEdit(null);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
            </Button>
          }
        />
      ) : (
        /* ── Modo cards ───────────────────────────────────────────────── */
        <CardGrid
          ref={cardGridRef}
          data={filtrados}
          selectedId={selectedCardId}
          onSelect={(c) => setSelectedCardId(c?.id ?? null)}
          loading={isLoading}
          loadingText="Carregando clientes..."
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Crie o primeiro cliente"
          emptyAction={
            <Button
              onClick={() => {
                setClienteEdit(null);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro
            </Button>
          }
          renderCard={(c) => <ClienteCard cliente={c} />}
        />
      )}

      {/* ── Modais ──────────────────────────────────────────────────────── */}
      <ClienteFormModal open={modalOpen} onOpenChange={setModalOpen} cliente={clienteEdit} />
      <DeleteClienteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cliente={clienteDelete}
        onConfirm={handleDeleteConfirm}
      />
    </PageShell>
  );
}
