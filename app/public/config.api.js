// ============================================================================
// CONFIGURAÇÃO DO ENDEREÇO DA API — ARJSYS
// ============================================================================
//
// Este arquivo é carregado em runtime (não passa pelo build do Vite).
// Pode ser editado DEPOIS do build, direto na pasta dist/, sem rebuildar.
//
// ── COMO FUNCIONA ───────────────────────────────────────────────────────────
//
//   O index.html carrega este arquivo via <script> antes do app.
//   O app lê window.__ARJSYS_CONFIG__.API_BASE_URL para montar as URLs da API.
//
// ── COM REVERSE PROXY (Caddy, Nginx, IIS, Apache) ───────────────────────────
//
//   Deixe API_BASE_URL vazio ("").
//   As chamadas saem relativas: /api/engenharia/Produtos
//   O reverse proxy redireciona para o backend automaticamente.
//
//   Exemplo:
//     API_BASE_URL: ""
//
// ── SEM REVERSE PROXY (acesso direto ao backend) ────────────────────────────
//
//   Informe o endereço completo do backend (protocolo + host + porta).
//   As chamadas saem absolutas: http://192.168.1.50:7000/api/engenharia/Produtos
//
//   Exemplos:
//     API_BASE_URL: "http://localhost:7000"         ← desenvolvimento local
//     API_BASE_URL: "http://192.168.1.50:7000"      ← servidor na rede
//     API_BASE_URL: "https://api.arjsys.com.br"     ← servidor externo
//
// ── IMPORTANTE ──────────────────────────────────────────────────────────────
//
//   - NÃO coloque barra (/) no final do endereço
//   - Após editar, basta atualizar o navegador (F5) — não precisa rebuildar
//
// ============================================================================

window.__ARJSYS_CONFIG__ = {
  API_BASE_URL: "http://localhost:7000"
};
