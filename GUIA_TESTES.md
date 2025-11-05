# 🚀 GUIA RÁPIDO DE TESTES - My ERP

## 🔗 URLs de Acesso

### Produção
- **Frontend:** https://vrb-erp-frontend.vercel.app
- **Backend API:** https://myerp-production-4bb9.up.railway.app/api
- **Django Admin:** https://myerp-production-4bb9.up.railway.app/admin

### Credenciais de Teste
```
Super Admin:
Email: michelhm91@gmail.com
Senha: [a senha que você definiu]
Role: superadmin

Outros usuários (se existirem no Supabase):
Email: vrberp@admin.com
Email: superadm@erp.com
```

---

## 📋 CHECKLIST BÁSICO DE TESTES

### 1️⃣ Autenticação (5 minutos)
```
✅ Teste 1: Login Correto
1. Acesse: https://vrb-erp-frontend.vercel.app/login
2. Digite email e senha corretos
3. Verificar: Deve redirecionar para /dashboard
4. Verificar: Token deve ser salvo em localStorage

✅ Teste 2: Login Incorreto
1. Digite email/senha errados
2. Verificar: Deve mostrar mensagem de erro
3. Verificar: NÃO deve redirecionar

✅ Teste 3: Logout
1. Clique no botão de logout
2. Verificar: Deve limpar tokens
3. Verificar: Deve redirecionar para /login

✅ Teste 4: Super Admin
1. Login com michelhm91@gmail.com
2. Acesse: /superadmin
3. Verificar: Deve mostrar painel de super admin
4. Verificar: NÃO deve tentar buscar tenant (error 404)
```

---

### 2️⃣ Multi-Tenancy (10 minutos)
```
✅ Teste 5: Criar 2 Tenants
1. Acesse: /signup
2. Crie Tenant A (ex: Barbearia do João)
   - Email: joao@barbearia.com
   - Senha: Senha123!
   - Nome: João Silva
   - Empresa: Barbearia do João
3. Faça logout
4. Crie Tenant B (ex: Salão da Maria)
   - Email: maria@salao.com
   - Senha: Senha123!
   - Nome: Maria Santos
   - Empresa: Salão da Maria

✅ Teste 6: Isolamento de Dados
1. Login como João (Tenant A)
2. Crie um agendamento
3. Crie um cliente
4. Crie um produto
5. Faça logout

6. Login como Maria (Tenant B)
7. Verificar: NÃO deve ver agendamentos do João
8. Verificar: NÃO deve ver clientes do João
9. Verificar: NÃO deve ver produtos do João

10. Crie dados próprios da Maria
11. Faça logout

12. Login novamente como João
13. Verificar: Deve ver apenas SEUS dados
14. Verificar: NÃO deve ver dados da Maria
```

---

### 3️⃣ Agendamentos (15 minutos)
```
✅ Teste 7: Criar Serviço
1. Login com qualquer tenant
2. Acesse: /dashboard/services
3. Clique em "Novo Serviço"
4. Preencha:
   - Nome: Corte Masculino
   - Descrição: Corte simples com máquina
   - Preço: 35.00
   - Duração: 30 minutos
5. Salvar
6. Verificar: Serviço aparece na lista

✅ Teste 8: Criar Agendamento
1. Acesse: /dashboard/appointments
2. Clique em "Novo Agendamento"
3. Preencha:
   - Cliente: João da Silva
   - Telefone: (11) 99999-9999
   - Serviço: Corte Masculino
   - Profissional: [Selecionar da lista]
   - Data: Hoje
   - Hora: 14:00
4. Salvar
5. Verificar: Agendamento aparece na lista

✅ Teste 9: Confirmar Agendamento
1. Encontre o agendamento criado
2. Clique em "Confirmar"
3. Verificar: Status deve mudar para "Confirmado"
4. Verificar: Badge deve mudar de cor

✅ Teste 10: Concluir Agendamento
1. Clique em "Concluir"
2. Verificar: Status deve mudar para "Concluído"

✅ Teste 11: Cancelar Agendamento
1. Crie outro agendamento
2. Clique em "Cancelar"
3. Verificar: Status deve mudar para "Cancelado"
```

