# 📋 TAREFAS PENDENTES - My ERP

**Última atualização**: 2025-11-01

---

## 🚨 PRIORIDADE ALTA - Deploy e Infraestrutura

### ✅ Corrigir Deploy do Railway

- [ ] **Corrigir conexão com Supabase**
  - [ ] Acessar Supabase Dashboard → Settings → Database
  - [ ] Copiar Connection String (Session mode - porta 6543)
  - [ ] Atualizar `DATABASE_URL` no Railway
  - [ ] Verificar que usa: `aws-0-us-east-1.pooler.supabase.com:6543`
  - [ ] Aguardar redeploy automático
  - [ ] Testar: `curl https://myerp-production-4bb9.up.railway.app/api/core/health/`
  - [ ] Verificar logs: migrations devem rodar sem erro

- [ ] **Configurar Variáveis no Railway**
  - [ ] `DATABASE_URL` (Supabase Session Pooler)
  - [ ] `CORS_ALLOWED_ORIGINS=https://vrb-erp-frontend.vercel.app,http://localhost:3000`
  - [ ] `FRONTEND_URL=https://vrb-erp-frontend.vercel.app`
  - [ ] `DEBUG=False`
  - [ ] `ALLOWED_HOSTS=.railway.app,.vercel.app`
  - [ ] `SECRET_KEY` (gerar novo para produção)
  - [ ] `JWT_SECRET_KEY` (diferente do SECRET_KEY)

- [ ] **Configurar Variáveis na Vercel**
  - [ ] `NEXT_PUBLIC_API_URL=https://myerp-production-4bb9.up.railway.app/api`
  - [ ] Fazer redeploy na Vercel

- [ ] **Testes Pós-Deploy**
  - [ ] Backend health check funciona
  - [ ] Frontend consegue fazer login
  - [ ] Criar usuário salva no Supabase
  - [ ] CORS não está bloqueando

---

## 🔴 PRIORIDADE ALTA - Módulo POS (Point of Sale)

### 1. Backend - Models

- [ ] **Criar `backend/pos/models.py`**
  - [ ] Model `Sale`
    - [ ] `id` (UUID)
    - [ ] `tenant` (FK)
    - [ ] `customer` (FK, nullable)
    - [ ] `user` (FK - vendedor)
    - [ ] `date` (DateTimeField)
    - [ ] `subtotal` (DecimalField)
    - [ ] `discount` (DecimalField)
    - [ ] `total` (DecimalField)
    - [ ] `payment_method` (choices: cash, credit, debit, pix)
    - [ ] `payment_status` (choices: pending, paid, cancelled)
    - [ ] `notes` (TextField, blank)
    - [ ] Métodos: `calculate_total()`, `generate_commission()`
  
  - [ ] Model `SaleItem`
    - [ ] `id` (UUID)
    - [ ] `sale` (FK)
    - [ ] `product` (FK, nullable)
    - [ ] `service` (FK, nullable)
    - [ ] `quantity` (IntegerField)
    - [ ] `unit_price` (DecimalField)
    - [ ] `discount` (DecimalField)
    - [ ] `total` (DecimalField)
    - [ ] `professional` (FK, nullable - quem executou)
  
  - [ ] Model `CashRegister`
    - [ ] `id` (UUID)
    - [ ] `tenant` (FK)
    - [ ] `user` (FK - operador)
    - [ ] `opened_at` (DateTimeField)
    - [ ] `closed_at` (DateTimeField, nullable)
    - [ ] `opening_balance` (DecimalField)
    - [ ] `closing_balance` (DecimalField, nullable)
    - [ ] `expected_balance` (DecimalField)
    - [ ] `difference` (DecimalField)
    - [ ] `notes` (TextField)
    - [ ] `status` (choices: open, closed)

### 2. Backend - Serializers

- [ ] **Criar `backend/pos/serializers.py`**
  - [ ] `SaleItemSerializer`
    - [ ] Nested product/service details
    - [ ] Professional name
  
  - [ ] `SaleSerializer`
    - [ ] Include items (nested)
    - [ ] Customer name
    - [ ] User name
    - [ ] Calculate totals
  
  - [ ] `SaleCreateSerializer`
    - [ ] Validação de estoque
    - [ ] Criação de items
    - [ ] Atualização de estoque
    - [ ] Geração de comissões
  
  - [ ] `CashRegisterSerializer`
    - [ ] User details
    - [ ] Sales summary
    - [ ] Payment methods breakdown

