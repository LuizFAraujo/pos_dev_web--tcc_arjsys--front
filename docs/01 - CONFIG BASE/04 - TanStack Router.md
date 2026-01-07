# Guia de Configuração do Ambiente Frontend - Parte 4: TanStack Router

Esta parte detalha a configuração do TanStack Router para roteamento type-safe baseado em arquivos.

-----

## Etapas

[1 - Instalar Dependências](#1---instalar-dependências)  
[2 - Configurar o Vite](#2---configurar-o-vite)  
[3 - Criar Estrutura de Rotas](#3---criar-estrutura-de-rotas)  
[4 - Configurar o Router](#4---configurar-o-router)  
[5 - Resumo da Fase](#5---resumo-da-fase)

-----

## [1 -](#etapas) Instalar Dependências

Certifique-se de estar na pasta `app`:

```bash
pwd  # Deve mostrar: .../pos_dev_web--tcc_front--arjsys/app
```

### Instalar dependências de runtime

```bash
pnpm add @tanstack/react-router
```

**O que faz:**

* `@tanstack/react-router` - Sistema de roteamento type-safe baseado em arquivos

### Instalar dependências de desenvolvimento

```bash
pnpm add -D @tanstack/router-devtools @tanstack/router-plugin
```

**O que cada uma faz:**

* `@tanstack/router-devtools` - Ferramenta de debug para o TanStack Router
* `@tanstack/router-plugin` - Plugin que gera automaticamente o tree de rotas

-----

## [2 -](#etapas) Configurar o Vite

Editar o arquivo `vite.config.ts` para integrar o plugin do TanStack Router.

**Conteúdo do `vite.config.ts`:**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      semicolons: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "_dist",
  },
  server: {
    open: true,
  },
});
```

> **Importante:** A ordem dos plugins importa! O `tanstackRouter` deve vir antes do `react()` para gerar as rotas corretamente.

### Opções de Configuração do Plugin

**Opções com valores padrão:**

| Opção | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `routesDirectory` | `"./src/routes"` | Pasta onde ficam os arquivos de rota |
| `generatedRouteTree` | `"./src/routeTree.gen.ts"` | Arquivo gerado automaticamente com a árvore de rotas |
| `routeFileIgnorePrefix` | `"-"` | Prefixo para ignorar arquivos (ex: `-components.tsx` não será tratado como rota) |
| `semicolons` | `false` | Adiciona ponto e vírgula nos arquivos gerados |

**Opções adicionais configuradas:**

| Opção | Valor Padrão | Valor Usado | Descrição |
|-------|--------------|-------------|-----------|
| `target` | *(obrigatório)* | `'react'` | Framework usado (`'react'`, `'solid'`, `'vue'`, etc) |
| `autoCodeSplitting` | `false` | `true` | Ativa divisão automática do código em chunks menores para melhor performance |

> **Nota sobre valores padrão:** As opções `routesDirectory`, `generatedRouteTree`, `routeFileIgnorePrefix` e `semicolons` têm valores padrão. Deixá-las explícitas é uma boa prática para documentação e clareza do projeto.
> **Sobre `autoCodeSplitting: true`:** Seguindo o exemplo da documentação oficial, ativamos essa opção para otimizar o carregamento. **Atenção:** Em alguns casos pode causar lentidão no Hot Module Replacement (HMR) durante desenvolvimento. Se isso ocorrer, você pode desativar temporariamente (`false`) e reativar antes do build de produção.

-----

## [3 -](#etapas) Criar Estrutura de Rotas

Criar os arquivos de rotas baseados em arquivos.

### Criar arquivo de rota raiz

**No Linux/Mac:**

```bash
touch src/routes/__root.tsx
```

**No Windows (CMD):**

```cmd
type nul > src\routes\__root.tsx
```

**Conteúdo do `src/routes/__root.tsx`:**

```tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
```

### Criar rota index

**No Linux/Mac:**

```bash
touch src/routes/index.tsx
```

**No Windows (CMD):**

```cmd
type nul > src\routes\index.tsx
```

**Conteúdo do `src/routes/index.tsx`:**

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center px-8 py-6 bg-white rounded-xl shadow-md">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-800">
          Hello World
        </h1>
        <p className="mt-4 text-gray-600">
          Vite + React 19 + Tailwind 4 + TanStack Router
        </p>
      </div>
    </div>
  );
}
```

> **Nota:** É normal aparecer erro de tipo TypeScript no `createFileRoute("/")` antes da primeira execução. O erro desaparecerá automaticamente após o plugin gerar o arquivo `routeTree.gen.ts`.

-----

## [4 -](#etapas) Configurar o Router

Configurar o RouterProvider mantendo a estrutura com App.tsx.

### Criar/Editar `App.tsx`

**Arquivo: `src/App.tsx`**

```tsx
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
```

> **Nota importante:** O arquivo `routeTree.gen.ts` será gerado automaticamente pelo plugin na primeira execução. Não tente criá-lo manualmente!

-----

## [5 -](#etapas) Resumo da Fase

### Estrutura Atual do Projeto

Após completar esta parte, sua estrutura deve estar assim:

```bash
pos_dev_web--tcc_front--arjsys/
├── app/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── helpers/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── routes/
│   │   │   ├── __root.tsx
│   │   │   └── index.tsx
│   │   ├── services/
│   │   ├── stores/
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routeTree.gen.ts (gerado automaticamente)
│   │   └── vite-env.d.ts
│   ├── .eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.paths.json
│   └── vite.config.ts
├── docs/
├── README.md
└── .gitignore
```

### Testar o TanStack Router

Para verificar se o router está funcionando:

1. Execute o projeto:

   ```bash
   pnpm dev
   ```

2. O arquivo `routeTree.gen.ts` será gerado automaticamente

3. A aplicação deve abrir mostrando "Hello World" com os estilos do Tailwind

4. No canto inferior direito, você verá o **TanStack Router Devtools** (um ícone pequeno)

Se tudo aparecer corretamente, o TanStack Router está funcionando!

-----
