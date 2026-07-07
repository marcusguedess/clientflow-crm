import { lazy, Suspense, useMemo, useState } from 'react'
import { buildPipelineMetrics, buildRevenueTrend, DEFAULT_GOAL_CONFIG } from '../domain/metrics'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'

const ThreeShowcase = lazy(() => import('./ThreeShowcase'))

const periods = {
  '7d': { label: '7 ganhos', limit: 7 },
  '30d': { label: '12 ganhos', limit: 12 },
  '90d': { label: '18 ganhos', limit: 18 },
}

const dashboardProfiles = {
  executive: { label: 'Executivo', description: 'Receita, risco e previsibilidade' },
  manager: { label: 'Gestão', description: 'Equipe, cadência e gargalos' },
  seller: { label: 'Minha carteira', description: 'Prioridades e próximos passos' },
  customer: { label: 'Clientes', description: 'Retenção, expansão e atendimento' },
}

function AreaChart({ values, labels, selectedIndex, onSelect }) {
  const width = 620
  const height = 210
  const padding = 26
  const max = Math.max(...values, 1)
  const safeIndex = Math.min(Math.max(selectedIndex, 0), values.length - 1)
  const points = values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : padding + index * ((width - padding * 2) / (values.length - 1)),
    y: height - padding - (value / max) * (height - padding * 2),
    value,
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = `M ${points[0].x} ${height - padding} L ${line.replaceAll(',', ' ')} L ${points.at(-1).x} ${height - padding} Z`

  return (
    <div className="revenue-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução estimada da receita">
        <defs>
          <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity=".38" />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-secondary)" />
            <stop offset="100%" stopColor="var(--accent-primary)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((lineIndex) => (
          <line key={lineIndex} x1={padding} x2={width - padding} y1={padding + lineIndex * 48} y2={padding + lineIndex * 48} className="chart-grid-line" />
        ))}
        <path d={area} fill="url(#revenueArea)" className="chart-area" />
        <polyline points={line} fill="none" stroke="url(#revenueLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
        {points.map((point, index) => (
          <g
            key={`${labels[index]}-${index}`}
            className={`chart-point ${safeIndex === index ? 'is-selected' : ''}`}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelect(index)
            }}
            role="button"
            tabIndex="0"
          >
            <circle cx={point.x} cy={point.y} r={safeIndex === index ? 8 : 5} />
            <text x={point.x} y={height - 5} textAnchor="middle">{labels[index]}</text>
          </g>
        ))}
      </svg>
      <div className="chart-tooltip" style={{ left: `${(points[safeIndex].x / width) * 100}%`, top: `${(points[safeIndex].y / height) * 100}%` }}>
        <small>{labels[safeIndex]}</small>
        <strong>{formatCurrency(points[safeIndex].value)}</strong>
      </div>
    </div>
  )
}

