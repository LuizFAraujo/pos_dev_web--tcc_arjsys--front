/**
 * index.ts - Registry centralizado
 * 
 * Exporta funções para buscar configurações de abas
 * de todos os registries do sistema.
 */

import type { TabType } from '@/types/tab.types';
import type { TabConfig } from '@/types/registry.types';
import { cadastrosRegistry } from './cadastrosRegistry';
import { vendasRegistry } from './vendasRegistry';
import { producaoRegistry } from './producaoRegistry';
import { comprasRegistry } from './comprasRegistry';
import { engenhariaRegistry } from './engenhariaRegistry';
import { modelsRegistry } from './modelsRegistry';

/**
 * Busca configuração de uma aba pelo seu tipo
 */
export function getTabConfig(type: TabType): TabConfig | undefined {
    return (
        cadastrosRegistry[type] ||
        vendasRegistry[type] ||
        producaoRegistry[type] ||
        comprasRegistry[type] ||
        engenhariaRegistry[type] ||
        modelsRegistry[type]
    );
}

/**
 * Busca todas as abas de uma categoria específica
 */
export function getTabsByCategory(category: string): Record<string, TabConfig> {
    switch (category) {
        case 'cadastros':
            return cadastrosRegistry;
        case 'vendas':
            return vendasRegistry;
        case 'producao':
            return producaoRegistry;
        case 'compras':
            return comprasRegistry;
        case 'engenharia':
            return engenhariaRegistry;
        case 'models':
            return modelsRegistry;
        default:
            return {};
    }
}

/**
 * Retorna todas as categorias com suas abas
 */
export function getAllCategories() {
    return {
        cadastros: cadastrosRegistry,
        vendas: vendasRegistry,
        producao: producaoRegistry,
        compras: comprasRegistry,
        engenharia: engenhariaRegistry,
        models: modelsRegistry,
    };
}