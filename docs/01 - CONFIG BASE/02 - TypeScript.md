<!-- markdownlint-disable MD0290 -->

# Guia de Configuração do Ambiente Frontend - Parte 2: TypeScript

Esta parte detalha a configuração do TypeScript com aliases e estrutura de pastas.

-----

## Etapas

[1 - Instalar Dependências](#1---instalar-dependências)  
[2 - Criar Estrutura de Pastas](#2---criar-estrutura-de-pastas)  
[3 - Configurar os Aliases do TypeScript](#3---configurar-os-aliases-do-typescript)  
[4 - Configurar o Vite](#4---configurar-o-vite)  
[5 - Criar/Editar vite-env.d.ts](#5---criareditar-vite-envdts)  
[6 - Ajustar os Arquivos de Configuração do TypeScript](#6---ajustar-os-arquivos-de-configuração-do-typescript)  
[7 - Resumo da Fase](#7---resumo-da-fase)

-----

## [1 -](#etapas) Instalar Dependências

Certifique-se de estar na pasta `app`:

```bash
pwd  # Deve mostrar: .../pos_dev_web--tcc_front--arjsys/app
```

### Instalar dependências de desenvolvimento

```bash
pnpm add -D vite-tsconfig-paths @types/node
```

**O que cada uma faz:**

* `vite-tsconfig-paths` - Permite usar os aliases do TypeScript no Vite
* `@types/node` - Tipos do Node.js para TypeScript

-----

## [2 -](#etapas) Criar Estrutura de Pastas

Criar a estrutura de diretórios do projeto:

```bash
mkdir -p src/components/ui src/helpers src/hooks src/layouts src/lib src/routes src/services src/stores src/styles
```

> A flag `-p` (parent) cria todas as pastas intermediárias necessárias e não gera erro se a pasta já existir.

**Para que serve cada pasta:**

* `src/components/` - Componentes React reutilizáveis
* `src/components/ui/` - Componentes de interface (botões, inputs, cards, etc)
* `src/helpers/` - Funções auxiliares e utilitários gerais
* `src/hooks/` - Custom hooks do React
* `src/layouts/` - Componentes de layout (header, footer, sidebar, etc)
* `src/lib/` - Bibliotecas e configurações de terceiros (usado por shadcn)
* `src/routes/` - Páginas e rotas da aplicação (usado por TanStack Router)
* `src/services/` - Serviços de API e integração com backend
* `src/stores/` - Gerenciamento de estado global
* `src/styles/` - Arquivos de estilo CSS/SCSS

-----

## [3 -](#etapas) Configurar os Aliases do TypeScript

Criar um arquivo centralizado para os aliases de importação.

### Criar o arquivo de aliases

**No Linux/Mac:**

```bash
touch tsconfig.paths.json
```

**No Windows (CMD):**

```cmd
type nul > tsconfig.paths.json
```

### Conteúdo do arquivo de aliases

**Arquivo: `tsconfig.paths.json` (na raiz de `app/`)**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@components": ["src/components/index.ts"],
      "@ui/*": ["src/components/ui/*"],
      "@ui": ["src/components/ui/index.ts"],
      "@helpers/*": ["src/helpers/*"],
      "@helpers": ["src/helpers/index.ts"],
      "@hooks/*": ["src/hooks/*"],
      "@hooks": ["src/hooks/index.ts"],
      "@layouts/*": ["src/layouts/*"],
      "@layouts": ["src/layouts/index.ts"],
      "@lib/*": ["src/lib/*"],
      "@lib": ["src/lib/index.ts"],
      "@routes/*": ["src/routes/*"],
      "@routes": ["src/routes/index.ts"],
      "@services/*": ["src/services/*"],
      "@services": ["src/services/index.ts"],
      "@stores/*": ["src/stores/*"],
      "@stores": ["src/stores/index.ts"],
      "@styles/*": ["src/styles/*"],
      "@styles": ["src/styles/index.ts"]
    }
  }
}
```

> **Para que servem os aliases?**  
> Permitem importar arquivos usando caminhos curtos como `@components/Button` ao invés de `../../../components/Button`.

-----

## [4 -](#etapas) Configurar o Vite

Editar o arquivo `vite.config.ts` para integrar o plugin de TypeScript paths.

**Conteúdo do `vite.config.ts`:**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths(),
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

* Importado `tsConfigPaths` do pacote `vite-tsconfig-paths`
* Adicionado `tsConfigPaths()` ao array de plugins

-----

## [5 -](#etapas) Criar/Editar vite-env.d.ts

O Vite geralmente cria este arquivo automaticamente, mas caso não exista, é necessário criá-lo para os tipos do Vite funcionarem corretamente.

### Verificar se o arquivo existe

```bash
ls src/vite-env.d.ts
```

### Se o arquivo não existir, criar

**No Linux/Mac:**

```bash
touch src/vite-env.d.ts
```

**No Windows (CMD):**

```cmd
type nul > src\vite-env.d.ts
```

### Conteúdo do arquivo `vite-env.d.ts`

**Arquivo: `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

> Este arquivo declara os tipos do Vite para o TypeScript, permitindo que o editor reconheça imports de assets e variáveis de ambiente.

-----

## [6 -](#etapas) Ajustar os Arquivos de Configuração do TypeScript

Editar apenas as partes necessárias dos arquivos de configuração.

### Ajuste em `tsconfig.app.json`

Adicionar as seguintes propriedades:

```json
{
  "compilerOptions": {
    /* ... outros já existentes */
    
    "resolveJsonModule": true,
    "composite": true
  },
  "extends": "./tsconfig.paths.json",
  "include": ["src", "src/vite-env.d.ts"]
}
```

**O que foi alterado:**

* `extends` - Herda os aliases do `tsconfig.paths.json`
* `resolveJsonModule: true` - Permite importar arquivos JSON com tipagem
* `composite: true` - Necessário quando este tsconfig é referenciado por outro
* `include` - Adicionado `src/vite-env.d.ts` explicitamente (caso o Vite não tenha adicionado automaticamente)

### Ajuste em `tsconfig.node.json`

Adicionar as seguintes propriedades:

```json
{
  "compilerOptions": {
    /* ... outros já existentes */
    
    "types": ["node"],
    "composite": true
  },
  "include": ["vite.config.ts"]
}
```

**O que foi alterado:**

* `types: ["node"]` - Tipos do Node.js para scripts do Vite (verifique se já não está configurado pelo Vite)
* `composite: true` - Habilita build incremental

> **Nota:** O Vite pode já ter configurado `"types": ["node"]` automaticamente. Verifique o arquivo antes de adicionar para não duplicar.

-----

## [7 -](#etapas) Resumo da Fase

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

### Testar os Aliases

Para verificar se os aliases estão funcionando:

1. Crie um arquivo de teste em `src/helpers/test.ts`:

   ```ts
   export const testHelper = () => "Hello from helper";
   ```

2. Importe no `App.tsx` usando o alias:

   ```tsx
   import { testHelper } from '@helpers/test';
   
   export default function App() {
     console.log(testHelper());
     return (
       <div>
         <h1>Hello World</h1>
         <p>ArjSys - Sistema em desenvolvimento</p>
       </div>
     )
   }
   ```

3. Execute o projeto:

   ```bash
   pnpm dev
   ```

Se não houver erros e o console mostrar "Hello from helper", os aliases estão funcionando corretamente.

-----
