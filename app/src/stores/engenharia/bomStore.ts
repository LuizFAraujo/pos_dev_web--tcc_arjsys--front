import { create } from 'zustand';
import { mockBOMRelacional, type BOMRelacao } from '@/data/engenharia/mockBOMRelacional';

// ============================================
// TIPOS
// ============================================

/** Item na visualização Tree */
export interface BOMTreeItem {
    codigo: string;
    quantidade: number;
    ordem: string;
    nivel: number;
    hasChildren: boolean;
    children: BOMTreeItem[];
}

// ============================================
// FUNÇÕES DE TRANSFORMAÇÃO
// ============================================

/** Transforma dados relacionais em árvore hierárquica */
export function buildTreeBOM(relacoes: BOMRelacao[], codigoPai: string): BOMTreeItem[] {
    const codigosPai = new Set(relacoes.map(r => r.codigo_pai));
    
    function getFilhos(codigo: string, nivelAtual: number): BOMTreeItem[] {
        return relacoes
            .filter(r => r.codigo_pai === codigo)
            .map(r => ({
                codigo: r.codigo_filho,
                quantidade: r.quantidade,
                ordem: r.ordem,
                nivel: nivelAtual,
                hasChildren: codigosPai.has(r.codigo_filho),
                children: codigosPai.has(r.codigo_filho) ? getFilhos(r.codigo_filho, nivelAtual + 1) : []
            }));
    }
    
    return getFilhos(codigoPai, 2);
}

/** Retorna lista de todos os códigos que são produtos pais (nível 1) */
export function getProdutosPai(relacoes: BOMRelacao[]): string[] {
    const todosFilhos = new Set(relacoes.map(r => r.codigo_filho));
    const todosPais = new Set(relacoes.map(r => r.codigo_pai));
    
    // Produtos que são pais mas nunca são filhos = nível 1
    return Array.from(todosPais).filter(pai => !todosFilhos.has(pai));
}

/** Retorna todos os códigos que TÊM estrutura (aparecem como pai) */
export function getProdutosComEstrutura(relacoes: BOMRelacao[]): string[] {
    const codigosPai = new Set(relacoes.map(r => r.codigo_pai));
    return Array.from(codigosPai);
}

// ============================================
// STORE GLOBAL (apenas dados, sem estado UI)
// ============================================

interface BOMStore {
    relacoes: BOMRelacao[];
    produtosPai: string[];
    produtosComEstrutura: string[];
}

export const useBOMStore = create<BOMStore>(() => ({
    relacoes: mockBOMRelacional,
    produtosPai: getProdutosPai(mockBOMRelacional),
    produtosComEstrutura: getProdutosComEstrutura(mockBOMRelacional)
}));
