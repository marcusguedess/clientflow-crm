# Report de melhorias — ClientFlow CRM

## Prioridade 1 — Dashboards

- Evolução temporal real: armazenar histórico diário de leads, receita, perdas e atividades para trocar projeções simuladas por série histórica auditável.
- Dashboards por perfil: visão CEO, gestor comercial, vendedor, CS e marketing, cada uma com métricas e ações próprias.
- Drill-down: clicar em uma métrica deve abrir a lista exata de leads que compõem o número.
- Forecast avançado: pesos por etapa configuráveis, data esperada de fechamento, probabilidade manual e cenário conservador/base/agressivo.
- Comparativos: período atual contra período anterior, meta contra realizado, responsável contra média do time.
- Alertas comerciais: leads sem próximo passo, propostas vencidas, oportunidade de alto valor parada, perda repetida por motivo.
- Painel de aquisição: CAC estimado, ticket por origem, conversão por canal, qualidade do lead por fonte.
- Apresentação executiva: modo tela cheia com KPIs, narrativa, gráfico principal e plano de ação para reunião semanal.

## Prioridade 2 — CRM

- Timeline por lead com atividades, notas, chamadas, reuniões, arquivos e mudança de etapa.
- Tarefas vinculadas a lead, cliente, responsável e prazo.
- Campos customizáveis por empresa e por segmento.
- Motivos de perda estruturados.
- Playbooks por etapa do funil.
- Score de lead com critérios configuráveis.
- Contas e contatos separados para vendas B2B.
- Importação/exportação em CSV/XLSX.

## Prioridade 3 — Experiência visual

- Biblioteca de componentes com tokens de cor, espaço, tipografia e estados.
- Modo apresentação para dashboards com visual mais amplo e menos elementos operacionais.
- Microinterações nos gráficos, filtros e cartões.
- Avatares em toda entidade humana: responsáveis, colaboradores, contatos e autores de atividade.
- Temas gradientes por área: vendas, CS, marketing, liderança e segurança.
- Estados vazios ricos e úteis, sempre com ação clara.

## Prioridade 4 — Segurança e operação

- Backend multiempresa com autenticação, autorização e auditoria.
- Sessões seguras com cookies `HttpOnly`.
- Criptografia em trânsito e segregação por organização.
- Rate limiting e logs de ações sensíveis.
- Política de permissões por papel.
- Backup server-side com trilha de auditoria.
- Testes automatizados para sanitização, importação, backup e permissões.

## Prioridade 5 — Escala para pequenas, médias e grandes empresas

- Pequenas empresas: fluxo simples, automações leves, cadastro rápido e painel de foco diário.
- Médias empresas: metas por equipe, relatórios por canal, múltiplos responsáveis e rotinas de gestão.
- Grandes empresas: multiunidade, permissões, auditoria, integrações, forecast por carteira e dashboards executivos.
