# 📸 Guia de Capturas de Tela - Sistema ERP

## 🎯 Objetivo
Capturar screenshots profissionais de todas as funcionalidades do sistema para documentação visual.

---

## ⚙️ PREPARAÇÃO

### 1. Popular Sistema com Dados Realistas
```powershell
cd c:\Users\carol\my_erp\backend
python scripts\populate_all.py
```

**O que será criado:**
- ✅ 1 Tenant (Salão Beleza & Estilo)
- ✅ 4 Usuários (Admin + 3 profissionais)
- ✅ 15 Clientes
- ✅ 8 Categorias de Serviços + 18 Serviços
- ✅ 7 Categorias de Produtos + 18 Produtos
- ✅ ~100 Agendamentos (últimos 30 dias + próximos 7 dias)
- ✅ ~150 Vendas (últimos 30 dias)
- ✅ 5 Metas (individuais e equipe)

### 2. Configurar Navegador
- **Resolução**: 1920x1080 (Full HD)
- **Zoom**: 100%
- **Limpar cache e cookies**
- **Modo tela cheia** (F11)

### 3. Login
- URL: https://seu-dominio-vercel.app/login
- Email: admin@teste.com
- Senha: Admin@123

---

## 📋 LISTA DE CAPTURAS

### 🔐 **1. AUTENTICAÇÃO** (3 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 1.1 | Login | Tela de login vazia | `01-login.png` |
| 1.2 | Cadastro | Tela de signup | `02-signup.png` |
| 1.3 | Login Preenchido | Login com dados preenchidos | `03-login-filled.png` |

---

### 📊 **2. DASHBOARD** (2 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 2.1 | Dashboard Principal | Visão geral com cards de estatísticas | `04-dashboard-main.png` |
| 2.2 | Dashboard com Gráficos | Scroll down para mostrar gráficos | `05-dashboard-charts.png` |

---

### 👥 **3. CLIENTES** (5 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 3.1 | Lista de Clientes | Tabela com todos os clientes | `06-customers-list.png` |
| 3.2 | Busca de Clientes | Com filtro de busca aplicado | `07-customers-search.png` |
| 3.3 | Novo Cliente | Formulário de cadastro | `08-customers-new.png` |
| 3.4 | Detalhes do Cliente | Aba "Informações" | `09-customers-detail.png` |
| 3.5 | Histórico do Cliente | Aba "Histórico" com agendamentos | `10-customers-history.png` |

---

### ✂️ **4. SERVIÇOS** (4 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 4.1 | Lista de Serviços | Todos os serviços em cards | `11-services-list.png` |
| 4.2 | Filtro por Categoria | Serviços filtrados | `12-services-filter.png` |
| 4.3 | Novo Serviço | Formulário de cadastro | `13-services-new.png` |
| 4.4 | Editar Serviço | Formulário preenchido | `14-services-edit.png` |

---

### 📅 **5. AGENDAMENTOS** (6 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 5.1 | Agenda - Lista | Todos os agendamentos | `15-appointments-list.png` |
| 5.2 | Agenda - Filtros | Com status/profissional filtrado | `16-appointments-filters.png` |
| 5.3 | Novo Agendamento | Formulário vazio | `17-appointments-new.png` |
| 5.4 | Novo Agendamento Preenchido | Formulário completo | `18-appointments-new-filled.png` |
| 5.5 | Detalhes Agendamento | Card de agendamento expandido | `19-appointments-detail.png` |
| 5.6 | Exportar Agendamentos | Modal ou botão destacado | `20-appointments-export.png` |

---

### 📦 **6. PRODUTOS** (5 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 6.1 | Lista de Produtos | Tabela completa | `21-products-list.png` |
| 6.2 | Produtos - Estoque Baixo | Filtro aplicado | `22-products-low-stock.png` |
| 6.3 | Novo Produto | Formulário de cadastro | `23-products-new.png` |
| 6.4 | Detalhes do Produto | Visualização completa | `24-products-detail.png` |
| 6.5 | Exportar Produtos | Destaque para botão export | `25-products-export.png` |

