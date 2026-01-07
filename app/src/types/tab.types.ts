/**
 * tab.types.ts - Tipos relacionados ao sistema de abas
 * 
 * Define as interfaces e tipos para o gerenciamento de abas do workspace.
 * Cada aba representa uma instância de página aberta no sistema.
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Tab - Interface principal de uma aba
 * 
 * Representa uma aba aberta no workspace com todas suas propriedades.
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

    /** ID da entidade relacionada (ex: ID do cliente sendo editado) */
    entityId?: string | number;

    /** Indica se a aba tem alterações não salvas */
    isDirty?: boolean;

    /** Timestamp de quando a aba foi criada */
    createdAt: number;

    /** Timestamp da última vez que a aba foi acessada */
    lastAccessedAt: number;
}

/**
 * TabType - Tipos de abas disponíveis no sistema
 * 
 * União de todos os tipos de abas que podem ser abertas.
 * Cada tipo está registrado em um dos registries de módulo.
 */
export type TabType =
    // Páginas Modelo (templates)
    | 'modelo-lista'
    | 'modelo-form'
    | 'modelo-complexo'

    // Cadastros
    | 'clientes-lista'
    | 'cliente-cadastro'
    | 'produtos-lista'
    | 'produto-cadastro'
    | 'fornecedores-lista'
    | 'fornecedor-cadastro'

    // Vendas
    | 'pedidos-lista'
    | 'pedido-cadastro'

    // Produção
    | 'ordens-lista'
    | 'ordem-cadastro'
    | 'kanban'

    // Compras
    | 'requisicoes-lista'
    | 'requisicao-cadastro'

    // Engenharia
    | 'estrutura-produto'
    | 'roteiro-fabricacao';

/**
 * TabMetadata - Metadados adicionais da aba
 * 
 * Informações extras que podem ser passadas ao abrir uma aba.
 */
export interface TabMetadata {
    /** Parâmetros customizados da aba */
    params?: Record<string, any>;

    /** Se deve mostrar header customizado */
    showHeader?: boolean;

    /** Se deve mostrar footer customizado */
    showFooter?: boolean;
}