### 3. Backend - Views

- [ ] **Criar `backend/pos/views.py`**
  - [ ] `SaleViewSet`
    - [ ] `list()` - Listar vendas com filtros
    - [ ] `create()` - Criar venda + items + atualizar estoque
    - [ ] `retrieve()` - Detalhes da venda
    - [ ] `update()` - Editar venda
    - [ ] `destroy()` - Cancelar venda (soft delete)
    - [ ] `@action` `cancel_sale()` - Cancelar e reverter estoque
    - [ ] `@action` `print_receipt()` - Gerar recibo PDF
    - [ ] `@action` `export_csv()` - Exportar vendas CSV
    - [ ] `@action` `export_excel()` - Exportar vendas Excel
    - [ ] `@action` `export_pdf()` - Exportar vendas PDF
  
  - [ ] `CashRegisterViewSet`
    - [ ] `list()` - Histórico de caixas
    - [ ] `create()` - Abrir caixa
    - [ ] `@action` `close()` - Fechar caixa
    - [ ] `@action` `current()` - Caixa aberto atual
    - [ ] `@action` `summary()` - Resumo do dia

### 4. Backend - URLs

- [ ] **Criar `backend/pos/urls.py`**
  - [ ] Registrar `SaleViewSet`
  - [ ] Registrar `CashRegisterViewSet`

### 5. Backend - Admin

- [ ] **Atualizar `backend/pos/admin.py`**
  - [ ] `SaleAdmin` - List, filter, search
  - [ ] `SaleItemInline`
  - [ ] `CashRegisterAdmin`

### 6. Backend - Migrations

- [ ] **Criar e rodar migrations**
  - [ ] `python manage.py makemigrations pos`
  - [ ] `python manage.py migrate`
  - [ ] Testar no Railway: `railway run python manage.py migrate`

### 7. Frontend - Hooks

- [ ] **Criar `frontend/hooks/usePOS.ts`**
  - [ ] `useSales()` - Listar vendas
  - [ ] `useSale(id)` - Detalhes de uma venda
  - [ ] `useCreateSale()` - Criar venda
  - [ ] `useCashRegister()` - Gerenciar caixa
  - [ ] `useOpenCashRegister()` - Abrir caixa
  - [ ] `useCloseCashRegister()` - Fechar caixa

### 8. Frontend - Páginas

- [ ] **Criar `frontend/app/dashboard/pos/page.tsx`**
  - [ ] Interface de PDV principal
  - [ ] Seleção de produtos/serviços
  - [ ] Carrinho de compras
  - [ ] Seleção de cliente
  - [ ] Cálculo automático de total
  - [ ] Aplicar desconto
  - [ ] Escolher forma de pagamento
  - [ ] Finalizar venda
  - [ ] Imprimir recibo

- [ ] **Criar `frontend/app/dashboard/pos/sales/page.tsx`**
  - [ ] Lista de vendas
  - [ ] Filtros (data, vendedor, status, forma pagamento)
  - [ ] Cards de resumo (total do dia, vendas, ticket médio)
  - [ ] Botões de exportação (CSV, Excel, PDF)
  - [ ] Visualizar detalhes da venda
  - [ ] Cancelar venda

- [ ] **Criar `frontend/app/dashboard/pos/cash-register/page.tsx`**
  - [ ] Status do caixa (aberto/fechado)
  - [ ] Abrir caixa (informar saldo inicial)
  - [ ] Fechar caixa (conferir valores)
  - [ ] Histórico de aberturas/fechamentos
  - [ ] Relatório de sangrias/reforços

### 9. Frontend - Componentes

- [ ] **Criar `frontend/components/pos/ProductSelector.tsx`**
  - [ ] Busca de produtos
  - [ ] Grid de produtos
  - [ ] Adicionar ao carrinho

- [ ] **Criar `frontend/components/pos/ServiceSelector.tsx`**
  - [ ] Lista de serviços
  - [ ] Selecionar profissional
  - [ ] Adicionar ao carrinho

