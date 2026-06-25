import { lazy, Suspense, useMemo, useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'

const ThreeShowcase = lazy(() => import('./ThreeShowcase'))

const periods = {
  '7d': { label: '7 dias', factor: 0.72 },
  '30d': { label: '30 dias', factor: 1 },
  '90d': { label: '90 dias', factor: 1.34 },
}

const chartLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje']

function buildSeries(base, factor) {
  const multipliers = [0.42, 0.58, 0.51, 0.76, 0.68, 0.87, 1]
  return multipliers.map((item, index) => Math.max(1, Math.round((base + index * 3400) * item * factor)))
}

function AreaChart({ values, selectedIndex, onSelect }) {
  const width = 620
  const height = 210
  const padding = 26
  const max = Math.max(...values, 1)
  const points = values.map((value, index) => ({
    x: padding + index * ((width - padding * 2) / (values.length - 1)),
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
            key={chartLabels[index]}
            className={`chart-point ${selectedIndex === index ? 'is-selected' : ''}`}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelect(index)
            }}
            role="button"
            tabIndex="0"
          >
            <circle cx={point.x} cy={point.y} r={selectedIndex === index ? 8 : 5} />
            <text x={point.x} y={height - 5} textAnchor="middle">{chartLabels[index]}</text>
          </g>
        ))}
      </svg>
      <div className="chart-tooltip" style={{ left: `${(points[selectedIndex].x / width) * 100}%`, top: `${(points[selectedIndex].y / height) * 100}%` }}>
        <small>{chartLabels[selectedIndex]}</small>
        <strong>{formatCurrency(points[selectedIndex].value)}</strong>
      </div>
    </div>
  )
}