---

### 4️⃣ Clientes (10 minutos)
```
✅ Teste 12: Cadastrar Cliente
1. Acesse: /dashboard/customers
2. Clique em "Novo Cliente"
3. Preencha:
   - Nome: Pedro Oliveira
   - CPF: 123.456.789-00
   - Email: pedro@email.com
   - Telefone: (11) 98888-8888
   - Endereço completo
4. Salvar
5. Verificar: Cliente aparece na lista

✅ Teste 13: Editar Cliente
1. Clique no cliente criado
2. Edite o telefone
3. Adicione notas: "Cliente VIP"
4. Salvar
5. Verificar: Alterações foram salvas

✅ Teste 14: Ver Histórico do Cliente
1. Clique em "Ver Detalhes"
2. Verificar: Deve mostrar:
   - Agendamentos anteriores
   - Compras realizadas
   - Estatísticas
```

---

### 5️⃣ Produtos e Estoque (15 minutos)
```
✅ Teste 15: Cadastrar Produto
1. Acesse: /dashboard/products
2. Clique em "Novo Produto"
3. Preencha:
   - Nome: Pomada Modeladora
   - Categoria: Pomada
   - Preço de Custo: 15.00
   - Preço de Venda: 35.00
   - Estoque Inicial: 10
   - Estoque Mínimo: 3
4. Salvar
5. Verificar: Produto aparece na lista

✅ Teste 16: Entrada de Estoque
1. Clique no produto
2. Clique em "Registrar Entrada"
3. Quantidade: 20 unidades
4. Motivo: Compra de fornecedor
5. Salvar
6. Verificar: Estoque deve aumentar para 30

✅ Teste 17: Saída de Estoque
1. Clique em "Registrar Saída"
2. Quantidade: 5 unidades
3. Motivo: Venda
4. Salvar
5. Verificar: Estoque deve diminuir para 25

✅ Teste 18: Alerta de Estoque Baixo
1. Faça saídas até estoque ficar < 3
2. Verificar: Deve aparecer alerta/badge vermelho
3. Verificar: Deve aparecer em "Estoque Baixo"
```

---

### 6️⃣ Financeiro (15 minutos)
```
✅ Teste 19: Criar Método de Pagamento
1. Acesse: /dashboard/financial
2. Clique em "Métodos de Pagamento"
3. Adicione:
   - Dinheiro
   - PIX
   - Cartão de Débito
   - Cartão de Crédito

✅ Teste 20: Registrar Receita
1. Clique em "Nova Transação"
2. Selecione: Receita
3. Preencha:
   - Categoria: Serviço
   - Valor: 35.00
   - Método: Dinheiro
   - Descrição: Corte Masculino - João Silva
4. Salvar
5. Verificar: Aparece em receitas

✅ Teste 21: Registrar Despesa
1. Clique em "Nova Transação"
2. Selecione: Despesa
3. Preencha:
   - Categoria: Fornecedor
   - Valor: 150.00
   - Método: PIX
   - Descrição: Compra de produtos
4. Salvar
5. Verificar: Aparece em despesas

✅ Teste 22: Ver Resumo Financeiro
1. Acesse aba "Resumo"
2. Verificar: Deve mostrar:
   - Total de Receitas
   - Total de Despesas
   - Saldo (Receitas - Despesas)
   - Gráfico por categoria
```

---

