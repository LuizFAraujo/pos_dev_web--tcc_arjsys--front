<!-- markdownlint-disable-file -->
# 🎨 Melhorias Futuras - ArjSYS

Este documento registra melhorias, refatorações e funcionalidades opcionais que podem ser implementadas no futuro para aprimorar o sistema.

---

## 🔧 Refatorações Técnicas

### 1. TypeScript: Extrair CategoryId como Type Separado
**Localização:** `src/types/registry.types.ts`

**Situação atual:**
```typescript
export interface TabConfig {
    category: 'cadastros' | 'vendas' | 'producao' | 'compras' | 'engenharia' | 'modelos';
}
```

**Melhoria proposta:**
```typescript
export type CategoryId = 'modelos' | 'cadastros' | 'vendas' | 'producao' | 'compras' | 'engenharia';

export interface TabConfig {
    category: CategoryId;
}
```

**Benefícios:**
- ✅ Reutilização do tipo em múltiplos lugares
- ✅ Type safety em `Sidebar.tsx` (CATEGORIES array)
- ✅ Detecção automática de typos
- ✅ Manutenção centralizada (mudar em 1 lugar)
- ✅ Facilita validação em `getTabsByCategory()`

**Arquivos afetados:**
- `src/types/registry.types.ts` (adicionar type)
- `src/layouts/Sidebar.tsx` (tipar CATEGORIES array)
- `src/registries/*.ts` (já usa indiretamente via TabConfig)

**Status:** ⏸️ Adiada (não urgente, mas recomendada)

---

## 🎨 Funcionalidades Opcionais

### 2. PageRightSidebar: Variantes (Overlay vs Push)
**Localização:** `src/components/shared/PageRightSidebar.tsx`

**Descrição:**
Adicionar suporte para sidebar que empurra conteúdo ao invés de sobrepor.

**Implementação:**

#### 2.1 - Adicionar prop variant
- [ ] Tipo: `'overlay' | 'push'`
- [ ] Default: `'overlay'` (comportamento atual)

#### 2.2 - Implementar variante Push
- [ ] Layout flex row na página
- [ ] Sidebar empurra conteúdo responsivamente
- [ ] Sem backdrop (sidebar faz parte do layout)
- [ ] Transição suave de largura

#### 2.3 - Atualizar ModeloFormPage (demonstração)
- [ ] Botão 1: "Config Overlay" (passa por cima)
- [ ] Botão 2: "Config Push" (empurra conteúdo)
- [ ] Demonstrar ambos comportamentos

#### 2.4 - Ajustar PageWrapper
- [ ] Flex layout quando sidebar push ativo
- [ ] Redimensionamento responsivo do conteúdo

**Status:** ⏸️ Adiada (funcionalidade opcional)

---

## 📱 PWA (Progressive Web App)

### 3. Configurar PWA Completo
**Status:** ⏸️ Deixado como melhoria futura

**Pacotes necessários:**
- `vite-plugin-pwa`
- `workbox-precaching`
- `workbox-routing`
- `workbox-strategies`

**Tarefas:**
- [ ] Configurar `vite.config.ts` com VitePWA plugin
- [ ] Criar `manifest.json` completo
- [ ] Configurar service worker
- [ ] Adicionar ícones PWA (192x192, 512x512)
- [ ] Configurar estratégias de cache
- [ ] Testar offline mode
- [ ] Adicionar prompt de instalação

---

## 🎯 Outras Melhorias

### 4. Sistema de Temas: Mais Variantes
**Descrição:**
Adicionar mais opções de tema além de light/dark.

**Sugestões:**
- High contrast mode (acessibilidade)
- Temas de cor (azul, verde, roxo)
- Auto (baseado em horário)

**Status:** 💡 Ideia

---

### 5. Command Palette: Expansão
**Descrição:**
Expandir funcionalidades do Command Palette (Ctrl+K).

**Ideias:**
- Busca global por conteúdo (não só páginas)
- Ações rápidas (criar novo, logout, etc)
- Navegação por histórico
- Favoritos destacados

**Status:** 💡 Ideia

---

### 6. Atalhos de Teclado: Documentação
**Descrição:**
Criar página ou modal mostrando todos os atalhos disponíveis.

**Atalhos atuais:**
- `Ctrl+K` - Command Palette
- `Ctrl+W` - Fechar aba
- (outros conforme implementados)

**Status:** 💡 Ideia

---

### 7. Tabs: Funcionalidades Extras
**Descrição:**
Melhorias no sistema de abas.

**Ideias:**
- [ ] Fechar todas as abas
- [ ] Fechar outras abas
- [ ] Reabrir aba fechada (Ctrl+Shift+T)
- [ ] Histórico de abas fechadas
- [ ] Duplicar aba

**Status:** 💡 Ideia

---

### 8. Responsividade Mobile Completa
**Descrição:**
Otimizar totalmente para dispositivos móveis.

**Tarefas:**
- [ ] Header mobile adaptado
- [ ] Sidebar mobile drawer
- [ ] Tabs mobile (swipe?)
- [ ] Formulários mobile-friendly
- [ ] Touch gestures

**Status:** ⏸️ Adiada (não é prioridade inicial)

---

## 📊 Legendas de Status

| Status | Significado |
|--------|-------------|
| 📌 TODO | Deve ser implementado em breve |
| ⏸️ Adiada | Deixada para depois, não urgente |
| 💡 Ideia | Sugestão para avaliar futuramente |
| 🚧 Em andamento | Sendo implementada |
| ✅ Concluída | Implementada e testada |

---

## 🔄 Como Usar Este Documento

1. **Surgiu uma melhoria?** Adicione aqui para não esquecer
2. **Planejando próximas etapas?** Consulte este arquivo
3. **Implementou algo?** Mude status para ✅ e adicione commit/data
4. **Priorize:** Ordene por prioridade conforme necessidade do projeto

---

**Última atualização:** 20/01/2025