---

### 🛒 **7. PDV - PONTO DE VENDA** (7 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 7.1 | PDV - Inicial | Tela vazia sem caixa aberto | `26-pos-closed.png` |
| 7.2 | Abrir Caixa | Modal de abertura | `27-pos-open-cash.png` |
| 7.3 | PDV - Produtos/Serviços | Com caixa aberto | `28-pos-main.png` |
| 7.4 | PDV - Carrinho | Com itens adicionados | `29-pos-cart.png` |
| 7.5 | PDV - Pagamento | Modal de finalização | `30-pos-payment.png` |
| 7.6 | Lista de Vendas | Histórico de vendas | `31-pos-sales-list.png` |
| 7.7 | Detalhes da Venda | Venda expandida | `32-pos-sale-detail.png` |

---

### 💵 **8. CAIXA** (4 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 8.1 | Caixa Aberto | Status atual do caixa | `33-cash-open.png` |
| 8.2 | Movimentações do Caixa | Lista de entradas/saídas | `34-cash-movements.png` |
| 8.3 | Fechar Caixa | Modal de fechamento | `35-cash-close.png` |
| 8.4 | Histórico de Caixas | Caixas fechados anteriores | `36-cash-history.png` |

---

### 💼 **9. COMISSÕES** (4 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 9.1 | Dashboard de Comissões | Resumo geral | `37-commissions-dashboard.png` |
| 9.2 | Lista de Comissões | Todas as comissões | `38-commissions-list.png` |
| 9.3 | Filtro por Profissional | Comissões filtradas | `39-commissions-filter.png` |
| 9.4 | Exportar Comissões | Destaque export | `40-commissions-export.png` |

---

### 💰 **10. FINANCEIRO** (6 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 10.1 | Dashboard Financeiro | Visão geral | `41-financial-dashboard.png` |
| 10.2 | Contas a Pagar | Lista completa | `42-financial-payable.png` |
| 10.3 | Nova Conta a Pagar | Formulário | `43-financial-new-payable.png` |
| 10.4 | Contas a Receber | Lista completa | `44-financial-receivable.png` |
| 10.5 | Fluxo de Caixa | Gráfico de entradas/saídas | `45-financial-cashflow.png` |
| 10.6 | Exportar Financeiro | Relatório | `46-financial-export.png` |

---

### 🎯 **11. METAS** (8 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 11.1 | Dashboard de Metas | Com metas ativas | `47-goals-dashboard.png` |
| 11.2 | Lista de Metas | Todas as metas | `48-goals-list.png` |
| 11.3 | Metas - Filtros | Com filtro aplicado | `49-goals-filters.png` |
| 11.4 | Nova Meta | Formulário vazio | `50-goals-new.png` |
| 11.5 | Nova Meta Preenchida | Formulário completo | `51-goals-new-filled.png` |
| 11.6 | Detalhes da Meta | Com gráfico de progresso | `52-goals-detail.png` |
| 11.7 | Ranking de Metas | Profissionais ranqueados | `53-goals-ranking.png` |
| 11.8 | Comparação de Períodos | Componente de comparação | `54-goals-comparison.png` |

---

### 📊 **12. RELATÓRIOS** (4 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 12.1 | Central de Relatórios | Página principal | `55-reports-main.png` |
| 12.2 | Relatório de Vendas | Gerado | `56-reports-sales.png` |
| 12.3 | Relatório Financeiro | DRE ou similar | `57-reports-financial.png` |
| 12.4 | Exportação | Excel/PDF sendo baixado | `58-reports-export.png` |

---

