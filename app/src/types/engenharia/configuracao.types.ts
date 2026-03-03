// ========================================
// TYPES — CONFIGURAÇÃO ENGENHARIA
// ========================================
// CRUD /api/engenharia/ConfiguracaoEngenharia
// Tabela chave/valor

export interface ConfiguracaoEngenharia {
  id: number;
  chave: string;
  valor: string;
  criadoEm?: string;
  modificadoEm?: string;
}