### 7️⃣ POS - Ponto de Venda (20 minutos)
```
✅ Teste 23: Abrir Caixa
1. Acesse: /dashboard/pos/cash-register
2. Clique em "Abrir Caixa"
3. Saldo Inicial: 100.00
4. Salvar
5. Verificar: Status deve ser "Aberto"

✅ Teste 24: Fazer Venda (Serviço)
1. Acesse: /dashboard/pos
2. Clique em "Nova Venda"
3. Adicione Serviço:
   - Corte Masculino (R$ 35,00)
4. Selecione Cliente
5. Método de Pagamento: Dinheiro
6. Finalizar Venda
7. Verificar: Venda aparece na lista

✅ Teste 25: Fazer Venda (Produto)
1. Nova Venda
2. Adicione Produto:
   - Pomada Modeladora (R$ 35,00)
   - Quantidade: 2
3. Subtotal: R$ 70,00
4. Aplicar Desconto: 10% (R$ 7,00)
5. Total: R$ 63,00
6. Método: PIX
7. Finalizar
8. Verificar: Estoque do produto diminuiu

✅ Teste 26: Venda Mista (Serviço + Produto)
1. Nova Venda
2. Adicione:
   - 1 Corte (R$ 35,00)
   - 1 Pomada (R$ 35,00)
3. Total: R$ 70,00
4. Método: Cartão Débito
5. Finalizar
6. Verificar: 
   - Venda registrada
   - Estoque atualizado
   - Comissão gerada (se configurada)

✅ Teste 27: Fechar Caixa
1. Acesse: /dashboard/pos/cash-register
2. Clique em "Fechar Caixa"
3. Informe:
   - Saldo Final Informado: [Contar dinheiro real]
   - Observações: "Dia normal"
4. Verificar:
   - Saldo Esperado (calculado automaticamente)
   - Diferença (se houver quebra de caixa)
5. Confirmar Fechamento
6. Verificar: Status muda para "Fechado"
```

---

### 8️⃣ Comissões (10 minutos)
```
✅ Teste 28: Criar Regra de Comissão Global
1. Acesse: /dashboard/commissions/rules
2. Clique em "Nova Regra"
3. Preencha:
   - Profissional: [Deixar vazio = todos]
   - Serviço: [Deixar vazio = todos]
   - Percentual: 40%
4. Salvar
5. Verificar: Regra aparece como "Global"

✅ Teste 29: Criar Regra Específica
1. Nova Regra
2. Preencha:
   - Profissional: João Barbeiro
   - Serviço: Corte Masculino
   - Percentual: 50%
   - Prioridade: 10 (maior que regra global)
3. Salvar
4. Verificar: Regra específica tem prioridade

✅ Teste 30: Calcular Comissões
1. Acesse: /dashboard/commissions
2. Clique em "Calcular Comissões"
3. Período: Último mês
4. Verificar:
   - Lista de comissões calculadas
   - Valor baseado nas regras
   - Status: "Pendente"

✅ Teste 31: Marcar Comissão como Paga
1. Selecione uma comissão
2. Clique em "Marcar como Paga"
3. Verificar: Status muda para "Paga"
```

---

### 9️⃣ Metas (10 minutos)
```
✅ Teste 32: Criar Meta Individual
1. Acesse: /dashboard/goals/new
2. Preencha:
   - Tipo: Individual
   - Profissional: João Barbeiro
   - Alvo: Faturamento
   - Valor: R$ 3.000,00
   - Período: Mensal
   - Mês: Atual
3. Salvar
4. Verificar: Meta aparece em "Ativas"

✅ Teste 33: Ver Progresso da Meta
1. Clique na meta criada
2. Verificar:
   - Progresso atual (baseado em vendas)
   - Percentual alcançado
   - Falta para atingir
   - Gráfico de evolução

✅ Teste 34: Ranking de Profissionais
1. Acesse: /dashboard/goals/ranking
2. Verificar:
   - Lista ordenada por performance
   - Indicadores visuais
   - Comparação com metas
```

---

### 🔟 Super Admin (15 minutos)
```
✅ Teste 35: Dashboard Super Admin
1. Login como michelhm91@gmail.com
2. Acesse: /superadmin
3. Verificar:
   - Total de Tenants
   - Tenants Ativos
   - Receita Total
   - Planos contratados

✅ Teste 36: Ver Todos os Tenants
1. Acesse: /superadmin/tenants
2. Verificar:
   - Lista de todas as empresas
   - Status (Ativo/Suspenso)
   - Plano contratado
   - Data de criação

✅ Teste 37: Suspender Tenant
1. Selecione um tenant de teste
2. Clique em "Suspender"
3. Confirme
4. Verificar: Status muda para "Suspenso"
5. Tente fazer login com esse tenant
6. Verificar: Deve bloquear acesso

✅ Teste 38: Ativar Tenant
1. Clique em "Ativar"
2. Verificar: Status volta para "Ativo"
3. Login deve funcionar novamente

✅ Teste 39: Ver Erros do Sistema
1. Acesse: /superadmin/errors
2. Verificar:
   - Lista de erros (se houver)
   - Severidade
   - Timestamp
3. Marque um erro como "Resolvido"
```

