/**
 * adminRegistry.ts - Registry do módulo Admin
 *
 * Registra páginas do setor Admin:
 * - Clientes
 * - Funcionários
 */

import type { TabRegistry } from '@/types/registry.types';
import { Users, UserCog } from 'lucide-react';
import { ClientesPage } from '@/pages/admin/ClientesPage';
import { FuncionariosPage } from '@/pages/admin/FuncionariosPage';

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
