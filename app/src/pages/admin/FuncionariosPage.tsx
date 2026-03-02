import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useFuncionariosStore } from '@/stores/admin/funcionariosStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FuncionarioFormModal } from '@/components/admin/FuncionarioFormModal';
import { DeleteFuncionarioDialog } from '@/components/admin/DeleteFuncionarioDialog';
import type { Funcionario } from '@/types/admin/funcionario.types';

interface FuncionariosPageProps {
  tab: { id: string; type: string; title: string };
}

export function FuncionariosPage({ tab }: FuncionariosPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [funcEdit, setFuncEdit] = useState<Funcionario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funcDelete, setFuncDelete] = useState<Funcionario | null>(null);

  const funcionarios = useFuncionariosStore((s) => s.funcionarios);
  const isLoading = useFuncionariosStore((s) => s.isLoading);
  const error = useFuncionariosStore((s) => s.error);
  const fetchFuncionarios = useFuncionariosStore((s) => s.fetchFuncionarios);
  const deleteFuncionario = useFuncionariosStore((s) => s.deleteFuncionario);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const filtrados = (funcionarios || []).filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (f.nome || '').toLowerCase().includes(term) ||
      (f.usuario || '').toLowerCase().includes(term) ||
      (f.cargo || '').toLowerCase().includes(term) ||
      (f.setor || '').toLowerCase().includes(term)
    );
  });

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Admin' }, { label: 'Funcionários' }]}
        title="Funcionários"
        description="Gerencie funcionários do sistema"
        actions={
          <Button onClick={() => { setFuncEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
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
            placeholder="Buscar por nome, usuário, cargo ou setor..."
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
            <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
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
                  <th className="p-3 text-left text-sm font-medium">Usuário</th>
                  <th className="p-3 text-left text-sm font-medium">Cargo</th>
                  <th className="p-3 text-left text-sm font-medium">Setor</th>
                  <th className="p-3 text-left text-sm font-medium">Telefone</th>
                  <th className="p-3 text-left text-sm font-medium">Cidade/UF</th>
                  <th className="p-3 text-left text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((func) => (
                  <tr key={func.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="p-3 text-sm font-medium">{func.nome || '-'}</td>
                    <td className="p-3 text-sm font-mono">{func.usuario || '-'}</td>
                    <td className="p-3 text-sm">{func.cargo || '-'}</td>
                    <td className="p-3 text-sm">{func.setor || '-'}</td>
                    <td className="p-3 text-sm">{func.telefone || '-'}</td>
                    <td className="p-3 text-sm">{[func.cidade, func.estado].filter(Boolean).join('/') || '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setFuncEdit(func); setModalOpen(true); }} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setFuncDelete(func); setDeleteDialogOpen(true); }} title="Excluir">
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
            <p className="text-sm text-muted-foreground">{filtrados.length} de {funcionarios.length} funcionários</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum funcionário encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {funcionarios.length === 0 ? 'Comece criando o primeiro' : 'Tente ajustar a busca'}
          </p>
          {funcionarios.length === 0 && (
            <Button onClick={() => { setFuncEdit(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Funcionário
            </Button>
          )}
        </div>
      )}

      <FuncionarioFormModal open={modalOpen} onOpenChange={setModalOpen} funcionario={funcEdit} />
      <DeleteFuncionarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        funcionario={funcDelete}
        onConfirm={async () => {
          if (funcDelete) {
            await deleteFuncionario(funcDelete.id);
            setDeleteDialogOpen(false);
            setFuncDelete(null);
          }
        }}
      />
    </PageWrapper>
  );
}
