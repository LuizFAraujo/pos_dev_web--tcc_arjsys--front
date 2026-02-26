/**
 * engenhariaRegistry.ts - Registry do módulo Engenharia
 *
 * Registra todas as páginas do setor de Engenharia:
 * - Produtos (era cadastrosRegistry, agora pertence aqui)
 * - Estrutura de Produto (BOM)
 * - Grupos de Produto (futuro — Fase 8)
 * - Configurações (futuro — Fase 7)
 */

import type { TabRegistry } from '@/types/registry.types';
import { Package, Network } from 'lucide-react';
import { ProdutosPage } from '@/pages/engenharia/ProdutosPage';
import { BOMPage } from '@/pages/engenharia/BOMPage';

export const engenhariaRegistry: TabRegistry = {
  'eng-produtos': {
    defaultTitle: 'Produtos',
    icon: Package,
    component: ProdutosPage,
    category: 'engenharia',
  },
  'eng-estrutura': {
    defaultTitle: 'Estrutura de Produtos',
    icon: Network,
    component: BOMPage,
    category: 'engenharia',
  },
};
