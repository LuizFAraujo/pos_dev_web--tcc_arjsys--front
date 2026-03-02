/**
 * comercialRegistry.ts - Registry do módulo Comercial
 *
 * Registra páginas do setor Comercial:
 * - Pedidos de Venda
 * - Número de Série
 */

import type { TabRegistry } from '@/types/registry.types';
import { ShoppingCart, Hash } from 'lucide-react';
import { PedidosPage } from '@/pages/comercial/PedidosPage';
import { NumeroSeriePage } from '@/pages/comercial/NumeroSeriePage';

export const comercialRegistry: TabRegistry = {
  'com-pedidos-venda': {
    defaultTitle: 'Pedidos de Venda',
    icon: ShoppingCart,
    component: PedidosPage,
    category: 'comercial',
  },
  'com-numero-serie': {
    defaultTitle: 'Número de Série',
    icon: Hash,
    component: NumeroSeriePage,
    category: 'comercial',
  },
};
