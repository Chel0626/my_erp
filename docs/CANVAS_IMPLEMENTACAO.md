# Canvas de Implementação: Núcleo Multi-Tenant

Este documento é um blueprint passo a passo para construir a fundação de um sistema SaaS (Software as a Service). O objetivo é garantir que os dados de cada cliente (Tenant) sejam completamente isolados e seguros antes de construir qualquer funcionalidade de negócio específica.

## BLOCO 1: FUNDAÇÃO DO BANCO DE DADOS

### Tabela: Tenants
Representa cada empresa cliente: a barbearia, a padaria, etc.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único (Automático) |
| name | String | Nome da empresa |
| owner_id | FK -> Users | Dono da conta |
| plan | String | Plano contratado ("Básico", "Premium") |
| is_active | Boolean | Status da conta (Default: true) |
| created_at | DateTime | Data de criação (Automático) |
| updated_at | DateTime | Data de atualização (Automático) |

### Tabela: Users
Representa cada usuário que pode fazer login no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único (Automático) |
| email | Email | Email para login (Único) |
| password | String | Senha hasheada |
| tenant_id | FK -> Tenants | **O CAMPO MAIS IMPORTANTE!** |
| role | String | Papel ("admin", "barbeiro", "caixa") |
| name | String | Nome completo |
| is_active | Boolean | Status do usuário |
| created_at | DateTime | Data de criação |

## BLOCO 2: WORKFLOWS ESSENCIAIS DO NÚCLEO

### Workflow: Novo Cliente - Sign Up
Quando o dono da barbearia cria a conta principal.

**Etapas:**

1. **GATILHO**: Formulário de Cadastro preenchido (nome, email, senha, nome_empresa)

2. **AÇÃO 1**: [Criar Tenant]
   - name = form.nome_empresa
   - Salva o resultado como `newTenant`

3. **AÇÃO 2**: [Criar Usuário]
   - email = form.email
   - password = hash(form.password)
   - name = form.nome
   - tenant_id = `newTenant.id`
   - role = "admin"
   - Salva o resultado como `newUser`

4. **AÇÃO 3**: [Atualizar Tenant]
   - ID do Registro = `newTenant.id`
   - Campo `owner_id` = `newUser.id`

5. **AÇÃO 4**: [Gerar Token JWT]
   - Gerar token para `newUser`

6. **AÇÃO 5**: [Retornar Resposta]
   - user: dados do usuário
   - tenant: dados do tenant
   - token: JWT token

### Workflow: Convidar Membro da Equipe
Quando um admin convida um funcionário.

**Etapas:**

1. **GATILHO**: Formulário de Convite preenchido (email_convidado, role_convidado)

2. **VALIDAÇÃO**: Verificar se usuário atual é admin

3. **AÇÃO 1**: [Criar Usuário Convidado]
   - email = form.email_convidado
   - password = gerar_senha_temporaria()
   - role = form.role_convidado
   - tenant_id = `Current User's tenant_id` // LIGAÇÃO AUTOMÁTICA!
   - Salva o resultado como `invitedUser`

4. **AÇÃO 2**: [Enviar Email]
   - Para: `invitedUser.email`
   - Assunto: "Você foi convidado para o sistema!"
   - Corpo: Link de login + senha temporária

## BLOCO 3: REGRAS DE SEGURANÇA (ISOLAMENTO DE DADOS)

### Regra Universal de Acesso a Dados
**"Um usuário só pode ver/editar dados que pertencem ao seu próprio Tenant."**

### Implementação no Django

#### 1. Middleware de Tenant (Automático)
```python
# Adiciona automaticamente o filtro tenant_id em todas as queries
class TenantMiddleware:
    def process_request(self, request):
        if request.user.is_authenticated:
            request.tenant_id = request.user.tenant_id
```

#### 2. Manager Personalizado
```python
# Filtra automaticamente por tenant
class TenantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            tenant_id=get_current_tenant_id()
        )
```

#### 3. Permissões no ViewSet
```python
# Valida permissões no nível da API
class TenantPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.tenant_id == request.user.tenant_id
```

## BLOCO 4: CONSTRUÇÃO DO PRIMEIRO MÓDULO (BARBEARIA)

### Tabela: Servicos
Catálogo de serviços da barbearia.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | String | Nome do serviço (Ex: "Corte Masculino") |
| price | Decimal | Preço do serviço |
| duration_minutes | Integer | Duração em minutos |
| tenant_id | FK -> Tenants | **VINCULADO AO TENANT** |
| is_active | Boolean | Serviço ativo |
| created_at | DateTime | Data de criação |

### Tabela: Agendamentos
A agenda da barbearia.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| customer_name | String | Nome do cliente |
| service_id | FK -> Servicos | Serviço agendado |
| professional_id | FK -> Users | Profissional responsável |
| start_time | DateTime | Data/hora do agendamento |
| status | String | Status ("Marcado", "Concluído", "Cancelado") |
| tenant_id | FK -> Tenants | **VINCULADO AO TENANT** |
| created_at | DateTime | Data de criação |

### Workflow: Criar Novo Agendamento

1. **GATILHO**: Formulário de agendamento preenchido

2. **VALIDAÇÃO**: 
   - Verificar se profissional pertence ao mesmo tenant
   - Verificar se serviço pertence ao mesmo tenant
   - Verificar disponibilidade do horário

3. **AÇÃO 1**: [Criar Agendamento]
   - customer_name = form.customer_name
   - service_id = form.service_id
   - professional_id = form.professional_id
   - start_time = form.start_time
   - status = "Marcado"
   - tenant_id = `Current User's tenant_id` // INSERIDO AUTOMATICAMENTE

4. **AÇÃO 2**: [Notificação]
   - Enviar notificação para o profissional

5. **AÇÃO 3**: [Atualizar UI]
   - Fechar modal
   - Atualizar lista/calendário de agendamentos

## 🔐 Checklist de Segurança Multi-Tenant

- [ ] Todo modelo tem campo `tenant_id`
- [ ] Middleware de tenant configurado
- [ ] Managers personalizados implementados
- [ ] Permissões de tenant validadas
- [ ] Testes de isolamento criados
- [ ] Queries manuais incluem filtro de tenant
- [ ] Relacionamentos validam mesmo tenant
- [ ] Admin Django filtra por tenant
- [ ] Logs incluem tenant_id
- [ ] Backups isolados por tenant