- [ ] **Criar `frontend/components/pos/Cart.tsx`**
  - [ ] Lista de items
  - [ ] Editar quantidade
  - [ ] Remover item
  - [ ] Aplicar desconto por item
  - [ ] Total do carrinho

- [ ] **Criar `frontend/components/pos/PaymentModal.tsx`**
  - [ ] Selecionar forma de pagamento
  - [ ] Calcular troco
  - [ ] Finalizar venda

- [ ] **Criar `frontend/components/pos/Receipt.tsx`**
  - [ ] Recibo para impressão
  - [ ] Logo da empresa
  - [ ] Detalhes da venda
  - [ ] QR Code (opcional)

### 10. Testes

- [ ] **Backend - Testes unitários**
  - [ ] Teste de criação de venda
  - [ ] Teste de atualização de estoque
  - [ ] Teste de geração de comissões
  - [ ] Teste de abertura/fechamento de caixa

- [ ] **Frontend - Testes E2E**
  - [ ] Fluxo completo de venda
  - [ ] Adicionar produtos ao carrinho
  - [ ] Finalizar pagamento
  - [ ] Imprimir recibo

---

## 🟡 PRIORIDADE MÉDIA - Exportações Individuais

### 1. Módulo de Produtos (Inventory)

- [ ] **Backend - `backend/inventory/views.py`**
  - [ ] Adicionar `@action` `export_csv()` em `ProductViewSet`
  - [ ] Adicionar `@action` `export_excel()` em `ProductViewSet`
  - [ ] Adicionar `@action` `export_pdf()` em `ProductViewSet`
  - [ ] Campos: SKU, Nome, Categoria, Descrição, Preço Custo, Preço Venda, Estoque, Estoque Mínimo

- [ ] **Frontend - `frontend/app/dashboard/products/page.tsx`**
  - [ ] Adicionar função `handleExport(format)`
  - [ ] Adicionar 3 botões de exportação (CSV, Excel, PDF)
  - [ ] Posicionar ao lado do botão "Novo Produto"

### 2. Módulo de Comissões

- [ ] **Backend - `backend/commissions/views.py`**
  - [ ] Adicionar `@action` `export_csv()` em `CommissionViewSet`
  - [ ] Adicionar `@action` `export_excel()` em `CommissionViewSet`
  - [ ] Adicionar `@action` `export_pdf()` em `CommissionViewSet`
  - [ ] Campos: Data, Profissional, Tipo, Valor Base, Percentual, Comissão, Status

- [ ] **Frontend - `frontend/app/dashboard/commissions/page.tsx`**
  - [ ] Adicionar função `handleExport(format)`
  - [ ] Adicionar 3 botões de exportação
  - [ ] Respeitar filtros aplicados (profissional, período, status)

### 3. Módulo Financeiro

- [ ] **Backend - `backend/financial/views.py`**
  - [ ] Adicionar `@action` `export_csv()` em `TransactionViewSet`
  - [ ] Adicionar `@action` `export_excel()` em `TransactionViewSet`
  - [ ] Adicionar `@action` `export_pdf()` em `TransactionViewSet`
  - [ ] Campos: Data, Tipo, Categoria, Descrição, Valor, Forma Pagamento, Status

- [ ] **Frontend - `frontend/app/dashboard/financial/page.tsx`**
  - [ ] Adicionar função `handleExport(format)`
  - [ ] Adicionar 3 botões de exportação
  - [ ] Respeitar filtros (tipo, categoria, período)

### 4. Módulo de Clientes

- [ ] **Backend - `backend/customers/views.py`**
  - [ ] Adicionar `@action` `export_csv()` em `CustomerViewSet`
  - [ ] Adicionar `@action` `export_excel()` em `CustomerViewSet`
  - [ ] Adicionar `@action` `export_pdf()` em `CustomerViewSet`
  - [ ] Campos: Nome, Email, Telefone, CPF, Data Cadastro, Total Gasto, Última Visita

- [ ] **Frontend - `frontend/app/dashboard/customers/page.tsx`**
  - [ ] Adicionar função `handleExport(format)`
  - [ ] Adicionar 3 botões de exportação

### 5. Módulo de Agendamentos

