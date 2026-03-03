import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
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

export function GruposPage({ tab }: GruposPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<NivelGrupo | ''>('');
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
    return (grupos || []).filter((g) => {
      if (filtroNivel && g.nivel !== filtroNivel) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (g.codigo || '').toLowerCase().includes(term) || (g.descricao || '').toLowerCase().includes(term);
    });
  }, [grupos, searchTerm, filtroNivel]);

  const columns: DataGridColumn<GrupoProduto>[] = [
    { key: 'codigo', header: 'Código', render: (g) => <span className="font-mono font-medium">{g.codigo || '-'}</span> },
    { key: 'descricao', header: 'Descrição' },
    {
      key: 'nivel', header: 'Nível', render: (g) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nivelColor(g.nivel)}`}>
          {NIVEL_LABELS[g.nivel] || g.nivel}
        </span>
      ),
    },
    { key: 'qtdCaracteres', header: 'Chars', align: 'center', className: 'font-mono' },
    {
      key: 'pathDocumentos', header: 'Path Documentos', render: (g) =>
        g.pathDocumentos ? (
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <FolderOpen className="h-3 w-3" />{g.pathDocumentos}
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'ativo', header: 'Ativo', align: 'center', render: (g) => (
        <Badge variant={g.ativo ? 'default' : 'secondary'} className="text-[10px]">{g.ativo ? 'Sim' : 'Não'}</Badge>
      ),
    },
    {
      key: 'acoes', header: 'Ações', render: (g) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setGrupoEdit(g); setModalOpen(true); }} title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setGrupoDelete(g); setDeleteDialogOpen(true); }} title="Excluir">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const nivelFilters = (
    <div className="flex gap-1">
      {(['', 'Coluna1', 'Coluna2', 'Coluna3'] as (NivelGrupo | '')[]).map((n) => (
        <Button key={n || 'all'} variant={filtroNivel === n ? 'default' : 'outline'} size="sm" onClick={() => setFiltroNivel(n)}>
          {n ? `Coluna ${n.replace('Coluna', '')}` : 'Todos'}
        </Button>
      ))}
    </div>
  );

  return (
    <PageShell
      breadcrumbs={[{ label: 'Engenharia' }, { label: 'Grupos de Produto' }]}
      title="Grupos de Produto"
      description="Gerencie a hierarquia de grupos (Coluna1 → Coluna2 → Coluna3)"
      error={error}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por código ou descrição..."
      extraFilters={nivelFilters}
      actions={
        <Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      }
    >
      <DataGrid
        columns={columns}
        data={filtrados}
        total={grupos?.length}
        loading={isLoading}
        loadingText="Carregando grupos..."
        emptyTitle="Nenhum grupo encontrado"
        emptyDescription={grupos?.length === 0 ? 'Crie o primeiro grupo de produto' : 'Tente ajustar a busca ou filtro'}
        emptyAction={grupos?.length === 0 ? (
          <Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Grupo
          </Button>
        ) : undefined}
        itemLabel="grupos"
      />

      <GrupoFormModal open={modalOpen} onOpenChange={setModalOpen} grupo={grupoEdit} />
      <DeleteGrupoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        grupo={grupoDelete}
        onConfirm={async () => {
          if (grupoDelete) { await deleteGrupo(grupoDelete.id); setDeleteDialogOpen(false); setGrupoDelete(null); }
        }}
      />
    </PageShell>
  );
}
