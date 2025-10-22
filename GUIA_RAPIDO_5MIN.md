# 🚀 GUIA RÁPIDO - 5 MINUTOS PARA COMEÇAR

## ⚡ Início Ultra-Rápido

### 1️⃣ Tem Python? (Verificar)

```powershell
python --version
```

**✅ Se mostrar "Python 3.11" ou superior:** Continue para o passo 2

**❌ Se der erro:** Instale o Python:
1. Baixe: https://www.python.org/downloads/
2. **IMPORTANTE:** Marque "Add Python to PATH" na instalação
3. Feche e abra um NOVO terminal
4. Teste novamente: `python --version`

---

### 2️⃣ Instalar Dependências (1 minuto)

```powershell
cd C:\Users\carol\my_erp\backend
pip install -r requirements.txt
```

💡 **Vai aparecer várias linhas instalando pacotes. Aguarde até terminar.**

---

### 3️⃣ Iniciar Backend (10 segundos)

```powershell
# No mesmo terminal
python manage.py runserver
```

**✅ Você vai ver:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

💡 **Deixe esse terminal aberto! Não feche.**

---

### 4️⃣ Iniciar Frontend (Novo Terminal)

**Abra um NOVO terminal** (deixe o outro rodando) e execute:

```powershell
cd C:\Users\carol\my_erp\frontend
npm run dev
```

**✅ Você vai ver:**
```
▲ Next.js 15.5.5
- Local:        http://localhost:3000
```

💡 **Aguarde até aparecer "Ready in..."**

---

### 5️⃣ Acessar o Sistema (5 segundos)

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Faça login:
   - **Email:** admin@barbearia.com
   - **Senha:** admin123

**🎉 PRONTO! O sistema está rodando!**

---

## 🗺️ Navegação Rápida

Após fazer login, você verá o dashboard. Explore:

### 📊 Dashboard (Tela Inicial)
- Métricas do dia (agendamentos, receitas)
- Gráficos de status
- Próximos atendimentos

### 📅 Agendamentos
- **Calendário visual** - Todos os agendamentos
- **Criar novo** - Botão azul "Novo Agendamento"
- **Filtros** - Por profissional, status, data

### 👥 Clientes
- Lista de todos os clientes
- Criar novo cliente
- Ver histórico de cada um

### 💰 Financeiro
- Receitas e despesas
- Gráficos de evolução
- Adicionar transação

### 📦 Produtos
- Estoque de produtos
- Alerta de estoque baixo
- Adicionar/editar produtos

### 📈 Relatórios
- Gráficos interativos
- Análise de performance
- Export PDF/Excel

### 👨‍💼 Equipe
- Lista de profissionais
- Convidar novo membro
- Definir comissões

---

## 🧪 Testar Funcionalidades

### Criar um Agendamento

1. Clique em **"Agendamentos"** no menu
2. Clique no botão **"Novo Agendamento"**
3. Preencha:
   - Cliente: Selecione ou crie novo
   - Serviço: Escolha um serviço
   - Profissional: Escolha quem vai atender
   - Data/Hora: Selecione
4. Clique em **"Criar"**
5. **✅ Agendamento aparece no calendário!**

### Ver Relatórios

1. Clique em **"Relatórios"**
2. Veja gráficos de:
   - Status dos agendamentos
   - Receitas por período
   - Top serviços
   - Performance dos profissionais
3. Clique em **"Exportar PDF"** ou **"Exportar Excel"**

### Adicionar Cliente

1. Clique em **"Clientes"**
2. Botão **"Novo Cliente"**
3. Preencha nome, telefone, email
4. Escolha tag (VIP, Regular, Novo)
5. **"Salvar"**

---

## 🎨 Popular com Mais Dados (Opcional)

Quer testar com mais clientes, produtos e agendamentos?

```powershell
# Abra um TERCEIRO terminal
cd C:\Users\carol\my_erp\backend
python populate_test_data.py
```

Isso vai adicionar:
- 📋 20 clientes novos
- 📦 15 produtos
- 📅 50 agendamentos
- 💰 30 transações

**Depois refresh a página (F5) e veja os novos dados!**

---

## 🛑 Parar o Sistema

### Parar Backend:
- No terminal do backend, pressione: **CTRL + C**

### Parar Frontend:
- No terminal do frontend, pressione: **CTRL + C**

### Iniciar de Novo:
```powershell
# Terminal 1
cd C:\Users\carol\my_erp\backend
python manage.py runserver

# Terminal 2
cd C:\Users\carol\my_erp\frontend
npm run dev
```

---

## ❓ Problemas Comuns

### "Python não é reconhecido como comando"