- [ ] **Backend - `backend/scheduling/views.py`**
  - [ ] Adicionar `@action` `export_csv()` em `AppointmentViewSet`
  - [ ] Adicionar `@action` `export_excel()` em `AppointmentViewSet`
  - [ ] Adicionar `@action` `export_pdf()` em `AppointmentViewSet`
  - [ ] Campos: Data, Horário, Cliente, Profissional, Serviço, Status, Valor

- [ ] **Frontend - `frontend/app/dashboard/appointments/page.tsx`**
  - [ ] Adicionar função `handleExport(format)`
  - [ ] Adicionar 3 botões de exportação
  - [ ] Respeitar filtros (profissional, período, status)

---

## 🟡 PRIORIDADE MÉDIA - Sistema de Metas

### 1. Backend - Models

- [ ] **Criar app `goals`**
  - [ ] `python manage.py startapp goals`
  - [ ] Adicionar em `INSTALLED_APPS`

- [ ] **Criar `backend/goals/models.py`**
  - [ ] Model `Goal`
    - [ ] `id` (UUID)
    - [ ] `tenant` (FK)
    - [ ] `user` (FK, nullable - se null é meta de equipe)
    - [ ] `name` (CharField)
    - [ ] `description` (TextField)
    - [ ] `type` (choices: individual, team)
    - [ ] `target_type` (choices: revenue, sales_count, services_count, products_sold)
    - [ ] `target_value` (DecimalField)
    - [ ] `current_value` (DecimalField, default=0)
    - [ ] `period` (choices: daily, weekly, monthly, yearly)
    - [ ] `start_date` (DateField)
    - [ ] `end_date` (DateField)
    - [ ] `status` (choices: active, completed, failed, cancelled)
    - [ ] `created_at`, `updated_at`
    - [ ] Métodos: `update_progress()`, `check_completion()`, `percentage()`
  
  - [ ] Model `GoalProgress`
    - [ ] `id` (UUID)
    - [ ] `goal` (FK)
    - [ ] `date` (DateField)
    - [ ] `value` (DecimalField)
    - [ ] `percentage` (FloatField)
    - [ ] `notes` (TextField)

### 2. Backend - Serializers

- [ ] **Criar `backend/goals/serializers.py`**
  - [ ] `GoalSerializer`
    - [ ] Include user details
    - [ ] Calculate percentage
    - [ ] Progress chart data
  
  - [ ] `GoalCreateSerializer`
    - [ ] Validação de datas
    - [ ] Validação de valores
  
  - [ ] `GoalProgressSerializer`

### 3. Backend - Views

- [ ] **Criar `backend/goals/views.py`**
  - [ ] `GoalViewSet`
    - [ ] `list()` - Filtrar por user/team/period
    - [ ] `create()` - Criar meta
    - [ ] `update()` - Editar meta
    - [ ] `destroy()` - Cancelar meta
    - [ ] `@action` `update_progress()` - Atualizar progresso manual
    - [ ] `@action` `dashboard()` - Dashboard de metas
    - [ ] `@action` `ranking()` - Ranking de profissionais

### 4. Backend - Signals

- [ ] **Criar `backend/goals/signals.py`**
  - [ ] Signal ao criar venda → atualizar metas de faturamento
  - [ ] Signal ao completar serviço → atualizar metas de serviços
  - [ ] Signal ao atingir meta → criar notificação

### 5. Backend - Tasks (Celery - opcional)

- [ ] **Criar `backend/goals/tasks.py`**
  - [ ] Task diária: verificar metas vencidas
  - [ ] Task diária: calcular progresso automático
  - [ ] Task: enviar notificações de metas próximas

### 6. Frontend - Hooks

- [ ] **Criar `frontend/hooks/useGoals.ts`**
  - [ ] `useGoals()` - Listar metas
  - [ ] `useGoal(id)` - Detalhes de uma meta
  - [ ] `useCreateGoal()` - Criar meta
  - [ ] `useUpdateGoal()` - Atualizar meta
  - [ ] `useGoalDashboard()` - Dashboard de metas
  - [ ] `useGoalRanking()` - Ranking

### 7. Frontend - Páginas

- [ ] **Criar `frontend/app/dashboard/goals/page.tsx`**
  - [ ] Cards de metas ativas
  - [ ] Filtros (tipo, período, profissional)
  - [ ] Botão "Nova Meta"
  - [ ] Indicador de progresso (%)
  - [ ] Status (ativa, completa, falhada)

