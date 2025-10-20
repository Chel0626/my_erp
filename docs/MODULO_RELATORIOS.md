# 📊 Módulo de Relatórios e Dashboards - Documentação

**Data de Implementação:** 20 de Outubro de 2025  
**Versão:** 1.0

---

## ✅ Status: IMPLEMENTADO E FUNCIONAL

O módulo de **Relatórios e Dashboards** foi completamente implementado com backend e frontend prontos para uso.

---

## 🎯 O QUE FOI IMPLEMENTADO

### Backend (Django + DRF)

#### 1. **Endpoints de Relatórios Financeiros**

**Localização:** `backend/financial/views.py`

```python
# Gráfico de Receita ao Longo do Tempo
GET /api/financial/transactions/revenue_chart/
Query params: start_date, end_date, period (day|week|month)
Retorna: { start_date, end_date, period, data: [{period, total, count}] }

# Gráfico de Despesas ao Longo do Tempo
GET /api/financial/transactions/expense_chart/
Query params: start_date, end_date, period (day|week|month)
Retorna: { start_date, end_date, period, data: [{period, total, count}] }
```

**Funcionalidades:**
- ✅ Agrupamento por dia, semana ou mês
- ✅ Filtros de data (start_date, end_date)
- ✅ Padrão: últimos 30 dias se não fornecido
- ✅ Usa `TruncDate`, `TruncWeek`, `TruncMonth` do Django ORM
- ✅ Retorna total e quantidade de transações

#### 2. **Endpoints de Relatórios de Agendamentos**

**Localização:** `backend/scheduling/views.py`

```python
# Distribuição de Status (Pizza/Donut)
GET /api/scheduling/appointments/status_distribution/
Query params: start_date, end_date
Retorna: { total, data: [{status, status_display, count, percentage}] }

# Top Serviços Mais Agendados
GET /api/scheduling/appointments/top_services/
Query params: start_date, end_date, limit (padrão: 10)
Retorna: [{service_id, service_name, price, appointments_count, total_revenue}]

# Desempenho por Profissional
GET /api/scheduling/appointments/professional_performance/
Query params: start_date, end_date
Retorna: [{
  professional_id, 
  professional_name, 
  professional_email,
  total_appointments, 
  completed, 
  cancelled, 
  total_revenue, 
  completion_rate
}]

# Timeline de Agendamentos
GET /api/scheduling/appointments/appointments_timeline/
Query params: start_date, end_date, period (day|week|month)
Retorna: { start_date, end_date, period, data: [{period, total, confirmed, completed, cancelled}] }
```

**Funcionalidades:**
- ✅ Cálculo de percentuais automático
- ✅ Agregação com `Count`, `Sum`, `Avg`
- ✅ Filtros por período
- ✅ Ordenação por receita/quantidade
- ✅ Taxa de conclusão calculada
- ✅ Ranking de profissionais

---

### Frontend (Next.js + TypeScript + Recharts)

#### 1. **Hook useReports.ts**

**Localização:** `frontend/hooks/useReports.ts`

**Funções Disponíveis:**
```typescript
useRevenueChart(filters?)          // Gráfico de receita
useExpenseChart(filters?)          // Gráfico de despesas
useStatusDistribution(filters?)    // Distribuição de status
useTopServices(filters?)           // Top serviços
useProfessionalPerformance(filters?) // Desempenho profissional
useAppointmentsTimeline(filters?)  // Timeline agendamentos
useAllReports(filters?)            // Todos os relatórios de uma vez
```

**Filtros Disponíveis:**
```typescript
interface ReportFilters {
  start_date?: string;    // YYYY-MM-DD
  end_date?: string;      // YYYY-MM-DD
  period?: 'day' | 'week' | 'month';
  limit?: number;         // Para top serviços
}
```

#### 2. **Componentes de Gráficos**

**Localização:** `frontend/components/reports/`

