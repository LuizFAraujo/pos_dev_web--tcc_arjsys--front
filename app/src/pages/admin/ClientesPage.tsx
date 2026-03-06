import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { GridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { ClienteFormModal } from '@/components/admin/ClienteFormModal';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import type { Cliente } from '@/types/admin/cliente.types';
import { toast } from 'sonner';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

// Componente de ações por linha
function ClienteActions({ cliente, onEdit, onDelete }: {
  cliente: Cliente;
  onEdit: (c: Cliente) => void;
  onDelete: (c: Cliente) => void;
}) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(cliente)} title="Editar">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => onDelete(cliente)} title="Excluir">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ClientesPage({ tab }: ClientesPageProps) {
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

  const columns: GridColumn<Cliente>[] = useMemo(() => [
    { key: 'nome', header: 'Nome', width: 200, minWidth: 120, render: (c) => <span className="font-semibold text-slate-800 dark:text-slate-200">{c.nome || '-'}</span> },
    { key: 'cpfCnpj', header: 'CPF/CNPJ', width: 170, minWidth: 130, contentAlign: 'center', className: 'font-mono', filterType: 'exact' },
    { key: 'razaoSocial', header: 'Razão Social', width: 220, minWidth: 120 },
    { key: 'cidade', header: 'Cidade/UF', width: 150, minWidth: 80, render: (c) => c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-' },
    { key: 'telefone', header: 'Telefone', width: 140, minWidth: 100, contentAlign: 'center' },
    {
      key: 'contatoComercial', header: 'Contato', width: 200, minWidth: 100,
      contentAlign: 'center', headerAlign: 'center',
      render: (c) => c.contatoComercial || '-'
    },
    {
      key: 'acoes', header: 'Ações', width: 80, minWidth: 80,
      sortable: false, filterType: false,
      contentAlign: 'center', headerAlign: 'center',
      render: (c) => <ClienteActions cliente={c} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ], []);

  return (
    <PageShell
      breadcrumbs={[{ label: 'Admin' }, { label: 'Clientes' }]}
      title="Clientes"
      tooltip="Gerencie o cadastro de clientes do sistema"
      headerRight={
        <Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      }
    >

      <DataGrid
        tabId={tab.id}
        storageId="clientes"
        columns={columns}
        data={clientes || []}
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
