# Guia de Configuração do Ambiente Frontend - Parte 3: Tailwind CSS

Esta parte detalha a configuração do Tailwind CSS 4.1 no projeto.

-----

## Etapas

[1 - Instalar Dependências](#1---instalar-dependências)  
[2 - Criar Arquivo CSS do Tailwind](#2---criar-arquivo-css-do-tailwind)  
[3 - Configurar o Vite](#3---configurar-o-vite)  
[4 - Importar CSS no Main](#4---importar-css-no-main)  
[5 - Resumo da Fase](#5---resumo-da-fase)

-----

## [1 -](#etapas) Instalar Dependências

Certifique-se de estar na pasta `app`:

```bash
pwd  # Deve mostrar: .../pos_dev_web--tcc_front--arjsys/app
```

### Instalar dependências de desenvolvimento

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

**O que cada uma faz:**

* `tailwindcss` - Framework CSS utilitário
* `@tailwindcss/vite` - Plugin oficial do Tailwind para Vite

-----

## [2 -](#etapas) Criar Arquivo CSS do Tailwind

Criar o arquivo de estilos principal do Tailwind.

### Criar o arquivo

**No Linux/Mac:**

```bash
touch src/styles/tailwind.css
```

**No Windows (CMD):**

```cmd
type nul > src\styles\tailwind.css
```

### Conteúdo do arquivo

**Arquivo: `src/styles/tailwind.css`**

```css
@import "tailwindcss";
```

> **Nota:** No Tailwind CSS 4.1, basta importar `tailwindcss` diretamente. Não é mais necessário usar `@tailwind base`, `@tailwind components` e `@tailwind utilities`.

-----

## [3 -](#etapas) Configurar o Vite

Editar o arquivo `vite.config.ts` para integrar o plugin do Tailwind.

**Conteúdo do `vite.config.ts`:**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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

**O que mudou:**

* Importado `tailwindcss` do pacote `@tailwindcss/vite`
* Adicionado `tailwindcss()` ao array de plugins

-----

## [4 -](#etapas) Importar CSS no Main

Adicionar a importação do CSS do Tailwind no arquivo principal.

### Editar `main.tsx`

**Arquivo: `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@styles/tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**O que mudou:**

* Adicionada importação: `import './styles/tailwind.css'`

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
│   │   ├── services/
│   │   ├── stores/
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── App.tsx
│   │   ├── main.tsx
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

### Testar o Tailwind CSS

Para verificar se o Tailwind está funcionando:

1. Edite o `App.tsx` para usar classes do Tailwind:

   ```tsx
   export default function App() {
     return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="px-8 py-6 bg-white rounded-xl shadow-md">
           <h1 className="text-5xl font-semibold tracking-tight text-gray-800">
             Hello World
           </h1>
           <p className="text-center mt-4 text-gray-600">
             Vite + React 19 + Tailwind 4
           </p>
         </div>
       </div>
     );
   }
   ```

2. Execute o projeto:

   ```bash
   pnpm dev
   ```

Se os estilos aparecerem (fundo cinza, card branco centralizado, etc), o Tailwind está funcionando corretamente.

-----
