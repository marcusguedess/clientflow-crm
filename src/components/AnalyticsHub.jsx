import { useMemo, useState } from 'react'
import { PIPELINE_STATUSES } from '../data/seedData'
import { formatCurrency } from '../utils/formatCurrency'

const tabs = [
  { id: 'leads', label: 'Leads' },
  { id: 'clients', label: 'Clientes' },
  { id: 'losses', label: 'Perdas' },
]

function Metric({ label, value, detail, tone }) {
  return <div className={`analytics-metric analytics-metric--${tone}`}><small>{label}</small><strong>{value}</strong><span>{detail}</span></div>
}

export default function AnalyticsHub({ leads, employees }) {
  const [tab, setTab] = useState('leads')

  const data = useMemo(() => {
    const clients = leads.filter((lead) => lead.status === 'Fechado')
    const losses = leads.filter((lead) => lead.status === 'Perdido')
    const open = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    const sum = (items) => items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
    const owners = employees.map((employee) => ({
      name: employee.nome,
      leads: leads.filter((lead) => lead.responsavel === employee.nome).length,
      clients: clients.filter((lead) => lead.responsavel === employee.nome).length,
      value: sum(clients.filter((lead) => lead.responsavel === employee.nome)),
    })).sort((a, b) => b.value - a.value)
    return { clients, losses, open, sum, owners }
  }, [leads, employees])

  const maxStatus = Math.max(...PIPELINE_STATUSES.map((status) => leads.filter((lead) => lead.status === status).length), 1)
  const reasons = [
    ['Orçamento adiado', 42],
    ['Sem prioridade', 26],
    ['Concorrência', 19],
    ['Sem retorno', 13],
  ]

  return (
    <section className="analytics-hub">
      <div className="analytics-hero">
        <div><span className="eyebrow">Central de relatórios</span><h2>Decisões com contexto</h2><p>Uma visão direta sobre aquisição, receita, clientes e perdas.</p></div>
        <div className="analytics-tabs">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
      </div>

      {tab === 'leads' && (
        <>
          <div className="analytics-metrics">
            <Metric label="Leads totais" value={leads.length} detail="carteira completa" tone="blue" />
            <Metric label="Pipeline aberto" value={formatCurrency(data.sum(data.open))} detail={`${data.open.length} oportunidades`} tone="violet" />
            <Metric label="Ticket potencial" value={formatCurrency(data.open.length ? data.sum(data.open) / data.open.length : 0)} detail="média em aberto" tone="orange" />
            <Metric label="Em proposta" value={leads.filter((lead) => lead.status === 'Proposta').length} detail="próximos do fechamento" tone="green" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Distribuição</span><h3>Leads por etapa</h3></header><div className="stage-columns">{PIPELINE_STATUSES.map((status) => { const count = leads.filter((lead) => lead.status === status).length; return <div key={status}><strong>{count}</strong><i style={{ height: `${Math.max(12, count / maxStatus * 100)}%` }} /><span>{status}</span></div> })}</div></article>
            <article className="analytics-card"><header><span className="eyebrow">Top oportunidades</span><h3>Maior potencial</h3></header><div className="analytics-list">{[...data.open].sort((a, b) => b.valorEstimado - a.valorEstimado).slice(0, 5).map((lead, index) => <div key={lead.id}><b>{index + 1}</b><span><strong>{lead.empresa}</strong><small>{lead.status}</small></span><em>{formatCurrency(lead.valorEstimado)}</em></div>)}</div></article>
          </div>
        </>
      )}

      {tab === 'clients' && (
        <>
          <div className="analytics-metrics">
            <Metric label="Clientes ativos" value={data.clients.length} detail="negócios ganhos" tone="green" />
            <Metric label="Receita conquistada" value={formatCurrency(data.sum(data.clients))} detail="valor fechado" tone="violet" />
            <Metric label="Ticket médio" value={formatCurrency(data.clients.length ? data.sum(data.clients) / data.clients.length : 0)} detail="por cliente" tone="blue" />
            <Metric label="Retenção demo" value="94%" detail="indicador projetado" tone="orange" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Carteira</span><h3>Receita por responsável</h3></header><div className="owner-performance">{data.owners.map((owner, index) => <div key={owner.name}><span>{owner.name}</span><div><i style={{ width: `${Math.max(4, owner.value / Math.max(data.owners[0]?.value || 1, 1) * 100)}%`, '--delay': `${index * 80}ms` }} /></div><strong>{formatCurrency(owner.value)}</strong></div>)}</div></article>
            <article className="analytics-card"><header><span className="eyebrow">Clientes</span><h3>Contas conquistadas</h3></header><div className="analytics-list">{data.clients.map((client, index) => <div key={client.id}><b>{index + 1}</b><span><strong>{client.empresa}</strong><small>{client.responsavel}</small></span><em>{formatCurrency(client.valorEstimado)}</em></div>)}</div></article>
          </div>
        </>
      )}

      {tab === 'losses' && (
        <>
          <div className="analytics-metrics">
            <Metric label="Oportunidades perdidas" value={data.losses.length} detail="negócios encerrados" tone="red" />
            <Metric label="Valor perdido" value={formatCurrency(data.sum(data.losses))} detail="potencial não convertido" tone="orange" />
            <Metric label="Taxa de perda" value={`${leads.length ? Math.round(data.losses.length / leads.length * 100) : 0}%`} detail="sobre a carteira" tone="violet" />
            <Metric label="Retomadas sugeridas" value={data.losses.length} detail="para próximo trimestre" tone="blue" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Diagnóstico</span><h3>Motivos de perda</h3></header><div className="loss-reasons">{reasons.map(([reason, value]) => <div key={reason}><span>{reason}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>)}</div></article>
            <article className="analytics-card loss-recovery"><header><span className="eyebrow">Recuperação</span><h3>Próximas retomadas</h3></header>{data.losses.length ? data.losses.map((lead) => <div key={lead.id}><strong>{lead.empresa}</strong><span>{lead.notas}</span><button>Planejar retomada</button></div>) : <p>Nenhuma perda registrada.</p>}</article>
          </div>
        </>
      )}
    </section>
  )
}
