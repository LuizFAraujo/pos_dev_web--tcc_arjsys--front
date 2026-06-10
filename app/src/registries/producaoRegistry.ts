/**
 * producaoRegistry.ts - Registry do módulo Produção
 *
 * Registra páginas do setor Produção:
 * - Ordens de Produção
 * - Demanda de Produção
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import type { TabRegistry } from '@/types/registry.types';
import { Factory, ListChecks } from 'lucide-react';

const OrdensProducaoPage = lazy(() =>
  import('@/pages/producao/OrdensProducaoPage').then((m) => ({ default: m.OrdensProducaoPage })),
);
const DemandaProducaoPage = lazy(() =>
  import('@/pages/producao/DemandaProducaoPage').then((m) => ({ default: m.DemandaProducaoPage })),
);

export const producaoRegistry: TabRegistry = {
  'prod-ordens': {
    defaultTitle: 'Ordens de Produção',
    icon: Factory,
    component: OrdensProducaoPage,
    category: 'producao',
  },
  'prod-demanda': {
    defaultTitle: 'Demanda de Produção',
    icon: ListChecks,
    component: DemandaProducaoPage,
    category: 'producao',
  },
};