**Solução:**
1. Reinstale Python: https://www.python.org/downloads/
2. ✅ MARQUE "Add Python to PATH"
3. Feche TODOS os terminais
4. Abra um NOVO terminal
5. Teste: `python --version`

---

### "npm não é reconhecido como comando"

**Solução:**
1. Instale Node.js: https://nodejs.org/
2. Escolha a versão LTS (recomendada)
3. Feche e abra novo terminal
4. Teste: `npm --version`

---

### "Porta 8000 já está em uso"

**Solução:**
```powershell
# Matar processo na porta 8000
netstat -ano | findstr :8000
taskkill /PID <número_do_pid> /F
```

---

### "Erro ao instalar dependências Python"

**Solução:**
```powershell
# Atualizar pip
python -m pip install --upgrade pip

# Instalar novamente
pip install -r requirements.txt --force-reinstall
```

---

### "Erro 401 Unauthorized no login"

**Verificar:**
1. Backend está rodando? (http://localhost:8000)
2. Frontend está conectando no backend certo?
3. Tente fazer logout e login novamente

---

### "Página em branco / erro 404"

**Solução:**
1. Verifique se o frontend compilou sem erros
2. Acesse: http://localhost:3000 (não localhost:8000)
3. Limpe o cache: CTRL + SHIFT + R

---

## 📚 Quer Saber Mais?

### Documentação Completa

📖 **README_COMPLETO.md** - Resumo executivo de tudo

📖 **docs/PROXIMOS_PASSOS.md** - Próximos passos detalhados

📖 **docs/MIGRACAO_PRODUCAO_AWS.md** - Deploy em produção

📖 **docs/LEVANTAMENTO_COMPLETO.md** - Inventário do sistema

📖 **docs/API_REFERENCE.md** - Documentação da API

---

## 🎯 Roadmap Rápido

### ✅ Agora (Você está aqui!)
- Sistema rodando localmente
- Testando funcionalidades
- Explorando o dashboard

### ⏳ Próximo (Quando precisar)
- Migrar para PostgreSQL (melhor performance)
- Configurar emails SMTP (envio real)
- Adicionar mais usuários/profissionais

### 🚀 Futuro (Produção)
- Deploy na AWS (banco escalável)
- Configurar domínio próprio
- SSL/HTTPS habilitado
- Backups automáticos
- Monitoramento

---

## 💡 Dicas Pro

### 1. Atalhos do Sistema
- **F5** - Atualizar página
- **CTRL + K** - Busca rápida (se implementada)
- **ESC** - Fechar modais

### 2. Navegação Rápida
- Logo no topo → Voltar ao Dashboard
- Menu lateral → Acessar módulos
- Perfil (canto) → Configurações

### 3. Performance
- Feche abas não usadas
- Use Chrome/Edge (melhor suporte)
- Limpe cache se algo não carregar

### 4. Desenvolvimento
- Erros aparecem no **console do navegador** (F12)
- Backend logs aparecem no **terminal do runserver**
- Frontend logs aparecem no **terminal do npm**

---

## ✨ Funcionalidades Cool

### 🎨 Temas
- Interface moderna com Tailwind CSS
- Responsivo (funciona no celular)
- Dark mode (se implementado)

### 📊 Gráficos Interativos
- Passe o mouse sobre os gráficos
- Clique nas legendas para filtrar
- Zoom e navegação

### 📥 Exports
- PDF com logo e dados formatados
- Excel com todas as colunas
- Imagens dos gráficos

### 🔔 Notificações
- Centro de notificações (sino no topo)
- Alertas em tempo real
- Contador de não lidas

---

## 🎉 Pronto Para Produção?

Quando estiver pronto para colocar online:

1. **Leia:** `docs/MIGRACAO_PRODUCAO_AWS.md`
2. **Crie conta:** AWS (free tier)
3. **Siga o guia:** Passo a passo completo
4. **Tempo estimado:** 2-3 horas
5. **Custo inicial:** $10-30/mês

---

## 📞 Precisa de Ajuda?

### Cheque Primeiro:
1. ✅ Backend rodando? (porta 8000)
2. ✅ Frontend rodando? (porta 3000)
3. ✅ Console do browser (F12) - tem erros?
4. ✅ Terminal - tem erros em vermelho?

### Documentação:
- `README_COMPLETO.md` - Visão geral
- `docs/` - Guias detalhados
- `backend/test_complete_api.py` - Testar APIs

---

**🚀 Agora é com você! Explore o sistema e aproveite!**

**Lembre-se:** 
- Terminal 1: `python manage.py runserver`
- Terminal 2: `npm run dev`
- Browser: http://localhost:3000
- Login: admin@barbearia.com / admin123

**Divirta-se! 🎉**