### 👨‍💼 **13. EQUIPE** (3 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 13.1 | Lista de Profissionais | Todos os usuários | `59-team-list.png` |
| 13.2 | Novo Profissional | Formulário de cadastro | `60-team-new.png` |
| 13.3 | Perfil do Profissional | Detalhes e edição | `61-team-profile.png` |

---

### 🔔 **14. NOTIFICAÇÕES** (2 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 14.1 | Lista de Notificações | Dropdown aberto | `62-notifications-list.png` |
| 14.2 | Notificação de Meta | Exemplo de notificação | `63-notifications-goal.png` |

---

### ⚙️ **15. CONFIGURAÇÕES** (2 capturas)

| # | Tela | Descrição | Nome do Arquivo |
|---|------|-----------|-----------------|
| 15.1 | Meu Perfil | Dados do usuário | `64-profile-settings.png` |
| 15.2 | Alterar Senha | Formulário | `65-profile-password.png` |

---

## 📐 ESPECIFICAÇÕES TÉCNICAS

### Resolução das Capturas
- **Largura**: 1920px
- **Altura**: Variável (captura completa da página)
- **Formato**: PNG (melhor qualidade)
- **Compressão**: Mínima

### Ferramentas Recomendadas
- **Windows**: 
  - Snipping Tool (Win + Shift + S)
  - Greenshot (gratuito)
  - ShareX (gratuito, avançado)
- **Extensões Chrome**:
  - Awesome Screenshot
  - Full Page Screen Capture

### Onde Salvar
```
c:\Users\carol\my_erp\docs\screenshots\
```

---

## ✅ CHECKLIST DE QUALIDADE

Antes de salvar cada captura, verificar:

- [ ] Sem dados pessoais/sensíveis reais
- [ ] Interface completa visível
- [ ] Sem erros ou mensagens de debug
- [ ] Dados realistas e consistentes
- [ ] Sem cursores ou elementos temporários
- [ ] Boa iluminação e contraste
- [ ] Texto legível
- [ ] Nome de arquivo correto

---

## 🎨 DICAS DE APRESENTAÇÃO

### 1. Layout Limpo
- Feche abas desnecessárias
- Esconda extensões do navegador
- Use modo de tela cheia (F11)

### 2. Dados Consistentes
- Use os mesmos clientes em várias telas
- Mantenha datas realistas
- Valores coerentes

### 3. Destaque Recursos
- Para exportações, posicione mouse sobre botão
- Para filtros, mostre resultado filtrado
- Para formulários, mostre preenchidos

### 4. Sequência Lógica
- Siga a ordem da lista
- Mostre fluxo completo de uso
- Capture estados diferentes da mesma tela

---

## 📊 RESUMO DE CAPTURAS

**Total de Screenshots**: 65

Por módulo:
- Autenticação: 3
- Dashboard: 2
- Clientes: 5
- Serviços: 4
- Agendamentos: 6
- Produtos: 5
- PDV: 7
- Caixa: 4
- Comissões: 4
- Financeiro: 6
- Metas: 8
- Relatórios: 4
- Equipe: 3
- Notificações: 2
- Configurações: 2

---

## 🚀 APÓS AS CAPTURAS

1. **Organizar arquivos**:
   ```powershell
   # Verificar todas as capturas
   ls c:\Users\carol\my_erp\docs\screenshots\
   ```

2. **Otimizar imagens** (opcional):
   - Usar TinyPNG ou similar
   - Reduzir peso mantendo qualidade

3. **Atualizar documentação**:
   - Inserir imagens no USER_MANUAL.md
   - Criar README visual
   - Adicionar ao repositório

4. **Commit e Push**:
   ```powershell
   git add docs/screenshots/
   git commit -m "docs: Adiciona screenshots completos do sistema"
   git push origin main
   ```

---

**Estimativa de Tempo**: 2-3 horas para capturas completas  
**Responsável**: Carol  
**Status**: ⏳ Aguardando população de dados

---

© 2025 Sistema ERP Multi-Tenant
