import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
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

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  const filtrados = (grupos || []).filter((g) => {
    if (filtroNivel && g.nivel !== filtroNivel) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (g.codigo || '').toLowerCase().includes(term) ||
      (g.descricao || '').toLowerCase().includes(term)
    );
  });

  const nivelColor = (nivel: NivelGrupo) => {
    switch (nivel) {
      case 'Coluna1': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Coluna2': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Coluna3': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return '';
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[{ label: 'Engenharia' }, { label: 'Grupos de Produto' }]}
        title="Grupos de Produto"
        description="Gerencie a hierarquia de grupos (Coluna1 → Coluna2 → Coluna3)"
        actions={
          <Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        }
      />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-4 mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={filtroNivel === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroNivel('')}
          >
            Todos
          </Button>
          <Button
            variant={filtroNivel === 'Coluna1' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroNivel('Coluna1')}
          >
            Coluna 1
          </Button>
          <Button
            variant={filtroNivel === 'Coluna2' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroNivel('Coluna2')}
          >
            Coluna 2
          </Button>
          <Button
            variant={filtroNivel === 'Coluna3' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroNivel('Coluna3')}
          >
            Coluna 3
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando grupos...</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length > 0 && (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Código</th>
                  <th className="p-3 text-left text-sm font-medium">Descrição</th>
                  <th className="p-3 text-left text-sm font-medium">Nível</th>
                  <th className="p-3 text-center text-sm font-medium">Chars</th>
                  <th className="p-3 text-left text-sm font-medium">Path Documentos</th>
                  <th className="p-3 text-center text-sm font-medium">Ativo</th>
                  <th className="p-3 text-left text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((grupo) => (
                  <tr key={grupo.id} className="border-t transition-colors hover:bg-muted/30">
                    <td className="p-3 text-sm font-mono font-medium">{grupo.codigo || '-'}</td>
                    <td className="p-3 text-sm">{grupo.descricao || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${nivelColor(grupo.nivel)}`}>
                        {NIVEL_LABELS[grupo.nivel] || grupo.nivel}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-center font-mono">{grupo.qtdCaracteres}</td>
                    <td className="p-3 text-sm">
                      {grupo.pathDocumentos ? (
                        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                          <FolderOpen className="h-3 w-3" />
                          {grupo.pathDocumentos}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={grupo.ativo ? 'default' : 'secondary'} className="text-[10px]">
                        {grupo.ativo ? 'Sim' : 'Não'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setGrupoEdit(grupo); setModalOpen(true); }} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setGrupoDelete(grupo); setDeleteDialogOpen(true); }} title="Excluir">
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
            <p className="text-sm text-muted-foreground">{filtrados.length} de {grupos.length} grupos</p>
          </div>
        </div>
      )}

      {!isLoading && filtrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum grupo encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {grupos.length === 0 ? 'Crie o primeiro grupo de produto' : 'Tente ajustar a busca ou filtro'}
          </p>
          {grupos.length === 0 && (
            <Button onClick={() => { setGrupoEdit(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Grupo
            </Button>
          )}
        </div>
      )}

      <GrupoFormModal open={modalOpen} onOpenChange={setModalOpen} grupo={grupoEdit} />
      <DeleteGrupoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        grupo={grupoDelete}
        onConfirm={async () => {
          if (grupoDelete) {
            await deleteGrupo(grupoDelete.id);
            setDeleteDialogOpen(false);
            setGrupoDelete(null);
          }
        }}
      />
    </PageWrapper>
  );
}
