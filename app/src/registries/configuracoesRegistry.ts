/**
 * configuracoesRegistry.ts - Registry do módulo Configurações
 *
 * Registra páginas do setor Configurações:
 * - Sistema (configurações gerais do sistema, incluindo dados da empresa)
 */

import type { TabRegistry } from '@/types/registry.types';
import { Cog } from 'lucide-react';
import { ConfiguracaoSistemaPage } from '@/pages/configuracoes/ConfiguracaoSistemaPage';

export const configuracoesRegistry: TabRegistry = {
  'cfg-sistema': {
    defaultTitle: 'Sistema',
    icon: Cog,
    component: ConfiguracaoSistemaPage,
    category: 'configuracoes',
  },
};
