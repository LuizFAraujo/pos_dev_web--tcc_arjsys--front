// ============================================================================
// CONFIGURAÇÃO DO ARJSYS — Runtime (editável após build)
// ============================================================================
//
// Este arquivo é carregado em runtime (não passa pelo build do Vite).
// Pode ser editado DEPOIS do build, direto na pasta dist/, sem rebuildar.
// Basta salvar e atualizar o navegador (F5).
//
// O index.html carrega este arquivo via <script> antes do app.
// O app lê window.__ARJSYS_CONFIG__ para obter as configurações.
//
// ============================================================================
// API_BASE_URL — Endereço do backend
// ============================================================================
//
// ── COM REVERSE PROXY (Caddy, Nginx, IIS, Apache) ───────────────────────────
//
//   Deixe vazio (""). As chamadas saem relativas: /api/engenharia/Produtos
//   O reverse proxy redireciona para o backend automaticamente.
//
//     API_BASE_URL: ""
//
// ── SEM REVERSE PROXY (acesso direto ao backend) ────────────────────────────
//
//   Informe o endereço completo (protocolo + host + porta).
//
//     API_BASE_URL: "http://localhost:7000"         ← dev local
//     API_BASE_URL: "http://192.168.1.50:7000"      ← servidor na rede
//     API_BASE_URL: "https://api.arjsys.com.br"     ← servidor externo
//
// ── NÃO coloque barra (/) no final do endereço.
//
// ============================================================================
// HELPER_URL — ArjSys Helper (agente local para abrir pastas/documentos)
// ============================================================================
//
// O ArjSys Helper é um executável portátil (ArjSysHelper.exe) que roda no
// PC do usuário e permite abrir pastas e documentos localmente pelo browser.
//
// ── COM HELPER (recomendado para usuários na rede) ──────────────────────────
//
//   Informe o endereço local do helper. Padrão: http://localhost:9111
//   Os botões "Abrir Pasta" e "Abrir Documento" abrem no PC do USUÁRIO.
//
//     HELPER_URL: "http://localhost:9111"
//
// ── SEM HELPER ──────────────────────────────────────────────────────────────
//
//   Deixe vazio ("") ou remova a linha.
//   Os botões chamam o backend, que abre no SERVIDOR (comportamento padrão).
//   Útil para desenvolvimento local onde o backend roda na mesma máquina.
//
//     HELPER_URL: ""
//
// ============================================================================

window.__ARJSYS_CONFIG__ = {
  API_BASE_URL: "http://localhost:7000",
  //API_BASE_URL: "",
  HELPER_URL: "http://localhost:9111"
};
