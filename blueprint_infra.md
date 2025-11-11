🏗️ Blueprint: Super Dashboard de Operações do NutriPro
Este blueprint detalha as tarefas, as tecnologias recomendadas e a apresentação visual para cada seção do seu dashboard.

Metodologia de Construção:
Backend como "Agregador": Seu backend será o ponto central que coleta dados de todas as fontes (Sentry, Redis, AWS/Vercel, UptimeRobot, etc.) e os expõe através de uma API para o seu frontend.

Frontend como "Visualizador": Seu frontend (o painel ADM) consome essa API e renderiza os dados em tempo real ou quase real.

Comunicação em Tempo Real (Opcional, mas Recomendado): Para dados como "Usuários Online" ou "Status de Uptime", considere usar WebSockets (Socket.IO, ou direto com FastAPI/Django Channels) para atualizações instantâneas.

🎯 Seções do Dashboard e Detalhes de Implementação
Vamos organizar as informações em "quadrantes" ou "telas" como na sua imagem, focando nas áreas críticas.

Quadrante 1: Saúde da Aplicação (Sentry & Código)
Foco: Detecção e Impacto de Erros. Dados Provenientes: Sentry API.

Tasks:

Backend:

Criar um endpoint GET /api/dashboard/sentry/health que consulta a API do Sentry para buscar:

Número de "Usuários Crash-Free" (para a última hora/dia).

Contagem de "Eventos Novos" (que não foram vistos antes).

Contagem de "Eventos Recorrentes" (regressões ou não resolvidos).

Link direto para o Sentry para a lista completa de issues.

Frontend:

Componente para exibir a porcentagem de usuários sem crash.

Componentes de contador para erros novos e recorrentes.

Um botão ou link "Ver Todos os Erros" que leva para o Sentry.

Apresentação Visual:

Gráfico de Velocímetro/Doughnut: Para "Usuários Crash-Free" (verde > 99%, amarelo > 95%, vermelho < 95%).

Cards de Contagem: "Novos Erros: [Número]", "Erros Recorrentes: [Número]".

Título: "Saúde do Código (Sentry)"

Icone de Alerta: Pequenos ícones de exclamação (vermelho/amarelo) nos cards de contagem quando o número é alto.

Quadrante 2: Performance da Aplicação (Sentry APM & Latência)
Foco: Lentidão e Gargalos. Dados Provenientes: Sentry API (APM).

Tasks:

Backend:

Criar um endpoint GET /api/dashboard/sentry/performance que consulta a API do Sentry para buscar:

Lista das "Top 5 Transações Mais Lentas" (com tempo médio e P95/P99 de latência).

Tempo médio de resposta geral da aplicação.

Taxa de falha das transações (ex: "Transações com Erro 5xx").

Frontend:

Tabela ou lista para exibir as 5 transações mais lentas.

Componente de texto para tempo médio de resposta.

Gráfico de linha mostrando a evolução da latência média ao longo do tempo.

Apresentação Visual:

Tabela: Colunas "Endpoint", "Tempo Médio (ms)", "P95 (ms)".

Gráfico de Linha: "Latência Média da API (última hora)".

Card de Contagem: "Tempo Médio de Resposta: [X ms]".

Título: "Performance (Sentry APM)"

Quadrante 3: Saúde do Cache (Redis)
Foco: Eficiência e Uso de Recurso do Cache. Dados Provenientes: Conexão direta do Backend ao Redis.

Tasks:

Backend:

Criar endpoint GET /api/dashboard/redis/metrics que executa INFO no Redis e retorna:

keyspace_hits e keyspace_misses (para calcular o Hit Ratio).

used_memory e maxmemory (se configurado).

connected_clients.

db0:keys (número total de chaves).

Criar endpoint POST /api/dashboard/redis/flushall para o botão "Limpar Cache Total". (Requer autenticação de ADM rigorosa!)

Criar endpoint POST /api/dashboard/redis/del_key para limpar chaves específicas.

Criar endpoint POST /api/dashboard/redis/inspect_key para ver o conteúdo de uma chave.

Frontend:

Componente para exibir a "Taxa de Acerto do Cache".

