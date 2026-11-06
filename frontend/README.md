# GymControl — Frontend

Frontend independente do backend Spring Boot. O código Java do projeto original não foi alterado.

## Tecnologias
- React 19 + TypeScript
- Vite
- Lucide React
- CSS responsivo com temas e cores persistidos no navegador

## Executar localmente

Pré-requisitos: Node.js 20.19+ (ou 22.12+) e o backend GymControl iniciado na porta `3000`.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

O Vite encaminha as rotas `/auth`, `/users`, `/maquinas`, `/exercicios` e `/treinos` para `http://localhost:3000` durante o desenvolvimento. O build de produção é gerado diretamente em `src/main/resources/static`, para que o Spring Boot sirva o frontend e a API pela mesma origem. Para outro endereço de API, crie `.env` a partir de `.env.example` e defina `VITE_API_URL`.

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

O comando `npm run build` gera `../src/main/resources/static/index.html` e os arquivos estáticos versionados pelo Vite. Não copie o `frontend/index.html` manualmente: use sempre o build para gerar os arquivos de produção.

## Integração implementada

| Recurso | Endpoint(s) usados |
|---|---|
| Login / cadastro | `POST /auth/login`, `POST /auth/register` |
| Sessão / perfil | `GET /users/me` |
| Usuários (ADM) | `GET /users`, `PUT /users/{id}`, `PATCH /users/{id}/role`, `DELETE /users/{id}` |
| Treinos | `GET /treinos`, `POST /treinos`, `PUT /treinos/{id}`, `DELETE /treinos/{id}` |
| Exercícios | `GET /exercicios`, `POST /exercicios`, `PUT /exercicios/{id}`, `DELETE /exercicios/{id}` |
| Máquinas | `GET /maquinas`, `POST /maquinas`, `PUT /maquinas/{id}`, `DELETE /maquinas/{id}` |

### Observações importantes sobre o contrato atual do backend

- O cadastro público exige `nome`, `email`, `cpf` e `password`; `contato` é opcional. O frontend envia exatamente esses campos.
- A resposta do login contém somente `token`. O frontend lê a expiração (`exp`) do JWT e mantém a sessão no `localStorage`.
- O backend restringe a criação, edição e exclusão de máquinas e exercícios ao perfil `ADM`; o frontend esconde essas ações para `USER`.
- O backend restringe `/users/**` ao perfil `ADM`, exceto `/users/me`. A gestão de usuários é exibida apenas para administradores.
- `GET /treinos` retorna a lista fornecida pelo backend. O frontend não filtra registros por usuário, pois o contrato atual desse endpoint não oferece esse filtro. As regras atuais também não restringem atualização e exclusão ao dono do treino; o frontend respeita essa API e não inventa uma separação que o backend não fornece.
- `TreinoRequest` recebe a lista completa de itens. Para editar um treino, o frontend envia novamente o dia e todos os itens. A remoção de um exercício dentro do treino também é feita por essa atualização completa.
- `ItemTreinoResponse` não devolve `exercicioId`; ao editar, o frontend tenta relacionar o exercício pelo nome. Se houver exercícios diferentes com nomes idênticos, a API atual não permite distingui-los com segurança.
- A API não oferece endpoint para o próprio usuário alterar seus dados ou senha; a edição de dados cadastrais disponível no frontend é administrativa, via `PUT /users/{id}`.

## Estrutura

```text
src/
  api.ts       # comunicação HTTP, JWT e endpoints
  types.ts     # tipos alinhados aos DTOs
  App.tsx      # telas, navegação, formulários e fluxos
  styles.css   # identidade visual e responsividade
```

## Publicação no Spring Boot

O `vite.config.ts` está configurado para gerar o frontend em `gymcontrol/src/main/resources/static`. Após executar `npm run build` dentro da pasta `frontend`, o Spring Boot encontrará o arquivo `index.html` nesse diretório. O frontend usa caminhos relativos para chamar a API (`/auth`, `/users`, `/maquinas`, `/exercicios` e `/treinos`), sem o prefixo `/api`.
