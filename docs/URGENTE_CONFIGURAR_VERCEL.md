# 🚨 URGENTE: Configurar Variável de Ambiente no Vercel

## Problema Atual
Os cards do dashboard superadmin estão ficando em loading porque o frontend não consegue conectar ao backend.

## Causa Raiz
A variável de ambiente `NEXT_PUBLIC_API_URL` não está configurada no Vercel. O frontend está tentando conectar em `http://localhost:8000/api` (que não existe na produção).

## ✅ Solução

### 1. Acesse o Vercel Dashboard
- Vá para: https://vercel.com/dashboard
- Selecione seu projeto (my_erp)

### 2. Adicione a Variável de Ambiente
1. Clique em **Settings** (no topo da página)
2. No menu lateral esquerdo, clique em **Environment Variables**
3. Adicione a seguinte variável:

```
Key: NEXT_PUBLIC_API_URL
Value: https://myerp-production-4bb9.up.railway.app/api
Environment: Production, Preview, Development (selecione todos)
```

4. Clique em **Save**

### 3. Force um Redeploy
1. Vá para a aba **Deployments**
2. Encontre o último deployment (que acabou de fazer o push)
3. Clique nos três pontos (...) ao lado dele
4. Selecione **Redeploy**
5. Marque a opção **Use existing build cache** (opcional, mas mais rápido)
6. Confirme o redeploy

### 4. Aguarde 2-3 minutos
O Vercel vai reconstruir e deployar com a variável de ambiente correta.

## ✅ Como Verificar se Funcionou

Após o deploy:

1. Acesse: https://seu-app.vercel.app/superadmin
2. Faça login com superadmin/admin123
3. Os cards devem mostrar dados em vez de ficar carregando:
   - ✅ Redis: Hit Ratio, Memory, Keys
   - ✅ Infra: CPU %, RAM %
   - ✅ Uptime: ONLINE (com LED verde piscando)
   - ✅ Sentry: Crash-free rate
   - ✅ Sentry Performance: Response time

## 🔍 Debug Adicional (se ainda não funcionar)

### Verificar no Console do Browser
1. Pressione F12 no navegador
2. Vá na aba **Console**
3. Procure por erros de "Failed to fetch" ou "Network Error"
4. Vá na aba **Network**
5. Filtro por "system-health"
6. Verifique se as requisições estão indo para o Railway (`myerp-production-4bb9.up.railway.app`)

### Testar Backend Diretamente
```bash
# Health check público (deve retornar 200 OK)
curl https://myerp-production-4bb9.up.railway.app/api/health/

# Endpoint Redis (requer autenticação)
curl -H "Authorization: Bearer SEU_TOKEN_JWT" \
  https://myerp-production-4bb9.up.railway.app/api/superadmin/system-health/redis/metrics/
```

## 📋 Checklist de Resolução

- [ ] Variável `NEXT_PUBLIC_API_URL` configurada no Vercel
- [ ] Redeploy forçado no Vercel
- [ ] Build completou com sucesso (sem erros TypeScript)
- [ ] Dashboard `/superadmin` acessível
- [ ] Card Redis mostrando dados (não loading)
- [ ] Card Infra mostrando CPU/RAM (não loading)
- [ ] Card Uptime mostrando ONLINE (não OFFLINE)
- [ ] Card Sentry mostrando crash-free rate
- [ ] Card Sentry Performance mostrando response time

---

## 🎯 Resumo das Correções Feitas

### Commit 60b6d07c (MAIS RECENTE)
**fix: Correct RedisMetrics field names and remove ops_per_sec**

✅ Correções realizadas:
- `keys_total` → `total_keys` (linhas 74, 140)
- `hits` → `keyspace_hits` (linha 96)
- `misses` → `keyspace_misses` (linha 99)
- Removido métrica `ops_per_sec` (não existe na API)

✅ Resultado:
- Build do TypeScript vai passar agora
- Nenhum erro de "Property does not exist"

### Problema Remanescente
🔴 Cards ficam carregando porque frontend não encontra o backend
🔴 Causa: `NEXT_PUBLIC_API_URL` não configurada no Vercel
🔴 Solução: Seguir os passos acima para configurar a variável

---

**Próximo Passo:** Configure a variável no Vercel e force o redeploy! 🚀
