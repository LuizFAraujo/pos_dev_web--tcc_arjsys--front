/**
 * comercialRegistry.ts - Registry do módulo Comercial
 *
 * Registra páginas do setor Comercial:
 * - Pedidos de Venda
 * - Número de Série
 *
 * Páginas carregadas via React.lazy — cada uma vira chunk separado no build.
 */

import { lazy } from 'react';
import type { TabRegistry } from '@/types/registry.types';
import { ShoppingCart, Hash } from 'lucide-react';

const PedidosPage = lazy(() =>
  import('@/pages/comercial/PedidosPage').then((m) => ({ default: m.PedidosPage })),
);
const NumeroSeriePage = lazy(() =>
  import('@/pages/comercial/NumeroSeriePage').then((m) => ({ default: m.NumeroSeriePage })),
);

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
