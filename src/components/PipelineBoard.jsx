import { useMemo, useState } from 'react'
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

function findEmployeeByName(employees, name) {
  return employees.find((employee) => employee.nome === name) || employees[0]
}

export default function PipelineBoard({ leads, employees = [], tasks = [], onEdit, onDelete, onStatusChange }) {
  const [selectedStage, setSelectedStage] = useState('Todos')
  const stageTotals = useMemo(() => PIPELINE_STATUSES.map((status) => {
    const items = leads.filter((lead) => lead.status === status)
    const value = items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
    return { status, count: items.length, value }
  }), [leads])
  const selectedLeads = selectedStage === 'Todos' ? leads : leads.filter((lead) => lead.status === selectedStage)
  const selectedValue = selectedLeads.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)

  return (
    <div className="pipeline-board">
      <div className="pipeline-dash">
        <button className={selectedStage === 'Todos' ? 'is-active' : ''} type="button" onClick={() => setSelectedStage('Todos')}>
          <span>Visão total</span>
          <strong>{leads.length}</strong>
          <small>{formatCurrency(leads.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0))}</small>
        </button>
        {stageTotals.map((stage) => (
          <button key={stage.status} className={selectedStage === stage.status ? 'is-active' : ''} type="button" onClick={() => setSelectedStage(stage.status)}>
            <span>{stage.status}</span>
            <strong>{stage.count}</strong>
            <small>{formatCurrency(stage.value)}</small>
          </button>
        ))}
      </div>

      <section className="pipeline-spotlight">
        <div>
          <span className="eyebrow">Destaque da etapa</span>
          <h3>{selectedStage === 'Todos' ? 'Pipeline completo' : selectedStage}</h3>
          <p>
            {selectedLeads.length} oportunidades selecionadas, com {formatCurrency(selectedValue)} em valor estimado.
          </p>
          <div className="pipeline-spotlight__stats">
            <span><strong>{leads.length}</strong><small>Total</small></span>
            <span><strong>{selectedLeads.length}</strong><small>Selecionados</small></span>
            <span><strong>{formatCurrency(selectedValue)}</strong><small>Valor</small></span>
          </div>
        </div>
      </section>

      <div className="pipeline-columns">
        {PIPELINE_STATUSES.map((status) => {
          const columnLeads = leads.filter((lead) => lead.status === status)
          const columnValue = columnLeads.reduce(
            (total, lead) => total + Number(lead.valorEstimado || 0),
            0,
          )

          return (
            <section className={`pipeline-column ${selectedStage === status ? 'is-active' : ''}`} key={status}>
              <button className="pipeline-column__header" type="button" onClick={() => setSelectedStage(status)}>
                <div>
                  <span className={`column-dot column-dot--${columnTone[status]}`} />
                  <strong>{status}</strong>
                  <span className="pipeline-count">{columnLeads.length}</span>
                </div>
                <small>{formatCurrency(columnValue)}</small>
              </button>
              <div className="pipeline-column__body">
                {columnLeads.length ? (
                  columnLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      owner={findEmployeeByName(employees, lead.responsavel)}
                      tasks={tasks}
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
    </div>
  )
}
