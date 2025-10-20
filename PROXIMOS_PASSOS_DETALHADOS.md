# 🎯 PRÓXIMOS PASSOS DETALHADOS - My ERP

**Data:** 20 de Outubro de 2025  
**Versão:** 1.0  
**Baseado na análise completa do projeto**

---

## 📋 ÍNDICE DE PRIORIDADES

### 🔴 ALTA PRIORIDADE (Semana 1-2)
1. [Relatórios e Dashboards](#1-relatórios-e-dashboards)
2. [Testes Automatizados](#2-testes-automatizados)
3. [Configurações do Sistema](#3-configurações-do-sistema)

### 🟡 MÉDIA PRIORIDADE (Semana 3-4)
4. [Sistema de Notificações](#4-sistema-de-notificações)
5. [Sistema de Fidelidade](#5-sistema-de-fidelidade)
6. [Agendamento Online](#6-agendamento-online)

### 🟢 BAIXA PRIORIDADE (Mês 2)
7. [Marketing e Comunicação](#7-marketing-e-comunicação)
8. [Multi-unidade](#8-multi-unidade)
9. [Integrações](#9-integrações)
10. [Mobile App](#10-mobile-app)

---

## 🔴 ALTA PRIORIDADE

### 1. Relatórios e Dashboards

#### 1.1 Dashboard Executivo
**Localização:** `/app/dashboard/reports/page.tsx`

**Componentes Necessários:**

```typescript
// 1. RevenueChart.tsx - Gráfico de Receita
- Biblioteca: recharts ou chart.js
- Tipos: Linha, Barra
- Períodos: Dia, Semana, Mês, Ano
- Comparação: Período anterior
- Filtros: Data inicial, data final

// 2. AppointmentStatusChart.tsx - Pizza de Status
- Tipos: Pizza ou Donut
- Status: Confirmado, Concluído, Cancelado, No-show
- Tooltip com percentuais

// 3. TopServicesChart.tsx - Top 5 Serviços
- Tipo: Barra horizontal
- Dados: Nome do serviço, quantidade, receita
- Ordenação: Por receita ou quantidade

// 4. ProfessionalPerformance.tsx - Desempenho por Profissional
- Tipo: Tabela ou cards
- Métricas: Agendamentos, Receita, Comissões
- Ranking: Por receita total

// 5. ProductSalesChart.tsx - Vendas de Produtos
- Tipo: Linha ou barra
- Top 10 produtos mais vendidos
- Estoque atual
```

**Endpoints Backend Necessários:**

```python
# financial/views.py
@action(detail=False, methods=['get'])
def revenue_chart(self, request):
    """
    Retorna dados para gráfico de receita
    Query params: start_date, end_date, period (day|week|month)
    """
    pass

@action(detail=False, methods=['get'])
def expense_chart(self, request):
    """Gráfico de despesas"""
    pass

# scheduling/views.py
@action(detail=False, methods=['get'])
def status_distribution(self, request):
    """Distribuição de status dos agendamentos"""
    pass

@action(detail=False, methods=['get'])
def top_services(self, request):
    """Top serviços por receita"""
    pass

@action(detail=False, methods=['get'])
def professional_performance(self, request):
    """Desempenho de cada profissional"""
    pass

# inventory/views.py
@action(detail=False, methods=['get'])
def top_products(self, request):
    """Top produtos mais vendidos"""
    pass
```

**Checklist de Implementação:**

```
Backend:
□ Criar endpoints de relatórios
□ Implementar lógica de agregação (annotate, aggregate)
□ Adicionar testes unitários
□ Documentar endpoints na API_REFERENCE.md

Frontend:
□ Instalar biblioteca de gráficos (npm install recharts)
□ Criar componentes de gráficos
□ Criar página /dashboard/reports
□ Criar hooks useReports.ts
□ Adicionar filtros de data
□ Adicionar export para PDF (react-pdf)
□ Adicionar export para Excel (xlsx)

Testes:
□ Testar com dados reais
□ Testar com diferentes períodos
□ Testar responsividade
```

#### 1.2 Relatório de Comissões
**Localização:** `/app/dashboard/reports/commissions/page.tsx`

**Funcionalidades:**
- Tabela de comissões por profissional
- Filtros: Período, profissional, status
- Resumo: Total pendente, total pago, total cancelado
- Export para PDF (holerite de comissões)
- Botão de marcar como pago (batch)

---

### 2. Testes Automatizados

#### 2.1 Backend (pytest)

**Estrutura:**
```
backend/
├── pytest.ini
├── conftest.py
└── tests/
    ├── __init__.py
    ├── test_core/
    │   ├── test_auth.py
    │   ├── test_multi_tenant.py
    │   └── test_permissions.py
    ├── test_scheduling/
    │   ├── test_appointments.py
    │   └── test_services.py
    ├── test_financial/
    │   ├── test_transactions.py
    │   └── test_payment_methods.py
    ├── test_customers/
    │   └── test_customers.py
    ├── test_inventory/
    │   └── test_products.py
    └── test_commissions/
        └── test_commissions.py
```

**Exemplo de Teste:**
```python
# tests/test_core/test_multi_tenant.py
import pytest
from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()

@pytest.mark.django_db
class TestMultiTenantIsolation:
    def test_user_cannot_access_other_tenant_data(self, api_client):
        # Criar tenant 1
        tenant1 = Tenant.objects.create(name="Tenant 1")
        user1 = User.objects.create_user(
            email="user1@tenant1.com",
            password="pass123",
            tenant=tenant1
        )
        
        # Criar tenant 2
        tenant2 = Tenant.objects.create(name="Tenant 2")
        user2 = User.objects.create_user(
            email="user2@tenant2.com",
            password="pass123",
            tenant=tenant2
        )
        
        # Criar serviço para tenant 2
        service2 = Service.objects.create(
            name="Service 2",
            tenant=tenant2,
            price=50
        )
        
        # Login como user1
        api_client.force_authenticate(user=user1)
        
        # Tentar acessar serviço do tenant 2
        response = api_client.get(f'/api/scheduling/services/{service2.id}/')
        
        # Deve retornar 404 (não encontrado)
        assert response.status_code == 404
```

**Checklist:**
```
□ Instalar pytest e pytest-django
□ Configurar pytest.ini
□ Criar fixtures em conftest.py
□ Escrever testes de auth (login, signup, refresh)
□ Escrever testes de isolamento multi-tenant
□ Escrever testes de permissions
□ Escrever testes de CRUD de cada módulo
□ Escrever testes de validações
□ Escrever testes de signals (comissões)
□ Configurar CI/CD (GitHub Actions)
□ Atingir 80%+ de cobertura
```

#### 2.2 Frontend (Jest + React Testing Library)

**Estrutura:**
```
frontend/
├── jest.config.js
├── jest.setup.js
└── __tests__/
    ├── components/
    │   ├── appointments/
    │   ├── services/
    │   └── customers/
    ├── pages/
    │   ├── login.test.tsx
    │   ├── signup.test.tsx
    │   └── dashboard.test.tsx
    └── hooks/
        ├── useAppointments.test.ts
        └── useServices.test.ts
```

**Exemplo de Teste:**
```typescript
// __tests__/pages/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/app/login/page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('LoginPage', () => {
  it('should render login form', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });
  });
});
```

**Checklist:**
```
□ Instalar jest, @testing-library/react, @testing-library/jest-dom
□ Configurar jest.config.js
□ Criar mocks de API (msw)
□ Testar componentes de formulário
□ Testar validações
□ Testar hooks customizados
□ Testar navegação
□ Testar proteção de rotas
□ Atingir 70%+ de cobertura
```

---

### 3. Configurações do Sistema

#### 3.1 Backend - Model de Settings

```python
# core/models.py
class TenantSettings(models.Model):
    """Configurações do tenant"""
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='settings')
    
    # Aparência
    primary_color = models.CharField(max_length=7, default='#3b82f6')  # hex color
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    
    # Horário de Funcionamento
    opening_time = models.TimeField(default='09:00')
    closing_time = models.TimeField(default='18:00')
    working_days = models.JSONField(default=list)  # [1,2,3,4,5] = seg-sex
    
    # Agendamentos
    appointment_interval = models.IntegerField(default=30)  # minutos
    min_advance_booking = models.IntegerField(default=60)  # minutos
    max_advance_booking = models.IntegerField(default=30)  # dias
    allow_overlapping = models.BooleanField(default=False)
    
    # Notificações
    send_confirmation_sms = models.BooleanField(default=True)
    send_reminder_sms = models.BooleanField(default=True)
    reminder_hours_before = models.IntegerField(default=24)
    
    # Comissões
    default_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=30)
    
    # Estoque
    enable_low_stock_alerts = models.BooleanField(default=True)
    low_stock_threshold = models.IntegerField(default=5)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 3.2 Frontend - Página de Configurações

**Localização:** `/app/dashboard/settings/page.tsx`

**Tabs/Seções:**

```typescript
1. Empresa
   - Nome da empresa
   - Logo
   - Cor primária (color picker)
   - Endereço
   - Telefone

2. Horário de Funcionamento
   - Horário de abertura
   - Horário de fechamento
   - Dias da semana (checkboxes)
   - Intervalo de almoço

3. Agendamentos
   - Intervalo entre agendamentos
   - Antecedência mínima
   - Antecedência máxima
   - Permitir sobreposição

4. Notificações
   - SMS de confirmação (toggle)
   - SMS de lembrete (toggle)
   - Horas antes do lembrete
   - Email de confirmação (toggle)

5. Comissões
   - Taxa padrão de comissão
   - Regras customizadas por profissional

6. Estoque
   - Alertas de estoque baixo (toggle)
   - Quantidade mínima para alerta

7. Backup
   - Fazer backup agora
   - Backup automático (toggle)
   - Frequência (diário, semanal)
```

**Checklist:**
```
□ Criar model TenantSettings
□ Criar serializer SettingsSerializer
□ Criar endpoint /api/settings/
□ Criar página /dashboard/settings
□ Criar componente ColorPicker
□ Criar componente UploadLogo
□ Adicionar validações
□ Aplicar configurações no sistema (cor primária, etc)
```

---

## 🟡 MÉDIA PRIORIDADE

### 4. Sistema de Notificações

#### 4.1 Backend - Models

```python
# core/models.py
class Notification(models.Model):
    """Notificações do sistema"""
    TYPES = [
        ('appointment_confirmed', 'Agendamento Confirmado'),
        ('appointment_reminder', 'Lembrete de Agendamento'),
        ('appointment_cancelled', 'Agendamento Cancelado'),
        ('stock_low', 'Estoque Baixo'),
        ('birthday', 'Aniversário'),
        ('commission_paid', 'Comissão Paga'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.UUIDField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 4.2 Backend - Tasks (Celery)

```python
# core/tasks.py
from celery import shared_task
from datetime import datetime, timedelta

@shared_task
def send_appointment_reminders():
    """Envia lembretes de agendamentos (24h antes)"""
    tomorrow = datetime.now() + timedelta(days=1)
    appointments = Appointment.objects.filter(
        start_time__date=tomorrow.date(),
        status='confirmado'
    )
    
    for apt in appointments:
        # Criar notificação
        Notification.objects.create(
            tenant=apt.tenant,
            user=apt.professional,
            type='appointment_reminder',
            title='Lembrete de Agendamento',
            message=f'Você tem um agendamento amanhã às {apt.start_time.strftime("%H:%M")}'
        )
        
        # Enviar SMS (opcional)
        if apt.tenant.settings.send_reminder_sms:
            send_sms(apt.client_phone, f'Lembrete: Seu agendamento é amanhã às {apt.start_time.strftime("%H:%M")}')

@shared_task
def check_low_stock():
    """Verifica produtos com estoque baixo"""
    pass

@shared_task
def send_birthday_notifications():
    """Envia notificações de aniversário"""
    pass
```

#### 4.3 Frontend - Centro de Notificações

**Componente:** `components/notifications/NotificationCenter.tsx`

```typescript
// Badge no header com contador
// Dropdown com últimas 5 notificações
// Link para página completa /dashboard/notifications
// Marcar como lida
// Marcar todas como lidas
```

**Checklist:**
```
Backend:
□ Criar model Notification
□ Criar endpoints /api/notifications/
□ Instalar Celery + Redis
□ Criar tasks de notificações
□ Configurar celery beat (scheduler)
□ Integrar SMS (Twilio ou similar)

Frontend:
□ Criar componente NotificationBadge
□ Criar componente NotificationDropdown
□ Criar página /dashboard/notifications
□ Criar hook useNotifications
□ Implementar WebSocket (opcional - tempo real)
□ Adicionar som de notificação
```

---

### 5. Sistema de Fidelidade

#### 5.1 Backend - Models

```python
# customers/models.py
class LoyaltyProgram(models.Model):
    """Programa de fidelidade do tenant"""
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    points_per_real = models.DecimalField(max_digits=5, decimal_places=2, default=1)  # 1 ponto por real gasto
    welcome_bonus = models.IntegerField(default=100)  # pontos ao se cadastrar

class LoyaltyTier(models.Model):
    """Níveis de fidelidade (Bronze, Prata, Ouro)"""
    program = models.ForeignKey(LoyaltyProgram, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    min_points = models.IntegerField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    benefits = models.JSONField(default=dict)

class CustomerLoyalty(models.Model):
    """Pontos de fidelidade do cliente"""
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE)
    total_points = models.IntegerField(default=0)
    available_points = models.IntegerField(default=0)
    tier = models.ForeignKey(LoyaltyTier, on_delete=models.SET_NULL, null=True)
    
class LoyaltyTransaction(models.Model):
    """Histórico de pontos"""
    TYPES = [('earn', 'Ganhou'), ('redeem', 'Resgatou'), ('expire', 'Expirou')]
    customer_loyalty = models.ForeignKey(CustomerLoyalty, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TYPES)
    points = models.IntegerField()
    description = models.CharField(max_length=200)
    appointment = models.ForeignKey('scheduling.Appointment', null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 5.2 Frontend - Página de Fidelidade

**Localização:** `/app/dashboard/loyalty/page.tsx`

**Funcionalidades:**
- Configurar programa de fidelidade
- Criar níveis (Bronze, Prata, Ouro)
- Definir benefícios por nível
- Ver clientes por nível
- Histórico de pontos
- Resgatar pontos manualmente

**Checklist:**
```
□ Criar models de fidelidade
□ Criar signal para adicionar pontos (appointment_completed)
□ Criar endpoints /api/loyalty/
□ Criar página de configuração
□ Criar página de visualização (cliente)
□ Adicionar pontos no CustomerCard
□ Adicionar resgate de pontos no checkout
```

---

### 6. Agendamento Online

#### 6.1 Widget Público

**Fluxo:**
```
1. Tenant gera um link público: https://meu-erp.com/book/{tenant_slug}
2. Cliente acessa o link
3. Escolhe serviço
4. Escolhe profissional (opcional)
5. Escolhe data e hora
6. Preenche dados (nome, telefone, email)
7. Confirma agendamento
8. Recebe confirmação via SMS/Email
```

**Backend:**
```python
# scheduling/views.py
class PublicAppointmentViewSet(viewsets.ModelViewSet):
    """Endpoints públicos para agendamento"""
    permission_classes = [AllowAny]
    
    def create(self, request, tenant_slug):
        """Criar agendamento público"""
        tenant = Tenant.objects.get(slug=tenant_slug)
        # Validar horário disponível
        # Criar cliente (se não existir)
        # Criar agendamento
        # Enviar SMS de confirmação
        pass
```

**Frontend:**
```typescript
// app/book/[tenant_slug]/page.tsx
// Página pública (não requer login)
// Calendário com horários disponíveis
// Formulário de dados do cliente
```

**Checklist:**
```
□ Adicionar campo slug no Tenant
□ Criar endpoints públicos
□ Criar página pública /book/[tenant_slug]
□ Implementar validação de horários disponíveis
□ Integrar SMS de confirmação
□ Criar página de configuração do widget
□ Gerar embed code (iframe)
```

---

## 🟢 BAIXA PRIORIDADE

### 7. Marketing e Comunicação

**Funcionalidades:**
- Campanhas de SMS/WhatsApp em massa
- Segmentação de clientes (VIP, inativos, aniversariantes)
- Templates de mensagens
- Histórico de campanhas
- Métricas de engajamento

**Checklist:**
```
□ Criar model Campaign
□ Integrar WhatsApp Business API
□ Criar página /dashboard/marketing
□ Criar editor de templates
□ Adicionar agendamento de campanhas
```

---

### 8. Multi-unidade

**Funcionalidades:**
- Um tenant pode ter múltiplas unidades
- Transferência de estoque entre unidades
- Profissionais podem trabalhar em várias unidades
- Relatórios consolidados ou por unidade

**Checklist:**
```
□ Criar model Unit (unidade)
□ Adicionar unit_id em models relevantes
□ Atualizar filtros de isolamento
□ Criar seletor de unidade no header
□ Criar dashboard por unidade
```

---

### 9. Integrações

#### 9.1 Pagamento Online
- PagSeguro
- MercadoPago
- Stripe

#### 9.2 Comunicação
- WhatsApp Business API
- Twilio (SMS)
- SendGrid (Email)

#### 9.3 Nota Fiscal
- NF-e
- NFS-e

#### 9.4 Outras
- Google Calendar
- Google Maps
- Facebook Pixel
- Google Analytics

---

### 10. Mobile App

**Opções:**
1. **React Native** (recomendado)
   - Reutiliza lógica do frontend
   - TypeScript
   - Expo para facilitar

2. **PWA** (Progressive Web App)
   - Mais simples
   - Funciona offline
   - Instalar no home screen

**Funcionalidades:**
- Login
- Ver agendamentos do dia
- Criar agendamento rápido
- Notificações push
- Tirar foto de clientes
- Trabalhar offline

---

## 📊 ROADMAP SUGERIDO

### Mês 1
```
Semana 1: Relatórios e Dashboards
Semana 2: Testes Automatizados (Backend)
Semana 3: Testes Automatizados (Frontend)
Semana 4: Configurações do Sistema
```

### Mês 2
```
Semana 1: Sistema de Notificações
Semana 2: Sistema de Fidelidade
Semana 3: Agendamento Online
Semana 4: Otimizações e Refatorações
```

### Mês 3
```
Semana 1: Marketing e Comunicação
Semana 2: Integrações (Pagamento)
Semana 3: Deploy em Produção
Semana 4: Monitoramento e Ajustes
```

### Mês 4+
```
- Multi-unidade
- Mobile App
- Novas integrações
- Novos módulos (RH, Folha de Pagamento, etc)
```

---

## 🎯 MÉTRICAS DE SUCESSO

### Técnicas
- ✅ 80%+ de cobertura de testes
- ✅ 100% dos endpoints documentados
- ✅ Tempo de resposta < 200ms (95 percentil)
- ✅ Zero downtime em produção
- ✅ Backup diário automático

### Negócio
- ✅ 10+ tenants usando o sistema
- ✅ 1000+ agendamentos por mês
- ✅ NPS > 50
- ✅ Churn rate < 5%
- ✅ ROI positivo

---

## 📝 CONCLUSÃO

Este documento detalha os próximos passos para evoluir o sistema My ERP de um MVP funcional para um produto de nível empresarial.

**Priorize:**
1. **Relatórios** (valor imediato para o usuário)
2. **Testes** (qualidade e confiança)
3. **Configurações** (flexibilidade)

**Depois evolua para:**
4. **Notificações** (engajamento)
5. **Fidelidade** (retenção)
6. **Integrações** (ecossistema)

Cada item tem um checklist detalhado e pode ser implementado de forma incremental.

---

**Próxima Ação Recomendada:** Começar pelo item **#1 - Relatórios e Dashboards**, pois traz valor imediato e diferencial competitivo.
