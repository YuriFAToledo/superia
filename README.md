# Superia - Aplicação Next.js com Autenticação Supabase

Uma aplicação moderna construída com Next.js, TypeScript e Supabase para autenticação.

## Tecnologias Utilizadas

- Next.js 15+
- TypeScript
- Supabase (Autenticação)
- TailwindCSS

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/superia.git
cd superia
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure o Supabase

1. Crie uma conta em [Supabase](https://supabase.com)
2. Crie um novo projeto
3. No painel do Supabase, vá para Settings > API
4. Copie a URL e a anon key
5. Crie um arquivo `.env.local` na raiz do projeto usando o modelo em `src/lib/env.example`

```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-do-supabase
SITE_URL=http://localhost:3000
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Estrutura do Projeto

- `src/app` - Páginas e layouts da aplicação
- `src/components` - Componentes reutilizáveis
- `src/hooks` - Hooks personalizados (incluindo useAuth)
- `src/lib` - Utilitários e configurações
- `src/middleware.ts` - Middleware para controle de autenticação

## Funcionalidades

- Sistema de autenticação completo (login, registro, logout)
- Proteção de rotas via middleware
- Gerenciamento de sessão e tokens
- Redirecionamentos inteligentes baseados no status de autenticação

## Fluxo de Autenticação

1. O usuário se registra na página `/register`
2. O Supabase envia um email de confirmação (opcional, pode ser desativado no painel do Supabase)
3. O usuário confirma o email e é redirecionado para `/auth/callback`
4. O middleware processa o token e estabelece a sessão
5. O usuário é redirecionado para o dashboard

## Customização

Você pode personalizar a UI e adicionar funcionalidades conforme necessário. A estrutura básica de autenticação já está configurada e funcional.

## Nota para Desenvolvedores

Este projeto segue as melhores práticas de autenticação com Supabase e Next.js. A autenticação é gerenciada pelo middleware do Next.js e o hook `useAuth` fornece uma API fácil de usar para gerenciar o estado de autenticação.

Para implementar funcionalidades adicionais, recomendamos:
- Adicionar validação de formulário com Zod ou Yup
- Implementar oAuth para login com Google, GitHub, etc.
- Criar um painel de administração para gerenciar usuários
