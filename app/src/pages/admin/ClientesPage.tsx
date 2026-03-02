import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useClientesStore } from '@/stores/admin/clientesStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const filtrados = (clientes || []).filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.nome || '').toLowerCase().includes(term) ||
      (c.cpfCnpj || '').toLowerCase().includes(term) ||
      (c.razaoSocial || '').toLowerCase().includes(term) ||
      (c.cidade || '').toLowerCase().includes(term) ||
      (c.contatoComercial || '').toLowerCase().includes(term)
    );
  });

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Clientes' }]}
        title="Clientes"
        description="Gerencie o cadastro de clientes"
        actions={
          <Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ, razão social ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length > 0 && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Nome</th>
                  <th className="p-3 text-left text-sm font-medium">CPF/CNPJ</th>
                  <th className="p-3 text-left text-sm font-medium">Razão Social</th>
                  <th className="p-3 text-left text-sm font-medium">Cidade/UF</th>
                  <th className="p-3 text-left text-sm font-medium">Telefone</th>
                  <th className="p-3 text-left text-sm font-medium">Contato</th>
                  <th className="p-3 text-left text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((cliente) => (
                  <tr key={cliente.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="p-3 text-sm font-medium">{cliente.nome || '-'}</td>
                    <td className="p-3 text-sm font-mono">{cliente.cpfCnpj || '-'}</td>
                    <td className="p-3 text-sm">{cliente.razaoSocial || '-'}</td>
                    <td className="p-3 text-sm">{[cliente.cidade, cliente.estado].filter(Boolean).join('/') || '-'}</td>
                    <td className="p-3 text-sm">{cliente.telefone || '-'}</td>
                    <td className="p-3 text-sm">{cliente.contatoComercial || '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setClienteEdit(cliente); setModalOpen(true); }} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setClienteDelete(cliente); setDeleteDialogOpen(true); }} title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-muted/30 p-3">
            <p className="text-sm text-muted-foreground">{filtrados.length} de {clientes.length} clientes</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum cliente encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {clientes.length === 0 ? 'Comece criando o primeiro cliente' : 'Tente ajustar a busca'}
          </p>
          {clientes.length === 0 && (
            <Button onClick={() => { setClienteEdit(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Cliente
            </Button>
          )}
        </div>
      )}

      <ClienteFormModal open={modalOpen} onOpenChange={setModalOpen} cliente={clienteEdit} />
      <DeleteClienteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        cliente={clienteDelete}
        onConfirm={async () => {
          if (clienteDelete) {
            await deleteCliente(clienteDelete.id);
            setDeleteDialogOpen(false);
            setClienteDelete(null);
          }
        }}
      />
    </PageWrapper>
  );
}