export default function PerformanceDashboard({
  leads,
  employees,
  tasks = [],
  goalConfig = DEFAULT_GOAL_CONFIG,
  onGoalConfigChange,
  onNavigate,
}) {
  const [period, setPeriod] = useState('30d')
  const [selectedPoint, setSelectedPoint] = useState(6)
  const [rankingMode, setRankingMode] = useState('score')
  const [ownerFilter, setOwnerFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [sourceFilter, setSourceFilter] = useState('Todos')
  const [profile, setProfile] = useState('executive')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [comparison, setComparison] = useState('previous')

  const filterOptions = useMemo(() => ({
    owners: ['Todos', ...employees.map((employee) => employee.nome)],
    statuses: ['Todos', ...new Set(leads.map((lead) => lead.status))],
    sources: ['Todos', ...new Set(leads.map((lead) => lead.origem || 'Outros'))],
  }), [employees, leads])

  const filteredLeads = useMemo(() => leads.filter((lead) =>
    (ownerFilter === 'Todos' || lead.responsavel === ownerFilter) &&
    (statusFilter === 'Todos' || lead.status === statusFilter) &&
    (sourceFilter === 'Todos' || (lead.origem || 'Outros') === sourceFilter),
  ), [leads, ownerFilter, statusFilter, sourceFilter])

  const metrics = useMemo(() => {
    const won = filteredLeads.filter((lead) => lead.status === 'Fechado')
    const lost = filteredLeads.filter((lead) => lead.status === 'Perdido')
    const newLeads = filteredLeads.filter((lead) => lead.status === 'Novo Lead')
    const revenue = won.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const open = filteredLeads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    const pipeline = open.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const averageTicket = won.length ? Math.round(revenue / won.length) : 0
    return { won: won.length, lost: lost.length, newLeads: newLeads.length, revenue, pipeline, open: open.length, averageTicket }
  }, [filteredLeads])
  const pipelineMetrics = useMemo(() => buildPipelineMetrics(filteredLeads, tasks, goalConfig), [filteredLeads, tasks, goalConfig])

  const sourceData = useMemo(() => {
    const counts = filteredLeads.reduce((result, lead) => ({ ...result, [lead.origem || 'Outros']: (result[lead.origem || 'Outros'] || 0) + 1 }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredLeads])

  const performance = useMemo(() => employees.map((employee, index) => {
    const owned = filteredLeads.filter((lead) => lead.responsavel === employee.nome)
    const closed = owned.filter((lead) => lead.status === 'Fechado')
    const value = closed.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const activeTasks = tasks.filter((task) => task.owner === employee.nome && task.status !== 'Concluído').length
    const score = Math.min(100, Math.round(closed.length * 24 + owned.length * 6 + Math.min(24, activeTasks * 4) + (value > 0 ? 12 : 0)))
    return { employee, score, deals: closed.length, value }
  }).sort((a, b) => rankingMode === 'value' ? b.value - a.value : b.score - a.score), [employees, filteredLeads, rankingMode, tasks])

  const statusHealth = pipelineMetrics.stageTotals

  const segmentData = useMemo(() => {
    const segments = ['PME', 'Mid-market', 'Enterprise', 'Setor público']
    return segments.map((label) => {
      const items = filteredLeads.filter((lead) => (lead.segmento || 'PME') === label)
      const value = items.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
      return { label, count: items.length, value }
    })
  }, [filteredLeads])

  const revenueTrend = buildRevenueTrend(filteredLeads, periods[period].limit)
  const series = revenueTrend.map((item) => item.value)
  const chartLabels = revenueTrend.map((item) => item.label)
  const goal = pipelineMetrics.goal
  const goalProgress = goal ? Math.min(100, Math.round((metrics.revenue / goal) * 100)) : 0
  const conversion = metrics.won + metrics.lost ? Math.round((metrics.won / (metrics.won + metrics.lost)) * 100) : 0
  const weightedForecast = pipelineMetrics.weightedForecast
  const coverage = pipelineMetrics.goalCoverage
  const stalled = pipelineMetrics.risks.filter(({ risk }) => ['medium', 'high'].includes(risk.level)).map(({ lead }) => lead)
  const bestOwner = performance[0]
  const bestSource = sourceData[0]
  const overdueTasks = tasks.filter((task) => task.status !== 'Concluído' && task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date())
  const urgentTasks = tasks.filter((task) => task.priority === 'Alta' && task.status !== 'Concluído')
  const activeTasks = tasks.filter((task) => ['Planejado', 'Em andamento', 'Em revisão'].includes(task.status))
  const lostReasons = useMemo(() => {
    const reasons = filteredLeads
      .filter((lead) => lead.status === 'Perdido')
      .reduce((result, lead) => ({ ...result, [lead.motivoPerda || 'Sem motivo registrado']: (result[lead.motivoPerda || 'Sem motivo registrado'] || 0) + 1 }), {})
    return Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [filteredLeads])
  const decisionQueue = useMemo(() => {
    const proposals = filteredLeads.filter((lead) => lead.status === 'Proposta')
    const noNextStep = filteredLeads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status) && !lead.proximoPasso)
    const closingSoon = filteredLeads.filter((lead) => lead.previsaoFechamento && !['Fechado', 'Perdido'].includes(lead.status) && new Date(`${lead.previsaoFechamento}T23:59:59`) <= new Date(Date.now() + 14 * 86_400_000))
    const clients = filteredLeads.filter((lead) => lead.status === 'Fechado')
    const clientIds = new Set(clients.map((lead) => lead.id))
    const clientTasks = tasks.filter((task) => clientIds.has(task.relatedLeadId) && task.status !== 'Concluído')
    const clientsWithoutTask = clients.filter((lead) => !tasks.some((task) => task.relatedLeadId === lead.id && task.status !== 'Concluído'))
    const enterpriseClients = clients.filter((lead) => lead.segmento === 'Enterprise')

    const queues = {
      executive: [
        { id: 'stalled', label: 'Risco no pipeline', value: stalled.length, detail: 'Alto valor ainda nas etapas iniciais', tone: 'warning', view: 'pipeline', target: 'Contato Feito' },
        { id: 'proposal', label: 'Receita em proposta', value: formatCurrency(proposals.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)), detail: 'Valor que depende de decisão próxima', tone: 'violet', view: 'pipeline', target: 'Proposta' },
        { id: 'overdue', label: 'Execução atrasada', value: overdueTasks.length, detail: 'Pendências comerciais vencidas', tone: 'danger', view: 'tasks' },
        { id: 'coverage', label: 'Cobertura da meta', value: `${coverage}%`, detail: 'Receita ganha somada ao pipeline', tone: 'blue', view: 'analytics' },
      ],
      manager: [
        { id: 'active', label: 'Trabalho em curso', value: activeTasks.length, detail: 'Tarefas planejadas ou em execução', tone: 'blue', view: 'tasks' },
        { id: 'urgent', label: 'Prioridades altas', value: urgentTasks.length, detail: 'Itens que exigem coordenação do gestor', tone: 'danger', view: 'tasks' },
        { id: 'stalled', label: 'Carteiras estagnadas', value: stalled.length, detail: 'Oportunidades para redistribuir ou destravar', tone: 'warning', view: 'pipeline' },
        { id: 'no-step', label: 'Sem próxima ação', value: noNextStep.length, detail: 'Cobrar continuidade e qualidade do registro', tone: 'violet', view: 'leads' },
      ],
      seller: [
        { id: 'proposal', label: 'Propostas abertas', value: proposals.length, detail: 'Negócios prontos para follow-up', tone: 'violet', view: 'pipeline', target: 'Proposta' },
        { id: 'closing', label: 'Fechamento em 14 dias', value: closingSoon.length, detail: 'Proteja agenda, decisor e data de retorno', tone: 'warning', view: 'pipeline' },
        { id: 'no-step', label: 'Sem próxima ação', value: noNextStep.length, detail: 'Registre o próximo compromisso da carteira', tone: 'danger', view: 'leads' },
        { id: 'tasks', label: 'Minhas prioridades', value: urgentTasks.length, detail: 'Trabalho de alta prioridade no Flowboard', tone: 'blue', view: 'tasks' },
      ],
      customer: [
        { id: 'clients', label: 'Clientes ativos', value: clients.length, detail: 'Contas conquistadas na seleção', tone: 'blue', view: 'clients' },
        { id: 'handoff', label: 'Passagens em curso', value: clientTasks.length, detail: 'Onboarding e continuidade pós-venda', tone: 'violet', view: 'tasks' },
        { id: 'uncovered', label: 'Clientes sem tarefa', value: clientsWithoutTask.length, detail: 'Contas sem acompanhamento operacional', tone: 'warning', view: 'clients' },
        { id: 'enterprise', label: 'Clientes enterprise', value: enterpriseClients.length, detail: 'Contas estratégicas para expansão', tone: 'green', view: 'clients' },
      ],
    }
    return queues[profile]
  }, [activeTasks.length, coverage, filteredLeads, overdueTasks.length, profile, stalled.length, tasks, urgentTasks.length])
  const comparisonLabel = comparison === 'previous' ? 'vs. período anterior' : 'vs. meta'
  const previousRevenue = series.length > 1 ? series[series.length - 2] : 0
  const revenueDelta = comparison === 'previous'
    ? Math.round(((metrics.revenue - previousRevenue) / Math.max(previousRevenue, 1)) * 100)
    : goal ? Math.round(((metrics.revenue - goal) / goal) * 100) : 0

  return (
    <section className="performance-dashboard">
      <div className="dashboard-control-bar">
        <div>
          <span className="eyebrow">Cockpit comercial</span>
          <h2>Resultados em movimento</h2>
          <p>{dashboardProfiles[profile].description}</p>
        </div>
        <div className="dashboard-control-bar__actions">
          <div className="dashboard-profile-tabs" aria-label="Perspectiva do dashboard">
            {Object.entries(dashboardProfiles).map(([key, item]) => (
              <button key={key} className={profile === key ? 'is-active' : ''} type="button" onClick={() => setProfile(key)} title={item.description}>{item.label}</button>
            ))}
          </div>
          <div className="period-tabs" aria-label="Período do dashboard">
            {Object.entries(periods).map(([key, item]) => (
              <button key={key} className={period === key ? 'is-active' : ''} type="button" onClick={() => setPeriod(key)}>{item.label}</button>
            ))}
          </div>
        </div>
      </div>

      <section className={`dashboard-filters ${filtersOpen ? 'is-open' : ''}`}>
        <header>
          <div><strong>Explorar dados</strong><small>{filteredLeads.length} de {leads.length} oportunidades na análise</small></div>
          <button type="button" onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen}>{filtersOpen ? 'Recolher filtros' : 'Abrir filtros'}</button>
        </header>
        {filtersOpen && (
          <div className="dashboard-filter-bar" aria-label="Filtros do dashboard">
            <label><span>Responsável</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>{filterOptions.owners.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Etapa</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{filterOptions.statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Origem</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>{filterOptions.sources.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Comparar</span><select value={comparison} onChange={(event) => setComparison(event.target.value)}><option value="previous">Período anterior</option><option value="goal">Meta mensal</option></select></label>
            <button type="button" onClick={() => { setOwnerFilter('Todos'); setStatusFilter('Todos'); setSourceFilter('Todos') }}>Limpar filtros</button>
          </div>
        )}
      </section>

      <div className="executive-strip">
        <div className="metric-glow metric-glow--blue"><small>Carteira filtrada</small><strong>{filteredLeads.length}</strong><span>oportunidades na visão</span><b>{Math.round((filteredLeads.length / Math.max(leads.length, 1)) * 100)}%</b></div>
        <div className="metric-glow metric-glow--green"><small>Fechamentos</small><strong>{metrics.won}</strong><span>{formatCurrency(metrics.revenue)}</span><b>{revenueDelta >= 0 ? '+' : ''}{revenueDelta}% {comparisonLabel}</b></div>
        <div className="metric-glow metric-glow--red"><small>Risco aberto</small><strong>{stalled.length}</strong><span>leads quentes parados</span><b>Priorizar</b></div>
        <div className="metric-glow metric-glow--violet"><small>Forecast</small><strong>{formatCurrency(weightedForecast)}</strong><span>{coverage}% de cobertura da meta</span><b>{formatCurrency(metrics.averageTicket)}</b></div>
      </div>

      <div className="dashboard-ops-strip">
        <div><span>Tarefas ativas</span><strong>{activeTasks.length}</strong><small>Em execução ou aguardando</small></div>
        <div><span>Urgentes</span><strong>{urgentTasks.length}</strong><small>Prioridade alta no fluxo</small></div>
        <div><span>Atrasadas</span><strong>{overdueTasks.length}</strong><small>Datas vencidas</small></div>
        <div><span>Melhor canal</span><strong>{bestSource ? bestSource[0] : 'N/A'}</strong><small>Maior tração comercial</small></div>
      </div>

      <section className="decision-center">
        <header>
          <div><span className="eyebrow">Fila de decisão</span><h2>O que precisa acontecer agora</h2></div>
          <span className="decision-center__profile">{dashboardProfiles[profile].label}</span>
        </header>
        <div className="decision-center__grid">
          {decisionQueue.map((item) => (
            <button
              key={item.id}
              className={`decision-card decision-card--${item.tone}`}
              type="button"
              onClick={() => {
                if (item.target) setStatusFilter(item.target)
                onNavigate?.(item.view)
              }}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
              <i>Abrir área →</i>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-briefing">
        <div>
          <span className="eyebrow">Leitura executiva</span>
          <h2>{coverage >= 100 ? 'Meta coberta com margem de execução' : 'Pipeline precisa de aceleração tática'}</h2>
          <p>
            A visão atual combina {filteredLeads.length} oportunidades, {metrics.open} em aberto e {metrics.won} clientes ganhos.
            {bestOwner?.employee?.nome ? ` ${bestOwner.employee.nome} lidera a performance nesta seleção.` : ''}
            {bestSource ? ` O canal ${bestSource[0]} concentra o maior volume de aquisição.` : ''}
          </p>
        </div>
        <div className="briefing-actions">
          <span><strong>{formatCurrency(metrics.pipeline)}</strong><small>Pipeline bruto</small></span>
          <span><strong>{formatCurrency(weightedForecast)}</strong><small>Forecast ponderado</small></span>
          <span><strong>{stalled.length}</strong><small>Alertas comerciais</small></span>
          <span><strong>{urgentTasks.length}</strong><small>Tarefas críticas</small></span>
        </div>
      </section>

      <Suspense fallback={<section className="three-showcase three-showcase--loading"><span>Carregando visão 3D...</span></section>}>
        <ThreeShowcase statusHealth={statusHealth} employees={employees} />
      </Suspense>

      <div className="insight-grid">
        <article className="revenue-panel">
          <header>
            <div><span className="eyebrow">Receita projetada</span><h2>{formatCurrency(series[Math.min(selectedPoint, series.length - 1)])}</h2><p>Receita ganha registrada no período selecionado</p></div>
            <span className="live-pill"><i /> Ao vivo</span>
          </header>
          <AreaChart values={series} labels={chartLabels} selectedIndex={Math.min(selectedPoint, series.length - 1)} onSelect={setSelectedPoint} />
        </article>

        <article className="goal-panel">
          <div className="goal-orbit" style={{ '--progress': `${goalProgress * 3.6}deg` }}>
            <div><strong>{goalProgress}%</strong><small>da meta</small></div>
          </div>
          <div className="goal-copy">
            <span className="eyebrow">Meta {goalConfig.period}</span>
            <h2>{formatCurrency(goal)}</h2>
            <p>Faltam {formatCurrency(Math.max(0, goal - metrics.revenue))} para completar.</p>
            <label className="goal-config-field">
              <span>Ajustar meta</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={goal}
                onChange={(event) => onGoalConfigChange?.({ ...goalConfig, periodGoal: Number(event.target.value || 0) })}
              />
            </label>
          </div>
          <div className="goal-confetti" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </article>

        <article className="conversion-panel">
          <header><span className="eyebrow">Conversão</span><strong>{conversion}%</strong></header>
          <div className="conversion-visual">
            <div className="conversion-ring" style={{ '--conversion': `${conversion * 3.6}deg` }}><span>{metrics.won}<small>ganhos</small></span></div>
            <div className="conversion-legend"><span><i className="won-dot" />Ganhos</span><span><i className="lost-dot" />Perdas</span></div>
          </div>
        </article>

        <article className="sources-panel">
          <header><span className="eyebrow">Aquisição</span><h2>Origem dos leads</h2></header>
          <div className="source-bars">
            {sourceData.map(([source, count], index) => (
              <div key={source}><span>{source}</span><div><i style={{ width: `${Math.max(16, (count / Math.max(filteredLeads.length, 1)) * 100)}%`, '--delay': `${index * 90}ms` }} /></div><strong>{count}</strong></div>
            ))}
          </div>
        </article>
      </div>

      <div className="dashboard-deep-grid">
        <article className="stage-health-panel">
          <header><div><span className="eyebrow">Funil completo</span><h2>Saúde por etapa</h2></div><span>{formatCurrency(metrics.pipeline + metrics.revenue)}</span></header>
          <div className="stage-health-list">
            {statusHealth.map((item) => (
              <button key={item.status} type="button" className={statusFilter === item.status ? 'is-active' : ''} onClick={() => setStatusFilter(item.status)}>
                <span>{item.status}</span>
                <div><i style={{ width: `${Math.max(6, (item.count / Math.max(filteredLeads.length, 1)) * 100)}%` }} /></div>
                <strong>{item.count}</strong>
                <small>{formatCurrency(item.value)}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="segment-panel">
          <header><span className="eyebrow">Tamanho de empresa</span><h2>PME a enterprise</h2></header>
          <div className="segment-rings">
            {segmentData.map((segment) => (
              <button key={segment.label} type="button" onClick={() => setSourceFilter('Todos')}>
                <span>{segment.label}</span>
                <i style={{ '--segment': `${Math.min(360, (segment.value / Math.max(metrics.pipeline + metrics.revenue, 1)) * 360)}deg` }}><b>{segment.count}</b></i>
                <strong>{formatCurrency(segment.value)}</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="playbook-panel">
          <header><span className="eyebrow">Próximas ações</span><h2>Plano de ataque</h2></header>
          <div className="playbook-list">
            <div><b>01</b><span><strong>Propostas</strong><small>Blindar retorno de decisores e criar data de fechamento.</small></span></div>
            <div><b>02</b><span><strong>Leads parados</strong><small>Reativar oportunidades acima de R$ 10 mil em contato inicial.</small></span></div>
            <div><b>03</b><span><strong>Canais fortes</strong><small>Duplicar campanha nos canais com maior ticket médio.</small></span></div>
          </div>
        </article>

        <article className="loss-reasons-panel">
          <header><span className="eyebrow">Aprendizado comercial</span><h2>Motivos de perda</h2></header>
          {lostReasons.length ? (
            <div className="loss-reasons-list">
              {lostReasons.map(([reason, count]) => (
                <div key={reason}><span>{reason}</span><strong>{count}</strong></div>
              ))}
            </div>
          ) : (
            <p>Nenhuma perda na seleção atual. Amplie o período ou remova filtros.</p>
          )}
        </article>
      </div>

      <div className="performance-grid">
        <article className="result-chart">
          <header><div><span className="eyebrow">Resultado comercial</span><h2>Fluxo de oportunidades</h2></div><span className="live-pill"><i /> Atualizado</span></header>
          <div className="funnel-bars">
            {[
              ['Entradas', filteredLeads.length, '#4e6fe0'],
              ['Contato', filteredLeads.filter((lead) => lead.status !== 'Novo Lead').length, '#7961d5'],
              ['Propostas', filteredLeads.filter((lead) => ['Proposta', 'Fechado'].includes(lead.status)).length, '#e1a442'],
              ['Ganhos', metrics.won, '#36b789'],
            ].map(([label, value, color]) => (
              <div key={label}><span>{label}</span><div><i style={{ width: `${Math.max(12, (value / Math.max(filteredLeads.length, 1)) * 100)}%`, background: color }} /></div><strong>{value}</strong></div>
            ))}
          </div>
        </article>

        <article className="team-ranking">
          <header>
            <div><span className="eyebrow">{employees.length} profissionais</span><h2>Desempenho da equipe</h2></div>
            <div className="ranking-toggle"><button className={rankingMode === 'score' ? 'is-active' : ''} onClick={() => setRankingMode('score')}>Score</button><button className={rankingMode === 'value' ? 'is-active' : ''} onClick={() => setRankingMode('value')}>Receita</button></div>
          </header>
          <div>
            {performance.map((item, index) => (
              <article key={item.employee.id}>
                <span className={`rank-position rank-position--${index + 1}`}>{index + 1}</span>
                <PixelAvatar avatar={item.employee.avatar} size={38} animated={index < 3} />
                <div className="rank-copy"><strong>{item.employee.nome}</strong><small>{item.employee.cargo}</small><span><i style={{ width: `${rankingMode === 'value' ? Math.max(8, (item.value / Math.max(performance[0].value, 1)) * 100) : item.score}%` }} /></span></div>
                <div className="rank-result"><strong>{rankingMode === 'value' ? formatCurrency(item.value) : item.score}</strong><small>{item.deals} negócios ganhos</small></div>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
