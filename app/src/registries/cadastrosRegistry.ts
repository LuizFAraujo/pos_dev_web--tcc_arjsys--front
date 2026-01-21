/**
 * cadastrosRegistry.ts - Registry do módulo Cadastros
 * 
 * Registra todas as páginas do módulo de cadastros:
 * - Clientes (lista e cadastro)
 * - Produtos (lista e cadastro)
 * - Fornecedores (lista e cadastro)
 */

import type { TabRegistry } from '@/types/registry.types';
import { Package } from 'lucide-react';
import { ProdutosPage } from '@/pages/cadastros/ProdutosPage';

export const cadastrosRegistry: TabRegistry = {
  'produtos-lista': {
    defaultTitle: 'Produtos',
    icon: Package,
    component: ProdutosPage,
    category: 'cadastros',
  },
};