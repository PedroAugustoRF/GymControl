# GymControl — controle por perfil

O projeto contém o back-end Spring Boot e o front-end React. A interface pronta para o Spring está em `gymcontrol/src/main/resources/static/`; o código-fonte React está em `frontend/`.

## Perfis e permissões

### ADM
- Cadastra alunos (`USER`) e professores (`PROF`).
- Lista e gerencia os usuários.
- Altera o perfil entre `USER` e `PROF`.
- Exclui usuários `USER` e `PROF`; a API bloqueia a exclusão de qualquer `ADM`.
- Visualiza e gerencia treinos de todos os usuários.
- Cadastra, edita e exclui máquinas e exercícios.

### PROF
- Visualiza os próprios treinos e os treinos dos alunos (`USER`).
- Cadastra treinos próprios e para alunos.
- Edita e exclui treinos próprios e treinos atribuídos a alunos.
- Consulta o catálogo de exercícios.
- Cadastra, edita e exclui máquinas.
- Não acessa a gestão de usuários nem pode excluir usuários.

### USER
- Consulta somente os treinos do próprio usuário programados para o dia atual, considerando o fuso `America/Sao_Paulo`.
- Não acessa gestão de usuários, exercícios ou máquinas.
- Não pode criar, editar ou excluir registros.

## Endpoints adicionados/ajustados

- `POST /users`: cadastro administrativo de `USER` ou `PROF`; recebe `nome`, `email`, `cpf`, `contato`, `password` e `role`.
- `GET /users/alunos`: lista alunos para ADM e PROF.
- `GET /users`: lista todos os usuários, somente ADM.
- `PATCH /users/{id}/role`: ADM alterna entre `USER` e `PROF`; não promove contas para `ADM` nem altera contas ADM.
- `DELETE /users/{id}`: ADM exclui somente `USER` e `PROF`; os treinos do usuário são removidos antes da conta.
- `POST /treinos` e `PUT /treinos/{id}`: ADM/PROF podem informar `alunoId`; sem `alunoId`, o treino é associado ao próprio usuário. Professores só podem atribuir treinos a `USER`.
- `GET /treinos`: ADM recebe todos; PROF recebe os próprios e os dos alunos; USER recebe apenas os próprios treinos do dia.
- `GET /treinos/{id}` aplica a mesma regra de visibilidade. As rotas antigas de itens isolados (`/treinos/itens/**` e `/treinos/{id}/itens`) foram bloqueadas; os itens são gerenciados dentro do próprio endpoint de treino, com validação de acesso.
- Máquinas: GET para ADM/PROF; operações de escrita para ADM/PROF. Ao excluir uma máquina, os exercícios associados permanecem cadastrados e passam a ficar sem máquina vinculada.
- Exercícios: GET para ADM/PROF; operações de escrita somente ADM.

O `TreinoResponse` agora inclui `alunoId` e `alunoNome` para identificar a quem o treino pertence.

## Executar

1. Abra a pasta `gymcontrol` no IntelliJ como projeto Maven.
2. Confira as credenciais do MySQL em `src/main/resources/application.properties`.
3. Confirme que o enum Java `Role` e os valores persistidos no banco contêm `USER`, `PROF` e `ADM`.
4. Execute a aplicação Spring Boot.
5. Acesse `http://localhost:3000`.

O front usa a mesma origem da API. A role incluída no JWT é lida no login; depois de alterar a role de uma conta, faça logout e login novamente para emitir um token com a role atualizada.

## Código-fonte e build opcional do front

```bash
cd frontend
npm install
npm run build
```

O Vite gera o front em `gymcontrol/src/main/resources/static/`. A versão estática já incluída no projeto carrega React e Lucide via ESM CDN, então o navegador precisa de acesso à internet para esses módulos.

## Observações

- Não foi adicionada uma relação separada entre professor e aluno: o professor pode visualizar e administrar os treinos de todos os usuários com role `USER`. Se futuramente a academia precisar limitar cada professor a uma carteira específica de alunos, será necessário modelar esse vínculo no banco.
- O cadastro público (`POST /auth/register`) foi bloqueado para que somente ADM crie contas pela rota protegida `POST /users`. A tela inicial oferece apenas login.

## Publicar no Render com Supabase PostgreSQL

O projeto agora usa PostgreSQL e está preparado para deploy via Docker no Render. Consulte `DEPLOY-RENDER-SUPABASE.md` para criar o banco Supabase, configurar o Session pooler, enviar o projeto ao GitHub, criar o Blueprint no Render e cadastrar o primeiro administrador.

O banco Supabase começa vazio. O Hibernate cria as tabelas, mas os dados que estavam no MySQL não são copiados automaticamente.
