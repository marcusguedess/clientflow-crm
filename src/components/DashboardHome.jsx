import BusinessCommandCenter from './BusinessCommandCenter'
import PixelAvatar from './PixelAvatar'
import StatCard from './StatCard'
import { formatCurrency } from '../utils/formatCurrency'

function MetricIcon({ type }) {
  const paths = {
    leads: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.8M17 15c2.3.4 4 2.4 4 5" /></>,
    value: <><path d="M12 2v20M17 6.5c0-1.4-2.2-2.5-5-2.5S7 5.1 7 6.5 9.2 9 12 9s5 1.1 5 2.5S14.8 14 12 14s-5 1.1-5 2.5S9.2 19 12 19s5-1.1 5-2.5" /></>,
    won: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    rate: <><path d="M4 19 19 4M7.5 5.5h.01M16.5 17.5h.01" /><circle cx="7.5" cy="5.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /></>,
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

function DestinationIcon({ type }) {
  const paths = {
    pipeline: <><path d="M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v11h-4z" /></>,
    messenger: <><path d="M5 18.5 3 21l.7-4A8 8 0 1 1 5 18.5Z" /><path d="M8 10h8M8 14h5" /></>,
    city: <><path d="M3 21V8l6-3v16M9 21V3l7 3v15M16 21v-9l5-2v11" /><path d="M6 11h1M12 8h1M19 14h.1" /></>,
    cockpit: <><path d="M4 18V9M10 18V5M16 18v-7M3 20h18" /><circle cx="19" cy="6" r="2" /></>,
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

export default function DashboardHome({
  stats,
  leads,
  tasks,
  employees,
  currentEmployee,
  onNavigate,
  onEditLead,
}) {
  const activeEmployees = employees.filter((employee) => employee.status !== 'offline')
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const recentLeads = openLeads.slice(0, 4)
  const urgentTasks = tasks.filter((task) => task.priority === 'Alta' && task.status !== 'Concluído').length

  return (
    <div className="dashboard-home">
      <section className="home-welcome">
        <div className="home-welcome__copy">
          <span className="eyebrow">Flow do dia</span>
          <h2>Bom trabalho, {currentEmployee.nome.split(' ')[0]}.</h2>
          <p>Negócios, pessoas e a cidade avançam no mesmo ritmo. Escolha onde quer entrar.</p>
          <div className="home-welcome__actions">
            <button className="button button--primary" type="button" onClick={() => onNavigate('pipeline')}>
              Abrir pipeline
            </button>
            <button className="button home-city-button" type="button" onClick={() => onNavigate('city')}>
              Entrar na cidade
            </button>
          </div>
        </div>
        <div className="home-presence" aria-label={`${activeEmployees.length} pessoas online`}>
          <div className="home-presence__avatars">
            {activeEmployees.slice(0, 6).map((employee) => (
              <PixelAvatar key={employee.id} avatar={employee.avatar} size={48} animated />
            ))}
          </div>
          <strong>{activeEmployees.length} pessoas em movimento</strong>
          <span>{urgentTasks} prioridades altas pedem atenção hoje.</span>
        </div>
      </section>

      <section className="stats-grid home-stats" aria-label="Métricas do CRM">
        <StatCard label="Oportunidades" value={stats.total} detail="na carteira comercial" tone="blue" icon={<MetricIcon type="leads" />} />
        <StatCard label="Em negociação" value={formatCurrency(stats.valorNegociacao)} detail="pipeline em aberto" tone="violet" icon={<MetricIcon type="value" />} />
        <StatCard label="Negócios ganhos" value={stats.ganhos} detail="clientes conquistados" tone="green" icon={<MetricIcon type="won" />} />
        <StatCard label="Conversão" value={`${stats.conversao}%`} detail="entre negócios concluídos" tone="orange" icon={<MetricIcon type="rate" />} />
      </section>

      <section className="home-destinations" aria-label="Áreas principais">
        <button type="button" onClick={() => onNavigate('pipeline')}>
          <DestinationIcon type="pipeline" />
          <span><strong>Trabalho comercial</strong><small>{openLeads.length} oportunidades abertas</small></span>
          <i aria-hidden="true">→</i>
        </button>
        <button type="button" onClick={() => onNavigate('messenger')}>
          <DestinationIcon type="messenger" />
          <span><strong>Flow Chat</strong><small>Diretas, grupos e setores</small></span>
          <i aria-hidden="true">→</i>
        </button>
        <button className="home-destination--city" type="button" onClick={() => onNavigate('city')}>
          <DestinationIcon type="city" />
          <span><strong>ClientFlow City</strong><small>Presença, encontros e interação</small></span>
          <i aria-hidden="true">→</i>
        </button>
        <button type="button" onClick={() => onNavigate('performance')}>
          <DestinationIcon type="cockpit" />
          <span><strong>Cockpit & 3D</strong><small>Forecast e leitura holográfica</small></span>
          <i aria-hidden="true">→</i>
        </button>
      </section>

      <BusinessCommandCenter leads={leads} tasks={tasks} onNavigate={onNavigate} />

      <section className="home-opportunities">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Foco comercial</span>
            <h2>Oportunidades que pedem movimento</h2>
          </div>
          <button className="button button--text" type="button" onClick={() => onNavigate('leads')}>Ver carteira completa</button>
        </div>
        <div className="home-opportunity-list">
          {recentLeads.map((lead) => {
            const owner = employees.find((employee) => employee.nome === lead.responsavel) || employees[0]
            return (
              <button key={lead.id} type="button" onClick={() => onEditLead(lead)}>
                <PixelAvatar avatar={owner.avatar} size={40} />
                <span>
                  <strong>{lead.empresa}</strong>
                  <small>{lead.nome} · {lead.status}</small>
                </span>
                <b>{formatCurrency(lead.valorEstimado)}</b>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
