import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'
import StatusBadge from './StatusBadge'

function findEmployeeByName(employees, name) {
  return employees.find((employee) => employee.nome === name) || employees[0]
}

export default function ClientsPage({ leads, employees = [], tasks = [], activities = [], onEdit }) {
  const clients = leads.filter((lead) => lead.status === 'Fechado')
  const [selected, setSelected] = useState(clients[0] || null)
  const selectedOwner = selected ? findEmployeeByName(employees, selected.responsavel) : null
  const relatedTasks = useMemo(() => tasks.filter((task) => task.relatedLeadId === selected?.id || task.owner === selected?.responsavel).slice(0, 4), [tasks, selected?.id, selected?.responsavel])
  const selectedActivities = useMemo(() => activities.filter((activity) => {
    const text = `${activity.title || ''} ${activity.detail || ''}`.toLowerCase()
    return [selected?.empresa, selected?.nome, selected?.responsavel].filter(Boolean).some((token) => text.includes(String(token).toLowerCase()))
  }).slice(0, 4), [activities, selected])

  return (
    <section className="clients-page">
      <div className="section-heading">
        <div><span className="eyebrow">Relacionamento</span><h2>Clientes ativos</h2></div>
        <span className="result-count">{clients.length} clientes</span>
      </div>
      <div className="client-layout">
        <div className="client-list">
          {clients.map((client) => (
            <button className={selected?.id === client.id ? 'client-list-card is-active' : 'client-list-card'} key={client.id} type="button" onClick={() => setSelected(client)}>
              <PixelAvatar avatar={findEmployeeByName(employees, client.responsavel).avatar} size={38} animated />
              <div><strong>{client.empresa}</strong><small>{client.nome}</small></div>
              <b>{formatCurrency(client.valorEstimado)}</b>
            </button>
          ))}
        </div>
        {selected ? (
          <article className="client-detail">
            <div className="client-detail__hero">
              {selectedOwner?.avatar && <PixelAvatar avatar={selectedOwner.avatar} size={58} animated />}
              <div><span className="eyebrow">Conta ativa</span><h2>{selected.empresa}</h2><p className="sensitive-data">{selected.nome} · {selected.email}</p></div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="client-detail__stats">
              <div><small>Valor contratado</small><strong>{formatCurrency(selected.valorEstimado)}</strong></div>
              <div><small>Responsável</small><strong>{selected.responsavel}</strong></div>
              <div><small>Origem</small><strong>{selected.origem}</strong></div>
            </div>
            <div className="client-detail__notes sensitive-data"><span className="eyebrow">Contexto da conta</span><p>{selected.notas}</p></div>
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
                  <div className="client-mini-row"><strong>Sem ações vinculadas</strong><small>Conecte tarefas deste responsável ao cliente.</small></div>
                )}
              </div>
              <div>
                <span className="eyebrow">Histórico</span>
                {selectedActivities.length ? (
                  selectedActivities.map((activity, index) => (
                    <div className="client-mini-row" key={`${activity.id || activity.title}-${index}`}>
                      <strong>{activity.title || 'Movimentação'}</strong>
                      <small>{activity.detail || activity.description || 'Registro recente'}</small>
                    </div>
                  ))
                ) : (
                  <div className="client-mini-row"><strong>Sem histórico visível</strong><small>As últimas interações aparecerão aqui.</small></div>
                )}
              </div>
            </div>
            <div className="client-health"><span>Saúde do relacionamento</span><div><i style={{ width: '82%' }} /></div><strong>82%</strong></div>
            <button className="button button--primary" type="button" onClick={() => onEdit(selected)}>Atualizar cliente</button>
          </article>
        ) : <div className="empty-state"><strong>Nenhum cliente fechado</strong><span>Leads ganhos aparecerão nesta área.</span></div>}
      </div>
    </section>
  )
}
