/**
 * engenhariaRegistry.ts - Registry do módulo Engenharia
 *
 * Registra todas as páginas do setor de Engenharia:
 * - Produtos
 * - Estrutura de Produto (BOM)
 * - Configurações (Fase 7)
 * - Grupos de Produto (Fase 8)
 */

import type { TabRegistry } from '@/types/registry.types';
import { Package, Network, Settings } from 'lucide-react';
import { ProdutosPage } from '@/pages/engenharia/ProdutosPage';
import { BOMPage } from '@/pages/engenharia/BOMPage';
import { ConfiguracoesPage } from '@/pages/engenharia/ConfiguracoesPage';

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
  'eng-configuracoes': {
    defaultTitle: 'Configurações',
    icon: Settings,
    component: ConfiguracoesPage,
    category: 'engenharia',
  },
};
