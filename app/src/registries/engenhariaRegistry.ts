/**
 * engenhariaRegistry.ts - Registry do módulo Engenharia
 * 
 * Registra todas as páginas do módulo de engenharia:
 * - Estrutura de Produto (BOM)
 * - Roteiro de Fabricação
 */

import type { TabRegistry } from '@/types/registry.types';
import { Network } from 'lucide-react';
import { BOMPage } from '@/pages/engenharia/BOMPage';

export const engenhariaRegistry: TabRegistry = {
    'estrutura-produto': {
        defaultTitle: 'Estrutura de Produtos',
        icon: Network,
        component: BOMPage,
        category: 'engenharia',
    },
};