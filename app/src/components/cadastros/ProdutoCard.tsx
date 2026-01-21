import { Pencil, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Produto, TipoProduto } from '@/types/cadastros/produto.types';

interface ProdutoCardProps {
    produto: Produto;
    onEdit: (produto: Produto) => void;
    onDelete: (produto: Produto) => void;
    onViewDrawing: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onEdit, onDelete, onViewDrawing }: ProdutoCardProps) {
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

    return (
        <div className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="font-mono text-sm font-semibold">{produto.codigo}</p>
                        <Badge className={getTipoBadgeClass(produto.tipo)}>
                            {formatTipo(produto.tipo)}
                        </Badge>
                    </div>

                    <h3 className="font-medium text-sm mb-1">{produto.descricaoCurta}</h3>

                    {produto.descricaoCompleta && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {produto.descricaoCompleta}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>UN: {produto.unidade}</span>
                        {produto.pesoEstimado && <span>Peso: {produto.pesoEstimado.toFixed(2)} kg</span>}
                        {produto.tempoFabricacao && <span>Tempo: {produto.tempoFabricacao}h</span>}
                    </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {produto.possuiDesenho && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => onViewDrawing(produto)}
                            title="Ver desenho técnico"
                        >
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => onEdit(produto)}
                        title="Editar produto"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => onDelete(produto)}
                        title="Excluir produto"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}