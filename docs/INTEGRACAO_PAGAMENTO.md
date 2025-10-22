# 💳 Guia Rápido - Integração de Pagamento com Stripe

## ⚡ Setup em 30 Minutos

### 1. Criar Conta Stripe (5 min)

1. Acesse: https://dashboard.stripe.com/register
2. Crie conta (pode usar modo teste gratuitamente)
3. Anote suas chaves em: **Developers > API Keys**
   - `Publishable key` (começa com `pk_test_`)
   - `Secret key` (começa com `sk_test_`)

### 2. Instalar Dependências (2 min)

**Backend:**
```bash
cd backend
pip install stripe
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install @stripe/stripe-js
```

### 3. Configurar Backend (10 min)

#### 3.1. Adicionar ao `.env`
```bash
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_vai_ser_gerado_depois
```

#### 3.2. Criar `backend/superadmin/stripe_integration.py`
```python
import stripe
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Subscription, PaymentHistory

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(subscription_id):
    """Cria uma sessão de checkout do Stripe"""
    try:
        subscription = Subscription.objects.get(id=subscription_id)
        
        # Preços em centavos
        prices = {
            'basic': 4990,       # R$ 49,90
            'professional': 9990, # R$ 99,90
            'enterprise': 19990   # R$ 199,90
        }
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'brl',
                    'unit_amount': prices.get(subscription.plan, 0),
                    'product_data': {
                        'name': f'Assinatura {subscription.get_plan_display()}',
                        'description': f'Plano {subscription.get_plan_display()} - {subscription.tenant.name}',
                    },
                    'recurring': {
                        'interval': 'month',
                    },
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=settings.FRONTEND_URL + f'/superadmin/subscriptions?success=true&subscription_id={subscription_id}',
            cancel_url=settings.FRONTEND_URL + f'/superadmin/subscriptions?canceled=true',
            metadata={
                'subscription_id': subscription_id,
                'tenant_id': str(subscription.tenant.id),
            }
        )
        
        return session
    except Exception as e:
        raise Exception(f'Erro ao criar checkout: {str(e)}')

@api_view(['POST'])
def create_checkout(request):
    """Endpoint para criar checkout"""
    subscription_id = request.data.get('subscription_id')
    
    if not subscription_id:
        return Response({'error': 'subscription_id é obrigatório'}, status=400)
    
    try:
        session = create_checkout_session(subscription_id)
        return Response({
            'session_id': session.id,
            'url': session.url
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def stripe_webhook(request):
    """Processa webhooks do Stripe"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Processar evento
    if event.type == 'checkout.session.completed':
        session = event.data.object
        subscription_id = session.metadata.get('subscription_id')
        
        # Atualizar assinatura
        subscription = Subscription.objects.get(id=subscription_id)
        subscription.payment_status = 'paid'
        subscription.status = 'active'
        subscription.save()
        
        # Criar histórico de pagamento
        PaymentHistory.objects.create(
            subscription=subscription,
            amount=session.amount_total / 100,  # Converter de centavos
            payment_method='credit_card',
            status='paid',
            transaction_id=session.payment_intent,
            notes=f'Pagamento via Stripe - Session {session.id}'
        )
    
    elif event.type == 'invoice.payment_failed':
        # Marcar pagamento como falho
        session = event.data.object
        subscription_id = session.metadata.get('subscription_id')
        subscription = Subscription.objects.get(id=subscription_id)
        subscription.payment_status = 'failed'
        subscription.save()
    
    return Response({'status': 'success'})
```

#### 3.3. Adicionar URLs
```python
# backend/superadmin/urls.py
from .stripe_integration import create_checkout, stripe_webhook

urlpatterns = [
    # ... rotas existentes ...
    path('create-checkout/', create_checkout, name='create-checkout'),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
]
```

#### 3.4. Adicionar ao `settings.py`
```python
# backend/config/settings.py
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3001')
```

### 4. Configurar Frontend (10 min)

#### 4.1. Adicionar ao `.env.local`
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
```

#### 4.2. Criar `frontend/lib/stripe.ts`
```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const createCheckoutSession = async (subscriptionId: number) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/create-checkout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar checkout');
  }

  return response.json();
};
```

#### 4.3. Adicionar Botão de Pagamento
```typescript
// frontend/app/superadmin/subscriptions/page.tsx

