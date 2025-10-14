# Canvas de Design UX/UI: Barber & Beauty System

**Plataforma:** Next.js/React  
**Foco:** Mobile-First  
**Princípio-Chave:** Simplicidade Radical

Este documento orienta a criação de uma interface limpa, intuitiva e eficiente, focada nas necessidades reais de donos e profissionais de barbearias e salões de beleza.

## BLOCO 1: PRINCÍPIOS DE DESIGN & DIRETRIZES

### Menos é Mais
Se uma função não for usada por 80% dos usuários no dia a dia, ela não pertence à tela principal. Ela deve estar em um menu de "Configurações".

### Mobile-First, não Mobile-Friendly
Desenhe cada tela pensando primeiro em como ela funcionará perfeitamente em um celular ou tablet. O desktop é uma adaptação, não o contrário.

### Velocidade como Funcionalidade
A interface deve ser instantânea. Use as otimizações do Next.js (SSR/SSG) para carregamento rápido e feedback visual imediato para cada ação do usuário (loaders, esqueletos de tela).

### Dados Acionáveis, não Apenas Dados
Cada gráfico ou número no dashboard deve responder à pergunta: "O que eu devo fazer com esta informação?".

### Identidade Visual
Limpa, moderna e amigável. Use tons de cinza neutros com uma única cor de destaque vibrante (ex: um azul elétrico ou verde menta) para ações principais. Tipografia clara e legível (Inter, Poppins).

## BLOCO 2: PERSONAS E FLUXOS DE TRABALHO

### Persona 1: Zé, o Barbeiro (Foco: Agilidade na Operação)

**Necessidade:** Gerenciar sua agenda do dia de forma rápida, ver os detalhes do próximo cliente e fechar a comanda sem sair do balcão.

**Fluxo Principal (O "Golden Path" do Zé):**
1. Abrir o app no tablet e ver a agenda do dia
2. Clicar em um agendamento para ver o histórico do cliente
3. Ao final do serviço, clicar em "Finalizar" → "Fechar Comanda"
4. Adicionar um produto (pomada) à venda
5. Selecionar o método de pagamento e concluir

### Persona 2: Carla, a Dona do Salão (Foco: Visão do Negócio)

**Necessidade:** Entender a saúde do negócio rapidamente, ver o desempenho da equipe e gerenciar o catálogo de serviços e produtos.

**Fluxo Principal (O "Golden Path" da Carla):**
1. Abrir o app no celular e ver o dashboard com o faturamento do dia
2. Analisar o gráfico de "Clientes Novos vs. Recorrentes"
3. Navegar para a aba de "Relatórios" para ver o ranking de serviços mais rentáveis do mês
4. Ir para "Configurações" → "Serviços" para ajustar o preço de um item

## BLOCO 3: ARQUITETURA DA INFORMAÇÃO (SITEMAP)

A navegação principal (menu lateral no desktop, barra inferior no mobile) terá 4 ícones:

### 1. Dashboard (/)
A primeira tela que a Carla (admin) vê. Foco em KPIs (Key Performance Indicators). Para o Zé (barbeiro), esta tela pode ser um resumo do seu próprio dia.

### 2. Agenda (/agenda)
O coração da aplicação. A primeira tela que o Zé (barbeiro) vê.

### 3. Caixa (PDV) (/caixa)
Um ponto de venda rápido para vendas avulsas de produtos.

### 4. Clientes (/clientes)
A lista de clientes, com busca e histórico.

### 5. Configurações (/configuracoes)
- `/configuracoes/servicos`: Gerenciar o catálogo de serviços
- `/configuracoes/produtos`: Gerenciar o estoque de produtos
- `/configuracoes/equipe`: Convidar e gerenciar usuários
- `/configuracoes/conta`: Detalhes do Tenant, assinatura, etc.
- **Renderização Condicional** `/configuracoes/comissoes`: Aparece apenas para tenants com o module_comissoes

## BLOCO 4: WIREFRAMES DAS TELAS-CHAVE (GUIA VISUAL)

### Tela 1: Dashboard (A Visão da Carla)

**Layout:** Grid de cards. Responsivo.

**Cards:**
1. **Card 1 (Topo, Largura Total):** "Visão do Dia"
   - Faturamento de hoje
   - Nº de clientes atendidos
   - Ticket médio

2. **Card 2:** "Performance da Semana"
   - Gráfico de barras com o faturamento de cada dia da semana

3. **Card 3:** "Clientes Novos vs. Recorrentes"
   - Gráfico de pizza simples mostrando a proporção do mês

4. **Card 4:** "Ranking de Profissionais"
   - Lista simples com foto, nome do profissional e faturamento total gerado no mês

5. **Card 5:** "Serviços em Alta"
   - Top 3 serviços mais realizados

### Tela 2: Agenda (O Mundo do Zé)

**Layout:** Visão de colunas por profissional (no desktop/tablet). Em telas menores (celular), se transforma em um seletor no topo para alternar entre as agendas dos profissionais.

**Componente "Card de Agendamento":**
- Exibe o nome do cliente, o serviço e a hora
- Cores diferentes por status:
  - Azul: "Marcado"
  - Verde: "Concluído"
  - Cinza: "Cancelado"

**Interações:**
1. **Clicar em horário vago:** Abre modal simples para "Novo Agendamento"
2. **Clicar em agendamento existente:** Pop-up com detalhes e ações:
   - "Ver Cliente"
   - "Remarcar"
   - "Cancelar"
   - "Finalizar e Ir para Comanda"
3. **Arrastar e Soltar:** Remarcar arrastando para outro horário/profissional

### Tela 3: Comanda / Checkout (O Fluxo Final)

**Layout:** Tela dividida em duas colunas

**Coluna Esquerda (Resumo da Venda):**
- Itens adicionados (ex: "Corte Masculino - R$ 50,00")
- Botão "+ Adicionar Produto" (modal de busca rápida)
- Subtotal, Descontos, Total

**Coluna Direita (Pagamento):**
- Botões grandes para métodos de pagamento (Dinheiro, Cartão, Pix)
- Se dinheiro: campo "Valor Recebido" que calcula troco
- **Botão Principal (Rodapé):** "CONCLUIR VENDA" - Grande, verde, impossível de errar

## BLOCO 5: BIBLIOTECA DE COMPONENTES

### Biblioteca Recomendada: Shadcn/UI

**Por quê?**
- Moderna e acessível
- Sem estilo opinativo (você define a aparência)
- Permite copiar e colar código dos componentes
- Total controle

### Componentes a serem usados:
- **Card:** Para o dashboard
- **Button:** Para todas as ações
- **Dialog:** Para modais de "Novo Agendamento"
- **Calendar:** Base para agenda
- **Table:** Para listas e relatórios
- **Input, Select:** Para formulários

---

**Este Canvas é seu guia. Siga-o para construir um front-end que não apenas funcione com seu back-end, mas que também encante seus usuários e se destaque da concorrência pela sua elegância e simplicidade.**
