import { PIPELINE_STATUSES } from '../data/seedData'
import { formatCurrency } from '../utils/formatCurrency'
import LeadCard from './LeadCard'

const columnTone = {
  'Novo Lead': 'new',
  'Contato Feito': 'contacted',
  Reunião: 'meeting',
  Proposta: 'proposal',
  Fechado: 'won',
  Perdido: 'lost',
}

export default function PipelineBoard({ leads, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="pipeline-board">
      {PIPELINE_STATUSES.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status)
        const columnValue = columnLeads.reduce(
          (total, lead) => total + Number(lead.valorEstimado || 0),
          0,
        )

        return (
          <section className="pipeline-column" key={status}>
            <div className="pipeline-column__header">
              <div>
                <span className={`column-dot column-dot--${columnTone[status]}`} />
                <strong>{status}</strong>
                <span className="pipeline-count">{columnLeads.length}</span>
              </div>
              <small>{formatCurrency(columnValue)}</small>
            </div>
            <div className="pipeline-column__body">
              {columnLeads.length ? (
                columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    compact
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div className="empty-column">Nenhum lead nesta etapa</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
