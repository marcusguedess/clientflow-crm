import { buildBusinessAlerts, buildPipelineMetrics, DEFAULT_GOAL_CONFIG } from '../domain/metrics'
import { formatCurrency } from '../utils/formatCurrency'

export default function BusinessCommandCenter({ leads, tasks, goalConfig = DEFAULT_GOAL_CONFIG, onNavigate }) {
  const alerts = buildBusinessAlerts(leads, tasks)
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const metrics = buildPipelineMetrics(leads, tasks, goalConfig)
  const wonRevenue = metrics.wonRevenue
  const weightedForecast = metrics.weightedForecast
  const enterpriseOpen = openLeads.filter((lead) => lead.segmento === 'Enterprise')
  const coverage = metrics.goalCoverage
  const forecastProgress = Math.min(100, metrics.forecastCoverage)
  const atRiskValue = metrics.atRiskValue
  const scenarioValues = [
    { label: 'Conservador', value: wonRevenue + weightedForecast * 0.72 },
    { label: 'Base', value: wonRevenue + weightedForecast },
    { label: 'Agressivo', value: wonRevenue + weightedForecast * 1.28 },
  ]
  const urgentAlert = [...alerts].sort((a, b) => Number(b.value) - Number(a.value))[0]

  return (
    <section className="business-command-center">
      <div className="command-summary">
        <div>
          <span className="eyebrow">Gestão empresarial</span>
          <h2>Comando operacional</h2>
          <p>Alertas conectando vendas, execução e carteira para a reunião diária.</p>
        </div>
        <div className="command-kpis">
          <span><small>Receita ganha</small><strong>{formatCurrency(wonRevenue)}</strong></span>
          <span><small>Forecast ponderado</small><strong>{formatCurrency(weightedForecast)}</strong></span>
          <span><small>Enterprise abertos</small><strong>{enterpriseOpen.length}</strong></span>
        </div>
      </div>
      <div className="command-alerts">
        {alerts.map((alert) => (
          <article className={`command-alert command-alert--${alert.tone}`} key={alert.id}>
            <strong>{alert.value}</strong>
            <span>{alert.label}</span>
            <small>{alert.detail}</small>
          </article>
        ))}
      </div>
      <div className="command-executive-read">
        <article className="command-coverage">
          <header>
            <div>
              <span className="eyebrow">Cobertura da meta</span>
              <strong>{coverage}%</strong>
            </div>
            <small>{formatCurrency(wonRevenue + metrics.openPipeline)} sobre {formatCurrency(metrics.goal)}</small>
          </header>
          <div className="command-coverage__track">
            <i style={{ width: `${Math.min(100, coverage)}%` }} />
            <span style={{ left: `${forecastProgress}%` }} title="Receita ganha + forecast ponderado" />
          </div>
          <footer>
            <span>Forecast realizável: {forecastProgress}%</span>
            <span>Valor em risco: {formatCurrency(atRiskValue)}</span>
          </footer>
        </article>
        <article className="command-scenarios">
          <span className="eyebrow">Cenários do período</span>
          {scenarioValues.map((scenario) => (
            <div key={scenario.label}>
              <span>{scenario.label}</span>
              <strong>{formatCurrency(scenario.value)}</strong>
            </div>
          ))}
        </article>
        <article className="command-decision">
          <span className="eyebrow">Decisão sugerida</span>
          <strong>{urgentAlert?.label || 'Operação estável'}</strong>
          <p>{urgentAlert?.detail || 'Nenhum risco crítico identificado agora.'}</p>
          <div>
            <button type="button" onClick={() => onNavigate?.('pipeline')}>Revisar pipeline</button>
            <button type="button" onClick={() => onNavigate?.('tasks')}>Abrir prioridades</button>
          </div>
        </article>
      </div>
    </section>
  )
}
