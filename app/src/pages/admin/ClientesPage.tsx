import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { ClienteFormModal } from '@/components/admin/ClienteFormModal';
import { DeleteClienteDialog } from '@/components/admin/DeleteClienteDialog';
import type { Cliente } from '@/types/admin/cliente.types';

interface ClientesPageProps {
  tab: { id: string; type: string; title: string };
}

export function ClientesPage({ tab }: ClientesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
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

  const filtrados = useMemo(() => {
    if (!searchTerm) return clientes || [];
    const term = searchTerm.toLowerCase();
    return (clientes || []).filter((c) =>
      (c.nome || '').toLowerCase().includes(term) ||
      (c.cpfCnpj || '').toLowerCase().includes(term) ||
      (c.razaoSocial || '').toLowerCase().includes(term) ||
      (c.cidade || '').toLowerCase().includes(term) ||
      (c.contatoComercial || '').toLowerCase().includes(term)
    );
  }, [clientes, searchTerm]);

  const columns: DataGridColumn<Cliente>[] = [
    { key: 'nome', header: 'Nome', render: (c) => <span className="font-medium">{c.nome || '-'}</span> },
    { key: 'cpfCnpj', header: 'CPF/CNPJ', className: 'font-mono' },
    { key: 'razaoSocial', header: 'Razão Social' },
    { key: 'cidadeUf', header: 'Cidade/UF', render: (c) => c.cidade ? `${c.cidade}${c.estado ? '/' + c.estado : ''}` : '-' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'contatoComercial', header: 'Contato' },
    {
      key: 'acoes', header: 'Ações', render: (c) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setClienteEdit(c); setModalOpen(true); }} title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setClienteDelete(c); setDeleteDialogOpen(true); }} title="Excluir">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: 'Admin' }, { label: 'Clientes' }]}
      title="Clientes"
      description="Gerencie o cadastro de clientes"
      error={error}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nome, CPF/CNPJ, razão social, cidade ou contato..."
      actions={
        <Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      }
    >
      <DataGrid
        columns={columns}
        data={filtrados}
        total={clientes?.length}
        loading={isLoading}
        loadingText="Carregando clientes..."
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription={clientes?.length === 0 ? 'Crie o primeiro cliente' : 'Tente ajustar a busca'}
        emptyAction={clientes?.length === 0 ? (
          <Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Cliente
          </Button>
        ) : undefined}
        itemLabel="clientes"
      />

      <ClienteFormModal open={modalOpen} onOpenChange={setModalOpen} cliente={clienteEdit} />
      <DeleteClienteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cliente={clienteDelete}
        onConfirm={async () => {
          if (clienteDelete) { await deleteCliente(clienteDelete.id); setDeleteDialogOpen(false); setClienteDelete(null); }
        }}
      />
    </PageShell>
  );
}
