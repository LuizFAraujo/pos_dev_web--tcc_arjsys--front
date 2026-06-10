/**
 * engenhariaRegistry.ts - Registry do módulo Engenharia
 *
 * Registra todas as páginas do setor de Engenharia:
 * - Produtos
 * - Estrutura de Produto (BOM)
 * - Liberação de Projetos
 * - Configurações
 * - Grupos de Produto
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import type { TabRegistry } from '@/types/registry.types';
import { Package, Network, Settings, FolderTree, Rocket } from 'lucide-react';

const ProdutosPage = lazy(() =>
  import('@/pages/engenharia/ProdutosPage').then((m) => ({ default: m.ProdutosPage })),
);
const BOMPage = lazy(() =>
  import('@/pages/engenharia/BOMPage').then((m) => ({ default: m.BOMPage })),
);
const ConfiguracoesPage = lazy(() =>
  import('@/pages/engenharia/ConfiguracoesPage').then((m) => ({ default: m.ConfiguracoesPage })),
);
const GruposPage = lazy(() =>
  import('@/pages/engenharia/GruposPage').then((m) => ({ default: m.GruposPage })),
);
const LiberacaoProjetosPage = lazy(() =>
  import('@/pages/engenharia/LiberacaoProjetosPage').then((m) => ({ default: m.LiberacaoProjetosPage })),
);

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
  'eng-liberacao-projetos': {
    defaultTitle: 'Liberação de Projetos',
    icon: Rocket,
    component: LiberacaoProjetosPage,
    category: 'engenharia',
  },
  'eng-configuracoes': {
    defaultTitle: 'Configurações',
    icon: Settings,
    component: ConfiguracoesPage,
    category: 'engenharia',
  },
  'eng-grupos': {
    defaultTitle: 'Grupos de Produto',
    icon: FolderTree,
    component: GruposPage,
    category: 'engenharia',
  },
};
