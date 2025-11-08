# População de Dados do SuperAdmin - Guia Completo

## 📋 Resumo

Script criado para popular dados de demonstração no painel SuperAdmin, incluindo tenants, usuários, assinaturas, pagamentos e estatísticas de uso.

## ✅ Dados Populados Localmente

### 🏢 Tenants (8 empresas)
1. **Clínica São Lucas** - Premium, Ativa
2. **Estética Bella Vita** - Professional, Ativa
3. **Salão de Beleza Maria** - Basic, Trial
4. **Spa Relaxar** - Professional, Ativa
5. **Clínica Odontológica Sorrir** - Enterprise, Suspensa
6. **Academia FitLife** - Basic, Ativa
7. **Pet Shop Amigo Fiel** - Professional, Trial
8. **Barbearia do João** - Basic, Ativa

### 📊 Estatísticas
- **Total Tenants**: 11 (10 ativos, 2 em trial)
- **Usuários**: 62 (excluindo superadmins)
- **Assinaturas**: 8
- **Pagamentos Históricos**: 20 registros
- **Estatísticas de Uso**: 48 meses de dados (6 meses por tenant)
- **Receita Total**: R$ 4,598.00

### 🔐 Credenciais de Acesso

**Padrão Admin**:
- Email: `admin@[nometenant].com` (sem espaços e acentos)
- Senha: `admin123`
- Exemplo: `admin@clinicasaolucas.com`

**Padrão Usuário**:
- Email: `user1@[nometenant].com`, `user2@...`, etc
- Senha: `user123`

## 🚀 Como Executar

### Local (Desenvolvimento)
```bash
cd backend
python populate_superadmin.py
```

### Railway (Produção)
```bash
# Via Railway CLI
railway run python backend/populate_superadmin.py

# Ou conectar e executar manualmente
railway shell
cd backend
python populate_superadmin.py
```

## 🛠️ Detalhes Técnicos

### Modelos Django Corrigidos

#### User (core/models.py)
```python
- email: EmailField (unique)
- name: CharField (não first_name/last_name)
- tenant: ForeignKey
- role: CharField (admin, barbeiro, caixa, atendente, superadmin)
- is_active: BooleanField
```

#### Subscription (superadmin/models.py)
```python
- tenant: OneToOneField
- plan: CharField (free, basic, professional, enterprise)
- status: CharField (trial, active, suspended, cancelled, expired)
- payment_status: CharField (pending, paid, overdue, failed)
- start_date: DateField
- trial_end_date: DateField (não trial_ends_at)
- next_billing_date: DateField
- monthly_price: DecimalField (não price)
- max_users: IntegerField
- max_appointments_per_month: IntegerField
- features: JSONField
```

#### PaymentHistory (superadmin/models.py)
```python
- subscription: ForeignKey
- amount: DecimalField
- payment_method: CharField (credit_card, boleto, pix)
- status: CharField (paid, pending, failed)
- paid_at: DateTimeField (não payment_date)
- reference_month: DateField
- transaction_id: CharField
```

#### TenantUsageStats (superadmin/models.py)
```python
- tenant: ForeignKey
- month: DateField (não date)
- api_calls: IntegerField
- storage_used_mb: IntegerField
- active_users: IntegerField
- total_appointments: IntegerField
- completed_appointments: IntegerField
- new_customers: IntegerField
- total_customers: IntegerField
- total_revenue: DecimalField
- total_users: IntegerField
```

### Mapeamentos de Planos

```python
# Tenant.plan → Subscription.plan
plan_mapping = {
    'basic': 'basic',
    'pro': 'professional',
    'premium': 'enterprise',
}

# Preços
plan_prices = {
    'basic': Decimal('99.90'),
    'pro': Decimal('199.90'),
    'premium': Decimal('399.90'),
}
```

### Encoding UTF-8 para Windows

```python
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
```

Necessário para exibir emojis corretamente no console do Windows.

## 📦 Estrutura de Dados Gerada

### Por Tenant
- 1 Admin (role='admin')
- 2-14 Usuários (role='atendente')
- 1 Assinatura
- 3-6 Pagamentos históricos (se ativo)
- 6 Meses de estatísticas de uso

