# Publicação do GymControl — Render + Supabase PostgreSQL

Este pacote está preparado para publicar o Spring Boot e servir o front-end React pela mesma aplicação. Não é necessário criar um serviço separado para o front.

## 1. Criar o banco no Supabase

1. Acesse https://supabase.com/dashboard e crie um projeto.
2. Defina uma senha forte para o banco e guarde-a em um gerenciador de senhas.
3. Aguarde o provisionamento do banco.
4. Abra **Connect** no projeto e escolha **Session pooler**.
5. Copie host, porta, banco e usuário apresentados pelo Supabase.

**Use Session pooler (porta 5432)** para este backend no Render. O pooler compartilhado em modo Session aceita conexões IPv4, enquanto a conexão direta do Supabase pode exigir IPv6 ou o adicional IPv4. O modo Session também preserva o comportamento de sessão usado por aplicações Java/JPA.

O formato JDBC será:

```text
jdbc:postgresql://HOST-DO-POOLER:5432/postgres?sslmode=require
```

Use o host e o usuário exatos mostrados no painel. No Session pooler, o usuário costuma ter o formato `postgres.PROJECT_REF`, mas confirme no painel. A senha é a senha do banco que você definiu no Supabase.

## 2. Subir o projeto para o GitHub

1. Extraia o ZIP.
2. Crie um repositório no GitHub, por exemplo `GymControl`.
3. Envie para a raiz do repositório os itens `gymcontrol/`, `frontend/`, `render.yaml` e `README-FRONTEND.md`.
4. Confira que `render.yaml` está na raiz do repositório e que `gymcontrol/Dockerfile` existe.
5. Faça commit e push para a branch principal.

Não envie `.env` com senhas. O arquivo `.env.example` contém apenas valores ilustrativos.

## 3. Criar o serviço no Render

1. Acesse https://dashboard.render.com.
2. Selecione **New + → Blueprint**.
3. Conecte o repositório do GitHub que acabou de criar.
4. O Render vai detectar o `render.yaml` e preparar o serviço `gymcontrol`.
5. Confirme a criação do serviço.
6. Na primeira configuração, preencha as variáveis solicitadas:

| Variável | Valor |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST-POOLER:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Usuário mostrado em Connect → Session pooler |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco Supabase |
| `JWT_KEY` | Gerada automaticamente pelo Blueprint |
| `JWT_EXPIRATION` | `900000` (15 minutos) |
| `DB_POOL_SIZE` | `5` |

O Render injeta a variável `PORT`; o Spring Boot já está configurado para usá-la. Não fixe a porta 3000 no painel.

## 4. Primeiro deploy e criação das tabelas

- O Dockerfile compila o projeto com Java 21 e inicia o JAR do Spring Boot.
- O Spring usa o driver PostgreSQL, conexão SSL e variáveis de ambiente.
- `spring.jpa.hibernate.ddl-auto=update` cria/atualiza as tabelas mapeadas pelas entidades JPA no primeiro início.
- O front-end está em `gymcontrol/src/main/resources/static/` e é servido pela mesma URL do backend.

Quando o deploy terminar, abra a URL `https://SEU-SERVICO.onrender.com`.

## 5. Criar o primeiro administrador

O cadastro público está bloqueado. Por segurança, não existe formulário público para criar o primeiro ADM.

A forma mais direta é inserir o primeiro administrador no Supabase depois que as tabelas forem criadas:

1. Abra Supabase → **Table Editor** → `users`.
2. Insira `nome`, `email`, `cpf`, `contato`, `password` e `role`.
3. `password` precisa ser um hash BCrypt, não uma senha em texto puro.
4. Defina `role` como `ADM`.

Para gerar o hash BCrypt, execute temporariamente este trecho Java em um projeto Spring com a mesma dependência:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarSenha {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("SUA_SENHA_FORTE"));
    }
}
```

Copie o resultado para a coluna `password`. Depois entre normalmente pela tela de login. Não publique o hash nem a senha em repositórios.

## 6. Atenção: dados antigos do MySQL

Trocar o driver e apontar para o Supabase **não copia automaticamente** os registros do MySQL antigo. O Supabase começa com um banco novo; o Hibernate cria a estrutura, mas não migra usuários, máquinas, exercícios ou treinos existentes.

Se precisar preservar dados, faça backup do MySQL e migre as tabelas para PostgreSQL respeitando a ordem das chaves estrangeiras (usuários, máquinas, exercícios, treinos e itens de treino). Não apague o banco MySQL antes de conferir a migração.

## 7. Verificações depois do deploy

- Consulte os logs do Render e confirme que o Spring Boot iniciou sem erro de conexão.
- Teste o login ADM.
- Cadastre um USER e um PROF pelo painel de usuários.
- Cadastre máquinas e exercícios.
- Crie treinos para um aluno e confirme que o aluno vê apenas o treino do dia.
- Entre com um PROF e confirme que consegue cadastrar treinos e gerenciar máquinas, mas não usuários nem exercícios.
- Teste que USER não consegue executar operações de escrita mesmo chamando a API diretamente.

## Configuração local

Para executar localmente, copie `.env.example` para `.env` e preencha os dados do Supabase. O IntelliJ não carrega automaticamente um arquivo `.env` sem configuração adicional; configure as mesmas variáveis na Run Configuration da aplicação, ou defina-as no terminal antes de executar.

A porta local continua sendo 3000 quando `PORT` não está definida.
