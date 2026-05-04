// ========================================
// TYPES - GRUPO DE PRODUTO (Engenharia)
// ========================================
// CRUD /api/engenharia/GrupoProduto
// Vínculos /api/engenharia/GrupoVinculo
//
// Níveis: Coluna1 (2 chars) → Coluna2 (3 chars) → Coluna3 (4 chars)
// Máscara: XX.YYY.ZZZZ.NNN.0000

export type NivelGrupo = 'Coluna1' | 'Coluna2' | 'Coluna3';

export const NIVEL_LABELS: Record<NivelGrupo, string> = {
  Coluna1: 'Coluna 1 (Grupo)',
  Coluna2: 'Coluna 2 (Subgrupo)',
  Coluna3: 'Coluna 3 (Família)',
};

export const NIVEL_CHARS: Record<NivelGrupo, number> = {
  Coluna1: 2,
  Coluna2: 3,
  Coluna3: 4,
};

export interface GrupoProduto {
  id: number;
  codigo: string;
  descricao: string;
  nivel: NivelGrupo;
  qtdCaracteres: number;
  pathDocumentos?: string;
  ativo: boolean;
  criadoEm?: string;
  modificadoEm?: string;
}

export interface GrupoProdutoFormData {
  codigo: string;
  descricao: string;
  nivel: NivelGrupo;
  qtdCaracteres: number;
  pathDocumentos?: string;
  ativo: boolean;
}

export interface GrupoVinculo {
  id: number;
  grupoPaiId: number;
  grupoFilhoId: number;
  grupoPaiCodigo?: string;
  grupoPaiDescricao?: string;
  grupoFilhoCodigo?: string;
  grupoFilhoDescricao?: string;
  criadoEm?: string;
}

export interface GrupoVinculoFormData {
  grupoPaiId: number;
  grupoFilhoId: number;
}
