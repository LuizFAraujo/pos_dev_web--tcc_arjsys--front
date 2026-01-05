# Guia de Configuração do Ambiente Frontend - Parte 5: Zustand

Esta parte detalha a configuração do Zustand para gerenciamento de estado global.

-----

## Etapas

[1 - Instalar Dependências](#1---instalar-dependências)  
[2 - Criar Store Zustand](#2---criar-store-zustand)  
[3 - Resumo da Fase](#3---resumo-da-fase)

-----

## [1 -](#etapas) Instalar Dependências

Certifique-se de estar na pasta `app`:

```bash
pwd  # Deve mostrar: .../pos_dev_web--tcc_front--arjsys/app
```

### Instalar dependências de runtime

```bash
pnpm add zustand
```

**O que faz:**

* `zustand` - Biblioteca minimalista para gerenciamento de estado global

-----

## [2 -](#etapas) Criar Store Zustand

Criar um exemplo de store global com contador e configurar o index para facilitar imports.

### Criar o arquivo da store

**No Linux/Mac:**

```bash
touch src/stores/useAppStore.ts
```

**No Windows (CMD):**

```cmd
type nul > src\stores\useAppStore.ts
```

### Conteúdo da store

**Arquivo: `src/stores/useAppStore.ts`**

```ts
import { create } from "zustand";

interface AppState {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
}));
```

### Criar arquivo index para centralizar exports

**No Linux/Mac:**

```bash
touch src/stores/index.ts
```

**No Windows (CMD):**

```cmd
type nul > src\stores\index.ts
```

**Arquivo: `src/stores/index.ts`**

```ts
export * from './useAppStore';
```

> **Por que criar o index.ts?**  
> Facilita os imports. Ao invés de `import { useAppStore } from '@stores/useAppStore'`, você usa apenas `import { useAppStore } from '@stores'`.

### Exemplo de uso

Para usar a store em um componente:

```tsx
import { useAppStore } from "@stores";

export function Counter() {
  const { count, increment, decrement, reset } = useAppStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

-----

## [3 -](#etapas) Resumo da Fase

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
│   │   │   ├── index.ts
│   │   │   └── useAppStore.ts
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routeTree.gen.ts
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

### Testar o Zustand

Para verificar se o Zustand está funcionando:

1. Edite o arquivo `src/routes/index.tsx` para adicionar um componente de teste usando a store:

   ```tsx
   import { createFileRoute } from "@tanstack/react-router";
   import { useAppStore } from "@stores";
   
   export const Route = createFileRoute("/")({
     component: Home,
   });
   
   function Home() {
     const { count, increment, decrement, reset } = useAppStore();
   
     return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="text-center px-8 py-6 bg-white rounded-xl shadow-md">
           <h1 className="text-5xl font-semibold tracking-tight text-gray-800">
             Hello World
           </h1>
           <p className="mt-4 text-gray-600">
             Vite + React 19 + Tailwind 4 + TanStack Router + Zustand
           </p>
   
           {/* Contador Zustand */}
           <div className="mt-8 pt-6 border-t border-gray-200">
             <p className="text-3xl font-bold text-center text-gray-700">
               Count: {count}
             </p>
             <div className="flex gap-3 mt-4 justify-center">
               <button
                 onClick={increment}
                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
               >
                 +
               </button>
               <button
                 onClick={decrement}
                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
               >
                 -
               </button>
               <button
                 onClick={reset}
                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
               >
                 Reset
               </button>
             </div>
           </div>
         </div>
       </div>
     );
   }
   ```

2. Execute o projeto:

   ```bash
   pnpm dev
   ```

Se os botões funcionarem e o contador atualizar, o Zustand está funcionando corretamente!

-----
