<!-- markdownlint-disable-file -->
## Vendas / Comercial — Casos de uso

- **Criar pedido**
  - Usuário cadastra `CadastroPedido` com cliente, escopo, qty, prazo.
- **Vincular pedido a um projeto**
  - No `DetalhePedido`, cria/associa um Projeto (gera código do projeto).
- **Acompanhar andamento**
  - Em `ListaPedidos`, vê status do projeto ligado (Em engenharia / Em produção / Concluído).

---

## Engenharia — Casos de uso

- **Cadastrar item (produto/componente)**
  - Em `CadastroProduto`, cria item (Fabricado/Comprado/Conjunto) com material e infos.
- **Criar/revisar desenho**
  - Em `CadastroDesenho`, cadastra desenho e vincula ao item e ao projeto.
  - Em `RevisaoDesenho`, cria Revisão B, aprova e muda status para “Liberado”.
- **Montar estrutura (BOM) do equipamento**
  - Em `EstruturaProduto`, monta BOM do conjunto do projeto com quantidades.
  - Em `ExplosaoBOM`, valida níveis e totalizadores.
- **Checar impacto / onde é usado**
  - Em `WhereUsed`, descobre em quais conjuntos o item aparece antes de alterar.
- **Abrir mudança (ECO)**
  - (Se existir no seu módulo de engenharia) registra mudança, itens afetados e nova revisão.

---

## Compras — Casos de uso

- **Gerar solicitação de compra a partir da BOM**
  - Em `SolicitacaoCompra`, filtra itens “Comprado” do projeto e gera lista.
- **Registrar pedido de compra**
  - Em `PedidosCompra`, cria PC por fornecedor e marca data prevista.
- **Acompanhar pendências**
  - Em `StatusCompras`, vê o que está “Pendente” vs “Entregue” por projeto.

---

## Produção (inclui Almoxarifado / Estoque) — Casos de uso

### Almoxarifado / Estoque
- **Dar entrada de material comprado**
  - Em `EntradaMaterial`, lança NF/recebimento e atualiza `SaldoEstoque`.
- **Reservar material para um projeto**
  - Em `ReservaProjeto`, aloca quantidades para o projeto X.
- **Baixar consumo na fabricação**
  - Em `SaidaMaterial`, dá baixa conforme produção consome.

### Fabricação
- **Gerar fila de fabricação do projeto**
  - Em `FilaProducao`, carrega itens “Fabricado” da BOM e cria a lista de execução.
- **Executar por Kanban**
  - Em `KanbanProducao`, move item: A Fazer → Em Produção → Concluído.
- **Apontar avanço**
  - Em `ApontamentoProducao`, registra qty produzida / observações / responsável.

---

## Qualidade — Casos de uso

- **Inspecionar item produzido**
  - Em `Inspecao`, registra resultado (Aprovado/Reprovado) e anexos.
- **Liberar para próximo passo**
  - Em `Aprovacao`, libera item/conjunto para montagem/expedição.
- **Abrir não conformidade**
  - Em `NaoConformidade`, registra problema, ação e itens afetados.
- **Consultar histórico por projeto**
  - Em `HistoricoQualidade`, filtra por projeto/item e vê ocorrências.

---

## Administração — Casos de uso

- **Criar usuários e perfis**
  - Em `Usuarios`, cria conta.
  - Em `PerfisAcesso`, define permissões (Engenharia/Produção/Compras/Qualidade).
- **Configurar parâmetros do sistema**
  - Em `ParametrosSistema`, define padrões (status, numeração, unidades, etc.).
- **Auditar alterações**
  - Em `LogsSistema`, consulta quem mudou BOM/desenho/status e quando.
