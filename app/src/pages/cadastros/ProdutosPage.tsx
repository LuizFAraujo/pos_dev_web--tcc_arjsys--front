import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';
import { useProdutosStore } from '@/stores/cadastros/produtosStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProdutoFormModal } from '@/components/cadastros/ProdutoFormModal';
import type { TipoProduto, Produto } from '@/types/cadastros/produto.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteProdutoDialog } from '@/components/cadastros/DeleteProdutoDialog';

export function ProdutosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [tipoFilter, setTipoFilter] = useState<string>('all');
    const [desenhoFilter, setDesenhoFilter] = useState<string>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [produtoEdit, setProdutoEdit] = useState<Produto | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [produtoDelete, setProdutoDelete] = useState<Produto | null>(null);

    const produtos = useProdutosStore((state) => state.produtos);
    const isLoading = useProdutosStore((state) => state.isLoading);
    const loadProdutos = useProdutosStore((state) => state.loadProdutos);
    const deleteProduto = useProdutosStore((state) => state.deleteProduto);


    useEffect(() => {
        if (produtos.length === 0) {
            loadProdutos();
        }
    }, [loadProdutos, produtos.length]);

    const produtosFiltrados = produtos.filter((produto) => {
        const matchSearch =
            produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            produto.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase());

        const matchTipo = tipoFilter === 'all' || produto.tipo === tipoFilter;

        const matchDesenho =
            desenhoFilter === 'all' ||
            (desenhoFilter === 'sim' && produto.possuiDesenho) ||
            (desenhoFilter === 'nao' && !produto.possuiDesenho);

        return matchSearch && matchTipo && matchDesenho;
    });

    const getTipoBadgeClass = (tipo: TipoProduto) => {
        switch (tipo) {
            case 'FABRICADO':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'COMPRADO':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'MATERIA_PRIMA':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const formatTipo = (tipo: TipoProduto) => {
        return tipo.replace('_', ' ');
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
        if (produto.caminhoDesenho) {
            // TODO: Implementar abertura do arquivo
            console.log('Abrir desenho:', produto.caminhoDesenho);
            alert(`Futuro: Abrir ${produto.caminhoDesenho}`);
        }
    };

    return (
        <PageWrapper>
            <PageHeader
                breadcrumbs={[
                    { label: 'Cadastros', href: '#' },
                    { label: 'Produtos' }
                ]}
                title="Produtos"
                description="Gerencie o cadastro de produtos do sistema"
                actions={
                    <Button onClick={handleNovoProduto}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Produto
                    </Button>
                }
            />

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
                        <SelectItem value="FABRICADO">Fabricado</SelectItem>
                        <SelectItem value="COMPRADO">Comprado</SelectItem>
                        <SelectItem value="MATERIA_PRIMA">Matéria-Prima</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={desenhoFilter} onValueChange={setDesenhoFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Desenho" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="sim">Com desenho</SelectItem>
                        <SelectItem value="nao">Sem desenho</SelectItem>
                    </SelectContent>
                </Select>

                {(searchTerm || tipoFilter !== 'all' || desenhoFilter !== 'all') && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm('');
                            setTipoFilter('all');
                            setDesenhoFilter('all');
                        }}
                    >
                        Limpar Filtros
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                    </div>
                </div>
            )}

            {!isLoading && produtosFiltrados.length > 0 && (
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
                                    <th className="p-3 text-left text-sm font-medium">Tempo (h)</th>
                                    <th className="p-3 text-left text-sm font-medium">Desenho</th>
                                    <th className="p-3 text-left text-sm font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosFiltrados.map((produto) => (
                                    <tr
                                        key={produto.id}
                                        className="border-t transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 text-sm font-mono font-medium">
                                            {produto.codigo}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <div>
                                                <p className="font-medium">{produto.descricaoCurta}</p>
                                                {produto.descricaoCompleta && (
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {produto.descricaoCompleta}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getTipoBadgeClass(produto.tipo)}>
                                                {formatTipo(produto.tipo)}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm">{produto.unidade}</td>
                                        <td className="p-3 text-sm">
                                            {produto.pesoEstimado ? produto.pesoEstimado.toFixed(2) : '-'}
                                        </td>
                                        <td className="p-3 text-sm">{produto.tempoFabricacao || '-'}</td>
                                        <td className="p-3 text-sm">
                                            {produto.possuiDesenho ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                                    onClick={() => handleAbrirDesenho(produto)}
                                                    title="Ver desenho técnico"
                                                >
                                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={() => handleEditarProduto(produto)}
                                                    title="Editar produto"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
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
            )}

            {!isLoading && produtosFiltrados.length === 0 && (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                    <p className="mb-2 text-lg font-medium">Nenhum produto encontrado</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {produtos.length === 0
                            ? 'Comece adicionando seu primeiro produto'
                            : 'Tente ajustar os filtros de busca'}
                    </p>
                    {produtos.length === 0 && (
                        <Button onClick={handleNovoProduto}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Primeiro Produto
                        </Button>
                    )}
                </div>
            )}

            <ProdutoFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                produto={produtoEdit}
            />
            <DeleteProdutoDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                produto={produtoDelete}
                onConfirm={() => {
                    if (produtoDelete) {
                        deleteProduto(produtoDelete.id);
                        setDeleteDialogOpen(false);
                        setProdutoDelete(null);
                    }
                }}
            />
        </PageWrapper>
    );
}