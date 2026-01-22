// ========================================
// COMPONENTE - NÓ DA ÁRVORE BOM
// ========================================

import { ChevronRight, ChevronDown, Package, ShoppingCart, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BOMItem, TipoItem } from '@/types/engenharia/bom.types';

interface BOMTreeNodeProps {
    item: BOMItem;
    isExpanded: boolean;
    onToggle: (id: string) => void;
    onEdit?: (item: BOMItem) => void;
    onDelete?: (item: BOMItem) => void;
    onAddChild?: (parentItem: BOMItem) => void;
}

export function BOMTreeNode({ item, isExpanded, onToggle, onEdit, onDelete, onAddChild }: BOMTreeNodeProps) {
    const hasChildren = item.children && item.children.length > 0;
    const indentLevel = item.nivel - 2; // Nível 2 = indent 0

    const getTipoIcon = (tipo: TipoItem) => {
        switch (tipo) {
            case 'FABRICADO':
                return <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
            case 'COMPRADO':
                return <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />;
            case 'MATERIA_PRIMA':
                return <Boxes className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
        }
    };

    const getTipoBadgeClass = (tipo: TipoItem) => {
        switch (tipo) {
            case 'FABRICADO':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'COMPRADO':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'MATERIA_PRIMA':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        }
    };

    const formatTipo = (tipo: TipoItem) => {
        return tipo.replace('_', ' ');
    };

    return (
        <div>
            {/* Linha do item */}
            <div
                className="group flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md transition-colors"
                style={{ paddingLeft: `${indentLevel * 24 + 12}px` }}
            >
                {/* Botão Expandir/Colapsar */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onToggle(item.id)}
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )
                    ) : (
                        <span className="w-4" />
                    )}
                </Button>

                {/* Ícone Tipo */}
                <div className="shrink-0">{getTipoIcon(item.tipo)}</div>

                {/* Sequência */}
                <span className="text-xs text-muted-foreground font-mono w-8 text-center shrink-0">
                    {item.sequencia}
                </span>

                {/* Código */}
                <span className="font-mono text-sm font-medium w-24 shrink-0">{item.codigo}</span>

                {/* Descrição */}
                <span className="text-sm flex-1 min-w-0 truncate">{item.descricao}</span>

                {/* Badge Tipo */}
                <Badge className={`${getTipoBadgeClass(item.tipo)} text-xs shrink-0`}>
                    {formatTipo(item.tipo)}
                </Badge>

                {/* Quantidade */}
                <div className="text-sm font-medium w-20 text-right shrink-0">
                    {item.quantidade} {item.unidade}
                </div>

                {/* Ações (aparecem no hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {item.tipo === 'FABRICADO' && onAddChild && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => onAddChild(item)}
                            title="Adicionar componente"
                        >
                            + Sub
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => onEdit(item)}
                            title="Editar item"
                        >
                            Editar
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => onDelete(item)}
                            title="Remover item"
                        >
                            Remover
                        </Button>
                    )}
                </div>
            </div>

            {/* Renderização recursiva dos filhos */}
            {hasChildren && isExpanded && (
                <div>
                    {item.children!.map((child) => (
                        <BOMTreeNode
                            key={child.id}
                            item={child}
                            isExpanded={isExpanded}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}