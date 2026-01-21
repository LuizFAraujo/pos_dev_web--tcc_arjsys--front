<!-- markdownlint-disable-file -->
# Sequência lógica entre setores (macrofluxo)

Vendas/Comercial -> Pedido -> Projeto -> Engenharia (Itens/Desenhos/BOM) -> Compras (itens comprados) -> Almox/Estoque (recebe/reserva) -> Produção (fabrica/monta) -> Qualidade (inspeciona/libera) -> Entrega (fecha Projeto/Pedido, grava Nº Série)

---

# Casos de uso isolados (por setor)

## Engenharia

### UC-ENG-01 — Cadastrar Item (Fabricado/Comprado/Conjunto)
**Ator:** Engenharia  
**Páginas:** `CadastroProduto`  
**Fluxo (resumo):**
1. Informar Tipo (Fabricado/Comprado/Conjunto)
2. Informar **Código** e **Descrição curta** (obrigatórios)
3. Informar UN, peso estimado, descrição completa, tempo fabricar/montar, flag “tem desenho”
4. Salvar (criar/editar)
**Resultado:** Item disponível para BOM/pedido/projeto

### UC-ENG-02 — Anexar/Abrir Desenho de um Item
**Ator:** Engenharia  
**Páginas:** `CadastroDesenho` / `CadastroProduto`  
**Fluxo:**
1. Selecionar item
2. Vincular desenho (PDF/DWG/STEP) e metadados
3. Abrir desenho por clique
**Resultado:** Item passa a aparecer nos filtros “somente com desenho”

### UC-ENG-03 — Revisar e Liberar Desenho
**Ator:** Engenharia (aprovador)  
**Páginas:** `RevisaoDesenho`  
**Fluxo:**
1. Selecionar desenho
2. Criar revisão (A->B)
3. Ajustar status: Em desenvolvimento -> Liberado
4. Registrar motivo/observação
**Resultado:** Desenho liberado para produção (rastreável)

### UC-ENG-04 — Montar/Editar Estrutura (BOM) com ordenação 0010/0020
**Ator:** Engenharia  
**Páginas:** `EstruturaProduto`  
**Fluxo:**
1. Selecionar item pai (conjunto/equipamento)
2. Inserir filhos com: ordem (0010, 0020...), qty, UN, notas
3. Salvar
**Resultado:** Estrutura pronta para visualização/totalização

### UC-ENG-05 — Visualizar BOM em Árvore vs Flatten (salvar preferência do usuário)
**Ator:** Engenharia  
**Páginas:** `ExplosaoBOM`  
**Fluxo:**
1. Abrir BOM do produto/projeto
2. Alternar visualização (Árvore/Indentado <-> Flatten)
3. Sistema salva preferência no storage do usuário
**Resultado:** Usuário mantém o modo preferido nas próximas visitas

### UC-ENG-06 — Where-Used (impacto antes de alterar item)
**Ator:** Engenharia  
**Páginas:** `WhereUsed`  
**Fluxo:**
1. Pesquisar item
2. Ver onde está aplicado (quais pais/projetos)
**Resultado:** Evita alteração cega e reduz erro

### UC-ENG-07 — Relatório consolidado de materiais (total por projeto)
**Ator:** Engenharia / Orçamento  
**Páginas:** `Relatorios` (ou seção em `DetalheProjeto`)  
**Fluxo:**
1. Selecionar projeto
2. Explodir BOM multinível
3. Consolidar itens iguais (ex.: SKF UC-200) somando qty total
4. Exportar CSV/Excel
**Resultado:** Lista de materiais total para custo/prazo

---

## Vendas / Comercial

### UC-VEN-01 — Lançar Pedido de Produto
**Ator:** Vendas  
**Páginas:** `CadastroPedido`  
**Fluxo:**
1. Selecionar cliente
2. Selecionar produto (ou descrever escopo)
3. Informar qty e prazo
4. Salvar
**Resultado:** Pedido “Aberto”

---

## Compras