- [ ] **Criar `frontend/app/dashboard/goals/new/page.tsx`**
  - [ ] Formulário de criação
  - [ ] Selecionar tipo (individual/equipe)
  - [ ] Selecionar profissional (se individual)
  - [ ] Definir objetivo (faturamento, vendas, etc)
  - [ ] Valor da meta
  - [ ] Período (início e fim)

- [ ] **Criar `frontend/app/dashboard/goals/[id]/page.tsx`**
  - [ ] Detalhes da meta
  - [ ] Gráfico de progresso
  - [ ] Histórico de valores
  - [ ] Editar/Cancelar meta

### 8. Frontend - Componentes

- [ ] **Criar `frontend/components/goals/GoalCard.tsx`**
  - [ ] Card com informações da meta
  - [ ] Barra de progresso
  - [ ] Porcentagem atingida
  - [ ] Badge de status

- [ ] **Criar `frontend/components/goals/GoalProgress.tsx`**
  - [ ] Gráfico de linha (progresso ao longo do tempo)
  - [ ] Usar recharts ou Chart.js

- [ ] **Criar `frontend/components/goals/GoalForm.tsx`**
  - [ ] Formulário reutilizável
  - [ ] Validação de campos

- [ ] **Criar `frontend/components/goals/GoalRanking.tsx`**
  - [ ] Tabela de ranking
  - [ ] Ordenação por desempenho
  - [ ] Badges (1º, 2º, 3º lugar)

### 9. Frontend - Integração no Menu

- [ ] **Atualizar `frontend/app/dashboard/layout.tsx`**
  - [ ] Adicionar item "Metas" no menu
  - [ ] Ícone: Target ou TrendingUp

---

## 🟢 PRIORIDADE BAIXA - Documentação

### 1. Manual do Usuário

- [ ] **Criar `docs/USER_MANUAL.md`**
  
  - [ ] **Introdução**
    - [ ] O que é o My ERP
    - [ ] Para quem é destinado
    - [ ] Requisitos mínimos
  
  - [ ] **Primeiros Passos**
    - [ ] Como fazer login
    - [ ] Como recuperar senha
    - [ ] Visão geral do dashboard
    - [ ] Navegação pelo sistema
  
  - [ ] **Módulo de Clientes**
    - [ ] Como cadastrar cliente
    - [ ] Como editar dados
    - [ ] Como buscar cliente
    - [ ] Como ver histórico
    - [ ] Screenshot de cada tela
  
  - [ ] **Módulo de Agendamentos**
    - [ ] Como criar agendamento
    - [ ] Como confirmar/cancelar
    - [ ] Como reagendar
    - [ ] Visualização de agenda
    - [ ] Filtros disponíveis
  
  - [ ] **Módulo de Serviços**
    - [ ] Como cadastrar serviço
    - [ ] Definir preço e duração
    - [ ] Categorias de serviços
  
  - [ ] **Módulo de Produtos**
    - [ ] Como cadastrar produto
    - [ ] Controle de estoque
    - [ ] Alertas de estoque baixo
    - [ ] Categorias de produtos
  
  - [ ] **Módulo PDV (Point of Sale)**
    - [ ] Como abrir o caixa
    - [ ] Como registrar venda
    - [ ] Adicionar produtos/serviços
    - [ ] Aplicar descontos
    - [ ] Formas de pagamento
    - [ ] Imprimir recibo
    - [ ] Como fechar o caixa
  
  - [ ] **Módulo de Comissões**
    - [ ] Como funcionam as comissões
    - [ ] Configurar regras
    - [ ] Visualizar comissões
    - [ ] Marcar como pagas
    - [ ] Exportar relatório
  
  - [ ] **Módulo Financeiro**
    - [ ] Registrar receitas
    - [ ] Registrar despesas
    - [ ] Categorias financeiras
    - [ ] Fluxo de caixa
    - [ ] Relatórios financeiros
  
  - [ ] **Módulo de Metas**
    - [ ] Como criar meta
    - [ ] Tipos de metas
    - [ ] Acompanhar progresso
    - [ ] Ranking de profissionais
  
  - [ ] **Relatórios**
    - [ ] Como gerar relatórios
    - [ ] Filtros disponíveis
    - [ ] Exportar PDF/Excel/CSV
    - [ ] Tipos de gráficos
  
  - [ ] **Configurações**
    - [ ] Dados da empresa
    - [ ] Gerenciar usuários
    - [ ] Permissões
    - [ ] Preferências
  
  - [ ] **FAQ (Perguntas Frequentes)**
    - [ ] Esqueci minha senha
    - [ ] Como adicionar novo usuário
    - [ ] Como alterar foto de perfil
    - [ ] Sistema está lento
    - [ ] Erro ao fazer login
    - [ ] Dados não aparecem
  
  - [ ] **Troubleshooting**
    - [ ] Problemas comuns e soluções
    - [ ] Como reportar bugs
    - [ ] Contato de suporte

