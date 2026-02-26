/**
 * tab.types.ts - Tipos relacionados ao sistema de abas
 *
 * Define as interfaces e tipos para o gerenciamento de abas do workspace.
 * Cada aba representa uma instância de página aberta no sistema.
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Tab - Interface principal de uma aba
 */
export interface Tab {
  /** ID único da aba (gerado automaticamente) */
  id: string;

  /** Tipo da aba (define qual componente renderizar) */
  type: TabType;

  /** Título exibido na aba */
  title: string;

  /** Ícone da aba (opcional) */
  icon?: LucideIcon;

  /** ID da entidade relacionada (ex: ID do produto sendo editado) */
  entityId?: string | number;

  /** Indica se a aba tem alterações não salvas */
  isDirty?: boolean;

  /** Timestamp de quando a aba foi criada */
  createdAt: number;

  /** Timestamp da última vez que a aba foi acessada */
  lastAccessedAt: number;
}

/**
 * TabType - Tipos de abas organizados por setor
 *
 * Prefixos:
 * - eng-  → Engenharia
 * - adm-  → Admin
 * - com-  → Comercial
 * - pcp-  → PCP (futuro)
 * - cpr-  → Compras (futuro)
 * - alm-  → Almoxarifado (futuro)
 */
export type TabType =
  // Páginas Modelo (templates de desenvolvimento)
  | 'modelo-lista'
  | 'modelo-form'
  | 'modelo-complexo'

  // Engenharia
  | 'eng-produtos'
  | 'eng-estrutura'
  | 'eng-grupos'
  | 'eng-configuracoes'

  // Admin
  | 'adm-clientes'
  | 'adm-funcionarios'

  // Comercial
  | 'com-pedidos-venda'
  | 'com-numero-serie'

  // PCP (futuro)
  | 'pcp-ordens'
  | 'pcp-kanban'

  // Compras (futuro)
  | 'cpr-requisicoes'

  // Almoxarifado (futuro)
  | 'alm-estoque';

/**
 * TabMetadata - Metadados adicionais da aba
 */
export interface TabMetadata {
  /** Parâmetros customizados da aba */
  params?: Record<string, unknown>;

  /** Se deve mostrar header customizado */
  showHeader?: boolean;

  /** Se deve mostrar footer customizado */
  showFooter?: boolean;
}
