// ========================================
// TYPES — FUNCIONÁRIO (Admin)
// ========================================
// Alinhado com backend ASP.NET Core 10
// CRUD /api/admin/Funcionarios
// Campos: Nome, CpfCnpj?, Telefone?, Email?, Endereco?,
//   Cidade?, Estado?, Cep?, Cargo?, Setor?, Usuario, Senha
// Senha nunca retorna no GET
// IDs são int sequenciais

export interface Funcionario {
  id: number;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cargo?: string;
  setor?: string;
  usuario: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FuncionarioFormData {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cargo?: string;
  setor?: string;
  usuario: string;
  senha?: string;
}