### UC-COM-01 — Gerar Solicitação de Compra a partir do consolidado do projeto
**Ator:** Compras  
**Páginas:** `SolicitacaoCompra` / `StatusCompras`  
**Fluxo:**
1. Selecionar projeto
2. Carregar lista consolidada de itens “Comprado”
3. Gerar solicitação e marcar status (A comprar)
**Resultado:** Base de compras do projeto

---

## Almoxarifado / Estoque

### UC-ALM-01 — Receber material e reservar para um projeto
**Ator:** Almoxarifado  
**Páginas:** `EntradaMaterial` / `ReservaProjeto`  
**Fluxo:**
1. Dar entrada do item (qty, data)
2. Reservar qty para projeto X
**Resultado:** Produção enxerga disponibilidade reservada

---

## Produção

### UC-PROD-01 — Kanban de Produção por Projeto
**Ator:** Produção  
**Páginas:** `KanbanProducao`  
**Fluxo:**
1. Abrir projeto
2. Visualizar itens/etapas (A fazer / Em produção / Concluído)
3. Mover cartões conforme execução
**Resultado:** Andamento simples e visível

---

## Qualidade

### UC-QUAL-01 — Inspecionar e liberar item/conjunto
**Ator:** Qualidade  
**Páginas:** `Inspecao` / `Aprovacao`  
**Fluxo:**
1. Selecionar item/projeto
2. Registrar inspeção (aprovado/reprovado) e observações
3. Liberar para próxima etapa/entrega
**Resultado:** Rastreabilidade e liberação formal

---

# Casos de uso ponta-a-ponta (começo ao fim)

## UC-E2E-01 — Produzir equipamento sob encomenda (fluxo completo)
**Sequência:**
1. **Vendas**: `CadastroPedido` cria Pedido (cliente, produto/escopo, qty, prazo)
2. **Engenharia**: cria/ajusta itens (`CadastroProduto`) e desenhos (`CadastroDesenho`)
3. **Engenharia**: monta BOM (`EstruturaProduto`) e valida visualização (`ExplosaoBOM`)
4. **Engenharia**: libera revisões (`RevisaoDesenho` e/ou `RevisaoProduto`)
5. **Engenharia/Orçamento**: gera consolidado (`Relatorios`) para custo e prazo
6. **Compras**: gera solicitação (`SolicitacaoCompra`) e acompanha (`StatusCompras`)
7. **Almox**: recebe (`EntradaMaterial`) e reserva (`ReservaProjeto`)
8. **Produção**: executa (`KanbanProducao`) e aponta avanço (`ApontamentoProducao`)
9. **Qualidade**: inspeciona/libera (`Inspecao`/`Aprovacao`)
10. **Admin/Encerramento**: marca Pedido/Projeto como Entregue e grava **Nº Série** no projeto

---

## UC-E2E-02 — Alteração de desenho após início (impacto controlado)
**Sequência:**
1. **Engenharia**: identifica item afetado via `WhereUsed`
2. **Engenharia**: cria nova revisão do desenho em `RevisaoDesenho` (ex.: B->C)
3. **Engenharia**: atualiza BOM se necessário em `EstruturaProduto`
4. **Relatórios**: recalcula consolidado de materiais (mudança de qty/itens)
5. **Compras**: ajusta necessidade (cancelar/complementar)
6. **Produção**: atualiza cartões/etapas no `KanbanProducao`
7. **Qualidade**: reforça inspeção conforme mudança

---

## UC-E2E-03 — Pedido já nasce com Número de Série (rastreio futuro)
**Sequência:**
1. **Vendas**: cria Pedido e informa Nº Série (ou reserva faixa)
2. **Engenharia**: vincula projeto ao Pedido e Nº Série em `DetalheProjeto`
3. **Produção/Qualidade**: registros do projeto ficam associados ao Nº Série
4. **Consulta futura**: por cliente -> lista de séries -> itens/desenhos/revisões usados

---

# Sequências curtas exemplificadas (como você pediu)

- Vendas -> `CadastroPedido` -> (gera) Projeto -> Engenharia -> BOM/Desenhos -> Produção
- Engenharia -> `WhereUsed` -> `RevisaoDesenho` -> Atualiza BOM -> Recalcula consolidado
- Projeto -> Relatório consolidado -> Compras -> Entrada/Reserva -> Produção -> Qualidade
