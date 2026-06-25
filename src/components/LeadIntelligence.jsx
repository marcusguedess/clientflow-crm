import { PIPELINE_STATUSES } from '../data/seedData'
import { formatCurrency } from '../utils/formatCurrency'

const colors = {
  'Novo Lead': '#5577df',
  'Contato Feito': '#7863d5',
  Reunião: '#ee9951',
  Proposta: '#dfaa3f',
  Fechado: '#36b789',
  Perdido: '#e45e70',
}

export default function LeadIntelligence({ leads, activeStatus, onSelectStatus }) {
  const totalValue = leads.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
  const averageTicket = leads.length ? totalValue / leads.length : 0
  const hottest = [...leads].filter((lead) => !['Fechado', 'Perdido'].includes(lead.status)).sort((a, b) => b.valorEstimado - a.valorEstimado)[0]

  return (
    <section className="lead-intelligence">
      <div className="lead-intelligence__intro">
        <span className="eyebrow">Radar comercial</span>
        <h2>Inteligência da carteira</h2>
        <p>Clique em uma etapa para filtrar a base e investigar o momento do funil.</p>
      </div>
      <div className="lead-intelligence__metrics">
        <div><small>Ticket médio</small><strong>{formatCurrency(averageTicket)}</strong></div>
        <div><small>Maior oportunidade</small><strong>{hottest ? formatCurrency(hottest.valorEstimado) : '—'}</strong><span>{hottest?.empresa || 'Sem oportunidade'}</span></div>
      </div>
      <div className="status-radar">
        {PIPELINE_STATUSES.map((status) => {
          const count = leads.filter((lead) => lead.status === status).length
          return (
            <button
              key={status}
              className={activeStatus === status ? 'is-active' : ''}
              onClick={() => onSelectStatus(activeStatus === status ? 'Todos' : status)}
              style={{ '--status-color': colors[status], '--status-size': `${Math.max(34, 34 + count * 8)}px` }}
            >
              <i />
              <strong>{count}</strong>
              <span>{status}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
