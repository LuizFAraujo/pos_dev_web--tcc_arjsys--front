# Guia de Configuração do Ambiente Frontend

Este guia detalha o processo de configuração do ambiente de desenvolvimento web com roteamento baseado em arquivos e suporte PWA.

## Tecnologias

* ⚡ **Vite**: Bundler de alta performance
* ⚛️ **React 19**: A mais recente versão do React
* ⌨️ **TypeScript**: Tipagem estática para JavaScript
* 🎨 **Tailwind 4.1**: Framework CSS utilitário (versão mais recente)
* 🧩 **shadcn/ui**: Componentes de UI acessíveis e personalizáveis
* 🧭 **TanStack Router**: Roteamento type-safe baseado em arquivos
* 🐻 **Zustand**: Gerenciamento de estado simples e eficiente
* 📱 **Vite PWA Plugin**: Suporte completo para Progressive Web Apps

Adotado o **pnpm** como gerenciador de pacotes, conhecido por sua eficiência e velocidade.

-----

## Etapas

[1 - Criar Estrutura Base do Projeto](#1---criar-estrutura-base-do-projeto)  
[2 - Criar o Projeto Vite](#2---criar-o-projeto-vite)  
[3 - Aprovar Builds (pnpm 10+)](#3---aprovar-builds-pnpm-10)  
[4 - Instalar Dependências](#4---instalar-dependências)  
[5 - Ajustar Arquivos Base](#5---ajustar-arquivos-base)  
[6 - Limpar Arquivos Iniciais](#6---limpar-arquivos-iniciais)  
[7 - Configurar Vite](#7---configurar-o-vite)  
[8 - Resumo da Fase](#8---resumo-da-fase)

-----

## [1 -](#etapas) Criar Estrutura Base do Projeto

Antes de tudo, vamos criar a estrutura base do projeto.

### Nome do Projeto

```bash
pos_dev_web--tcc_front--arjsys
```

### Estrutura de Diretórios

```bash
pos_dev_web--tcc_front--arjsys/
├── app/            # Projeto Web
├── docs/           # Documentação
├── README.md       # Documentação principal
└── .gitignore      # Arquivos ignorados pelo Git
```

### Comandos

**Criar e acessar o diretório base:**

```bash
mkdir pos_dev_web--tcc_front--arjsys
cd pos_dev_web--tcc_front--arjsys
```

**Criar a estrutura base:**

```bash
mkdir app docs
```

-----

## [2 -](#etapas) Criar o Projeto Vite

Agora vamos criar o projeto Vite **dentro da pasta `app`**.

### Acessar a pasta app

```bash
cd app
```

### Criar projeto Vite

```bash
pnpm create vite . --template react-ts
```

> **Nota:** O ponto (`.`) indica que o projeto será criado na pasta atual (`app`).

### Perguntas que podem aparecer

1. `Use rolldown-vite (Experimental)?:` → Escolha **No**
2. `Install with pnpm and start now?:` → Escolha **No**

> **Por que escolher "No"?**
>
> * **Rollup** é um bundler experimental em Rust. Por enquanto, é melhor usar a versão estável.
> * Vamos instalar as dependências manualmente nos próximos passos para ter mais controle sobre o processo.

-----

## [3 -](#etapas) Aprovar Builds (pnpm 10+)

> Algumas libs (`esbuild`, `@tailwindcss/oxide`) pedem aprovação de build ao instalar.

### Se aparecer aviso de ignored build scripts

```bash
pnpm ignored-builds
pnpm approve-builds
```

### Evitar esse problema no futuro

Adicionar **pnpm** no `package.json` (dentro da pasta `app`):

```json
{
  /* ... outros já existentes */

  {
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "@tailwindcss/oxide"
    ]
  }
}
```

> **Importante:** A seção `"pnpm"` deve ser adicionada no mesmo nível de `"name"`, `"scripts"`, etc.

-----

## [4 -](#etapas) Instalar Dependências

Certifique-se de estar na pasta `app`:

```bash
pwd  # Deve mostrar: .../pos_dev_web--tcc_front--arjsys/app
```

### Instalar dependências base do Vite

```bash
pnpm install
```

-----

## [5 -](#etapas) Ajustar Arquivos Base

Editar os arquivos principais para configuração inicial.

### Editar `index.html`

Alterar o idioma e o título:

**Arquivo: `index.html` (na raiz de `app/`)**

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ArjSys</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### Editar `main.tsx`

Remover a importação do CSS:

**Arquivo: `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Editar `App.tsx`

Criar um componente simples:

**Arquivo: `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>ArjSys - Sistema em desenvolvimento</p>
    </div>
  )
}
```

-----

## [6 -](#etapas) Limpar Arquivos Iniciais

Remover arquivos gerados pelo template que não serão utilizados.

### No Linux/Mac

```bash
rm -rf src/assets
rm src/App.css src/index.css
```

### No Windows (CMD)

```cmd
rmdir /s /q src\assets
del src\App.css src\index.css
```

-----

## [7 -](#etapas) Configurar o Vite

Configurar opções importantes do Vite.

### Editar `vite.config.ts`

Adicionar configurações de servidor e build:

**Arquivo: `vite.config.ts` (na raiz de `app/`)**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "_dist",
  },
  server: {
    open: true,
  },
});
```

**O que cada opção faz:**

* `server.open: true` - Abre o navegador automaticamente ao executar `pnpm dev`
* `build.outDir: '_dist'` - Define a pasta de saída do build como `_dist` ao invés de `dist`

-----

## [8 -](#etapas) Resumo da Fase

### Estrutura Atual do Projeto

Após completar esta parte, sua estrutura deve estar assim:

```bash
pos_dev_web--tcc_front--arjsys/
├── app/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── docs/
├── README.md
└── .gitignore
```

### Testar o Projeto

Para verificar se tudo está funcionando:

```bash
pnpm dev
```

O navegador deve abrir automaticamente em `http://localhost:5173` exibindo "Hello World".

-----
