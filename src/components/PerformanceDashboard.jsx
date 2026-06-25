import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'

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

export default function PerformanceDashboard({ leads, employees }) {
  const [period, setPeriod] = useState('30d')
  const [selectedPoint, setSelectedPoint] = useState(6)
  const [rankingMode, setRankingMode] = useState('score')

  const metrics = useMemo(() => {
    const won = leads.filter((lead) => lead.status === 'Fechado')
    const lost = leads.filter((lead) => lead.status === 'Perdido')
    const newLeads = leads.filter((lead) => lead.status === 'Novo Lead')
    const revenue = won.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const pipeline = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status)).reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    return { won: won.length, lost: lost.length, newLeads: newLeads.length, revenue, pipeline }
  }, [leads])

  const sourceData = useMemo(() => {
    const counts = leads.reduce((result, lead) => ({ ...result, [lead.origem || 'Outros']: (result[lead.origem || 'Outros'] || 0) + 1 }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [leads])

  const performance = useMemo(() => employees.map((employee, index) => {
    const owned = leads.filter((lead) => lead.responsavel === employee.nome)
    const closed = owned.filter((lead) => lead.status === 'Fechado')
    const value = closed.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    const score = Math.min(100, Math.max(18, closed.length * 32 + owned.length * 8 + (10 - index) * 2))
    return { employee, score, deals: closed.length, value }
  }).sort((a, b) => rankingMode === 'value' ? b.value - a.value : b.score - a.score), [employees, leads, rankingMode])

  const series = buildSeries(Math.max(metrics.revenue, 18000), periods[period].factor)
  const goal = 50000
  const goalProgress = Math.min(100, Math.round((metrics.revenue / goal) * 100))
  const conversion = metrics.won + metrics.lost ? Math.round((metrics.won / (metrics.won + metrics.lost)) * 100) : 0

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

      <div className="executive-strip">
        <div className="metric-glow metric-glow--blue"><small>Entradas</small><strong>{metrics.newLeads}</strong><span>novos leads</span><b>↗ 12%</b></div>
        <div className="metric-glow metric-glow--green"><small>Fechamentos</small><strong>{metrics.won}</strong><span>clientes ganhos</span><b>↗ 8%</b></div>
        <div className="metric-glow metric-glow--red"><small>Perdas</small><strong>{metrics.lost}</strong><span>oportunidades</span><b>↘ 3%</b></div>
        <div className="metric-glow metric-glow--violet"><small>Pipeline</small><strong>{formatCurrency(metrics.pipeline)}</strong><span>potencial em aberto</span><b>↗ 18%</b></div>
      </div>

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
              <div key={source}><span>{source}</span><div><i style={{ width: `${Math.max(16, (count / Math.max(leads.length, 1)) * 100)}%`, '--delay': `${index * 90}ms` }} /></div><strong>{count}</strong></div>
            ))}
          </div>
        </article>
      </div>

      <div className="performance-grid">
        <article className="result-chart">
          <header><div><span className="eyebrow">Resultado comercial</span><h2>Fluxo de oportunidades</h2></div><span className="live-pill"><i /> Atualizado</span></header>
          <div className="funnel-bars">
            {[
              ['Entradas', leads.length, '#4e6fe0'],
              ['Contato', leads.filter((lead) => lead.status !== 'Novo Lead').length, '#7961d5'],
              ['Propostas', leads.filter((lead) => ['Proposta', 'Fechado'].includes(lead.status)).length, '#e1a442'],
              ['Ganhos', metrics.won, '#36b789'],
            ].map(([label, value, color]) => (
              <div key={label}><span>{label}</span><div><i style={{ width: `${Math.max(12, (value / Math.max(leads.length, 1)) * 100)}%`, background: color }} /></div><strong>{value}</strong></div>
            ))}
          </div>
        </article>

        <article className="team-ranking">
          <header>
            <div><span className="eyebrow">10 profissionais</span><h2>Desempenho da equipe</h2></div>
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
