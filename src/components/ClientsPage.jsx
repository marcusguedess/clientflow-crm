import { useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import StatusBadge from './StatusBadge'

export default function ClientsPage({ leads, onEdit }) {
  const clients = leads.filter((lead) => lead.status === 'Fechado')
  const [selected, setSelected] = useState(clients[0] || null)

  return (
    <section className="clients-page">
      <div className="section-heading">
        <div><span className="eyebrow">Relacionamento</span><h2>Clientes ativos</h2></div>
        <span className="result-count">{clients.length} clientes</span>
      </div>
      <div className="client-layout">
        <div className="client-list">
          {clients.map((client) => (
            <button className={selected?.id === client.id ? 'client-list-card is-active' : 'client-list-card'} key={client.id} onClick={() => setSelected(client)}>
              <span>{client.nome.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
              <div><strong>{client.empresa}</strong><small>{client.nome}</small></div>
              <b>{formatCurrency(client.valorEstimado)}</b>
            </button>
          ))}
        </div>
        {selected ? (
          <article className="client-detail">
            <div className="client-detail__hero">
              <span className="client-detail__avatar">{selected.empresa.slice(0, 2).toUpperCase()}</span>
              <div><span className="eyebrow">Conta ativa</span><h2>{selected.empresa}</h2><p className="sensitive-data">{selected.nome} · {selected.email}</p></div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="client-detail__stats">
              <div><small>Valor contratado</small><strong>{formatCurrency(selected.valorEstimado)}</strong></div>
              <div><small>Responsável</small><strong>{selected.responsavel}</strong></div>
              <div><small>Origem</small><strong>{selected.origem}</strong></div>
            </div>
            <div className="client-detail__notes sensitive-data"><span className="eyebrow">Contexto da conta</span><p>{selected.notas}</p></div>
            <div className="client-health"><span>Saúde do relacionamento</span><div><i style={{ width: '82%' }} /></div><strong>82%</strong></div>
            <button className="button button--primary" onClick={() => onEdit(selected)}>Atualizar cliente</button>
          </article>
        ) : <div className="empty-state"><strong>Nenhum cliente fechado</strong><span>Leads ganhos aparecerão nesta área.</span></div>}
      </div>
    </section>
  )
}
