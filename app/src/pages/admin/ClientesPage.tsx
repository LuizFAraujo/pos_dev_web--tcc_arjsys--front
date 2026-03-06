import { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, FilterX } from 'lucide-react';
import { toast } from 'sonner';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn, DataGridHandle } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shared/AppTooltip';
import { ClienteFormModal } from '@/components/admin/ClienteFormModal';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import type { Cliente } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

function ClienteActions({ cliente, onEdit, onDelete }: {
  cliente: Cliente;
  onEdit: (c: Cliente) => void;
  onDelete: (c: Cliente) => void;
}) {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(cliente)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Editar cliente</p></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => onDelete(cliente)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Excluir cliente</p></TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ClientesPage({ tab }: ClientesPageProps) {
  const gridRef = useRef<DataGridHandle>(null);
  const [searchTerm, setSearchTerm] = useTabState(tab.id + '-search', '');
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteDelete, setClienteDelete] = useState<Cliente | null>(null);

  const clientes = useClientesStore((s) => s.clientes);
  const isLoading = useClientesStore((s) => s.isLoading);
  const error = useClientesStore((s) => s.error);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);
  const deleteCliente = useClientesStore((s) => s.deleteCliente);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleEdit = (c: Cliente) => { setClienteEdit(c); setModalOpen(true); };
  const handleDelete = (c: Cliente) => { setClienteDelete(c); setDeleteDialogOpen(true); };

  const filtrados = useMemo(() => {
    if (!searchTerm) return clientes || [];
    const term = searchTerm.toLowerCase();
    return (clientes || []).filter((c) =>
      (c.nome || '').toLowerCase().includes(term) ||
      (c.cpfCnpj || '').toLowerCase().includes(term) ||
      (c.razaoSocial || '').toLowerCase().includes(term) ||
      (c.cidade || '').toLowerCase().includes(term)
    );
  }, [clientes, searchTerm]);

  const columns: GridColumn<Cliente>[] = useMemo(() => [
    { key: 'nome', header: 'Nome', width: 200, minWidth: 120, render: (c) => <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nome || '-'}</span> },
    { key: 'cpfCnpj', header: 'CPF/CNPJ', width: 170, minWidth: 130, className: 'font-mono', filterType: 'exact' },
    { key: 'razaoSocial', header: 'Razão Social', width: 220, minWidth: 120 },
    { key: 'cidade', header: 'Cidade/UF', width: 150, minWidth: 80, render: (c) => c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-' },
    { key: 'telefone', header: 'Telefone', width: 140, minWidth: 100 },
    { key: 'contatoComercial', header: 'Contato', width: 200, minWidth: 100, render: (c) => c.contatoComercial || '-' },
    {
      key: 'acoes', header: 'Ações', width: 80, minWidth: 80,
      sortable: false, filterType: false, resizable: false,
      contentAlign: 'center',
      render: (c) => <ClienteActions cliente={c} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ], []);

  return (
    <PageShell
      module="Admin"
      title="Clientes"
      headerRight={
        <>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-8 w-52 pl-7 text-xs" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { gridRef.current?.clearAll(); setSearchTerm(''); }}>
                <FilterX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Limpar todos os filtros</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="h-8 w-8" onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Novo cliente</p></TooltipContent>
          </Tooltip>
        </>
      }
    >
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
        emptyAction={<Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Criar Primeiro</Button>}
      />

      <ClienteFormModal open={modalOpen} onOpenChange={setModalOpen} cliente={clienteEdit} />
      <DeleteClienteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} cliente={clienteDelete}
        onConfirm={async () => { if (clienteDelete) { await deleteCliente(clienteDelete.id); setDeleteDialogOpen(false); setClienteDelete(null); } }}
      />
    </PageShell>
  );
}
