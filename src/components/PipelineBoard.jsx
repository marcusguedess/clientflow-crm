import { useMemo, useState } from 'react'
import { PIPELINE_STATUSES } from '../data/seedData'
import { formatCurrency } from '../utils/formatCurrency'
import { buildPipelineViewModel, filterPipelineItems, getPipelineFilterOptions } from '../utils/pipelineViewModel'
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

export default function PipelineBoard({ leads, employees = [], tasks = [], crmData = null, onEdit, onDelete, onStatusChange }) {
  const [selectedStage, setSelectedStage] = useState('Todos')
  const [ownerFilter, setOwnerFilter] = useState('Todos')
  const [riskFilter, setRiskFilter] = useState('Todos')
  const [segmentFilter, setSegmentFilter] = useState('Todos')
  const [originFilter, setOriginFilter] = useState('Todos')
  const pipelineModel = useMemo(() =>
    buildPipelineViewModel({ leads, tasks, employees, crmData }),
  [crmData, employees, leads, tasks])
  const filterOptions = useMemo(() => getPipelineFilterOptions(pipelineModel.items), [pipelineModel.items])
  const pipelineItems = useMemo(() => filterPipelineItems(pipelineModel.items, {
    owner: ownerFilter,
    stage: selectedStage,
    risk: riskFilter,
    segment: segmentFilter,
    origin: originFilter,
  }), [originFilter, ownerFilter, pipelineModel.items, riskFilter, segmentFilter, selectedStage])
  const stageTotals = useMemo(() => PIPELINE_STATUSES.map((status) => {
    const items = pipelineModel.items.filter((lead) => lead.status === status)
    const value = items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
    return { status, count: items.length, value }
  }), [pipelineModel.items])
  const selectedValue = pipelineItems.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
  const totalValue = pipelineModel.items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
  const filteredLabel = pipelineModel.source === 'crm' ? 'Deals reais' : 'Fallback legado'

  return (
    <div className="pipeline-board">
      <div className="pipeline-source">
        <span>{filteredLabel}</span>
        <small>{pipelineItems.length} de {pipelineModel.items.length} oportunidades na visão atual</small>
      </div>

      <div className="pipeline-filters" aria-label="Filtros do Pipeline">
        <label>
          <span>Responsável</span>
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            {filterOptions.owners.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Risco</span>
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
            {filterOptions.risks.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Segmento</span>
          <select value={segmentFilter} onChange={(event) => setSegmentFilter(event.target.value)}>
            {filterOptions.segments.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        {filterOptions.origins.length > 1 && (
          <label>
            <span>Origem</span>
            <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)}>
              {filterOptions.origins.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="pipeline-dash">
        <button className={selectedStage === 'Todos' ? 'is-active' : ''} type="button" onClick={() => setSelectedStage('Todos')}>
          <span>Visão total</span>
          <strong>{pipelineModel.items.length}</strong>
          <small>{formatCurrency(totalValue)}</small>
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
            {pipelineItems.length} oportunidades selecionadas, com {formatCurrency(selectedValue)} em valor estimado.
          </p>
          <div className="pipeline-spotlight__stats">
            <span><strong>{pipelineModel.items.length}</strong><small>Total</small></span>
            <span><strong>{pipelineItems.length}</strong><small>Selecionados</small></span>
            <span><strong>{formatCurrency(selectedValue)}</strong><small>Valor</small></span>
          </div>
        </div>
      </section>

      <div className="pipeline-columns">
        {PIPELINE_STATUSES.map((status) => {
          const columnLeads = pipelineItems.filter((lead) => lead.status === status)
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
