import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, Search } from 'lucide-react';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GrupoFormModal } from '@/components/engenharia/GrupoFormModal';
import { DeleteGrupoDialog } from '@/components/engenharia/DeleteGrupoDialog';
import { NIVEL_LABELS } from '@/types/engenharia/grupo.types';
import type { GrupoProduto, NivelGrupo } from '@/types/engenharia/grupo.types';

interface GruposPageProps {
  tab: { id: string; type: string; title: string };
}

const nivelColor = (nivel: NivelGrupo) => {
  switch (nivel) {
    case 'Coluna1': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Coluna2': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Coluna3': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default: return '';
  }
};

const NIVEL_OPTIONS = [
  { label: 'Coluna 1 (Grupo)', value: 'Coluna1' },
  { label: 'Coluna 2 (Subgrupo)', value: 'Coluna2' },
  { label: 'Coluna 3 (Familia)', value: 'Coluna3' },
];

const ATIVO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Nao', value: 'false' },
];

export function GruposPage({ tab }: GruposPageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');
  const [modalOpen, setModalOpen] = useState(false);
  const [grupoEdit, setGrupoEdit] = useState<GrupoProduto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grupoDelete, setGrupoDelete] = useState<GrupoProduto | null>(null);

  const grupos = useGruposStore((s) => s.grupos);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchGrupos = useGruposStore((s) => s.fetchGrupos);
  const deleteGrupo = useGruposStore((s) => s.deleteGrupo);

  useEffect(() => { fetchGrupos(); }, [fetchGrupos]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return grupos || [];
    const term = searchTerm.toLowerCase();
    return (grupos || []).filter((g) => (g.codigo || '').toLowerCase().includes(term) || (g.descricao || '').toLowerCase().includes(term));
  }, [grupos, searchTerm]);

  const columns: DataGridColumn<GrupoProduto>[] = [
    { key: 'codigo', header: 'Codigo', filterType: 'exact', render: (g) => <span className="font-mono font-medium">{g.codigo || '-'}</span> },
    { key: 'descricao', header: 'Descricao' },
    { key: 'nivel', header: 'Nivel', filterType: 'select', filterOptions: NIVEL_OPTIONS, render: (g) => <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nivelColor(g.nivel)}`}>{NIVEL_LABELS[g.nivel] || g.nivel}</span> },
    { key: 'qtdCaracteres', header: 'Chars', align: 'center', className: 'font-mono', filterType: 'number' },
    { key: 'pathDocumentos', header: 'Path Documentos', render: (g) => g.pathDocumentos ? <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground"><FolderOpen className="h-3 w-3" />{g.pathDocumentos}</div> : <span className="text-xs text-muted-foreground">-</span> },
    { key: 'ativo', header: 'Ativo', align: 'center', filterType: 'select', filterOptions: ATIVO_OPTIONS, render: (g) => <Badge variant={g.ativo ? 'default' : 'secondary'} className="text-[10px]">{g.ativo ? 'Sim' : 'Nao'}</Badge> },
    { key: 'acoes', header: 'Acoes', sortable: false, filterable: false, resizable: false, render: (g) => (<div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setGrupoEdit(g); setModalOpen(true); }} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setGrupoDelete(g); setDeleteDialogOpen(true); }} title="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button></div>) },
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: 'Engenharia' }, { label: 'Grupos de Produto' }]}
      title="Grupos de Produto"
      tooltip="Gerencie a hierarquia de grupos (Coluna1 > Coluna2 > Coluna3)"
      headerRight={<Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Grupo</Button>}
      headerExtra={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por codigo ou descricao..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      }
      footer={<p className="text-sm text-muted-foreground">{filtrados.length} de {grupos?.length || 0} grupos</p>}
    >
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      <DataGrid columns={columns} data={filtrados} loading={isLoading} loadingText="Carregando grupos..." emptyTitle="Nenhum grupo encontrado"
        emptyDescription={grupos?.length === 0 ? 'Crie o primeiro grupo de produto' : 'Tente ajustar a busca'}
        emptyAction={grupos?.length === 0 ? <Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Criar Primeiro Grupo</Button> : undefined}
      />

      <GrupoFormModal open={modalOpen} onOpenChange={setModalOpen} grupo={grupoEdit} />
      <DeleteGrupoDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} grupo={grupoDelete}
        onConfirm={async () => { if (grupoDelete) { await deleteGrupo(grupoDelete.id); setDeleteDialogOpen(false); setGrupoDelete(null); } }}
      />
    </PageShell>
  );
}
