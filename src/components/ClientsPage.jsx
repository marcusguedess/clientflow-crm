import { useEffect, useMemo, useState } from 'react'
import { buildCommercialModel } from '../utils/commercialModel'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'
import StatusBadge from './StatusBadge'

function findEmployeeByName(employees, name) {
  return employees.find((employee) => employee.nome === name) || employees[0]
}

export default function ClientsPage({ leads, employees = [], tasks = [], activities = [], crmData = null, onEdit }) {
  const model = useMemo(() => buildCommercialModel(leads, tasks, activities, employees, crmData), [activities, crmData, employees, leads, tasks])
  const clients = model.accounts.filter((account) => account.wonDeals.length)
  const [selectedId, setSelectedId] = useState(clients[0]?.id || '')
  const selected = clients.find((client) => client.id === selectedId) || clients[0] || null
  const selectedOwner = selected ? findEmployeeByName(employees, selected.owner) : null
  const relatedTasks = useMemo(() => tasks
    .filter((task) => selected?.deals.some((deal) => deal.id === task.relatedLeadId))
    .slice(0, 4), [tasks, selected])
  const selectedActivities = useMemo(() => model.timeline
    .filter((activity) => activity.accountId === selected?.id)
    .slice(0, 4), [model.timeline, selected?.id])

  useEffect(() => {
    if (!clients.length) {
      setSelectedId('')
      return
    }
    if (!clients.some((client) => client.id === selectedId)) setSelectedId(clients[0].id)
  }, [clients, selectedId])

  const primaryDeal = selected ? selected.openDeals[0] || selected.wonDeals[0] || selected.deals[0] : null
  const wonRevenue = selected?.wonDeals.reduce((total, deal) => total + Number(deal.value || 0), 0) || 0
  const openPipeline = selected?.openDeals.reduce((total, deal) => total + Number(deal.value || 0), 0) || 0

  return (
    <section className="clients-page">
      <div className="section-heading">
        <div><span className="eyebrow">Customer 360</span><h2>Clientes ativos</h2></div>
        <span className="result-count">{clients.length} contas conquistadas</span>
      </div>
      <div className="client-layout">
        <div className="client-list">
          {clients.map((client) => (
            <button className={selected?.id === client.id ? 'client-list-card is-active' : 'client-list-card'} key={client.id} type="button" onClick={() => setSelectedId(client.id)}>
              <PixelAvatar avatar={findEmployeeByName(employees, client.owner).avatar} size={38} animated />
              <div><strong>{client.company}</strong><small>{client.owner}</small></div>
              <b>{formatCurrency(client.wonDeals.reduce((total, deal) => total + Number(deal.value || 0), 0))}</b>
            </button>
          ))}
        </div>
        {selected ? (
          <article className="client-detail">
            <div className="client-detail__hero">
              {selectedOwner?.avatar && <PixelAvatar avatar={selectedOwner.avatar} size={58} animated />}
              <div><span className="eyebrow">Conta ativa</span><h2>{selected.company}</h2><p>{selected.segment} · {selected.owner}</p></div>
              <StatusBadge status={selected.stage} />
            </div>
            <div className="client-detail__stats">
              <div><small>Receita ganha</small><strong>{formatCurrency(wonRevenue)}</strong></div>
              <div><small>Pipeline aberto</small><strong>{formatCurrency(openPipeline)}</strong></div>
              <div><small>Forecast</small><strong>{formatCurrency(selected.forecast)}</strong></div>
            </div>
            <div className="client-health">
              <span>Saúde da conta</span>
              <div><i style={{ width: `${selected.health}%` }} /></div>
              <strong>{selected.health}/100</strong>
            </div>
            <div className="client-detail__columns">
              <div>
                <span className="eyebrow">Por que está assim?</span>
                {(selected.healthDetails?.contributions || []).map((item) => <div className="client-mini-row" key={item}><strong>Contribui</strong><small>{item}</small></div>)}
                {(selected.healthDetails?.penalties || []).map((item) => <div className="client-mini-row" key={item}><strong>Atenção</strong><small>{item}</small></div>)}
              </div>
              <div>
                <span className="eyebrow">Pessoas</span>
                {selected.contacts.map((contact) => (
                  <div className="client-mini-row sensitive-data" key={contact.id}>
                    <strong>{contact.name}</strong>
                    <small>{contact.buyingRole || contact.role} · influência {contact.influence}</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="client-detail__columns">
              <div>
                <span className="eyebrow">Próximas ações</span>
                {relatedTasks.length ? (
                  relatedTasks.map((task) => (
                    <div className="client-mini-row" key={task.id}>
                      <strong>{task.title}</strong>
                      <small>{task.status} · {task.owner || 'Sem responsável'}</small>
                    </div>
                  ))
                ) : (
                  <div className="client-mini-row"><strong>Sem ações vinculadas</strong><small>Crie uma tarefa para manter a conta em movimento.</small></div>
                )}
              </div>
              <div>
                <span className="eyebrow">Histórico</span>
                {selectedActivities.length ? (
                  selectedActivities.map((activity) => (
                    <div className="client-mini-row" key={activity.id}>
                      <strong>{activity.title || 'Movimentação'}</strong>
                      <small>{activity.detail || 'Registro recente'}</small>
                    </div>
                  ))
                ) : (
                  <div className="client-mini-row"><strong>Sem histórico visível</strong><small>As últimas interações aparecerão aqui.</small></div>
                )}
              </div>
            </div>
            <div className="client-detail__columns">
              <div>
                <span className="eyebrow">Plano da conta</span>
                <div className="client-mini-row"><strong>Objetivo</strong><small>{selected.openDeals.length ? 'Converter pipeline aberto e proteger próximos passos.' : 'Manter relacionamento ativo e mapear expansão.'}</small></div>
                <div className="client-mini-row"><strong>Risco</strong><small>{selected.healthDetails?.penalties?.[0] || 'Sem risco operacional relevante.'}</small></div>
              </div>
              <div>
                <span className="eyebrow">Oportunidades</span>
                {selected.deals.map((deal) => (
                  <button className="client-mini-row" key={deal.id} type="button" onClick={() => onEdit(leads.find((lead) => lead.id === deal.id) || deal)}>
                    <strong>{deal.stage}</strong>
                    <small>{formatCurrency(deal.value)} · {deal.probability}%</small>
                  </button>
                ))}
              </div>
            </div>
            {primaryDeal && <button className="button button--primary" type="button" onClick={() => onEdit(leads.find((lead) => lead.id === primaryDeal.id) || primaryDeal)}>Abrir oportunidade principal</button>}
          </article>
        ) : <div className="empty-state"><strong>Nenhum cliente fechado</strong><span>Leads ganhos aparecerão nesta área.</span></div>}
      </div>
    </section>
  )
}
