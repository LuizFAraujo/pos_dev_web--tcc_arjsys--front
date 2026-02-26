import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText, LayoutGrid, Table, ScanSearch } from 'lucide-react';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useTabState } from '@/hooks/useTabState';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProdutoFormModal } from '@/components/engenharia/ProdutoFormModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteProdutoDialog } from '@/components/engenharia/DeleteProdutoDialog';
import { ProdutoCard } from '@/components/engenharia/ProdutoCard';
import type { TipoProduto, Produto } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';

interface ProdutosPageProps {
  tab: {
    id: string;
    type: string;
    title: string;
  };
}

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
    if (produtos.length === 0) {
      fetchProdutos();
    }
  }, [fetchProdutos, produtos.length]);

  const produtosFiltrados = produtos.filter((produto) => {
    const matchSearch =
      produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = tipoFilter === 'all' || produto.tipo === tipoFilter;

    const matchDoc =
      docFilter === 'all' ||
      (docFilter === 'sim' && produto.temDocumento) ||
      (docFilter === 'nao' && !produto.temDocumento);

    return matchSearch && matchTipo && matchDoc;
  });

  const getTipoBadgeClass = (tipo: TipoProduto) => {
    switch (tipo) {
      case 'Fabricado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Comprado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MateriaPrima':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Revenda':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Servico':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleNovoProduto = () => {
    setProdutoEdit(null);
    setModalOpen(true);
  };

  const handleEditarProduto = (produto: Produto) => {
    setProdutoEdit(produto);
    setModalOpen(true);
  };

  const handleAbrirDesenho = (produto: Produto) => {
    if (produto.temDocumento) {
      // TODO: Implementar abertura via path do grupo
      alert(`Futuro: Abrir documento do produto ${produto.codigo}`);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        breadcrumbs={[
          { label: 'Engenharia', href: '#' },
          { label: 'Produtos' },
        ]}
        title="Produtos"
        description="Gerencie o cadastro de produtos do sistema"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => varreduraDocumentos()} title="Varredura de Documentos">
              <ScanSearch className="mr-2 h-4 w-4" />
              Varredura
            </Button>
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-l-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleNovoProduto}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        }
      />

      {/* Erro da API */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mt-4 mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sim">Com documento</SelectItem>
            <SelectItem value="nao">Sem documento</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || tipoFilter !== 'all' || docFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setTipoFilter('all');
              setDocFilter('all');
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      )}

      {/* Lista */}
      {!isLoading && produtosFiltrados.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Código</th>
                      <th className="p-3 text-left text-sm font-medium">Descrição</th>
                      <th className="p-3 text-left text-sm font-medium">Tipo</th>
                      <th className="p-3 text-left text-sm font-medium">UN</th>
                      <th className="p-3 text-left text-sm font-medium">Peso (kg)</th>
                      <th className="p-3 text-left text-sm font-medium">Doc</th>
                      <th className="p-3 text-left text-sm font-medium">Ativo</th>
                      <th className="p-3 text-left text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => (
                      <tr key={produto.id} className="border-t transition-colors hover:bg-muted/30">
                        <td className="p-3 text-sm font-mono font-medium">{produto.codigo}</td>
                        <td className="p-3 text-sm">
                          <div>
                            <p className="font-medium">{produto.descricao}</p>
                            {produto.descricaoCompleta && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {produto.descricaoCompleta}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getTipoBadgeClass(produto.tipo)}>
                            {TIPO_PRODUTO_LABELS[produto.tipo]}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{produto.unidade}</td>
                        <td className="p-3 text-sm">{produto.peso ? produto.peso.toFixed(2) : '-'}</td>
                        <td className="p-3 text-sm">
                          {produto.temDocumento ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                              onClick={() => handleAbrirDesenho(produto)}
                              title="Ver documento"
                            >
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                            {produto.ativo ? 'Sim' : 'Não'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600"
                              onClick={() => handleEditarProduto(produto)}
                              title="Editar produto"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600"
                              onClick={() => {
                                setProdutoDelete(produto);
                                setDeleteDialogOpen(true);
                              }}
                              title="Excluir produto"
                            >
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
                <p className="text-sm text-muted-foreground">
                  Mostrando {produtosFiltrados.length} de {produtos.length} produtos
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {produtosFiltrados.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onEdit={handleEditarProduto}
                    onDelete={(p) => {
                      setProdutoDelete(p);
                      setDeleteDialogOpen(true);
                    }}
                    onViewDrawing={handleAbrirDesenho}
                  />
                ))}
              </div>
              <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">
                  Mostrando {produtosFiltrados.length} de {produtos.length} produtos
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* Vazio */}
      {!isLoading && produtosFiltrados.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="mb-2 text-lg font-medium">Nenhum produto encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {produtos.length === 0 ? 'Comece adicionando seu primeiro produto' : 'Tente ajustar os filtros de busca'}
          </p>
          {produtos.length === 0 && (
            <Button onClick={handleNovoProduto}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      )}

      <ProdutoFormModal open={modalOpen} onOpenChange={setModalOpen} produto={produtoEdit} />
      <DeleteProdutoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        produto={produtoDelete}
        onConfirm={async () => {
          if (produtoDelete) {
            await deleteProduto(produtoDelete.id);
            setDeleteDialogOpen(false);
            setProdutoDelete(null);
          }
        }}
      />
    </PageWrapper>
  );
}
