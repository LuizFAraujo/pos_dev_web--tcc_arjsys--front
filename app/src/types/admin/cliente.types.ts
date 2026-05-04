// ========================================
// TYPES - CLIENTE (Admin)
// ========================================
// Alinhado com backend ASP.NET Core 10 - /api/admin/Clientes
//
// v3.1 (22/04):
//   - Campo `codigo` adicionado (ex: "CLI-0042"), gerado automaticamente pelo back
//   - Busca server-side via ?busca= (LIKE em nome, codigo, cpfCnpj, cidade)

export interface Cliente {
  id: number;
  /** Código humano único gerado pelo back (ex: "CLI-0042"). Readonly. */
  codigo: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  contatoComercial?: string;
  /** Mantidos por compat; back retorna CriadoEm/ModificadoEm. */
  createdAt?: string;
  updatedAt?: string;
  criadoEm?: string;
  modificadoEm?: string;
  ativo?: boolean;
}

/** Dados do form - nunca envia `codigo` (back ignora se vier). */
export interface ClienteFormData {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  contatoComercial?: string;
}
