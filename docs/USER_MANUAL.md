# 📘 Manual do Usuário - Sistema ERP Multi-Tenant

## Índice
1. [Visão Geral](#visão-geral)
2. [Primeiros Passos](#primeiros-passos)
3. [Módulos do Sistema](#módulos-do-sistema)
4. [Guia Detalhado por Módulo](#guia-detalhado-por-módulo)
5. [Dicas e Melhores Práticas](#dicas-e-melhores-práticas)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## Visão Geral

Bem-vindo ao sistema ERP Multi-Tenant, uma solução completa para gestão de negócios desenvolvida especialmente para salões de beleza, barbearias e estabelecimentos similares.

### Recursos Principais
- ✅ **Multi-Tenant**: Cada empresa tem seus próprios dados isolados
- 📅 **Agendamento Online**: Sistema completo de agendas
- 💰 **PDV Integrado**: Ponto de venda com controle de caixa
- 👥 **Gestão de Clientes**: Histórico completo e preferências
- 📦 **Estoque de Produtos**: Controle de entrada e saída
- 💵 **Financeiro Completo**: Contas a pagar, receber e fluxo de caixa
- 💼 **Comissões**: Cálculo automático por vendas e serviços
- 🎯 **Metas**: Acompanhamento de desempenho e objetivos
- 📊 **Relatórios**: Análises e exportações em Excel

---

## Primeiros Passos

### 1. Acesso ao Sistema

**URL de Produção**: https://seu-dominio-vercel.app

**Credenciais de Teste**:
- Email: admin@teste.com
- Senha: Admin@123

> ⚠️ **Importante**: Após o primeiro acesso, altere sua senha em **Meu Perfil**.

### 2. Interface Principal

Após o login, você verá:
- **Barra Superior**: Nome da empresa, notificações, perfil do usuário
- **Menu Lateral**: Acesso rápido a todos os módulos
- **Dashboard Central**: Visão geral com estatísticas do dia

### 3. Navegação Básica

- **Dashboard**: Tela inicial com resumo geral
- **Menu**: Clique nos ícones à esquerda para acessar cada módulo
- **Notificações**: Sino no canto superior direito
- **Perfil**: Clique no seu avatar para ver opções da conta

---

## Módulos do Sistema

### 📊 1. Dashboard
Visão geral do negócio com métricas em tempo real.

**O que você vê:**
- Receita do dia, semana e mês
- Agendamentos de hoje
- Produtos com estoque baixo
- Gráficos de desempenho

**Ações rápidas:**
- Criar novo agendamento
- Registrar venda
- Ver alertas importantes

---

### 📅 2. Agenda

Sistema completo de agendamentos online.

**Funcionalidades:**
- Calendário visual por dia/semana/mês
- Agendamento de múltiplos serviços
- Notificações automáticas para clientes
- Bloqueio de horários
- Histórico de atendimentos

**Como criar um agendamento:**

1. Clique em **Agenda** no menu lateral
2. Clique em **+ Novo Agendamento**
3. Preencha os dados:
   - **Cliente**: Selecione ou cadastre novo
   - **Profissional**: Escolha quem vai atender
   - **Serviço(s)**: Selecione um ou mais serviços
   - **Data e Hora**: Escolha horário disponível
   - **Observações**: Notas adicionais (opcional)
4. Clique em **Salvar**

**Status dos agendamentos:**
- 🔵 **Agendado**: Confirmado, aguardando atendimento
- 🟢 **Em Atendimento**: Cliente sendo atendido
- ✅ **Concluído**: Serviço finalizado
- ❌ **Cancelado**: Agendamento cancelado
- ⏰ **Não Compareceu**: Cliente faltou

**Dica**: Use filtros por profissional, serviço ou status para encontrar agendamentos rapidamente.

---

### ✂️ 3. Serviços

Cadastro e gestão de todos os serviços oferecidos.

**Informações de cada serviço:**
- Nome e descrição
- Categoria (Corte, Barba, Coloração, etc.)
- Duração estimada
- Preço
- Comissão (fixa ou percentual)
- Status (ativo/inativo)

**Como cadastrar um serviço:**

1. Acesse **Serviços** no menu
2. Clique em **+ Novo Serviço**
3. Preencha:
   - **Nome**: Ex: "Corte Masculino"
   - **Descrição**: Detalhes do serviço
   - **Categoria**: Selecione ou crie nova
   - **Duração**: Em minutos (ex: 30)
   - **Preço**: Valor cobrado
   - **Comissão**: Tipo e valor
4. Clique em **Salvar**

**Exportação**: Clique em "Exportar para Excel" para gerar planilha com todos os serviços.

---

### 👥 4. Clientes

Gestão completa da base de clientes.

**Informações armazenadas:**
- Dados pessoais (nome, CPF, email, telefone)
- Endereço completo
- Data de nascimento
- Preferências e observações
- Histórico de atendimentos
- Histórico de compras
- Valor total gasto

**Como cadastrar um cliente:**

1. Vá em **Clientes**
2. Clique em **+ Novo Cliente**
3. Preencha os dados obrigatórios:
   - Nome completo
   - Telefone principal
4. Dados opcionais:
   - CPF, email, endereço
   - Data de nascimento
   - Observações
5. Clique em **Salvar**

**Visualização do cliente:**
- **Aba Informações**: Dados cadastrais
- **Aba Histórico**: Todos os agendamentos
- **Aba Compras**: Histórico de vendas

**Busca rápida**: Use a barra de busca para encontrar por nome, telefone ou email.

**Exportação**: Exporte a base completa para Excel com todos os dados.

---

### 📦 5. Produtos

Controle de estoque e produtos para venda.

**Gestão de produtos:**
- Cadastro com código de barras
- Categorização
- Controle de estoque mínimo
- Preço de custo e venda
- Margem de lucro automática
- Fornecedores
- Alertas de estoque baixo

**Como cadastrar um produto:**

1. Acesse **Produtos**
2. Clique em **+ Novo Produto**
3. Preencha:
   - **Nome**: Nome do produto
   - **Código**: SKU ou código de barras
   - **Categoria**: Selecione
   - **Descrição**: Detalhes
   - **Estoque**: Quantidade atual
   - **Estoque Mínimo**: Alerta quando baixar
   - **Preço Custo**: Quanto você pagou
   - **Preço Venda**: Quanto vai cobrar
   - **Fornecedor**: Quem fornece
4. Clique em **Salvar**

**Controle de estoque:**
- Verde: Estoque OK
- Amarelo: Estoque baixo (perto do mínimo)
- Vermelho: Estoque crítico (abaixo do mínimo)

**Movimentações**: Cada venda atualiza automaticamente o estoque.

**Exportação**: Gere relatório completo de produtos e estoque.

---

### 🛒 6. PDV (Ponto de Venda)

Sistema completo de vendas com controle de caixa.

**Funcionalidades:**
- Venda rápida de produtos e serviços
- Múltiplas formas de pagamento
- Desconto por item ou total
- Impressão de recibo
- Histórico de vendas
- Controle de caixa por turno

**Como fazer uma venda:**

1. Acesse **PDV** no menu
2. Clique em **Nova Venda**
3. Selecione o **Cliente** (opcional mas recomendado)
4. Adicione itens:
   - **Produtos**: Busque e adicione
   - **Serviços**: Selecione da lista
   - Para cada item, defina quantidade e desconto (se houver)
5. Escolha **Forma de Pagamento**:
   - Dinheiro
   - Cartão de Crédito
   - Cartão de Débito
   - PIX
   - Múltiplas formas (dividir pagamento)
6. Defina **Status do Pagamento**:
   - Pago
   - Pendente
   - Parcialmente Pago
7. Adicione observações se necessário
8. Clique em **Finalizar Venda**

**Listagem de Vendas:**
- Veja todas as vendas realizadas
- Filtre por data, cliente, profissional, status
- Exporte para Excel
- Cancele vendas (se necessário)

---

### 💰 7. Caixa

Controle de abertura e fechamento de caixa.

**Fluxo de trabalho:**

1. **Abertura do Caixa**:
   - Acesse **Caixa** no menu
   - Clique em **Abrir Caixa**
   - Informe o valor inicial (dinheiro)
   - Profissional responsável é registrado automaticamente

2. **Durante o Dia**:
   - Todas as vendas são registradas automaticamente
   - Acompanhe o saldo em tempo real
   - Veja resumo por forma de pagamento

3. **Fechamento do Caixa**:
   - Clique em **Fechar Caixa**
   - Sistema calcula:
     - Valor inicial
     - Total de entradas
     - Total de saídas
     - Saldo esperado
   - Informe o valor real contado
   - Sistema calcula diferença (se houver)
   - Adicione observações sobre a diferença
   - Clique em **Confirmar Fechamento**

**Relatórios de Caixa:**
- Histórico completo de movimentações
- Resumo por período
- Exportação para Excel

---

### 💼 8. Comissões

Cálculo automático de comissões para profissionais.

**Como funciona:**

**Regras de Comissão:**
- Cada serviço tem uma comissão definida (% ou valor fixo)
- Cada produto pode ter comissão
- Sistema calcula automaticamente ao finalizar venda

**Visualização de Comissões:**

1. Acesse **Comissões** no menu
2. Veja resumo:
   - Comissões do mês
   - Por profissional
   - Comissões pagas vs pendentes
3. Filtre por:
   - Período
   - Profissional
   - Status (paga/pendente)

**Pagamento de Comissões:**
- Marque comissões como pagas
- Sistema registra data de pagamento
- Exportehistórico completo

**Exportação**: Gere relatório detalhado de todas as comissões.

---

### 💵 9. Financeiro

Gestão completa de contas a pagar e receber.

**Funcionalidades:**
- Contas a Pagar (despesas)
- Contas a Receber (receitas)
- Fluxo de caixa
- Categorização de transações
- Conciliação bancária
- Relatórios financeiros

**Cadastro de Conta a Pagar:**

1. Acesse **Financeiro**
2. Clique em **Contas a Pagar**
3. Clique em **+ Nova Conta**
4. Preencha:
   - **Descrição**: Ex: "Aluguel", "Fornecedor X"
   - **Categoria**: Selecione (Fixa, Variável, etc)
   - **Valor**: Montante
   - **Data de Vencimento**: Quando vence
   - **Método de Pagamento**: Como vai pagar
   - **Recorrente**: Se repete mensalmente (opcional)
   - **Observações**: Notas adicionais
5. Clique em **Salvar**

**Cadastro de Conta a Receber:**

Similar ao processo acima, mas em **Contas a Receber**.

**Pagamento/Recebimento:**
- Clique na conta
- Clique em **Marcar como Paga** ou **Registrar Recebimento**
- Informe data e valor (se diferente do esperado)
- Salve

**Fluxo de Caixa:**
- Visualização gráfica de entradas vs saídas
- Projeção de saldo futuro
- Alertas de contas vencidas

**Exportação**: Exporte relatórios financeiros detalhados.

---

### 🎯 10. Metas

Sistema de acompanhamento de metas e objetivos.

**Tipos de Metas:**
- 💰 **Faturamento**: Valor total em vendas
- 🛒 **Quantidade de Vendas**: Número de transações
- ✂️ **Quantidade de Serviços**: Serviços realizados
- 📦 **Produtos Vendidos**: Quantidade de produtos
- 👥 **Novos Clientes**: Clientes cadastrados

**Meta Individual vs Equipe:**
- **Individual**: Atribuída a um profissional específico
- **Equipe**: Meta coletiva de todos

**Como criar uma meta:**

1. Acesse **Metas** no menu
2. Clique em **+ Nova Meta**
3. Preencha:
   - **Nome**: Ex: "Faturamento Novembro"
   - **Descrição**: Detalhes da meta
   - **Tipo**: Individual ou Equipe
   - **Tipo de Meta**: Escolha (faturamento, vendas, etc)
   - **Valor Alvo**: Objetivo a atingir
   - **Período**: Diário, Semanal, Mensal, etc
   - **Data Início/Fim**: Período da meta
   - **Profissional**: Se for meta individual
4. Clique em **Criar Meta**

**Acompanhamento:**
- Sistema atualiza progresso automaticamente
- Gráfico de evolução em tempo real
- Notificações quando próximo do vencimento
- Notificações quando meta é atingida

**Dashboard de Metas:**
- Metas ativas e progresso
- Metas próximas do vencimento
- Top performers (profissionais destaque)

**Ranking:**
- Classificação de profissionais por desempenho
- Pontuação baseada em metas atingidas
- Taxa de sucesso
- Progresso médio

**Comparação de Períodos:**
- Compare mês atual vs anterior
- Veja tendências de crescimento
- Análise de variações percentuais

**Detalhes da Meta:**
- Clique em uma meta para ver:
  - Gráfico de progresso
  - Histórico de evolução
  - Atualizar progresso manualmente
  - Recalcular valores
  - Cancelar ou excluir meta

---

### 📊 11. Relatórios

Central de relatórios e análises.

**Relatórios Disponíveis:**

1. **Vendas**:
   - Por período
   - Por profissional
   - Por produto/serviço
   - Ticket médio

2. **Financeiro**:
   - Fluxo de caixa
   - DRE (Demonstrativo de Resultados)
   - Contas a pagar/receber
   - Margem de lucro

3. **Clientes**:
   - Novos clientes por período
   - Clientes mais frequentes
   - Valor por cliente
   - Aniversariantes do mês

4. **Estoque**:
   - Produtos mais vendidos
   - Produtos parados
   - Necessidade de reposição
   - Valor do estoque

5. **Comissões**:
   - Por profissional
   - Por período
   - Detalhamento por venda

**Como gerar relatório:**

1. Acesse **Relatórios**
2. Escolha o tipo de relatório
3. Defina filtros:
   - Período
   - Profissional
   - Categoria
   - Outros filtros específicos
4. Clique em **Gerar Relatório**
5. Visualize na tela ou exporte para Excel

---

## Dicas e Melhores Práticas

### 🎯 Gestão de Agenda

1. **Configure horários padrão**: Defina horário de funcionamento nas configurações
2. **Bloqueie intervalos**: Reserve horários de almoço ou pausas
3. **Use cores diferentes**: Configure cores para cada tipo de serviço
4. **Confirme agendamentos**: Ligue para clientes 1 dia antes
5. **Registre no-shows**: Marque quando cliente não comparecer

### 💰 Controle Financeiro

1. **Abra/Feche caixa diariamente**: Mantenha controle rigoroso
2. **Categorize despesas**: Facilita análise de gastos
3. **Lance tudo no sistema**: Mesmo despesas pequenas
4. **Concilie semanalmente**: Confira com extrato bancário
5. **Acompanhe fluxo de caixa**: Evite surpresas

### 📦 Gestão de Estoque

1. **Defina estoque mínimo**: Evite faltas
2. **Faça inventário mensal**: Confira estoque físico
3. **Negocie com fornecedores**: Melhores preços e prazos
4. **Acompanhe giro**: Veja produtos que vendem mais
5. **Evite excesso**: Dinheiro parado é prejuízo

### 👥 Relacionamento com Clientes

1. **Cadastre todos**: Mesmo para serviços rápidos
2. **Atualize informações**: Mantenha dados atualizados
3. **Use observações**: Anote preferências e detalhes
4. **Envie felicitações**: Mensagens de aniversário
5. **Peça feedback**: Melhore sempre

### 🎯 Metas e Motivação

1. **Defina metas realistas**: Desafiadoras mas alcançáveis
2. **Acompanhe diariamente**: Ajuste estratégias se necessário
3. **Celebre conquistas**: Reconheça quando atingir metas
4. **Aprenda com falhas**: Analise o que não funcionou
5. **Compartilhe ranking**: Estimula competição saudável

---

## Perguntas Frequentes

### 1. Como alterar minha senha?

1. Clique no seu avatar no canto superior direito
2. Selecione **Meu Perfil**
3. Clique em **Alterar Senha**
4. Informe senha atual e nova senha
5. Confirme

### 2. Como recuperar senha esquecida?

1. Na tela de login, clique em **Esqueci minha senha**
2. Informe seu email
3. Você receberá link para redefinir
4. Clique no link e defina nova senha

### 3. Posso ter múltiplos usuários?

Sim! Vá em **Equipe** e cadastre novos profissionais. Cada um terá seu próprio login.

### 4. Como cancelar um agendamento?

1. Acesse o agendamento
2. Clique em **Cancelar**
3. Informe o motivo (opcional)
4. Confirme

### 5. O que fazer se houver erro no caixa?

1. Ao fechar o caixa, informe o valor real contado
2. Sistema calculará a diferença automaticamente
3. Adicione observação explicando a divergência
4. Investigue a causa para evitar repetição

### 6. Como funciona o estoque automático?

Quando você faz uma venda no PDV, o sistema:
1. Deduz automaticamente do estoque
2. Atualiza o valor de produtos vendidos
3. Gera alerta se estoque ficar baixo
4. Registra a movimentação

### 7. Posso editar uma venda já finalizada?

Vendas finalizadas não podem ser editadas diretamente. Você pode:
- Cancelar a venda (se necessário)
- Criar uma nova venda correta
- Ou registrar um ajuste financeiro

### 8. Como funcionam as notificações?

O sistema envia notificações para:
- Novos agendamentos
- Metas próximas do vencimento
- Metas concluídas ou falhadas
- Estoque baixo
- Contas a vencer
- Aniversários de clientes

Ative notificações no seu navegador para recebê-las.

### 9. Os dados estão seguros?

Sim! O sistema implementa:
- Criptografia de dados
- Backup automático diário
- Isolamento multi-tenant (cada empresa não vê dados de outras)
- Controle de acesso por usuário
- Logs de auditoria

### 10. Posso acessar de qualquer lugar?

Sim! O sistema é 100% web. Acesse de:
- Computador (recomendado)
- Tablet
- Smartphone

Basta ter internet e um navegador moderno.

### 11. Como exportar relatórios?

Todos os módulos têm botão "Exportar para Excel":
1. Clique no botão de exportação
2. Sistema gera arquivo .xlsx
3. Arquivo baixa automaticamente
4. Abra com Excel, Google Sheets ou similar

### 12. Quanto tempo os dados ficam salvos?

Os dados ficam salvos indefinidamente enquanto sua conta estiver ativa. Recomendamos fazer backup local periodicamente.

---

## Suporte

### Precisa de ajuda?

**Email**: suporte@seu-sistema.com  
**Telefone**: (XX) XXXX-XXXX  
**Horário**: Segunda a Sexta, 9h às 18h

### Atualizações

O sistema é atualizado regularmente com:
- Novos recursos
- Melhorias de desempenho
- Correções de bugs
- Ajustes de segurança

Você será notificado sobre atualizações importantes.

---

## Glossário

**Multi-Tenant**: Sistema onde múltiplas empresas compartilham a mesma plataforma, mas com dados completamente isolados.

**PDV**: Ponto de Venda - sistema de registro de vendas.

**SKU**: Stock Keeping Unit - código único do produto.

**Comissão**: Valor ou percentual pago ao profissional por venda ou serviço realizado.

**Fluxo de Caixa**: Movimento de entradas e saídas de dinheiro do negócio.

**DRE**: Demonstrativo de Resultado do Exercício - relatório que mostra receitas, despesas e lucro.

**Ticket Médio**: Valor médio gasto por cliente em cada visita.

**ROI**: Return on Investment - retorno sobre investimento.

**KPI**: Key Performance Indicator - indicador-chave de desempenho.

---

**Última atualização**: Novembro de 2025  
**Versão**: 1.0.0

---

© 2025 Sistema ERP Multi-Tenant. Todos os direitos reservados.
