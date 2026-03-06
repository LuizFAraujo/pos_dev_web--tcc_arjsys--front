import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useFuncionariosStore } from '@/stores/admin/funcionariosStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FuncionarioFormModal } from '@/components/admin/FuncionarioFormModal';
import { DeleteFuncionarioDialog } from '@/components/admin/DeleteFuncionarioDialog';
import type { Funcionario } from '@/types/admin/funcionario.types';

interface FuncionariosPageProps {
  tab: { id: string; type: string; title: string };
}

export function FuncionariosPage({ tab }: FuncionariosPageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');
  const [modalOpen, setModalOpen] = useState(false);
  const [funcEdit, setFuncEdit] = useState<Funcionario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funcDelete, setFuncDelete] = useState<Funcionario | null>(null);

  const funcionarios = useFuncionariosStore((s) => s.funcionarios);
  const isLoading = useFuncionariosStore((s) => s.isLoading);
  const error = useFuncionariosStore((s) => s.error);
  const fetchFuncionarios = useFuncionariosStore((s) => s.fetchFuncionarios);
  const deleteFuncionario = useFuncionariosStore((s) => s.deleteFuncionario);

  useEffect(() => { fetchFuncionarios(); }, [fetchFuncionarios]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return funcionarios || [];
    const term = searchTerm.toLowerCase();
    return (funcionarios || []).filter((f) =>
      (f.nome || '').toLowerCase().includes(term) ||
      (f.usuario || '').toLowerCase().includes(term) ||
      (f.cargo || '').toLowerCase().includes(term) ||
      (f.setor || '').toLowerCase().includes(term)
    );
  }, [funcionarios, searchTerm]);

  const columns: DataGridColumn<Funcionario>[] = [
    { key: 'nome', header: 'Nome', render: (f) => <span className="font-medium">{f.nome || '-'}</span> },
    { key: 'usuario', header: 'Usuário', className: 'font-mono', filterType: 'exact' },
    { key: 'cargo', header: 'Cargo' },
    { key: 'setor', header: 'Setor' },
    { key: 'telefone', header: 'Telefone', filterable: false },
    { key: 'cidade', header: 'Cidade/UF', render: (f) => f.cidade ? `${f.cidade}${f.estado ? '/' + f.estado : ''}` : '-' },
    {
      key: 'acoes', header: 'Ações', sortable: false, filterable: false, resizable: false,
      render: (f) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setFuncEdit(f); setModalOpen(true); }} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setFuncDelete(f); setDeleteDialogOpen(true); }} title="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: 'Admin' }, { label: 'Funcionários' }]}
      title="Funcionários"
      tooltip="Gerencie o cadastro de funcionários"
      headerRight={
        <Button onClick={() => { setFuncEdit(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
        </Button>
      }
      headerExtra={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, usuário, cargo ou setor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      }
      footer={<p className="text-sm text-muted-foreground">{filtrados.length} de {funcionarios?.length || 0} funcionários</p>}
    >
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      <DataGrid
        columns={columns}
        data={filtrados}
        loading={isLoading}
        loadingText="Carregando funcionários..."
        emptyTitle="Nenhum funcionário encontrado"
        emptyDescription={funcionarios?.length === 0 ? 'Crie o primeiro funcionário' : 'Tente ajustar a busca'}
        emptyAction={funcionarios?.length === 0 ? <Button onClick={() => { setFuncEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Criar Primeiro</Button> : undefined}
      />

      <FuncionarioFormModal open={modalOpen} onOpenChange={setModalOpen} funcionario={funcEdit} />
      <DeleteFuncionarioDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} funcionario={funcDelete}
        onConfirm={async () => { if (funcDelete) { await deleteFuncionario(funcDelete.id); setDeleteDialogOpen(false); setFuncDelete(null); } }}
      />
    </PageShell>
  );
}
