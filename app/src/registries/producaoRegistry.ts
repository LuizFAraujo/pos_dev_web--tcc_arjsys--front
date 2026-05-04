/**
 * producaoRegistry.ts - Registry do módulo Produção
 *
 * Registra páginas do setor Produção:
 * - Ordens de Produção (lista + visualização + criação de OP Master)
 */

import type { TabRegistry } from '@/types/registry.types';
import { Factory, ListChecks } from 'lucide-react';
import { OrdensProducaoPage } from '@/pages/producao/OrdensProducaoPage';
import { DemandaProducaoPage } from '@/pages/producao/DemandaProducaoPage';

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
