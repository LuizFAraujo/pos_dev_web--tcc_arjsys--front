import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, FileText, LayoutGrid, Table, ScanSearch, Search } from 'lucide-react';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useTabState } from '@/hooks/useTabState';
import { PageShell } from '@/components/shared/PageShell';
import { DataGrid } from '@/components/shared/DataGrid';
import type { DataGridColumn } from '@/components/shared/DataGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const TIPO_OPTIONS = [
  { label: 'Fabricado', value: 'Fabricado' },
  { label: 'Comprado', value: 'Comprado' },
  { label: 'Materia Prima', value: 'MateriaPrima' },
  { label: 'Revenda', value: 'Revenda' },
  { label: 'Servico', value: 'Servico' },
];

const SIM_NAO_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Nao', value: 'false' },
];

export function ProdutosPage({ tab }: ProdutosPageProps) {
  const [searchTerm, setSearchTerm] = useTabState(tab.id, '');
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

  useEffect(() => { if (produtos.length === 0) fetchProdutos(); }, [fetchProdutos, produtos.length]);

  const filtrados = useMemo(() => {
    if (!searchTerm) return produtos || [];
    const term = searchTerm.toLowerCase();
    return (produtos || []).filter((p) => p.codigo.toLowerCase().includes(term) || p.descricao.toLowerCase().includes(term));
  }, [produtos, searchTerm]);

  const handleAbrirDesenho = (produto: Produto) => {
    if (produto.temDocumento) alert(`Futuro: Abrir documento do produto ${produto.codigo}`);
  };

  const columns: DataGridColumn<Produto>[] = [
    { key: 'codigo', header: 'Codigo', filterType: 'exact', render: (p) => <span className="font-mono font-medium">{p.codigo}</span> },
    { key: 'descricao', header: 'Descricao', render: (p) => (<div><p className="font-medium">{p.descricao}</p>{p.descricaoCompleta && <p className="line-clamp-1 text-xs text-muted-foreground">{p.descricaoCompleta}</p>}</div>) },
    { key: 'tipo', header: 'Tipo', filterType: 'select', filterOptions: TIPO_OPTIONS, render: (p) => <Badge className={getTipoBadgeClass(p.tipo)}>{TIPO_PRODUTO_LABELS[p.tipo]}</Badge> },
    { key: 'unidade', header: 'UN', filterable: false },
    { key: 'peso', header: 'Peso (kg)', filterType: 'number', render: (p) => p.peso ? p.peso.toFixed(2) : '-' },
    { key: 'temDocumento', header: 'Doc', filterType: 'select', filterOptions: SIM_NAO_OPTIONS, render: (p) => p.temDocumento ? <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => handleAbrirDesenho(p)} title="Ver documento"><FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></Button> : <span className="text-muted-foreground">-</span> },
    { key: 'ativo', header: 'Ativo', filterType: 'select', filterOptions: SIM_NAO_OPTIONS, render: (p) => <Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Sim' : 'Nao'}</Badge> },
    { key: 'acoes', header: 'Acoes', sortable: false, filterable: false, resizable: false, render: (p) => (<div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => { setProdutoEdit(p); setModalOpen(true); }} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600" onClick={() => { setProdutoDelete(p); setDeleteDialogOpen(true); }} title="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button></div>) },
  ];

  return (
    <PageShell
      breadcrumbs={[{ label: 'Engenharia' }, { label: 'Produtos' }]}
      title="Produtos"
      tooltip="Gerencie o cadastro de produtos do sistema"
      headerRight={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => varreduraDocumentos()} title="Varredura"><ScanSearch className="mr-2 h-4 w-4" /> Varredura</Button>
          <div className="flex rounded-md border">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="rounded-r-none"><Table className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('card')} className="rounded-l-none"><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button onClick={() => { setProdutoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Novo Produto</Button>
        </div>
      }
      headerExtra={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por codigo ou descricao..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
      }
      footer={<p className="text-sm text-muted-foreground">{filtrados.length} de {produtos?.length || 0} produtos</p>}
    >
      {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      {viewMode === 'table' ? (
        <DataGrid columns={columns} data={filtrados} loading={isLoading} loadingText="Carregando produtos..." emptyTitle="Nenhum produto encontrado" emptyDescription={produtos?.length === 0 ? 'Comece adicionando seu primeiro produto' : 'Tente ajustar a busca'} emptyAction={produtos?.length === 0 ? <Button onClick={() => { setProdutoEdit(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro</Button> : undefined} />
      ) : (
        <>
          {isLoading ? <div className="flex h-64 items-center justify-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          : filtrados.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtrados.map((p) => <ProdutoCard key={p.id} produto={p} onEdit={(x) => { setProdutoEdit(x); setModalOpen(true); }} onDelete={(x) => { setProdutoDelete(x); setDeleteDialogOpen(true); }} onViewDrawing={handleAbrirDesenho} />)}</div>
          : <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed"><p className="text-lg font-medium">Nenhum produto encontrado</p></div>}
        </>
      )}

      <ProdutoFormModal open={modalOpen} onOpenChange={setModalOpen} produto={produtoEdit} />
      <DeleteProdutoDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} produto={produtoDelete} onConfirm={async () => { if (produtoDelete) { await deleteProduto(produtoDelete.id); setDeleteDialogOpen(false); setProdutoDelete(null); } }} />
    </PageShell>
  );
}