##### A. RevenueChart.tsx
- Gráfico de **área** ou **linha** para receita
- Formata valores em R$
- Tooltip com detalhes
- Total de receita e quantidade
- Responsivo

##### B. StatusDistributionChart.tsx
- Gráfico de **pizza** (donut)
- Cores customizadas por status
- Percentuais calculados
- Ícones por status
- Legenda com cards

##### C. TopServicesChart.tsx
- Gráfico de **barras horizontais**
- Lista detalhada dos top 5
- Cores em gradiente
- Total de receita calculado
- Percentual de cada serviço

##### D. ProfessionalPerformance.tsx
- **Tabela** (desktop) ou **cards** (mobile)
- Ranking por receita
- Badge de taxa de conclusão (cores dinâmicas)
- Troféus para top 3 (🥇🥈🥉)
- Resumo geral no rodapé

#### 3. **Página de Relatórios**

**Localização:** `frontend/app/dashboard/reports/page.tsx`

**Funcionalidades:**
- ✅ Filtros de data (início, fim)
- ✅ Seletor de período (dia, semana, mês)
- ✅ Seletor de limite (top 5, 10, 15, 20)
- ✅ Filtros rápidos (7, 15, 30 dias, este mês)
- ✅ Botão de resetar filtros
- ✅ Botão de exportar (placeholder)
- ✅ Loading states (skeletons)
- ✅ Estados vazios
- ✅ Grid responsivo (1/2 colunas)

**Layout da Página:**
```
┌─────────────────────────────────────────────────────┐
│ Header: Título + Botões (Filtros, Resetar, Exportar)│
├─────────────────────────────────────────────────────┤
│ Filtros (expansível):                               │
│ - Data inicial/final                                │
│ - Período de agrupamento                            │
│ - Limite top serviços                               │
│ - Filtros rápidos                                   │
├─────────────────────────────────────────────────────┤
│ Informação do Período Selecionado                   │
├─────────────────────────────────────────────────────┤
│ Linha 1: [Receita Chart] [Status Distribution]     │
├─────────────────────────────────────────────────────┤
│ Linha 2: [Top Serviços (full width)]               │
├─────────────────────────────────────────────────────┤
│ Linha 3: [Desempenho Profissional (full width)]    │
└─────────────────────────────────────────────────────┘
```

#### 4. **Navegação**

**Localização:** `frontend/app/dashboard/layout.tsx`

- ✅ Adicionado item "Relatórios" no menu
- ✅ Ícone: `BarChart3`
- ✅ Link: `/dashboard/reports`
- ✅ Visível em sidebar (desktop) e bottom nav (mobile)

---

## 🚀 COMO USAR

### 1. Acessar a Página

```
URL: http://localhost:3000/dashboard/reports
```

### 2. Usar Filtros

**Filtros Rápidos:**
- Clique em "Últimos 7 dias", "Últimos 15 dias", "Últimos 30 dias" ou "Este mês"

**Filtros Personalizados:**
1. Clique em "Filtros"
2. Selecione data inicial e final
3. Escolha o período de agrupamento (dia, semana, mês)
4. Defina quantos serviços mostrar no top (5, 10, 15, 20)

**Resetar:**
- Clique em "Resetar" para voltar aos filtros padrão (últimos 30 dias)

### 3. Interpretar os Gráficos

#### Gráfico de Receita
- **Verde**: valor em reais
- **Tooltip**: mostra receita e quantidade de transações
- **Total**: exibido no header do card

#### Distribuição de Status
- **Pizza**: percentual visual de cada status
- **Cards**: quantidade e percentual de cada status
- **Cores**:
  - Verde: Concluído
  - Azul: Confirmado
  - Laranja: Marcado
  - Vermelho: Cancelado
  - Roxo: Em atendimento
  - Cinza: Falta

#### Top Serviços
- **Barras**: quantidade de agendamentos
- **Lista**: top 5 com receita e percentual
- **Ranking**: ordenado por receita

