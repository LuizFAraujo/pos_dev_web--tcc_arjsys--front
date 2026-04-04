/**
 * constants.ts — Categorias do menu lateral
 */

import { Users, Package, Truck, ShoppingCart, Wrench, FileCode2, Warehouse } from 'lucide-react';

export const CATEGORIES = [
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'comercial', label: 'COMERCIAL', icon: ShoppingCart },
    { id: 'admin', label: 'ADMIN', icon: Users },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'almoxarifado', label: 'ALMOXARIFADO', icon: Warehouse },
    { id: 'modelos', label: 'PÁGINAS MODELO', icon: FileCode2 },
] as const;
