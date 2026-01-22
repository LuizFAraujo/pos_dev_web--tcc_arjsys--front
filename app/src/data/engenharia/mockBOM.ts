// ========================================
// MOCK DATA - BOM (Bill of Materials)
// ========================================

import type { BOMItem, BOMStructure } from '@/types/engenharia/bom.types';

/**
 * Estrutura BOM do Trator Agrícola (PRD-001)
 * 
 * Nível 1: Trator completo
 * Nível 2: Chassi, Motor, Sistema Hidráulico, Rodas
 * Nível 3: Componentes de cada conjunto
 */
export const mockBOMTrator: BOMItem[] = [
    // NÍVEL 2 - Conjuntos principais
    {
        id: 'bom-1',
        produtoId: '2',
        codigo: 'PRD-100',
        descricao: 'Chassi Principal',
        tipo: 'FABRICADO',
        quantidade: 1,
        unidade: 'UN',
        nivel: 2,
        sequencia: 10,
        parentId: null,
        children: [
            // NÍVEL 3 - Componentes do Chassi
            {
                id: 'bom-1-1',
                produtoId: '3',
                codigo: 'PRD-110',
                descricao: 'Viga Lateral Esquerda',
                tipo: 'FABRICADO',
                quantidade: 1,
                unidade: 'UN',
                nivel: 3,
                sequencia: 10,
                parentId: 'bom-1',
            },
            {
                id: 'bom-1-2',
                produtoId: '4',
                codigo: 'PRD-111',
                descricao: 'Viga Lateral Direita',
                tipo: 'FABRICADO',
                quantidade: 1,
                unidade: 'UN',
                nivel: 3,
                sequencia: 20,
                parentId: 'bom-1',
            },
            {
                id: 'bom-1-3',
                produtoId: '7',
                codigo: 'MP-001',
                descricao: 'Chapa de Aço 1020 - 3mm',
                tipo: 'MATERIA_PRIMA',
                quantidade: 150,
                unidade: 'KG',
                nivel: 3,
                sequencia: 30,
                parentId: 'bom-1',
            },
            {
                id: 'bom-1-4',
                produtoId: '8',
                codigo: 'MP-002',
                descricao: 'Perfil U 50x25x3mm',
                tipo: 'MATERIA_PRIMA',
                quantidade: 24,
                unidade: 'M',
                nivel: 3,
                sequencia: 40,
                parentId: 'bom-1',
            },
        ],
    },
    {
        id: 'bom-2',
        produtoId: '6',
        codigo: 'CMP-200',
        descricao: 'Motor Diesel MWM 4 cilindros',
        tipo: 'COMPRADO',
        quantidade: 1,
        unidade: 'UN',
        nivel: 2,
        sequencia: 20,
        parentId: null,
    },
    {
        id: 'bom-3',
        produtoId: '9',
        codigo: 'PRD-200',
        descricao: 'Sistema Hidráulico Completo',
        tipo: 'FABRICADO',
        quantidade: 1,
        unidade: 'UN',
        nivel: 2,
        sequencia: 30,
        parentId: null,
        children: [
            {
                id: 'bom-3-1',
                produtoId: '10',
                codigo: 'CMP-300',
                descricao: 'Bomba Hidráulica 45cc',
                tipo: 'COMPRADO',
                quantidade: 1,
                unidade: 'UN',
                nivel: 3,
                sequencia: 10,
                parentId: 'bom-3',
            },
        ],
    },
    {
        id: 'bom-4',
        produtoId: '11',
        codigo: 'PRD-300',
        descricao: 'Conjunto Rodas Traseiras',
        tipo: 'FABRICADO',
        quantidade: 1,
        unidade: 'UN',
        nivel: 2,
        sequencia: 40,
        parentId: null,
        children: [
            {
                id: 'bom-4-1',
                produtoId: '12',
                codigo: 'CMP-400',
                descricao: 'Pneu Agrícola 18.4-30',
                tipo: 'COMPRADO',
                quantidade: 2,
                unidade: 'UN',
                nivel: 3,
                sequencia: 10,
                parentId: 'bom-4',
            },
            {
                id: 'bom-4-2',
                produtoId: '17',
                codigo: 'CMP-600',
                descricao: 'Parafuso M12x40 Classe 8.8',
                tipo: 'COMPRADO',
                quantidade: 16,
                unidade: 'UN',
                nivel: 3,
                sequencia: 20,
                parentId: 'bom-4',
            },
            {
                id: 'bom-4-3',
                produtoId: '18',
                codigo: 'CMP-601',
                descricao: 'Porca M12 Autotravante',
                tipo: 'COMPRADO',
                quantidade: 16,
                unidade: 'UN',
                nivel: 3,
                sequencia: 30,
                parentId: 'bom-4',
            },
        ],
    },
];

/**
 * Estrutura BOM completa do Trator
 */
export const mockBOMStructureTrator: BOMStructure = {
    produtoId: '1',
    codigoProduto: 'PRD-001',
    descricaoProduto: 'Trator Agrícola Completo',
    items: mockBOMTrator,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
};