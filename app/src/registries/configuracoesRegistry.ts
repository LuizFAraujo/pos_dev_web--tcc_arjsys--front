/**
 * configuracoesRegistry.ts - Registry do módulo Configurações
 *
 * Registra páginas do setor Configurações:
 * - Sistema (configurações gerais do sistema, incluindo dados da empresa)
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import type { TabRegistry } from '@/types/registry.types';
import { Cog } from 'lucide-react';

const ConfiguracaoSistemaPage = lazy(() =>
  import('@/pages/configuracoes/ConfiguracaoSistemaPage').then((m) => ({
    default: m.ConfiguracaoSistemaPage,
  })),
);

export const configuracoesRegistry: TabRegistry = {
  'cfg-sistema': {
    defaultTitle: 'Sistema',
    icon: Cog,
    component: ConfiguracaoSistemaPage,
    category: 'configuracoes',
  },
};
