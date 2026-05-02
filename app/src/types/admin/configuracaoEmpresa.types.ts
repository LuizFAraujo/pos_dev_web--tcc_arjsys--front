// ========================================
// TYPES — CONFIGURAÇÃO DE EMPRESA (Admin)
// ========================================
// Alinhado com backend ASP.NET Core 10 — /api/admin/ConfiguracaoEmpresa
// Singleton (Id sempre = 1). Guarda AnoFundacao e flag Configurado.
// Configurado=true libera emissão de Número de Série.

export interface ConfiguracaoEmpresa {
  id: number;
  anoFundacao: number;
  configurado: boolean;
}

/** PUT — body do update normal (bloqueia se já há NS no banco). */
export interface ConfiguracaoEmpresaUpdateData {
  anoFundacao: number;
}
