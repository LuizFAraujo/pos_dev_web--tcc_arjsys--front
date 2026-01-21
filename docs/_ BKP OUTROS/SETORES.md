<!-- markdownlint-disable-file -->
## Vendas / Comercial

- **Pedidos**
  - `ListaPedidos` – pedidos do cliente
  - `CadastroPedido` – criar / editar pedido
  - `DetalhePedido` – escopo, prazo, vínculo com projeto

---

## Engenharia

- **Produtos / Itens**
  - `CadastroProduto` – CRUD de itens
  - `RevisaoProduto` – controle de revisão e status

- **Desenhos**
  - `CadastroDesenho` – dados do desenho
  - `RevisaoDesenho` – histórico e aprovação

- **Estrutura (BOM)**
  - `EstruturaProduto` – estrutura do produto
  - `ExplosaoBOM` – visualização multinível
  - `WhereUsed` – onde o item é usado

- **Projetos**
  - `CadastroProjeto` – projeto técnico
  - `DetalheProjeto` – visão geral do projeto

---

## Compras

- **Compras**
  - `SolicitacaoCompra` – itens a comprar
  - `PedidosCompra` – acompanhamento
  - `StatusCompras` – entregue / pendente

---

## Produção (inclui Almoxarifado / Estoque)

- **Almoxarifado / Estoque**
  - `SaldoEstoque` – saldo atual
  - `EntradaMaterial` – recebimento
  - `SaidaMaterial` – consumo
  - `ReservaProjeto` – reserva por projeto

- **Fabricação**
  - `FilaProducao` – itens a fabricar
  - `KanbanProducao` – status (a fazer / em produção / concluído)
  - `ApontamentoProducao` – avanço do item

---

## Qualidade

- **Qualidade**
  - `Inspecao` – inspeções
  - `Aprovacao` – liberar / reprovar
  - `NaoConformidade` – registros
  - `HistoricoQualidade` – por projeto / item

---

## Administração

- **Sistema**
  - `Usuarios` – cadastro de usuários
  - `PerfisAcesso` – permissões
  - `ParametrosSistema` – configurações
  - `LogsSistema` – auditoria
