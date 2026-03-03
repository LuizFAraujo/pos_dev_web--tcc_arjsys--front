import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, FileText, LayoutGrid, Table, ScanSearch } from 'lucide-react';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProdutoFormModal } from '@/components/engenharia/ProdutoFormModal';
import { DeleteProdutoDialog } from '@/components/engenharia/DeleteProdutoDialog';
import { ProdutoCard } from '@/components/engenharia/ProdutoCard';
import type { TipoProduto, Produto } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';

interface ProdutosPageProps {
  tab: { id: string; type: string; title: string };
}

const getTipoBadgeClass = (tipo: TipoProduto) => {
  switch (tipo) {
    case 'Fabricado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Comprado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'MateriaPrima': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'Revenda': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Servico': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export function ProdutosPage({ tab }: ProdutosPageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');
  const [tipoFilter, setTipoFilter] = useTabState(tab.id + '-tipo', 'all');
  const [docFilter, setDocFilter] = useTabState(tab.id + '-doc', 'all');
  const [viewMode, setViewMode] = useTabState<'table' | 'card'>(tab.id + '-view', 'table');

  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState<Produto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoDelete, setProdutoDelete] = useState<Produto | null>(null);

  const produtos = useProdutosStore((s) => s.produtos);
  const isLoading = useProdutosStore((s) => s.isLoading);
  const error = useProdutosStore((s) => s.error);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);
  const deleteProduto = useProdutosStore((s) => s.deleteProduto);
  const varreduraDocumentos = useProdutosStore((s) => s.varreduraDocumentos);

  useEffect(() => {
    if (produtos.length === 0) fetchProdutos();
  }, [fetchProdutos, produtos.length]);

  const filtrados = useMemo(() => {
    return (produtos || []).filter((p) => {
      const matchSearch = !searchTerm ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = tipoFilter === 'all' || p.tipo === tipoFilter;
      const matchDoc = docFilter === 'all' || (docFilter === 'sim' && p.temDocumento) || (docFilter === 'nao' && !p.temDocumento);
      return matchSearch && matchTipo && matchDoc;
    });
  }, [produtos, searchTerm, tipoFilter, docFilter]);

  const handleAbrirDesenho = (produto: Produto) => {
    if (produto.temDocumento) {
      alert(`Futuro: Abrir documento do produto ${produto.codigo}`);
    }
  };

  const columns: DataGridColumn<Produto>[] = [
    { key: 'codigo', header: 'Código', render: (p) => <span className="font-mono font-medium">{p.codigo}</span> },
    {
      key: 'descricao', header: 'Descrição', render: (p) => (
        <div>
          <p className="font-medium">{p.descricao}</p>
          {p.descricaoCompleta && <p className="line-clamp-1 text-xs text-muted-foreground">{p.descricaoCompleta}</p>}
        </div>
      ),
    },
    { key: 'tipo', header: 'Tipo', render: (p) => <Badge className={getTipoBadgeClass(p.tipo)}>{TIPO_PRODUTO_LABELS[p.tipo]}</Badge> },
    { key: 'unidade', header: 'UN' },
    { key: 'peso', header: 'Peso (kg)', render: (p) => p.peso ? p.peso.toFixed(2) : '-' },
    {
      key: 'doc', header: 'Doc', render: (p) => p.temDocumento ? (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => handleAbrirDesenho(p)} title="Ver documento">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </Button>
      ) : <span className="text-muted-foreground">-</span>,
    },
    { key: 'ativo', header: 'Ativo', render: (p) => <Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Sim' : 'Não'}</Badge> },
    {
      key: 'acoes', header: 'Ações', render: (p) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600" onClick={() => { setProdutoEdit(p); setModalOpen(true); }} title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setProdutoDelete(p); setDeleteDialogOpen(true); }} title="Excluir">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const extraFilters = (
    <>
      <Select value={tipoFilter} onValueChange={setTipoFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="Fabricado">Fabricado</SelectItem>
          <SelectItem value="Comprado">Comprado</SelectItem>
          <SelectItem value="MateriaPrima">Matéria Prima</SelectItem>
          <SelectItem value="Revenda">Revenda</SelectItem>
          <SelectItem value="Servico">Serviço</SelectItem>
        </SelectContent>
      </Select>
      <Select value={docFilter} onValueChange={setDocFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Documento" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="sim">Com documento</SelectItem>
          <SelectItem value="nao">Sem documento</SelectItem>
        </SelectContent>
      </Select>
      {(searchTerm || tipoFilter !== 'all' || docFilter !== 'all') && (
        <Button variant="outline" onClick={() => { setSearchTerm(''); setTipoFilter('all'); setDocFilter('all'); }}>
          Limpar Filtros
        </Button>
      )}
    </>
  );

  return (
    <PageShell
      breadcrumbs={[{ label: 'Engenharia', href: '#' }, { label: 'Produtos' }]}
      title="Produtos"
      description="Gerencie o cadastro de produtos do sistema"
      error={error}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por código ou descrição..."
      extraFilters={extraFilters}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => varreduraDocumentos()} title="Varredura de Documentos">
            <ScanSearch className="mr-2 h-4 w-4" /> Varredura
          </Button>
          <div className="flex rounded-md border">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-r-none">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('card')} className="rounded-l-none">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => { setProdutoEdit(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      }
    >
      {viewMode === 'table' ? (
        <DataGrid
          columns={columns}
          data={filtrados}
          total={produtos?.length}
          loading={isLoading}
          loadingText="Carregando produtos..."
          emptyTitle="Nenhum produto encontrado"
          emptyDescription={produtos?.length === 0 ? 'Comece adicionando seu primeiro produto' : 'Tente ajustar os filtros de busca'}
          emptyAction={produtos?.length === 0 ? (
            <Button onClick={() => { setProdutoEdit(null); setModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro Produto
            </Button>
          ) : undefined}
          itemLabel="produtos"
        />
      ) : (
        <>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filtrados.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onEdit={(p) => { setProdutoEdit(p); setModalOpen(true); }}
                    onDelete={(p) => { setProdutoDelete(p); setDeleteDialogOpen(true); }}
                    onViewDrawing={handleAbrirDesenho}
                  />
                ))}
              </div>
              <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">Mostrando {filtrados.length} de {produtos.length} produtos</p>
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="mb-2 text-lg font-medium">Nenhum produto encontrado</p>
            </div>
          )}
        </>
      )}

      <ProdutoFormModal open={modalOpen} onOpenChange={setModalOpen} produto={produtoEdit} />
      <DeleteProdutoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        produto={produtoDelete}
        onConfirm={async () => {
          if (produtoDelete) { await deleteProduto(produtoDelete.id); setDeleteDialogOpen(false); setProdutoDelete(null); }
        }}
      />
    </PageShell>
  );
}
