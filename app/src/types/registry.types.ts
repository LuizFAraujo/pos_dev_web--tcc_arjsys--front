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
 */
export interface TabConfig {
  /** Título padrão da aba (pode ser sobrescrito ao abrir) */
  defaultTitle: string;

  /** Ícone da aba */
  icon: LucideIcon;

  /** Componente React a ser renderizado */
  component: ComponentType<any>;

  /** Setor/módulo a que pertence (espelha backend) */
  category:
    | 'engenharia'
    | 'admin'
    | 'comercial'
    | 'producao'
    | 'compras'
    | 'almoxarifado'
    | 'modelos';

  /** Descrição da página (opcional) */
  description?: string;
}

/**
 * TabRegistry - Mapa de tipos de abas para suas configurações
 */
export type TabRegistry = {
  [K in TabType]?: TabConfig;
};

/**
 * CategoryRegistry - Registry agrupado por categoria
 */
export type CategoryRegistry = {
  [category: string]: TabRegistry;
};
