// ========================================
// TYPES — CLIENTE (Admin)
// ========================================
// Alinhado com backend ASP.NET Core 10
// CRUD /api/admin/Clientes
// Campos do backend: Nome, CpfCnpj?, Telefone?, Email?,
//   Endereco?, Cidade?, Estado?, Cep?, RazaoSocial?,
//   InscricaoEstadual?, ContatoComercial?
// IDs são int sequenciais

export interface Cliente {
  id: number;
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
  createdAt?: string;
  updatedAt?: string;
}

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
