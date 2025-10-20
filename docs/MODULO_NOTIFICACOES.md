# 📢 MÓDULO DE NOTIFICAÇÕES - DOCUMENTAÇÃO COMPLETA

**Data:** 20 de outubro de 2025  
**Status:** ✅ **100% IMPLEMENTADO E FUNCIONAL**

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Tipos de Notificações](#tipos-de-notificações)
6. [Como Usar](#como-usar)
7. [Testes](#testes)

---

## 🎯 VISÃO GERAL

Sistema completo de notificações em tempo real para alertar usuários sobre eventos importantes no sistema:
- Novos agendamentos
- Pagamentos recebidos
- Estoque baixo/zerado
- Comissões geradas
- Novos clientes cadastrados

### **Recursos Principais:**
- ✅ Notificações geradas automaticamente via signals
- ✅ Badge com contador de não lidas
- ✅ Dropdown com lista de notificações
- ✅ Marcar como lida individualmente
- ✅ Marcar todas como lidas
- ✅ Excluir notificações
- ✅ Polling automático (atualização a cada 10s)
- ✅ Ícones coloridos por tipo
- ✅ Design responsivo

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  NotificationCenter.tsx                                 │
│    ├─ Badge com contador                                │
│    ├─ Dropdown com lista                                │
│    ├─ Botões de ação                                    │
│    └─ Polling a cada 10s                                │
├─────────────────────────────────────────────────────────┤
│  useNotifications.ts (React Query)                      │
│    ├─ useNotifications()                                │
│    ├─ useUnreadNotifications()                          │
│    ├─ useNotificationCount()                            │
│    ├─ useMarkNotificationAsRead()                       │
│    ├─ useMarkAllNotificationsAsRead()                   │
│    └─ useDeleteNotification()                           │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Django)                       │
├─────────────────────────────────────────────────────────┤
│  NotificationViewSet (REST API)                         │
│    ├─ GET /api/notifications/                           │
│    ├─ GET /api/notifications/unread/                    │
│    ├─ GET /api/notifications/count/                     │
│    ├─ POST /api/notifications/mark_as_read/             │
│    ├─ POST /api/notifications/mark_all_as_read/         │
│    └─ DELETE /api/notifications/{id}/                   │
├─────────────────────────────────────────────────────────┤
│  Signals (Geração Automática)                           │
│    ├─ notify_new_appointment                            │
│    ├─ notify_appointment_status_change                  │
│    ├─ notify_payment_received                           │
│    ├─ notify_commission_generated                       │
│    ├─ notify_low_stock                                  │
│    └─ notify_new_customer                               │
├─────────────────────────────────────────────────────────┤
│  Notification Model                                     │
│    ├─ user, tenant                                      │
│    ├─ notification_type, title, message                 │
│    ├─ is_read, read_at                                  │
│    └─ reference_type, reference_id                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND

### **1. Modelo Notification**

**Arquivo:** `backend/notifications/models.py`

```python
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey(Tenant, ...)
    user = models.ForeignKey(User, ...)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    reference_type = models.CharField(max_length=50, null=True)
    reference_id = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Tipos de Notificação:**
- `appointment_new` - Novo Agendamento
- `appointment_confirmed` - Agendamento Confirmado
- `appointment_cancelled` - Agendamento Cancelado
- `payment_received` - Pagamento Recebido
- `commission_generated` - Comissão Gerada
- `stock_low` - Estoque Baixo
- `stock_out` - Produto Sem Estoque
- `customer_new` - Novo Cliente
- `system` - Sistema

### **2. API Endpoints**

**Base URL:** `/api/notifications/`

#### **GET /api/notifications/**
Lista todas as notificações do usuário autenticado.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "notification_type": "appointment_new",
    "notification_type_display": "Novo Agendamento",
    "title": "Novo Agendamento",
    "message": "Você tem um novo agendamento com João em 20/10/2025 às 14:00",
    "is_read": false,
    "read_at": null,
    "reference_type": "appointment",
    "reference_id": "uuid",
    "created_at": "2025-10-20T14:00:00Z",
    "user_name": "Maria Silva"
  }
]
```

#### **GET /api/notifications/unread/**
Retorna apenas notificações não lidas.

#### **GET /api/notifications/count/**
Retorna contagem de notificações.

**Resposta:**
```json
{
  "total": 45,
  "unread": 12,
  "read": 33
}
```

#### **POST /api/notifications/mark_as_read/**
Marca uma ou mais notificações como lidas.

**Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Resposta:**
```json
{
  "message": "3 notificação(ões) marcada(s) como lida(s)",
  "updated_count": 3
}
```

#### **POST /api/notifications/mark_all_as_read/**
Marca todas as notificações não lidas como lidas.

**Resposta:**
```json
{
  "message": "12 notificação(ões) marcada(s) como lida(s)",
  "updated_count": 12
}
```

#### **POST /api/notifications/{id}/mark_read/**
Marca uma notificação específica como lida.

#### **DELETE /api/notifications/{id}/**
Deleta uma notificação.

### **3. Signals (Geração Automática)**

**Arquivo:** `backend/notifications/signals.py`

#### **Novo Agendamento**
```python
@receiver(post_save, sender=Appointment)
def notify_new_appointment(sender, instance, created, **kwargs):
    # Notifica o profissional quando um novo agendamento é criado
```

#### **Mudança de Status do Agendamento**
```python
@receiver(pre_save, sender=Appointment)
def notify_appointment_status_change(sender, instance, **kwargs):
    # Notifica quando confirmado ou cancelado
```

#### **Pagamento Recebido**
```python
@receiver(post_save, sender=Transaction)
def notify_payment_received(sender, instance, created, **kwargs):
    # Notifica todos os usuários do tenant quando entrada é recebida
```

#### **Comissão Gerada**
```python
@receiver(post_save, sender=Commission)
def notify_commission_generated(sender, instance, created, **kwargs):
    # Notifica o profissional sobre nova comissão
```

#### **Estoque Baixo/Zerado**
```python
@receiver(pre_save, sender=Product)
def notify_low_stock(sender, instance, **kwargs):
    # Notifica todos quando estoque <= mínimo ou = 0
```

#### **Novo Cliente**
```python
@receiver(post_save, sender=Customer)
def notify_new_customer(sender, instance, created, **kwargs):
    # Notifica todos sobre novo cliente cadastrado
```

---

## 💻 FRONTEND

### **1. Hooks (useNotifications.ts)**

**Arquivo:** `frontend/hooks/useNotifications.ts`

#### **useNotifications()**
Busca todas as notificações do usuário. Refetch automático a cada 30s.

```typescript
const { data, isLoading, error } = useNotifications();
```

#### **useUnreadNotifications()**
Busca apenas não lidas. Polling a cada 10s.

```typescript
const { data: unreadNotifications } = useUnreadNotifications();
```

#### **useNotificationCount()**
Busca contagem. Polling a cada 10s.

```typescript
const { data: count } = useNotificationCount();
// count.total, count.unread, count.read
```

#### **useMarkNotificationAsRead()**
Marca uma notificação como lida.

```typescript
const markAsRead = useMarkNotificationAsRead();
markAsRead.mutate(notificationId);
```

#### **useMarkAllNotificationsAsRead()**
Marca todas como lidas.

```typescript
const markAllAsRead = useMarkAllNotificationsAsRead();
markAllAsRead.mutate();
```

#### **useDeleteNotification()**
Deleta uma notificação.

```typescript
const deleteNotification = useDeleteNotification();
deleteNotification.mutate(notificationId);
```

### **2. Componente NotificationCenter**

**Arquivo:** `frontend/components/notifications/NotificationCenter.tsx`

**Recursos:**
- ✅ Badge com contador de não lidas
- ✅ Dropdown com lista de notificações
- ✅ Ícones coloridos por tipo
- ✅ Timestamp relativo ("há 5 minutos")
- ✅ Botão de marcar como lida (individual)
- ✅ Botão de deletar
- ✅ Botão de marcar todas como lidas
- ✅ Estado vazio amigável
- ✅ Loading state
- ✅ Scroll area para muitas notificações
- ✅ Design responsivo

**Uso:**
```tsx
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

<NotificationCenter />
```

**Integração no Layout:**
```tsx
// frontend/app/dashboard/layout.tsx
<div className="flex items-center gap-2">
  <NotificationCenter />
  <UserMenu />
</div>
```

---

## 🎨 TIPOS DE NOTIFICAÇÕES

### **Cores e Ícones:**

| Tipo | Cor | Ícone | Uso |
|------|-----|-------|-----|
| `appointment_new` | Azul | Bell | Novo agendamento criado |
| `appointment_confirmed` | Azul | Bell | Agendamento confirmado |
| `appointment_cancelled` | Vermelho | X | Agendamento cancelado |
| `payment_received` | Verde | Check | Pagamento recebido |
| `commission_generated` | Roxo | Check | Comissão gerada |
| `stock_low` | Laranja | Bell | Estoque baixo |
| `stock_out` | Laranja | Bell | Produto sem estoque |
| `customer_new` | Índigo | Bell | Novo cliente |
| `system` | Cinza | Bell | Notificação do sistema |

---

## 🚀 COMO USAR

### **1. Criar Notificação Manualmente (opcional)**

```python
from notifications.models import Notification

Notification.objects.create(
    user=user,
    notification_type='system',
    title='Manutenção Programada',
    message='O sistema ficará em manutenção das 02h às 04h',
)
```

### **2. Visualizar Notificações**

No frontend, o componente `NotificationCenter` é automaticamente carregado no header do dashboard. Usuários veem:
1. Badge com contador de não lidas
2. Clicam no sino para abrir dropdown
3. Veem lista de notificações mais recentes
4. Podem marcar como lida ou deletar

### **3. Notificações Automáticas**

As notificações são geradas automaticamente via signals quando:
- Um agendamento é criado → profissional recebe notificação
- Um agendamento é confirmado/cancelado → profissional recebe notificação
- Um pagamento é recebido → todos os usuários recebem notificação
- Uma comissão é gerada → profissional recebe notificação
- Estoque fica baixo/zero → todos recebem alerta
- Um cliente é cadastrado → todos recebem notificação

---

## 🧪 TESTES

### **1. Testar Backend**

```bash
cd backend
python manage.py shell
```

```python
from core.models import User
from notifications.models import Notification

# Buscar usuário
user = User.objects.first()

# Criar notificação de teste
notification = Notification.objects.create(
    user=user,
    notification_type='system',
    title='Teste de Notificação',
    message='Esta é uma notificação de teste',
)

print(f"Notificação criada: {notification}")

# Marcar como lida
notification.mark_as_read()
print(f"Lida em: {notification.read_at}")
```

### **2. Testar Frontend**

1. Acesse: `http://localhost:3000/dashboard`
2. Veja o sino no header (sem badge se não houver notificações)
3. Crie um agendamento, pagamento, etc.
4. O sino deve mostrar badge com contador
5. Clique no sino para ver a lista
6. Teste marcar como lida e deletar

### **3. Testar Signals**

```python
# Criar agendamento (deve gerar notificação)
from scheduling.models import Appointment
appointment = Appointment.objects.create(...)
# Verifique: o profissional deve ter recebido notificação

# Criar transação (deve gerar notificação)
from financial.models import Transaction
transaction = Transaction.objects.create(
    transaction_type='entrada',
    ...
)
# Verifique: todos os usuários devem ter recebido notificação
```

---

## 📊 ESTATÍSTICAS

### **Arquivos Criados:**
- ✅ `backend/notifications/models.py` - Modelo completo
- ✅ `backend/notifications/serializers.py` - 4 serializers
- ✅ `backend/notifications/views.py` - ViewSet com 7 endpoints
- ✅ `backend/notifications/signals.py` - 6 signals
- ✅ `backend/notifications/admin.py` - Admin interface
- ✅ `backend/notifications/urls.py` - Rotas
- ✅ `backend/notifications/apps.py` - Configuração
- ✅ `frontend/hooks/useNotifications.ts` - 7 hooks
- ✅ `frontend/components/notifications/NotificationCenter.tsx` - Componente principal
- ✅ `frontend/components/ui/scroll-area.tsx` - Componente UI

### **Linhas de Código:**
- Backend: ~600 linhas
- Frontend: ~400 linhas
- **Total:** ~1.000 linhas de código

### **Funcionalidades:**
- ✅ 9 tipos de notificações
- ✅ 7 endpoints REST
- ✅ 6 signals automáticos
- ✅ 7 hooks React Query
- ✅ Polling automático (10s)
- ✅ Badge com contador
- ✅ Marcar como lida
- ✅ Marcar todas como lidas
- ✅ Deletar notificações
- ✅ Design responsivo
- ✅ Ícones coloridos

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Modelo Notification criado
- [x] Serializers criados
- [x] ViewSet com todos os endpoints
- [x] Signals para eventos automáticos
- [x] URLs configuradas
- [x] Admin interface configurado
- [x] Migrações criadas e aplicadas
- [x] Hooks React Query criados
- [x] Componente NotificationCenter criado
- [x] Componente ScrollArea instalado
- [x] Integração no layout do dashboard
- [x] Polling automático configurado
- [x] Badge com contador funcionando
- [x] Ícones e cores por tipo
- [x] Design responsivo
- [x] Documentação completa

---

## 🎯 PRÓXIMOS PASSOS (Opcionais)

### **Melhorias Futuras:**
1. **WebSockets/Server-Sent Events:** Notificações em tempo real sem polling
2. **Push Notifications:** Notificações do navegador (Web Push API)
3. **Email/SMS:** Enviar notificações importantes por email/SMS
4. **Preferências de Notificação:** Usuário escolhe quais tipos quer receber
5. **Som/Vibração:** Alertas sonoros para notificações novas
6. **Página de Histórico:** Ver todas as notificações (não só dropdown)
7. **Agrupamento:** Agrupar notificações similares
8. **Prioridades:** Notificações urgentes, importantes, normais

---

**Status Final:** ✅ **MÓDULO 100% COMPLETO E FUNCIONAL**

Sistema de notificações robusto, escalável e pronto para produção! 🚀