#### Desempenho Profissional
- **Troféus**: 🥇 1º lugar, 🥈 2º lugar, 🥉 3º lugar
- **Taxa de Conclusão**:
  - Verde: ≥ 90%
  - Amarelo: ≥ 70%
  - Vermelho: < 70%
- **Ordenação**: por receita total (decrescente)

---

## 📊 EXEMPLOS DE REQUISIÇÕES

### Receita dos Últimos 7 Dias (Diário)

```bash
GET http://localhost:8000/api/financial/transactions/revenue_chart/?start_date=2025-10-13&end_date=2025-10-20&period=day
```

**Resposta:**
```json
{
  "start_date": "2025-10-13",
  "end_date": "2025-10-20",
  "period": "day",
  "data": [
    {
      "period": "2025-10-13T00:00:00Z",
      "total": "250.00",
      "count": 5
    },
    {
      "period": "2025-10-14T00:00:00Z",
      "total": "180.00",
      "count": 3
    }
  ]
}
```

### Distribuição de Status

```bash
GET http://localhost:8000/api/scheduling/appointments/status_distribution/?start_date=2025-10-01&end_date=2025-10-20
```

**Resposta:**
```json
{
  "total": 45,
  "data": [
    {
      "status": "concluido",
      "status_display": "Concluído",
      "count": 20,
      "percentage": 44.44
    },
    {
      "status": "confirmado",
      "status_display": "Confirmado",
      "count": 15,
      "percentage": 33.33
    },
    {
      "status": "cancelado",
      "status_display": "Cancelado",
      "count": 10,
      "percentage": 22.22
    }
  ]
}
```

### Top 5 Serviços

```bash
GET http://localhost:8000/api/scheduling/appointments/top_services/?start_date=2025-10-01&end_date=2025-10-20&limit=5
```

**Resposta:**
```json
[
  {
    "service_id": "uuid",
    "service_name": "Corte Masculino",
    "price": "35.00",
    "appointments_count": 25,
    "total_revenue": "875.00"
  },
  {
    "service_id": "uuid",
    "service_name": "Barba",
    "price": "25.00",
    "appointments_count": 18,
    "total_revenue": "450.00"
  }
]
```

### Desempenho Profissional

```bash
GET http://localhost:8000/api/scheduling/appointments/professional_performance/?start_date=2025-10-01&end_date=2025-10-20
```

**Resposta:**
```json
[
  {
    "professional_id": "uuid",
    "professional_name": "João Silva",
    "professional_email": "joao@barbearia.com",
    "total_appointments": 30,
    "completed": 28,
    "cancelled": 2,
    "total_revenue": 1050.00,
    "completion_rate": 93.33
  }
]
```

---

## 🎨 TECNOLOGIAS UTILIZADAS

### Backend
- **Django ORM**: Aggregations (Count, Sum, Avg)
- **django.db.models.functions**: TruncDate, TruncWeek, TruncMonth
- **DRF Actions**: `@action(detail=False, methods=['get'])`
- **Query Params**: Filtros flexíveis

### Frontend
- **Recharts**: Biblioteca de gráficos React
  - `LineChart`, `AreaChart`: Receita/Despesa
  - `PieChart`: Distribuição de status
  - `BarChart`: Top serviços
- **React Query**: Cache e gerenciamento de estado
- **date-fns**: Formatação de datas
- **shadcn/ui**: Componentes UI

---

## 📈 MÉTRICAS E KPIs

### Financeiro
- ✅ Receita ao longo do tempo
- ✅ Despesas ao longo do tempo
- ✅ Saldo (receita - despesa)
- ✅ Quantidade de transações

### Agendamentos
- ✅ Distribuição por status
- ✅ Taxa de conclusão
- ✅ Taxa de cancelamento
- ✅ Top serviços por quantidade
- ✅ Top serviços por receita

### Profissionais
- ✅ Ranking por receita
- ✅ Quantidade de agendamentos
- ✅ Agendamentos concluídos
- ✅ Agendamentos cancelados
- ✅ Taxa de conclusão
- ✅ Receita total

