# ALTERAÇÕES GPT

Este documento lista todas as mudanças e acréscimos realizados pelo assistente no backend e frontend do projeto `my_erp`.

---

## 1. Configuração do Banco de Dados
- Adicionado Supabase como banco principal no `.env` e `settings.py`.
- Atualizado `DATABASE_URL` para conexão PostgreSQL Supabase.
- Patch no `settings.py` para usar `dj_database_url` e `load_dotenv()`.

## 2. Instalação de Pacotes
- Instalados: `psycopg2-binary`, `dj-database-url`, `python-dotenv`, `django-extensions`.

## 3. Migrações e Superusuário
- Rodado `python manage.py migrate` para aplicar migrações no Supabase.
- Criado superusuário diretamente no banco Supabase.
- Atualizado usuário `michelhm91@gmail.com` (nome, role, ativo).

## 4. Correções de Deploy e Ambiente
- Corrigido CORS e variáveis de ambiente para produção.
- Garantido que o backend e frontend usam as URLs corretas.
- Refatorado frontend para uso correto de imagens e componentes Next.js.

## 5. Scripts de População
- Tentativa de rodar scripts de população para todos os módulos (clientes, produtos, regras de comissão, financeiro).
- Orientação para uso de `django-extensions` e ajuste em `INSTALLED_APPS`.

## 6. Diagnóstico e Debug
- Análise detalhada de erros 401 no login, identificando possíveis bloqueios a superusuário.
- Busca por restrições em `serializers.py`, `views.py`, `permissions.py`.
- Orientação para rodar migrações e scripts no contexto correto.

## 7. Outras Ações
- Listagem de usuários cadastrados no banco Supabase.
- Associação de usuário ao tenant disponível.
- Orientação para acesso ao admin (`/admin/`) e rotas REST (`/api/core/tenants/`).

## 8. Deploy e Infraestrutura
- Realizado deploy do backend no Railway.
- Realizado deploy do frontend no Vercel.
- Banco de dados configurado e migrado para Supabase.
- Redis configurado via Upstash para cache.

## 9. Problemas e Pendências
- Persistem problemas no login de superusuário: usuários criados no Supabase não conseguem autenticar via API REST.
- Investigação de possíveis bloqueios no backend (serializers/views) para superusuários.
- Login de superusuário ainda não está funcional, aguardando correção no fluxo de autenticação.

---

**Observação:**
Todas as alterações foram feitas visando garantir que o ambiente local e de produção estejam sincronizados, que o banco Supabase seja utilizado corretamente, e que o deploy e autenticação funcionem sem bloqueios.

Se precisar detalhar alguma alteração específica, basta pedir!
