// ========================================
// TYPES - CONFIGURAÇÃO ENGENHARIA
// ========================================
// CRUD /api/engenharia/ConfiguracaoEngenharia
// CRUD /api/engenharia/PathDocumentos
// POST /api/engenharia/Produtos/varredura-documentos

/** Configuração chave/valor (tabela Engenharia_Configuracoes) */
export interface ConfiguracaoEngenharia {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
  criadoEm?: string;
  modificadoEm?: string;
}

// ─── Path Documentos ──────────────────────────────────────────────────────────

/** Response do GET /api/engenharia/PathDocumentos */
export interface PathDocumentos {
  id: number;
  grupoProdutoId: number;
  grupoCodigo: string;
  grupoDescricao: string;
  path: string;
  controlarPorPrefixo: boolean;
  ativo: boolean;
  criadoEm: string;
  modificadoEm: string | null;
}

/** Payload do POST /api/engenharia/PathDocumentos */
export interface PathDocumentosCreate {
  grupoProdutoId: number;
  path: string;
  controlarPorPrefixo: boolean;
  ativo: boolean;
}

/** Payload do PUT /api/engenharia/PathDocumentos/{id} */
export interface PathDocumentosUpdate {
  path: string;
  controlarPorPrefixo: boolean;
  ativo: boolean;
}

// ─── Varredura ────────────────────────────────────────────────────────────────

/** Response do POST /api/engenharia/Produtos/varredura-documentos */
export interface VarreduraResultado {
  totalGeral: number;
  totalVerificados: number;
  comPasta: number;
  comDocumento: number;
  pastaVazia: number;
  semPasta: number;
  atualizados: number;
}