Gráfico de barra para "Uso de Memória".

Cards de contagem para "Clientes Conectados" e "Total de Chaves".

Campos de input com botões para "Limpar Chave", "Limpar Padrão" e "Inspecionar Chave".

Botão grande e visível "Limpar TODO o Cache".

Apresentação Visual:

Gráfico de Velocímetro/Medidor: Para "Taxa de Acerto" (verde > 90%, amarelo > 70%, vermelho < 70%).

Gráfico de Barra: "Uso de Memória Redis".

Cards de Contagem: "Clientes Conectados: [Número]", "Total de Chaves: [Número]".

Bloco de Ações: Botões e campos de texto para as ações (limpar/inspecionar).

Título: "Saúde do Cache (Redis)"

Quadrante 4: Saúde da Infraestrutura (Servidor/Hospedagem)
Foco: Capacidade e Estabilidade do Servidor. Dados Provenientes: API do seu provedor de hospedagem (AWS CloudWatch, Vercel/Railway API, etc.).

Tasks:

Backend:

Criar endpoint GET /api/dashboard/infra/metrics que consulta a API do seu provedor para buscar:

CPU Utilization (percentual).

Memory Utilization (percentual).

(Opcional) Network In/Out (tráfego de rede).

Frontend:

Gráficos de linha para "Uso de CPU" e "Uso de Memória" ao longo do tempo.

Cards de texto com o valor atual dessas métricas.

Apresentação Visual:

Gráficos de Linha: "Uso de CPU (última hora)", "Uso de RAM (última hora)".

Cards de Contagem: "CPU Atual: [X%]", "RAM Atual: [Y%]".

Título: "Saúde da Infraestrutura ([Seu Provedor])"

Quadrante 5: Disponibilidade e Usuários Ativos (Uptime & Analytics)
Foco: O sistema está no ar? Quantas pessoas estão usando? Dados Provenientes: UptimeRobot API, Plausible/Fathom API, ou Redis (para usuários).

Tasks:

Backend:

Criar endpoint GET /api/dashboard/uptime/status que consulta a API do UptimeRobot (ou similar) para o status (UP/DOWN).

Criar endpoint GET /api/dashboard/users/online que consulta a API do Plausible/Fathom ou usa a lógica do Redis para contar usuários online.

Frontend:

Um grande "LED" ou texto para "Status do Sistema" (Verde para Online, Vermelho para Offline).

Um grande contador para "Usuários Ativos Agora".

Gráfico de linha simples para "Usuários Ativos (última hora)" para mostrar tendências.

Apresentação Visual:

Indicador de Status: Um círculo grande (verde/vermelho) com texto "ONLINE" / "OFFLINE".

Card de Contagem Grande: "Usuários Ativos: [Número]".

Gráfico de Linha: "Atividade de Usuários (última hora)".

Título: "Disponibilidade & Usuários"

Considerações Gerais de Apresentação Visual (Inspirado na sua Imagem):
Layout em Grid: Use um layout responsivo em grid (ex: CSS Grid, Tailwind CSS Grid) para organizar os quadrantes. Na sua imagem, parece ter um 3x2, ou talvez vários 2x2.

Modo Escuro (Dark Mode): Essencial para um dashboard de monitoramento (menos fadiga ocular).

Cores de Status:

Verde: Tudo OK, dentro do esperado.

Amarelo/Laranja: Alerta, algo está um pouco fora do normal, vale a pena observar.

Vermelho: Problema crítico, ação imediata necessária.

Atualização em Tempo Real/Quase Real: Use setInterval para fazer polling na sua API a cada X segundos/minutos, ou (melhor ainda) use WebSockets para dados que mudam muito rápido (uptime, usuários online).

Componentes de Gráfico: Utilize bibliotecas robustas como Chart.js, Recharts ou ApexCharts para criar gráficos interativos e bonitos.

Iconografia: Use ícones (ex: Font Awesome, Heroicons) para dar um toque profissional e visualmente indicar o tipo de métrica.

Botões de Ação Claros: Botões grandes e distintos, especialmente para ações críticas como "Limpar TODO o Cache", talvez com uma confirmação extra para evitar cliques acidentais.