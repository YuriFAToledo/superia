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

# Arquitetura Clean para Next.js

Este projeto implementa uma arquitetura limpa e bem organizada para aplicações Next.js, seguindo princípios de Clean Architecture e separation of concerns.

## Estrutura de Pastas

O projeto segue uma estrutura orientada a features, com separação clara de responsabilidades:

```
src/
├── app/               # Páginas e rotas do Next.js
├── api/               # API routes do Next.js
├── components/        # Componentes compartilhados
├── features/          # Módulos organizados por funcionalidade
│   └── configuracoes/ # Exemplo de feature
│       ├── components/  # Componentes específicos da feature
│       ├── hooks/       # Hooks específicos da feature
│       ├── services/    # Serviços para acesso a dados
│       ├── tests/       # Testes unitários
│       │   └── mocks/   # Mocks para testes
│       └── types/       # Tipos e interfaces
├── hooks/             # Hooks compartilhados
├── lib/               # Configurações e utilitários de bibliotecas
├── styles/            # Estilos globais
└── utils/             # Funções utilitárias
```

## Principais Camadas

A arquitetura segue os princípios de Clean Architecture, com separação clara entre:

### 1. Camada de Apresentação (Components)

- Responsável pela UI e interação com usuário
- Consome hooks e não implementa lógica de negócio
- Focada em renderização e experiência do usuário

### 2. Camada de Lógica de Negócio (Hooks)

- Encapsula toda a lógica de negócio
- Gerencia o estado da aplicação
- Orquestra chamadas aos serviços
- Implementa regras de negócio
- Fornece dados formatados para os componentes

### 3. Camada de Acesso a Dados (Services)

- Encapsula a comunicação com APIs externas (Supabase, etc.)
- Abstrai detalhes de implementação da fonte de dados
- Permite trocar a fonte de dados sem afetar as camadas superiores
- Responsável por transformar dados externos em estruturas internas

### 4. Camada de Entidades e Tipos (Types)

- Define as estruturas de dados e interfaces utilizadas no sistema
- Estabelece contratos entre as diferentes camadas
- Independente de implementações específicas

## Exemplo: Feature de Configurações

A feature de Configurações demonstra bem esta arquitetura:

### Components
Componentes React focados em renderização e delegando a lógica para hooks.

### Hooks: useConfiguracoes
- Gerencia estado interno (membros, formulários, paginação)
- Implementa regras de negócio (validações, permissões)
- Orquestra chamadas ao service layer

### Services: memberService
- Encapsula chamadas à API do Supabase 
- Abstrai a complexidade do acesso a dados
- Transforma dados do Supabase para o formato interno da aplicação

### Types
- Define interfaces como MemberAddData e MemberUpdateData
- Estabelece contratos entre as diferentes camadas

## Testes

A arquitetura foi projetada para ser facilmente testável:

- **Testes Unitários**: Para hooks e services isoladamente
- **Mocks**: Implementação de mocks para dependências externas (Supabase)
- **Jest + React Testing Library**: Para testar comportamento dos componentes

### Estratégia de Testes:
- Componentes: Testados por comportamento visível
- Hooks: Testados por comportamento funcional
- Services: Testados por interação com APIs externas

## Benefícios da Arquitetura

1. **Separação de Responsabilidades**: Cada camada tem uma função clara
2. **Testabilidade**: Fácil mockar dependências externas
3. **Manutenibilidade**: Mudanças em uma camada não afetam outras camadas
4. **Escalabilidade**: Novas features seguem o mesmo padrão
5. **Reutilização**: Componentes e lógica podem ser compartilhados entre features

## Boas Práticas Adotadas

1. **Tipagem Forte**: TypeScript em todo o projeto
2. **Injeção de Dependências**: Serviços são injetados nos hooks
3. **Single Responsibility**: Cada módulo tem uma única responsabilidade
4. **DRY (Don't Repeat Yourself)**: Código reutilizado via hooks e serviços
5. **Encapsulamento**: Detalhes de implementação escondidos atrás de interfaces
6. **Imutabilidade**: Estado gerenciado de forma imutável via React hooks

## Refatoração e Evolução

Para evoluir esta arquitetura:

1. Implementar gerenciamento de estado global (Context, Redux, Zustand) para dados compartilhados
2. Adicionar camada de validação com bibliotecas como Zod ou Yup
3. Implementar padrões de cache para otimizar chamadas repetidas
4. Expandir a cobertura de testes com testes de integração
