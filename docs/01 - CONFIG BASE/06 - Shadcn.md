# Guia de Configuração do Ambiente Frontend - Parte 6: shadcn/ui

Esta parte detalha a configuração do shadcn/ui para componentes de interface.

-----

## Etapas

[1 - Configurar Alias no tsconfig.json](#1---configurar-alias-no-tsconfigjson)  
[2 - Instalar tw-animate-css](#2---instalar-tw-animate-css)  
[3 - Inicializar o shadcn/ui](#3---inicializar-o-shadcnui)  
[4 - Verificar Arquivos Gerados](#4---verificar-arquivos-gerados)  
[5 - Instalar Componentes](#5---instalar-componentes)  
[6 - Criar Interface Demonstrativa](#6---criar-interface-demonstrativa)  
[7 - Resumo da Fase](#7---resumo-da-fase)

-----

## [1 -](#etapas) Configurar Alias no tsconfig.json

O shadcn/ui requer que o alias `@/*` esteja configurado no arquivo raiz `tsconfig.json`, mesmo que já esteja no `tsconfig.paths.json`.

### Editar `tsconfig.json`

Adicionar a configuração de alias:

**Arquivo: `tsconfig.json` (na raiz de `app/`)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

-----

## [2 -](#etapas) Instalar tw-animate-css

O shadcn/ui com Tailwind CSS 4 requer a biblioteca `tw-animate-css` para animações.

### Instalar dependência

```bash
cd app
pnpm add tw-animate-css
```

> **Nota:** Esta dependência é necessária para as animações dos componentes shadcn/ui funcionarem corretamente com Tailwind CSS 4.x.

-----

## [3 -](#etapas) Inicializar o shadcn/ui

Executar o comando de inicialização do shadcn/ui.

### Comando de inicialização

```bash
pnpm dlx shadcn@latest init
```

### Processo de instalação

O CLI irá:

1. Detectar automaticamente o Vite e Tailwind v4
2. Validar os imports alias configurados no `tsconfig.json`
3. Perguntar qual **cor base** você quer usar

**Recomendação:** Escolha **Slate** quando perguntado sobre a cor base.

### Etapas executadas automaticamente

1. Preflight checks
2. Verifying framework (Found Vite)
3. Validating Tailwind CSS config (Found v4)
4. Validating import alias
5. **Which color would you like to use as the base color?** → Escolha **Slate**
6. Writing `components.json`
7. Updating CSS variables in `src/styles/tailwind.css`
8. Installing dependencies (`clsx`, `tailwind-merge`, `lucide-react`)
9. Creating `src/lib/utils.ts`

-----

## [4 -](#etapas) Verificar Arquivos Gerados

O shadcn/ui cria e modifica alguns arquivos automaticamente.

### Verificar `tailwind.css`

O CLI adiciona variáveis CSS ao arquivo usando a sintaxe do Tailwind CSS 4.1:

**Arquivo: `src/styles/tailwind.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.704 0.04 256.788);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> **Observação:** Note o uso de `bg-linear-to-br` ao invés de `bg-gradient-to-br` - esta é a nova sintaxe do Tailwind CSS 4.1. O Tailwind mostrará avisos sugerindo esta mudança, mas `bg-gradient-*` ainda funciona.

### Verificar `components.json`

O arquivo de configuração do shadcn/ui:

**Arquivo: `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### Verificar `utils.ts`

O shadcn cria o arquivo de funções auxiliares:

**Arquivo: `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

> **O que faz a função `cn`?**  
> Combina classes do Tailwind CSS de forma inteligente, resolvendo conflitos automaticamente. Essencial para customizar componentes shadcn/ui.

-----

## [5 -](#etapas) Instalar Componentes

Instalar componentes básicos para o projeto.

### Instalar componentes iniciais

```bash
pnpm dlx shadcn@latest add button card input
```

Isso criará:

- `src/components/ui/button.tsx` - Componente de botão com 6 variantes
- `src/components/ui/card.tsx` - Componente de card com subcomponentes
- `src/components/ui/input.tsx` - Campo de entrada estilizado

> **Explorar mais componentes:**  
> Visite [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components) para ver todos os componentes disponíveis.

### Comandos úteis do shadcn/ui

```bash
# Listar todos os componentes disponíveis
pnpm dlx shadcn@latest add

# Adicionar componente específico
pnpm dlx shadcn@latest add [component-name]

# Adicionar múltiplos componentes
pnpm dlx shadcn@latest add button card input dialog

# Atualizar componentes
pnpm dlx shadcn@latest update

# Ver diferenças antes de atualizar
pnpm dlx shadcn@latest diff [component-name]
```

-----

## [6 -](#etapas) Criar Interface Demonstrativa

Vamos criar uma interface completa para demonstrar todos os componentes e integrá-los com Zustand.

### Atualizar `index.tsx`

Criar uma interface componentizada e organizada:

**Arquivo: `src/routes/index.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@stores";
import { Button } from "@ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Plus, Minus, RotateCcw, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-3">
      <Card className="w-full max-w-6xl shadow-2xl border-slate-200/60 backdrop-blur-sm bg-white/95">
        <PageHeader />
        
        <CardContent className="p-4 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <SearchInput />
              <ButtonVariants />
            </div>
            
            {/* Coluna Direita */}
            <div className="space-y-4">
              <ButtonSizes />
              <CounterSection />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// SUBCOMPONENTES
// ========================================

function PageHeader() {
  return (
    <CardHeader className="text-center space-y-3 py-5 bg-linear-to-br from-slate-50 to-white border-b">
      <div className="flex items-center justify-center gap-3">
        <div className="w-11 h-11 bg-linear-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          ArjSys
        </CardTitle>
      </div>
      <CardDescription className="text-base text-slate-700 font-medium">
        Sistema de Gerenciamento de Projetos Mecânicos
      </CardDescription>
      <CardDescription className="text-sm text-slate-500 font-mono bg-slate-100 px-4 py-1.5 rounded-full inline-block">
        Vite + React 19 + Tailwind 4 + TanStack Router + Zustand + Shadcn UI
      </CardDescription>
    </CardHeader>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-1 h-4 ${color} rounded-full`} />
      <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
        {children}
      </h3>
    </div>
  );
}

function SearchInput() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-slate-600 to-slate-400">
        Campo de Busca
      </SectionTitle>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
        <Input
          type="text"
          placeholder="Digite algo aqui..."
          className="pl-10 h-9 text-sm border-slate-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 bg-white transition-all"
        />
      </div>
    </div>
  );
}

function ButtonVariants() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-blue-600 to-blue-400">
        Variantes de Botão
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Button className="h-9 font-medium text-xs shadow-md hover:shadow-xl hover:scale-[1.02] transition-all hover:bg-slate-900">
          Default
        </Button>
        <Button 
          variant="secondary" 
          className="h-9 font-medium text-xs hover:bg-slate-300 hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Secondary
        </Button>
        <Button 
          variant="outline" 
          className="h-9 font-medium text-xs border-2 hover:bg-slate-100 hover:border-slate-400 hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Outline
        </Button>
        <Button 
          variant="destructive" 
          className="h-9 font-medium text-xs shadow-md hover:shadow-xl hover:scale-[1.02] hover:bg-red-700 transition-all"
        >
          Destructive
        </Button>
        <Button 
          variant="ghost" 
          className="h-9 font-medium text-xs hover:bg-slate-200 hover:shadow-sm hover:scale-[1.02] transition-all"
        >
          Ghost
        </Button>
        <Button 
          variant="link" 
          className="h-9 font-medium text-xs hover:underline-offset-4 hover:scale-[1.02] transition-all"
        >
          Link
        </Button>
      </div>
    </div>
  );
}

function ButtonSizes() {
  return (
    <div>
      <SectionTitle color="bg-linear-to-b from-purple-600 to-purple-400">
        Tamanhos
      </SectionTitle>
      <div className="flex gap-2 items-center justify-center flex-wrap">
        <Button 
          size="sm" 
          className="shadow-sm text-xs hover:shadow-lg hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Small
        </Button>
        <Button 
          size="default" 
          className="shadow-sm text-xs hover:shadow-lg hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Default
        </Button>
        <Button 
          size="lg" 
          className="shadow-md text-sm hover:shadow-xl hover:scale-105 hover:bg-slate-900 transition-all"
        >
          Large
        </Button>
        <Button 
          size="icon" 
          variant="outline" 
          className="border-2 h-9 w-9 hover:bg-slate-100 hover:border-slate-400 hover:shadow-md hover:scale-105 transition-all"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CounterSection() {
  const { count, increment, decrement, reset } = useAppStore();

  return (
    <div className="pt-3 border-t-2 border-slate-200">
      <SectionTitle color="bg-linear-to-b from-emerald-600 to-emerald-400">
        Contador com Zustand
      </SectionTitle>
      
      <div className="relative overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200 shadow-inner">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-linear-to-tr from-slate-200/50 to-transparent rounded-full blur-2xl" />
        
        {/* Counter display */}
        <div className="relative text-center mb-3">
          <div className="inline-block">
            <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter drop-shadow-sm">
              {count}
            </div>
            <div className="h-0.5 w-full bg-linear-to-r from-transparent via-slate-400 to-transparent mt-1 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
            Gerenciamento de Estado Global
          </p>
        </div>

        {/* Counter buttons */}
        <div className="relative flex gap-2 justify-center items-center">
          <Button
            onClick={decrement}
            variant="destructive"
            className="w-11 h-11 rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:bg-red-700 transition-all"
          >
            <Minus className="h-5 w-5" strokeWidth={3} />
          </Button>
          
          <Button
            onClick={reset}
            variant="outline"
            className="px-4 h-11 rounded-lg border-2 shadow-md hover:shadow-xl hover:scale-105 hover:bg-slate-100 hover:border-slate-400 transition-all font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          
          <Button
            onClick={increment}
            className="w-11 h-11 rounded-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:bg-slate-900 transition-all bg-linear-to-br from-slate-700 to-slate-900"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Características da Interface

**Design:**

- Layout responsivo de 2 colunas (1 coluna em mobile)
- Gradientes sutis no fundo e elementos
- Efeitos hover fortes e perceptíveis
- Animações de escala nos botões
- Sombras dinâmicas
- Compacto para caber em telas de notebook sem scroll

**Organização:**

- 6 subcomponentes modulares
- Componente principal com apenas 10 linhas
- Helper `SectionTitle` reutilizável
- Separação clara de responsabilidades

**Funcionalidades:**

- Campo de busca com ícone integrado
- 6 variantes de botão demonstradas
- 4 tamanhos de botão
- Contador Zustand integrado
- Todos os componentes shadcn/ui utilizados

-----

## [7 -](#etapas) Resumo da Fase

### Estrutura Final do Projeto

```bash
pos_dev_web--tcc_front--arjsys/
├── app/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       └── input.tsx
│   │   ├── helpers/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── routes/
│   │   │   ├── __root.tsx
│   │   │   └── index.tsx
│   │   ├── services/
│   │   ├── stores/
│   │   │   ├── index.ts
│   │   │   └── useAppStore.ts
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routeTree.gen.ts
│   │   └── vite-env.d.ts
│   ├── .eslint.config.js
│   ├── components.json
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.paths.json
│   └── vite.config.ts
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── .gitignore
```

### Testar o Projeto

Execute o projeto:

```bash
pnpm dev
```

Você deve ver:

- ✅ Interface completa e estilizada
- ✅ Card com sombra e gradientes
- ✅ Input com focus state azul
- ✅ 6 variantes de botão com hover forte
- ✅ 4 tamanhos de botão
- ✅ Contador funcional integrado com Zustand
- ✅ Layout responsivo (2 colunas desktop, 1 mobile)
- ✅ Efeitos de escala e sombra nos hovers

### Dependências Instaladas

**Automáticas (pelo shadcn init):**

- `clsx` - Combinar classes condicionalmente
- `tailwind-merge` - Resolver conflitos Tailwind
- `lucide-react` - Biblioteca de ícones

**Manual:**

- `tw-animate-css` - Animações para Tailwind CSS 4

### Próximos Passos

Agora que o ambiente base está completo, você pode:

1. **Adicionar mais componentes shadcn/ui conforme necessário:**

   ```bash
   pnpm dlx shadcn@latest add dialog table select
   ```

2. **Implementar o sistema real:**
   - Autenticação (Login/Logout)
   - Layout base (Header + Sidebar)
   - Páginas CRUD
   - Integração com backend

3. **Configurar PWA (opcional):**

   - Para funcionalidades offline
   - Para instalação no desktop/mobile

-----

**🎉 Ambiente Base 100% Completo!**

Stack configurada:

- ⚡ Vite 7
- ⚛️ React 19
- ⌨️ TypeScript
- 🎨 Tailwind CSS 4.1
- 🧭 TanStack Router
- 🐻 Zustand
- 🧩 shadcn/ui
- 📦 pnpm workspace

-----