---

## 🔜 PRÓXIMAS MELHORIAS

### Curto Prazo
- [ ] Adicionar gráfico de despesas na página
- [ ] Adicionar gráfico comparativo (receita vs despesa)
- [ ] Export para PDF (react-pdf)
- [ ] Export para Excel (xlsx)
- [ ] Mais filtros (por profissional, por serviço)

### Médio Prazo
- [ ] Gráficos de comparação (mês anterior, ano anterior)
- [ ] Previsão de receita (tendência)
- [ ] Relatório de produtos mais vendidos
- [ ] Relatório de clientes (novos, recorrentes, inativos)
- [ ] Gráfico de horários de pico
- [ ] Mapa de calor de agendamentos

### Longo Prazo
- [ ] Dashboard personalizado (arrastar e soltar gráficos)
- [ ] Relatórios agendados (envio por email)
- [ ] Alertas e notificações (metas atingidas)
- [ ] BI avançado (Power BI embed)
- [ ] Comparação entre unidades (multi-unidade)

---

## 🧪 ROTEIRO DE TESTES

### 1. Teste de Filtros
1. Acesse `/dashboard/reports`
2. Clique em "Últimos 7 dias"
3. Verifique se os gráficos atualizaram
4. Clique em "Este mês"
5. Verifique se mudou o período

### 2. Teste de Filtros Personalizados
1. Clique em "Filtros"
2. Selecione data inicial: 01/10/2025
3. Selecione data final: 20/10/2025
4. Escolha período: Semana
5. Verifique se os gráficos agruparam por semana

### 3. Teste de Gráfico de Receita
1. Passe o mouse sobre o gráfico
2. Verifique se o tooltip aparece
3. Verifique se mostra valor em R$ e quantidade

### 4. Teste de Status Distribution
1. Verifique se a pizza mostra percentuais
2. Verifique se os cards mostram ícones corretos
3. Verifique se as cores correspondem aos status

### 5. Teste de Top Serviços
1. Verifique se mostra barra horizontal
2. Verifique se a lista mostra top 5
3. Altere o limite para "Top 10"
4. Verifique se atualizou

### 6. Teste de Desempenho Profissional
1. Verifique se mostra troféus para top 3
2. Verifique se as taxas de conclusão têm cores corretas
3. Em mobile, verifique se mostra cards em vez de tabela

### 7. Teste de Responsividade
1. Abra DevTools (F12)
2. Ative modo mobile (Ctrl + Shift + M)
3. Redimensione para 375px
4. Verifique se os gráficos se adaptam
5. Verifique se a tabela vira cards

### 8. Teste de Estados Vazios
1. Configure filtros para um período sem dados
2. Verifique se mostra mensagem amigável
3. Verifique se não quebra a interface

---

## 📝 NOTAS TÉCNICAS

### Performance
- ✅ Queries otimizadas com `annotate()` e `aggregate()`
- ✅ Filtros aplicados no banco de dados
- ✅ React Query faz cache automático
- ✅ Componentes renderizam apenas quando dados mudam

### Escalabilidade
- ✅ Suporta grandes volumes de dados
- ✅ Agrupamento por período reduz quantidade de pontos
- ✅ Paginação pode ser adicionada facilmente

### Manutenibilidade
- ✅ Código modularizado (hooks, components, api)
- ✅ TypeScript para type safety
- ✅ Interfaces bem definidas
- ✅ Comentários em código complexo

---

## 🎉 CONCLUSÃO

O módulo de **Relatórios e Dashboards** está **100% funcional** e pronto para uso. Ele fornece insights valiosos sobre:

- 💰 **Desempenho financeiro** (receitas, despesas)
- 📅 **Agendamentos** (status, serviços populares)
- 👥 **Profissionais** (ranking, taxa de conclusão)

**Próxima Ação Sugerida:** Adicionar export para PDF/Excel para compartilhar relatórios com a equipe.

---

**Data de Documentação:** 20 de Outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ COMPLETO