### Distribuição de Status
- **Ativos**: 6 tenants (clínica, estética, spa, academia, barbearia)
- **Trial**: 2 tenants (salão, pet shop)
- **Suspenso**: 1 tenant (clínica odonto)

### Dados Temporais
- **Trials**: Criados há 7 dias, expiram em 7 dias (14 dias total)
- **Ativos**: Criados há 90 dias, próximo billing em 30 dias
- **Suspensos**: Criados há 180 dias, último billing há 30 dias

## 🧪 Testando o Frontend

### 1. Iniciar Servidor Django
```bash
cd backend
python manage.py runserver 8000
```

### 2. Iniciar Frontend Next.js
```bash
cd frontend
npm run dev
```

### 3. Acessar SuperAdmin Dashboard
```
http://localhost:3000/superadmin
```

### 4. Login com SuperAdmin
Use credenciais do superadmin criado anteriormente ou crie um:

```bash
cd backend
python manage.py createsuperuser
```

### 5. Verificar Páginas
- ✅ **Dashboard**: `/superadmin` - Deve mostrar stats (11 tenants, 10 ativos)
- ✅ **Tenants**: `/superadmin/tenants` - Deve listar 8 empresas
- ✅ **Subscriptions**: `/superadmin/subscriptions` - Deve mostrar 8 assinaturas
- ✅ **Payments**: `/superadmin/payments` - Deve mostrar 20 pagamentos
- ✅ **Usage**: `/superadmin/usage` - Deve mostrar estatísticas

## 🔧 Troubleshooting

### Erro: "User matching query does not exist"
- **Causa**: Campos `first_name`, `last_name`, `username` não existem no modelo
- **Solução**: Usar `name` para nome completo

### Erro: "Invalid field name(s) for model Subscription: 'price'"
- **Causa**: Campo `price` não existe
- **Solução**: Usar `monthly_price`

### Erro: "Cannot resolve keyword 'payment_date'"
- **Causa**: Campo `payment_date` não existe
- **Solução**: Usar `paid_at` e `reference_month`

### Erro: "Cannot resolve keyword 'date' into field"
- **Causa**: TenantUsageStats usa `month` não `date`
- **Solução**: Usar `month` com primeiro dia do mês

### Erro: UnicodeEncodeError com emojis
- **Causa**: Windows terminal não suporta UTF-8 por padrão
- **Solução**: Configurar `codecs.getwriter('utf-8')` no início do script

## 📈 Próximos Passos

### 1. Executar em Produção (Railway)
```bash
# Conectar ao Railway
railway link

# Executar script
railway run python backend/populate_superadmin.py
```

### 2. Verificar API Endpoints
```bash
# Tenants
curl http://localhost:8000/api/superadmin/tenants/

# Subscriptions
curl http://localhost:8000/api/superadmin/subscriptions/

# Dashboard Stats
curl http://localhost:8000/api/superadmin/dashboard/stats/
```

### 3. Testar Funcionalidades
- [ ] Suspender/Ativar tenants
- [ ] Visualizar detalhes de assinatura
- [ ] Gráficos de uso por tenant
- [ ] Filtros na página de pagamentos
- [ ] Exportar relatórios

### 4. Melhorias Futuras
- [ ] Adicionar mais variação nos dados (diferentes datas, valores)
- [ ] Gerar notas fiscais para pagamentos
- [ ] Criar eventos de auditoria (logs de mudanças)
- [ ] Adicionar notificações de vencimento
- [ ] Dashboard com gráficos de tendência

## 📝 Observações

- Script é **idempotente**: Pode ser executado múltiplas vezes sem duplicar dados
- Usa `get_or_create()` para evitar duplicações
- Dados são criados com datas realistas (passado recente)
- Estatísticas variam conforme o plano (basic < pro < premium)
- Pagamentos só são gerados para tenants ativos
- Trials não têm histórico de pagamento

## 🎯 Resultado Final

Após executar o script, o painel SuperAdmin deve estar completamente funcional com dados realistas para demonstração e testes.

**Status**: ✅ Implementado e testado localmente
**Commit**: `6e8b65ff`
**Arquivo**: `backend/populate_superadmin.py`

---

✨ **Pronto para demonstrações e testes!**