### 2. Screenshots

- [ ] **Capturar screenshots de todas as telas**
  - [ ] Login
  - [ ] Dashboard principal
  - [ ] Lista de clientes
  - [ ] Formulário de cliente
  - [ ] Agenda
  - [ ] Lista de serviços
  - [ ] Lista de produtos
  - [ ] Tela de PDV
  - [ ] Abertura de caixa
  - [ ] Fechamento de caixa
  - [ ] Lista de comissões
  - [ ] Configuração de regras
  - [ ] Transações financeiras
  - [ ] Metas
  - [ ] Relatórios

### 3. Vídeos Tutoriais (Opcional)

- [ ] **Criar vídeos curtos**
  - [ ] Como fazer primeira venda
  - [ ] Como agendar serviço
  - [ ] Como cadastrar cliente
  - [ ] Como gerar relatório

---

## 📊 RESUMO GERAL

### Por Prioridade

| Prioridade | Tarefas | Estimativa |
|------------|---------|------------|
| 🚨 **ALTA** (Deploy) | 23 tarefas | 2-3 horas |
| 🔴 **ALTA** (POS) | 65 tarefas | 8-12 horas |
| 🟡 **MÉDIA** (Exportações) | 30 tarefas | 4-6 horas |
| 🟡 **MÉDIA** (Metas) | 40 tarefas | 6-8 horas |
| 🟢 **BAIXA** (Docs) | 50+ tarefas | 4-6 horas |

**Total**: ~208 tarefas | ~24-35 horas de desenvolvimento

### Por Módulo

- ✅ **Dashboard**: Completo
- ✅ **Autenticação**: Completo
- ✅ **Clientes**: Completo
- ✅ **Agendamentos**: Completo
- ✅ **Serviços**: Completo
- ✅ **Produtos**: Completo (falta exportações)
- ✅ **Comissões**: Completo (falta exportações)
- ✅ **Financeiro**: Completo (falta exportações)
- ✅ **Relatórios**: Completo
- ✅ **Notificações**: Completo
- ⚠️ **PDV**: Incompleto (0%)
- ❌ **Metas**: Não implementado
- ⚠️ **Exportações**: Parcial (50%)
- ⚠️ **Documentação**: Parcial (30%)

---

## 🎯 ROADMAP SUGERIDO

### Sprint 1: Deploy e Infraestrutura (1-2 dias)
- Resolver problema do Railway/Supabase
- Configurar todas as variáveis
- Testar login e funcionalidades básicas

### Sprint 2: Módulo POS (5-7 dias)
- Backend completo
- Frontend completo
- Testes e ajustes

### Sprint 3: Exportações (2-3 dias)
- Implementar em todos os módulos
- Testar formatos (CSV, Excel, PDF)

### Sprint 4: Sistema de Metas (4-5 dias)
- Backend completo
- Frontend completo
- Dashboard de metas

### Sprint 5: Documentação (2-3 dias)
- Manual do usuário
- Screenshots
- FAQ

**Total estimado**: 14-20 dias (trabalhando 2-3 horas por dia)

---

## 📝 NOTAS

- Sempre fazer commit após completar cada tarefa maior
- Testar localmente antes de fazer deploy
- Atualizar esta lista conforme progride
- Marcar tarefas completas com `[x]`

---

**Gerado em**: 2025-11-01
**Próxima revisão**: A cada sprint concluída
