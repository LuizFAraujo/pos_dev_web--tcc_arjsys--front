/**
 * adminRegistry.ts - Registry do módulo Admin
 *
 * Registra páginas do setor Admin:
 * - Clientes
 * - Funcionários
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import type { TabRegistry } from '@/types/registry.types';
import { Users, UserCog } from 'lucide-react';

const ClientesPage = lazy(() =>
  import('@/pages/admin/ClientesPage').then((m) => ({ default: m.ClientesPage })),
);
const FuncionariosPage = lazy(() =>
  import('@/pages/admin/FuncionariosPage').then((m) => ({ default: m.FuncionariosPage })),
);

export const adminRegistry: TabRegistry = {
  'adm-clientes': {
    defaultTitle: 'Clientes',
    icon: Users,
    component: ClientesPage,
    category: 'admin',
  },
  'adm-funcionarios': {
    defaultTitle: 'Funcionários',
    icon: UserCog,
    component: FuncionariosPage,
    category: 'admin',
  },
};
