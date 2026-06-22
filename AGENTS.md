<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# React Agent Rules

## 1. Importações

### 1.1. Componentes e Hooks

- **Sempre use importações nomeadas** (ex: `import { useState } from 'react'`) em vez de importações padrão (ex: `import React from 'react'`).

### 1.2. Estilos

- **Evite importações globais**: Não use `import './styles.css'`. Importe estilos apenas quando necessário para componentes específicos.

### 1.3. Componentes Próprios

- **Nomes de arquivos**: Comece com letra maiúscula (ex: `Button.tsx`, `Modal.tsx`).
- **svg** sempre coloque em assets/icons, não quero ver o svg completo no codigo.

## 2. Componentes

### 2.1. Tipos

- **Sempre use TypeScript**: Todos os componentes devem ter tipos explícitos. Guarde no app/types/

### 2.2. State e Props

- **Use hooks**: `useState`, `useEffect`, `useContext`, etc. Não use classes.

### 2.3. NextJS 16

- Use as mais novas atualizações do NextJS 16.
- Use as mais novas atualizações do React 19
- Não precisa de memo, callback já estou utilizando o React Compiler

### 2.4. Renderização Condicional

- **Prefira ternários ou &&**: Evite múltiplos `if`'s dentro do JSX.

## 3. Hooks

### 3.1. Hooks Customizados

- Devem começar com `use` (ex: `useFetch`).
- Devem seguir a regra dos hooks (sempre no topo, sem loops/condicionais).

## 4. Estilização (Tailwind CSS)

### 4.1. Utility Classes

- **Use classes inline** em vez de componentes com estilos customizados, a menos que seja estritamente necessário.

### 4.2. Mobile-First

- Sempre comece com estilos mobile e use `sm:`, `md:`, `lg:` para breakpoints maiores.

### 4.3. Colors

- Use sempre as cores definidas no arquivo `globals.css`. Caso for precisa de outra cor, puxe uma cor que combine com o tema e crie no arquivo `globals.css`.

## 5. Código Limpo

- **Sem console.log**: Remova todos os `console.log` antes de finalizar o código.
- **Nomes descritivos** para variáveis e funções.
- **sem comentarios** deixe apenas em arquivo de configuração

## 6. Configuração do TypeScript

- **Strict mode**: Ativado por padrão.
- \*\*Non-null assertion (`!`): Use com moderação, apenas quando tiver certeza absoluta de que o valor não é nulo.
- **Use unknown em vez de any**: use unknown sempre que possivel

## 7. Testes

- **Rode npm run lint a cada demanda antes de finalizar**.
- **Teste end to end** crie test para as funcionalidades principais
- Não precisa fazer verificação manual nem rodar os teste apos cada demanda.

## 8. Estrutura de Arquivos

```
├── components/      # Componentes reutilizaveis
├── hooks/           # Hooks customizados (se tiver)
├── app/             # As paginas do site
├── actions/         # As actions
├── utils/           # Funções utilitárias
├── types/           # Tipos globais
└── contexts/        # Contextos
└── assets/          # As imagens png, svg
```

## 9. O Que Evitar

- ❌ `import React from 'react'`
- ❌ `const DD: any = 'hello'`
- ❌ `console.log('debug')` em código de produção
- ❌ Estilos complexos em JavaScript sem necessidade
- ❌ Múltiplos `if`'s aninhados no JSX
- ❌ Re-exportar tudo (`export * from './file'`) - prefira exportações nomeadas