import { stripePromise, createCheckoutSession } from '@/lib/stripe';

// No componente, adicionar:
const handlePayment = async (subscriptionId: number) => {
  try {
    const { url } = await createCheckoutSession(subscriptionId);
    window.location.href = url; // Redireciona para Stripe
  } catch (error) {
    toast.error('Erro ao processar pagamento');
  }
};

// Adicionar botão:
<Button onClick={() => handlePayment(subscription.id)}>
  💳 Pagar com Cartão
</Button>
```

### 5. Configurar Webhook (3 min)

#### 5.1. Instalar Stripe CLI
```bash
# Windows (Chocolatey)
choco install stripe-cli

# Mac
brew install stripe/stripe-cli/stripe

# Linux
https://stripe.com/docs/stripe-cli
```

#### 5.2. Login e Webhook Local
```bash
# Login
stripe login

# Encaminhar webhooks para local
stripe listen --forward-to http://localhost:8000/api/superadmin/webhook/stripe/

# Copiar o webhook secret que aparece (whsec_...)
# Adicionar ao .env como STRIPE_WEBHOOK_SECRET
```

## 🧪 Testar (5 min)

### 1. Iniciar servidores
```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm run dev

# Stripe webhook
stripe listen --forward-to http://localhost:8000/api/superadmin/webhook/stripe/
```

### 2. Fazer teste de pagamento
1. Acesse http://localhost:3001/superadmin/subscriptions
2. Clique em "Pagar com Cartão"
3. Use cartão de teste: `4242 4242 4242 4242`
4. Data: qualquer futura (ex: 12/25)
5. CVC: qualquer (ex: 123)
6. Complete o pagamento

### 3. Verificar
- ✅ Assinatura marcada como "Pago"
- ✅ Status mudou para "Ativa"
- ✅ Histórico de pagamento criado
- ✅ Webhook recebido no terminal

## 🚀 Deploy em Produção

### 1. Trocar para chaves de produção
```bash
# Backend .env
STRIPE_SECRET_KEY=sk_live_sua_chave_real

# Frontend .env.production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_real
```

### 2. Configurar webhook no Stripe Dashboard
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. URL: `https://api.seudominio.com/api/superadmin/webhook/stripe/`
4. Selecione eventos:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copie o "Signing secret" (whsec_...)
6. Adicione ao `.env` de produção

## 💡 Cartões de Teste

```
# Sucesso
4242 4242 4242 4242

# Requer autenticação 3D Secure
4000 0025 0000 3155

# Falha (cartão recusado)
4000 0000 0000 0002

# Insuficiente
4000 0000 0000 9995
```

## 🔒 Segurança

### ✅ Implementado
- Webhook signature verification
- Servidor-side processing
- Metadata com IDs

### ⚠️ Lembrar
- **NUNCA** commitar chaves no git
- Usar `.env` para todas as chaves
- Validar webhook signature sempre
- Usar HTTPS em produção

## 📊 Monitorar

### Stripe Dashboard
- Pagamentos: https://dashboard.stripe.com/payments
- Assinaturas: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

## 🎯 Próximos Passos

1. **Assinaturas Recorrentes**
   - Usar `stripe.Subscription.create()` ao invés de checkout único
   
2. **Portal do Cliente**
   - Permitir que cliente atualize cartão
   - Cancelar assinatura
   ```python
   stripe.billing_portal.Session.create(
       customer=customer_id,
       return_url=settings.FRONTEND_URL + '/dashboard'
   )
   ```

3. **Emails Automáticos**
   - Pagamento bem sucedido
   - Pagamento falhou
   - Assinatura cancelada

4. **Cupons de Desconto**
   ```python
   coupon = stripe.Coupon.create(
       percent_off=25,
       duration='once',
   )
   ```

## 📝 Documentação Stripe

- API Reference: https://stripe.com/docs/api
- Testing: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
- Subscriptions: https://stripe.com/docs/billing/subscriptions/overview

---

**Com isso, você terá pagamentos funcionando em ~30 minutos! 🎉**
