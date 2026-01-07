/**
 * registries/index.ts - Registry Pattern principal
 * 
 * Centraliza todos os registries de módulos e fornece
 * funções helper para buscar configurações de abas.
 */

import type { TabType } from '@/types/tab.types';
import type { TabConfig, TabRegistry } from '@/types/registry.types';
import { cadastrosRegistry } from './cadastrosRegistry';
import { vendasRegistry } from './vendasRegistry';
import { producaoRegistry } from './producaoRegistry';
import { comprasRegistry } from './comprasRegistry';
import { engenhariaRegistry } from './engenhariaRegistry';
import { modelsRegistry } from './modelsRegistry';

/**
 * Registry global - união de todos os registries de módulos
 */
const globalRegistry: TabRegistry = {
    ...cadastrosRegistry,
    ...vendasRegistry,
    ...producaoRegistry,
    ...comprasRegistry,
    ...engenhariaRegistry,
    ...modelsRegistry,
};

/**
 * getTabConfig - Busca configuração de uma aba pelo tipo
 * 
 * @param type - Tipo da aba
 * @returns Configuração da aba ou undefined se não encontrado
 */
export function getTabConfig(type: TabType): TabConfig | undefined {
    return globalRegistry[type];
}

/**
 * getTabsByCategory - Busca todas as abas de uma categoria
 * 
 * @param category - Nome da categoria
 * @returns Registry filtrado com abas da categoria
 */
export function getTabsByCategory(category: string): TabRegistry {
    const filtered: TabRegistry = {};

    Object.entries(globalRegistry).forEach(([type, config]) => {
        if (config && config.category === category) {
            filtered[type as TabType] = config;
        }
    });

    return filtered;
}

/**
 * getAllCategories - Retorna lista de todas as categorias disponíveis
 * 
 * @returns Array com nomes das categorias
 */
export function getAllCategories(): string[] {
    const categories = new Set<string>();

    Object.values(globalRegistry).forEach((config) => {
        if (config) {
            categories.add(config.category);
        }
    });

    return Array.from(categories);
}

// Exports dos registries individuais (para uso interno)
export {
    cadastrosRegistry,
    vendasRegistry,
    producaoRegistry,
    comprasRegistry,
    engenhariaRegistry,
    modelsRegistry,
};