/**
 * index.ts - Registry centralizado
 *
 * Exporta funções para buscar configurações de abas
 * de todos os registries do sistema.
 *
 * Organizado por SETOR (espelhando backend):
 * - Engenharia, Admin, Comercial, Produção, Compras, Almoxarifado
 * - Modelos (páginas de desenvolvimento)
 */

import type { TabType } from '@/types/tab.types';
import type { TabConfig } from '@/types/registry.types';
import { engenhariaRegistry } from './engenhariaRegistry';
import { adminRegistry } from './adminRegistry';
import { comercialRegistry } from './comercialRegistry';
import { producaoRegistry } from './producaoRegistry';
import { comprasRegistry } from './comprasRegistry';
import { almoxarifadoRegistry } from './almoxarifadoRegistry';
import { modelosRegistry } from './modelosRegistry';

/**
 * Busca configuração de uma aba pelo seu tipo
 */
export function getTabConfig(type: TabType): TabConfig | undefined {
  return (
    engenhariaRegistry[type] ||
    adminRegistry[type] ||
    comercialRegistry[type] ||
    producaoRegistry[type] ||
    comprasRegistry[type] ||
    almoxarifadoRegistry[type] ||
    modelosRegistry[type]
  );
}

/**
 * Busca todas as abas de uma categoria específica
 */
export function getTabsByCategory(category: string): Record<string, TabConfig> {
  switch (category) {
    case 'engenharia':
      return engenhariaRegistry;
    case 'admin':
      return adminRegistry;
    case 'comercial':
      return comercialRegistry;
    case 'producao':
      return producaoRegistry;
    case 'compras':
      return comprasRegistry;
    case 'almoxarifado':
      return almoxarifadoRegistry;
    case 'modelos':
      return modelosRegistry;
    default:
      return {};
  }
}

/**
 * Retorna todas as categorias com suas abas
 */
export function getAllCategories() {
  return {
    engenharia: engenhariaRegistry,
    admin: adminRegistry,
    comercial: comercialRegistry,
    producao: producaoRegistry,
    compras: comprasRegistry,
    almoxarifado: almoxarifadoRegistry,
    modelos: modelosRegistry,
  };
}
