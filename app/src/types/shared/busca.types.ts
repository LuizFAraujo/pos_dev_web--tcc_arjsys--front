/**
 * Contrato compartilhado de busca paginada.
 * Espelha BACK/app/DTOs/Shared/BuscaRequest.cs e PaginadoResponse.cs.
 *
 * Endpoint padrão no back:
 *   POST /api/<modulo>/<recurso>/buscar
 *   Body: BuscaRequest
 *   Resposta: PaginadoResponse<T>
 *
 * Os valores literais (operadores, direção, lógica) batem com o
 * JsonStringEnumMemberName configurado nos enums C# do back.
 */

export type Operador =
  | 'igual'
  | 'diferente'
  | 'contem'
  | 'naoContem'
  | 'comecaCom'
  | 'terminaCom'
  | 'maiorQue'
  | 'menorQue'
  | 'maiorOuIgual'
  | 'menorOuIgual'
  | 'entre'
  | 'em'
  | 'naoEm'
  | 'nulo'
  | 'naoNulo';

export type Direcao = 'asc' | 'desc';

export type Logica = 'e' | 'ou';

/**
 * Uma condição individual de filtro.
 * Valor pode ser string única ou array (operadores em/naoEm/entre).
 * Operadores nulo/naoNulo dispensam valor.
 */
export interface Condicao {
  operador: Operador;
  valor?: string | string[];
  logica?: Logica;
}

/**
 * Filtro de uma coluna específica com 1 ou mais condições combinadas por E/OU.
 */
export interface FiltroColuna {
  coluna: string;
  condicoes: Condicao[];
}

/**
 * Critério de ordenação por coluna. Várias ordenações podem ser aplicadas em sequência.
 */
export interface Ordenacao {
  coluna: string;
  direcao: Direcao;
}

/**
 * Body padrão de endpoints de busca paginada.
 * Tamanho = 0 retorna tudo (sem paginação aplicada).
 */
export interface BuscaRequest {
  pagina?: number;
  tamanho?: number;
  busca?: string;
  filtros?: FiltroColuna[];
  ordenacoes?: Ordenacao[];
}

/**
 * Resposta padrão de endpoints paginados.
 * Contém a página corrente em itens e os metadados de paginação.
 */
export interface PaginadoResponse<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
  totalPaginas: number;
}
