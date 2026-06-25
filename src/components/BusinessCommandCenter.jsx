import { buildBusinessAlerts, getWeightedForecast } from '../utils/businessInsights'
import { formatCurrency } from '../utils/formatCurrency'

export default function BusinessCommandCenter({ leads, tasks }) {
  const alerts = buildBusinessAlerts(leads, tasks)
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const wonRevenue = leads
    .filter((lead) => lead.status === 'Fechado')
    .reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
  const weightedForecast = getWeightedForecast(leads)
  const enterpriseOpen = openLeads.filter((lead) => lead.segmento === 'Enterprise')

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
    </section>
  )
}
