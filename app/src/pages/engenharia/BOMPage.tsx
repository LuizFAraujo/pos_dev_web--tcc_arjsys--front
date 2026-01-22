// ========================================
// PÁGINA - BOM (Bill of Materials)
// ========================================

import { useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useTabState } from '@/hooks/useTabState';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { useProdutosStore } from '@/stores/cadastros/produtosStore';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOMTreeNode } from '@/components/engenharia/BOMTreeNode';
import type { BOMItem } from '@/types/engenharia/bom.types';

interface BOMPageProps {
    tab: {
        id: string;
        type: string;
        title: string;
    };
}

export function BOMPage({ tab }: BOMPageProps) {
    const [selectedProdutoId, setSelectedProdutoId] = useTabState(tab.id, '');

    const bomStructure = useBOMStore((state) => state.bomStructure);
    const expandedNodes = useBOMStore((state) => state.expandedNodes);
    const isLoading = useBOMStore((state) => state.isLoading);
    const error = useBOMStore((state) => state.error);
    const loadBOM = useBOMStore((state) => state.loadBOM);
    const clearBOM = useBOMStore((state) => state.clearBOM);
    const toggleNode = useBOMStore((state) => state.toggleNode);
    const expandAll = useBOMStore((state) => state.expandAll);
    const collapseAll = useBOMStore((state) => state.collapseAll);

    const produtos = useProdutosStore((state) => state.produtos);
    const loadProdutos = useProdutosStore((state) => state.loadProdutos);

    useEffect(() => {
        if (produtos.length === 0) {
            loadProdutos();
        }
    }, [loadProdutos, produtos.length]);

    useEffect(() => {
        if (selectedProdutoId) {
            loadBOM(selectedProdutoId);
        } else {
            clearBOM();
        }
    }, [selectedProdutoId, loadBOM, clearBOM]);

    const produtosFabricados = produtos.filter((p) => p.tipo === 'FABRICADO');

    const handleAddRootItem = () => {
        console.log('Adicionar item raiz');
        // TODO: Abrir modal
    };

    const handleAddChild = (parent: BOMItem) => {
        console.log('Adicionar filho de:', parent.codigo);
        // TODO: Abrir modal
    };

    const handleEdit = (item: BOMItem) => {
        console.log('Editar item:', item.codigo);
        // TODO: Abrir modal
    };

    const handleDelete = (item: BOMItem) => {
        console.log('Deletar item:', item.codigo);
        // TODO: Abrir dialog confirmação
    };

    return (
        <PageWrapper>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <PageHeader
                        breadcrumbs={[
                            { label: 'Engenharia', href: '#' },
                            { label: 'Estrutura de Produtos' }
                        ]}
                        title="Estrutura de Produtos (BOM)"
                        description="Visualize e gerencie a estrutura de materiais dos produtos"
                    />

                    {/* Seleção de Produto */}
                    <div className="mt-4 mb-6 flex items-center gap-4">
                        <div className="flex-1 max-w-md">
                            <label className="text-sm font-medium mb-2 block">
                                Selecione um Produto Fabricado:
                            </label>
                            <Select value={selectedProdutoId} onValueChange={setSelectedProdutoId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha um produto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {produtosFabricados.map((produto) => (
                                        <SelectItem key={produto.id} value={produto.id}>
                                            {produto.codigo} - {produto.descricaoCurta}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {bomStructure && (
                            <div className="flex gap-2 mt-6">
                                <Button variant="outline" size="sm" onClick={expandAll}>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Expandir Tudo
                                </Button>
                                <Button variant="outline" size="sm" onClick={collapseAll}>
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                    Colapsar Tudo
                                </Button>
                                <Button size="sm" onClick={handleAddRootItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Item
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <p className="text-sm text-muted-foreground">Carregando estrutura...</p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && !isLoading && (
                        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Árvore BOM */}
                    {bomStructure && !isLoading && !error && (
                        <div className="rounded-lg border bg-card">
                            {/* Header da tabela */}
                            <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 border-b font-medium text-sm">
                                <div className="w-6" /> {/* Espaço botão expand */}
                                <div className="w-4" /> {/* Espaço ícone */}
                                <div className="w-8 text-center">Seq</div>
                                <div className="w-24">Código</div>
                                <div className="flex-1">Descrição</div>
                                <div className="w-24">Tipo</div>
                                <div className="w-20 text-right">Quantidade</div>
                                <div className="w-48">Ações</div>
                            </div>

                            {/* Produto Pai (Nível 1) */}
                            <div className="border-b bg-blue-50 dark:bg-blue-950">
                                <div className="flex items-center gap-2 py-3 px-3">
                                    <div className="w-6" />
                                    <div className="w-4" />
                                    <div className="w-8" />
                                    <span className="font-mono text-sm font-bold w-24">
                                        {bomStructure.codigoProduto}
                                    </span>
                                    <span className="text-sm font-bold flex-1">
                                        {bomStructure.descricaoProduto}
                                    </span>
                                    <div className="w-24 text-center">
                                        <span className="text-xs bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                            PRODUTO FINAL
                                        </span>
                                    </div>
                                    <div className="w-20" />
                                    <div className="w-48" />
                                </div>
                            </div>

                            {/* Itens da estrutura */}
                            <div>
                                {bomStructure.items.map((item) => (
                                    <BOMTreeNode
                                        key={item.id}
                                        item={item}
                                        isExpanded={expandedNodes.has(item.id)}
                                        onToggle={toggleNode}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAddChild={handleAddChild}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!selectedProdutoId && !isLoading && (
                        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                            <p className="mb-2 text-lg font-medium">Nenhum produto selecionado</p>
                            <p className="text-sm text-muted-foreground">
                                Selecione um produto fabricado para visualizar sua estrutura
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer fixo (se tiver estrutura) */}
                {bomStructure && !isLoading && (
                    <div className="shrink-0 border-t bg-background p-3">
                        <p className="text-sm text-muted-foreground">
                            Estrutura: {bomStructure.codigoProduto} • {bomStructure.items.length} itens de nível 2 •
                            Atualizado em {bomStructure.updatedAt.toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}