export default function PerformanceDashboard({ leads, employees, tasks = [] }) {
  const [period, setPeriod] = useState('30d')
  const [selectedPoint, setSelectedPoint] = useState(6)
  const [rankingMode, setRankingMode] = useState('score')
  const [ownerFilter, setOwnerFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [sourceFilter, setSourceFilter] = useState('Todos')

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

  const sourceData = useMemo(() => {
    const counts = filteredLeads.reduce((result, lead) => ({ ...result, [lead.origem || 'Outros']: (result[lead.origem || 'Outros'] || 0) + 1 }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredLeads])

  const performance = useMemo(() => employees.map((employee, index) => {
    const owned = filteredLeads.filter((lead) => lead.responsavel === employee.nome)
    const closed = owned.filter((lead) => lead.status === 'Fechado')
    const value = closed.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const score = Math.min(100, Math.max(18, closed.length * 32 + owned.length * 8 + (12 - index) * 2))
    return { employee, score, deals: closed.length, value }
  }).sort((a, b) => rankingMode === 'value' ? b.value - a.value : b.score - a.score), [employees, filteredLeads, rankingMode])

  const statusHealth = useMemo(() => {
    const stages = ['Novo Lead', 'Contato Feito', 'Reunião', 'Proposta', 'Fechado', 'Perdido']
    return stages.map((status) => {
      const items = filteredLeads.filter((lead) => lead.status === status)
      const value = items.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
      return { status, count: items.length, value }
    })
  }, [filteredLeads])

  const segmentData = useMemo(() => {
    const segments = [
      ['Pequenas', 0, 20000],
      ['Médias', 20000, 60000],
      ['Grandes', 60000, Infinity],
    ]
    return segments.map(([label, min, max]) => {
      const items = filteredLeads.filter((lead) => lead.valorEstimado >= min && lead.valorEstimado < max)
      const value = items.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
      return { label, count: items.length, value }
    })
  }, [filteredLeads])

  const series = buildSeries(Math.max(metrics.revenue, 18000), periods[period].factor)
  const goal = 250000
  const goalProgress = Math.min(100, Math.round((metrics.revenue / goal) * 100))
  const conversion = metrics.won + metrics.lost ? Math.round((metrics.won / (metrics.won + metrics.lost)) * 100) : 0
  const weightedForecast = Math.round(
    statusHealth.reduce((sum, item) => {
      const weight = { 'Novo Lead': 0.12, 'Contato Feito': 0.25, Reunião: 0.45, Proposta: 0.72, Fechado: 1, Perdido: 0 }[item.status] || 0
      return sum + item.value * weight
    }, 0),
  )
  const coverage = goal ? Math.round(((metrics.pipeline + metrics.revenue) / goal) * 100) : 0
  const stalled = filteredLeads.filter((lead) => ['Novo Lead', 'Contato Feito'].includes(lead.status) && Number(lead.valorEstimado || 0) >= 10000)
  const bestOwner = performance[0]
  const bestSource = sourceData[0]
  const overdueTasks = tasks.filter((task) => task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date())
  const urgentTasks = tasks.filter((task) => task.priority === 'Alta')
  const activeTasks = tasks.filter((task) => ['Planejado', 'Em andamento', 'Aguardando'].includes(task.status))

  return (
    <section className="performance-dashboard">
      <div className="dashboard-control-bar">
        <div>
          <span className="eyebrow">Cockpit comercial</span>
          <h2>Resultados em movimento</h2>
        </div>
        <div className="period-tabs" aria-label="Período do dashboard">
          {Object.entries(periods).map(([key, item]) => (
            <button key={key} className={period === key ? 'is-active' : ''} onClick={() => setPeriod(key)}>{item.label}</button>
          ))}
        </div>
      </div>

      <div className="dashboard-filter-bar" aria-label="Filtros do dashboard">
        <label><span>Responsável</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>{filterOptions.owners.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Etapa</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{filterOptions.statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Origem</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>{filterOptions.sources.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={() => { setOwnerFilter('Todos'); setStatusFilter('Todos'); setSourceFilter('Todos') }}>Limpar filtros</button>
      </div>

      <div className="executive-strip">
        <div className="metric-glow metric-glow--blue"><small>Carteira filtrada</small><strong>{filteredLeads.length}</strong><span>oportunidades na visão</span><b>{Math.round((filteredLeads.length / Math.max(leads.length, 1)) * 100)}%</b></div>
        <div className="metric-glow metric-glow--green"><small>Fechamentos</small><strong>{metrics.won}</strong><span>{formatCurrency(metrics.revenue)}</span><b>{conversion}% conv.</b></div>
        <div className="metric-glow metric-glow--red"><small>Risco aberto</small><strong>{stalled.length}</strong><span>leads quentes parados</span><b>Priorizar</b></div>
        <div className="metric-glow metric-glow--violet"><small>Forecast</small><strong>{formatCurrency(weightedForecast)}</strong><span>{coverage}% de cobertura da meta</span><b>{formatCurrency(metrics.averageTicket)}</b></div>
      </div>

      <div className="dashboard-ops-strip">
        <div><span>Tarefas ativas</span><strong>{activeTasks.length}</strong><small>Em execução ou aguardando</small></div>
        <div><span>Urgentes</span><strong>{urgentTasks.length}</strong><small>Prioridade alta no fluxo</small></div>
        <div><span>Atrasadas</span><strong>{overdueTasks.length}</strong><small>Datas vencidas</small></div>
        <div><span>Melhor canal</span><strong>{bestSource ? bestSource[0] : 'N/A'}</strong><small>Maior tração comercial</small></div>
      </div>

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
            <div><span className="eyebrow">Receita projetada</span><h2>{formatCurrency(series[selectedPoint])}</h2><p>Projeção do período selecionado</p></div>
            <span className="live-pill"><i /> Ao vivo</span>
          </header>
          <AreaChart values={series} selectedIndex={selectedPoint} onSelect={setSelectedPoint} />
        </article>

        <article className="goal-panel">
          <div className="goal-orbit" style={{ '--progress': `${goalProgress * 3.6}deg` }}>
            <div><strong>{goalProgress}%</strong><small>da meta</small></div>
          </div>
          <div className="goal-copy"><span className="eyebrow">Meta mensal</span><h2>{formatCurrency(goal)}</h2><p>Faltam {formatCurrency(Math.max(0, goal - metrics.revenue))} para completar.</p></div>
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
