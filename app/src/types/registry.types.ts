/**
 * registry.types.ts - Tipos do Registry Pattern
 * 
 * Define as interfaces para o sistema de registro de abas.
 * O Registry Pattern mapeia tipos de abas para seus componentes React.
 */

import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { TabType } from './tab.types';

/**
 * TabConfig - Configuração de um tipo de aba
 * 
 * Define como uma aba específica deve ser renderizada e exibida.
 */
export interface TabConfig {
    /** Título padrão da aba (pode ser sobrescrito ao abrir) */
    defaultTitle: string;

    /** Ícone da aba */
    icon: LucideIcon;

    /** Componente React a ser renderizado */
    component: ComponentType<any>;

    /** Categoria/módulo a que pertence */
    category: 'cadastros' | 'vendas' | 'producao' | 'compras' | 'engenharia' | 'models';

    /** Descrição da página (opcional) */
    description?: string;
}

/**
 * TabRegistry - Mapa de tipos de abas para suas configurações
 * 
 * Estrutura do registry que associa cada TabType ao seu TabConfig.
 */
export type TabRegistry = {
    [K in TabType]?: TabConfig;
};

/**
 * CategoryRegistry - Registry agrupado por categoria
 * 
 * Permite buscar todas as abas de uma categoria específica.
 */
export type CategoryRegistry = {
    [category: string]: TabRegistry;
};