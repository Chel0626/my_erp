# 📝 Como Criar Planos de Assinatura no Mercado Pago

Este guia mostra como criar os 3 planos de assinatura recorrente no painel do Mercado Pago.

---

## 🔑 Passo 1: Acessar o Painel

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login com sua conta Mercado Pago
3. No menu lateral, vá em **"Suas integrações"** → **"Assinaturas"**
4. Clique em **"Criar plano de assinatura"**

---

## 💰 Passo 2: Criar os 3 Planos

### Plano 1: Básico (R$ 19,90/mês)

**Informações do Plano:**
- **Nome:** Plano Básico
- **Descrição:** Para o Barbeiro Solo - Ideal para começar
- **Valor:** R$ 19,90
- **Periodicidade:** Mensal (1 mês)
- **Moeda:** BRL (Real Brasileiro)

**Recursos inclusos (opcional, apenas informativo):**
- 1 Profissional
- Agenda Online
- Controle Financeiro
- Link de Agendamento

**Após criar, copie o `plan_id` gerado (algo como: `2c9380848b9c0e8e018ba1b6e4b50f0d`)**

---

### Plano 2: Profissional (R$ 59,90/mês) ⭐ RECOMENDADO

**Informações do Plano:**
- **Nome:** Plano Profissional
- **Descrição:** Para Equipes que Querem Crescer - Mais Popular
- **Valor:** R$ 59,90
- **Periodicidade:** Mensal (1 mês)
- **Moeda:** BRL (Real Brasileiro)

**Recursos inclusos:**
- Profissionais ILIMITADOS
- Clientes ILIMITADOS
- Tudo do Básico +
- Gestão de Comissões
- Relatórios Avançados
- Lembretes WhatsApp

**Após criar, copie o `plan_id` gerado**

---

### Plano 3: Premium (R$ 109,90/mês)

**Informações do Plano:**
- **Nome:** Plano Premium
- **Descrição:** Para quem tem Múltiplas Filiais
- **Valor:** R$ 109,90
- **Periodicidade:** Mensal (1 mês)
- **Moeda:** BRL (Real Brasileiro)

**Recursos inclusos:**
- Tudo do Profissional +
- Gestão de Múltiplas Lojas
- Dashboard Consolidado
- Suporte Prioritário

**Após criar, copie o `plan_id` gerado**

---

## 🔧 Passo 3: Configurar os Plan IDs no Railway

Após criar os 3 planos, você terá 3 `plan_id`s. Configure-os no Railway:

```bash
# Substitua pelos IDs reais do seu painel MP
railway variables --set MP_PLAN_BASICO="2c9380848b9c0e8e018ba1b6e4b50f0d"
railway variables --set MP_PLAN_PROFISSIONAL="2c9380848b9c0e8e018ba1b6e4b60f1e"
railway variables --set MP_PLAN_PREMIUM="2c9380848b9c0e8e018ba1b6e4b70f2f"
```

---

## 🔗 Passo 4: Configurar Webhook no Mercado Pago

1. No painel do MP, vá em **"Suas integrações"** → **"Webhooks"**
2. Clique em **"Criar webhook"**
3. Configure:
   - **URL:** `https://seu-backend.railway.app/api/webhooks/mercadopago/`
   - **Eventos:**
     - ✅ `subscription_preapproval` (Assinatura criada/atualizada)
     - ✅ `subscription_authorized_payment` (Cobrança aprovada)
     - ✅ `subscription_preapproval_plan` (Plano atualizado)
4. Clique em **"Salvar"**

---

## ✅ Passo 5: Testar

1. Crie uma nova conta no seu sistema
2. Aguarde o trial de 7 dias ou force expiração
3. Clique em "Assinar Agora" → escolha um plano
4. Use os **cartões de teste do Mercado Pago:**
   - **Aprovado:** `5031 4332 1540 6351` (CVV: 123, Validade: qualquer futura)
   - **Rejeitado:** `5031 4332 1540 6351` (CVV: 123, Validade: qualquer futura)
5. Complete o pagamento no ambiente de teste
6. Verifique se o webhook foi recebido e o tenant ficou ACTIVE

---

## 📚 Documentação Oficial

- **API de Assinaturas:** https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration
- **Webhooks:** https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/notifications
- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing

---

## 🆘 Troubleshooting

**Erro: "Plan ID não configurado"**
- Verifique se as variáveis `MP_PLAN_BASICO`, `MP_PLAN_PROFISSIONAL`, `MP_PLAN_PREMIUM` estão configuradas no Railway
- Rode: `railway variables` para listar todas

**Webhook não está chegando:**
- Verifique se a URL está correta (https://...)
- Teste manualmente: `curl -X POST https://seu-backend.railway.app/api/webhooks/mercadopago/`
- Veja os logs no Railway: `railway logs`

**Assinatura não ativa após pagamento:**
- Verifique os logs do webhook no Railway
- Confirme que o `external_reference` está correto
- Teste com cartão de aprovação garantida

---

## 🎯 Status Atual

✅ Credenciais do MP configuradas no Railway
✅ Código atualizado para assinaturas recorrentes
⏳ **PRÓXIMO:** Criar os 3 planos no painel do MP e configurar os plan_ids
