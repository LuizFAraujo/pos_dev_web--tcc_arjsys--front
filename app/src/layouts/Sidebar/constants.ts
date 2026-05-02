/**
 * constants.ts — Categorias do menu lateral
 */

import { Users, Package, Truck, ShoppingCart, Wrench, Warehouse, Settings } from 'lucide-react';

export const CATEGORIES = [
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'comercial', label: 'COMERCIAL', icon: ShoppingCart },
    { id: 'admin', label: 'ADMIN', icon: Users },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'almoxarifado', label: 'ALMOXARIFADO', icon: Warehouse },
    { id: 'configuracoes', label: 'CONFIGURAÇÕES', icon: Settings },
    // PÁGINAS MODELO — desabilitada visualmente (registry preservado em registries/modelosRegistry.ts).
    // Pra reativar: descomentar a linha abaixo e re-importar FileCode2 de 'lucide-react'.
    // { id: 'modelos', label: 'PÁGINAS MODELO', icon: FileCode2 },
] as const;