---

## 🐛 TESTES DE BUGS COMUNS

### Validações
```
❌ Teste 40: Estoque Negativo
1. Tente vender mais produtos do que tem em estoque
2. Esperado: Deve bloquear e mostrar erro

❌ Teste 41: CPF Inválido
1. Tente cadastrar cliente com CPF: 111.111.111-11
2. Esperado: Deve mostrar erro de validação

❌ Teste 42: Email Duplicado
1. Tente criar usuário com email já existente
2. Esperado: Deve mostrar erro

❌ Teste 43: Horário Conflitante
1. Crie agendamento às 14:00
2. Tente criar outro no mesmo horário e profissional
3. Esperado: Deve alertar sobre conflito
```

### Performance
```
⏱️ Teste 44: Paginação
1. Crie 50+ registros (produtos, clientes, etc)
2. Verifique se lista é paginada
3. Teste navegação entre páginas

⏱️ Teste 45: Filtros
1. Liste agendamentos
2. Aplique filtros combinados:
   - Data específica
   - Profissional
   - Status
3. Verificar: Resultados corretos e rápidos

⏱️ Teste 46: Dashboard com Muitos Dados
1. Crie vários registros
2. Acesse dashboard
3. Verificar: KPIs carregam rapidamente
```

---

## 📱 TESTE RESPONSIVO (Mobile)

```
📱 Teste 47: Layout Mobile
1. Abra o site no celular ou DevTools (F12 → Toggle Device)
2. Verifique:
   - Menu inferior (bottom nav) aparece
   - Sidebar oculta
   - Cards se ajustam
   - Formulários são usáveis
   - Botões têm tamanho adequado

📱 Teste 48: Navegação Mobile
1. Teste todos os itens do menu inferior
2. Verifique transições suaves
3. Teste gestos de scroll
```

---

## 🔍 FERRAMENTAS DE DESENVOLVEDOR

### Console do Navegador (F12)
```javascript
// Ver token JWT salvo
localStorage.getItem('access_token')

// Ver dados do usuário
const response = await fetch('https://myerp-production-4bb9.up.railway.app/api/core/users/me/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
console.log(await response.json());

// Testar endpoint qualquer
const test = await fetch('https://myerp-production-4bb9.up.railway.app/api/scheduling/services/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
console.log(await test.json());
```

### Network Tab (Monitorar Requisições)
```
1. Abra F12 → Network
2. Faça qualquer ação no sistema
3. Veja todas as chamadas HTTP
4. Verifique:
   - Status Code (200, 201, 400, 401, etc)
   - Headers (Authorization, Content-Type)
   - Request Body
   - Response Body
```

---

## ✅ CHECKLIST FINAL

Após completar todos os testes acima:

- [ ] Autenticação funcionando
- [ ] Multi-tenancy isolando dados
- [ ] Agendamentos criados e gerenciados
- [ ] Clientes cadastrados
- [ ] Produtos e estoque controlados
- [ ] Transações financeiras registradas
- [ ] POS abrindo/fechando caixa
- [ ] Comissões calculadas
- [ ] Metas criadas e acompanhadas
- [ ] Super Admin gerenciando tenants
- [ ] Mobile responsivo
- [ ] Sem erros no console
- [ ] Performance aceitável

---

## 🎯 PRÓXIMOS PASSOS

Se todos os testes passarem:
1. ✅ **Sistema está pronto para uso**
2. 📝 Documentar bugs encontrados
3. 🔧 Corrigir problemas
4. 🚀 Deploy de correções
5. ♻️ Repetir testes

---

**Boa sorte com os testes! 🚀**

**Documentado em:** 05/11/2025  
**Por:** Claude AI
