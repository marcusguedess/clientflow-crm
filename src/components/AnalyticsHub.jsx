import { useMemo, useState } from 'react'
import { PIPELINE_STATUSES } from '../data/seedData'
import { getLeadProbability } from '../utils/businessInsights'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'

const tabs = [
  { id: 'leads', label: 'Leads' },
  { id: 'clients', label: 'Clientes' },
  { id: 'losses', label: 'Perdas' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'team', label: 'Equipe' },
  { id: 'acquisition', label: 'Aquisição' },
]

function Metric({ label, value, detail, tone }) {
  return <div className={`analytics-metric analytics-metric--${tone}`}><small>{label}</small><strong>{value}</strong><span>{detail}</span></div>
}

export default function AnalyticsHub({ leads, employees, tasks = [] }) {
  const [tab, setTab] = useState('leads')
  const [ownerFilter, setOwnerFilter] = useState('Todos')
  const [sourceFilter, setSourceFilter] = useState('Todos')

  const filteredLeads = useMemo(() => leads.filter((lead) =>
    (ownerFilter === 'Todos' || lead.responsavel === ownerFilter) &&
    (sourceFilter === 'Todos' || (lead.origem || 'Outros') === sourceFilter),
  ), [leads, ownerFilter, sourceFilter])

  const data = useMemo(() => {
    const clients = filteredLeads.filter((lead) => lead.status === 'Fechado')
    const losses = filteredLeads.filter((lead) => lead.status === 'Perdido')
    const open = filteredLeads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    const sum = (items) => items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
    const owners = employees.map((employee) => ({
      employee,
      name: employee.nome,
      leads: filteredLeads.filter((lead) => lead.responsavel === employee.nome).length,
      clients: clients.filter((lead) => lead.responsavel === employee.nome).length,
      value: sum(clients.filter((lead) => lead.responsavel === employee.nome)),
    })).sort((a, b) => b.value - a.value)
    const sources = Object.entries(filteredLeads.reduce((result, lead) => ({
      ...result,
      [lead.origem || 'Outros']: [...(result[lead.origem || 'Outros'] || []), lead],
    }), {})).map(([source, items]) => ({
      source,
      count: items.length,
      value: sum(items),
      won: items.filter((lead) => lead.status === 'Fechado').length,
    })).sort((a, b) => b.value - a.value)
    return { clients, losses, open, sum, owners, sources }
  }, [filteredLeads, employees])

  const maxStatus = Math.max(...PIPELINE_STATUSES.map((status) => filteredLeads.filter((lead) => lead.status === status).length), 1)
  const ownerOptions = ['Todos', ...employees.map((employee) => employee.nome)]
  const sourceOptions = ['Todos', ...new Set(leads.map((lead) => lead.origem || 'Outros'))]
  const forecast = Math.round(data.open.reduce((total, lead) => {
    return total + Number(lead.valorEstimado || 0) * (getLeadProbability(lead) / 100)
  }, 0))
  const reasons = Object.entries(data.losses.reduce((result, lead) => ({
    ...result,
    [lead.motivoPerda || 'Sem motivo registrado']: (result[lead.motivoPerda || 'Sem motivo registrado'] || 0) + 1,
  }), {})).sort((a, b) => b[1] - a[1])
  const clientsWithFollowUp = data.clients.filter((client) =>
    tasks.some((task) => task.relatedLeadId === client.id && task.status !== 'Concluído'),
  ).length

  return (
    <section className="analytics-hub">
      <div className="analytics-hero">
        <div><span className="eyebrow">Central de relatórios</span><h2>Decisões com contexto</h2><p>Uma visão direta sobre aquisição, receita, clientes e perdas.</p></div>
        <div className="analytics-tabs" role="tablist" aria-label="Relatórios disponíveis">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? 'is-active' : ''}
              onClick={() => setTab(item.id)}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-filter-bar analytics-filter-bar">
        <label><span>Responsável</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>{ownerOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Origem</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>{sourceOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={() => { setOwnerFilter('Todos'); setSourceFilter('Todos') }}>Limpar filtros</button>
      </div>

      {tab === 'leads' && (
        <>
          <div className="analytics-metrics">
            <Metric label="Leads totais" value={filteredLeads.length} detail="carteira filtrada" tone="blue" />
            <Metric label="Pipeline aberto" value={formatCurrency(data.sum(data.open))} detail={`${data.open.length} oportunidades`} tone="violet" />
            <Metric label="Ticket potencial" value={formatCurrency(data.open.length ? data.sum(data.open) / data.open.length : 0)} detail="média em aberto" tone="orange" />
            <Metric label="Em proposta" value={filteredLeads.filter((lead) => lead.status === 'Proposta').length} detail="próximos do fechamento" tone="green" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Distribuição</span><h3>Leads por etapa</h3></header><div className="stage-columns">{PIPELINE_STATUSES.map((status) => { const count = filteredLeads.filter((lead) => lead.status === status).length; return <div key={status}><strong>{count}</strong><i style={{ height: `${Math.max(12, count / maxStatus * 100)}%` }} /><span>{status}</span></div> })}</div></article>
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
            <Metric label="Com follow-up ativo" value={clientsWithFollowUp} detail="clientes com tarefa aberta" tone="orange" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Carteira</span><h3>Receita por responsável</h3></header><div className="owner-performance">{data.owners.map((owner, index) => <div key={owner.name}><PixelAvatar avatar={owner.employee.avatar} size={32} animated={index < 3} /><span>{owner.name}</span><div><i style={{ width: `${Math.max(4, owner.value / Math.max(data.owners[0]?.value || 1, 1) * 100)}%`, '--delay': `${index * 80}ms` }} /></div><strong>{formatCurrency(owner.value)}</strong></div>)}</div></article>
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
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Diagnóstico</span><h3>Motivos de perda</h3></header><div className="loss-reasons">{reasons.length ? reasons.map(([reason, value]) => <div key={reason}><span>{reason}</span><div><i style={{ width: `${Math.max(12, (value / Math.max(data.losses.length, 1)) * 100)}%` }} /></div><strong>{value}</strong></div>) : <p>Nenhuma perda registrada nesta seleção.</p>}</div></article>
            <article className="analytics-card loss-recovery"><header><span className="eyebrow">Recuperação</span><h3>Próximas retomadas</h3></header>{data.losses.length ? data.losses.map((lead) => <div key={lead.id}><strong>{lead.empresa}</strong><span>{lead.notas}</span><button type="button">Planejar retomada</button></div>) : <p>Nenhuma perda registrada.</p>}</article>
          </div>
        </>
      )}

      {tab === 'forecast' && (
        <>
          <div className="analytics-metrics">
            <Metric label="Forecast ponderado" value={formatCurrency(forecast)} detail="baseado em etapa" tone="violet" />
            <Metric label="Conservador" value={formatCurrency(Math.round(forecast * 0.72))} detail="simulação sobre forecast" tone="blue" />
            <Metric label="Agressivo" value={formatCurrency(Math.round(forecast * 1.28))} detail="simulação sobre forecast" tone="green" />
            <Metric label="Pipeline aberto" value={formatCurrency(data.sum(data.open))} detail={`${data.open.length} oportunidades`} tone="orange" />
          </div>
          <div className="analytics-layout">
            <article className="analytics-card analytics-card--wide"><header><span className="eyebrow">Cenários</span><h3>Forecast por intensidade</h3></header><div className="scenario-bars">{[['Conservador', .72], ['Base', 1], ['Agressivo', 1.28]].map(([label, factor]) => <div key={label}><span>{label}</span><div><i style={{ width: `${Math.min(100, factor * 70)}%` }} /></div><strong>{formatCurrency(Math.round(forecast * factor))}</strong></div>)}</div></article>
            <article className="analytics-card"><header><span className="eyebrow">Ações</span><h3>Alavancas de fechamento</h3></header><div className="analytics-list">{data.open.slice(0, 5).map((lead, index) => <div key={lead.id}><b>{index + 1}</b><span><strong>{lead.empresa}</strong><small>{lead.status} · {lead.responsavel}</small></span><em>{formatCurrency(lead.valorEstimado)}</em></div>)}</div></article>
          </div>
        </>
      )}

      {tab === 'team' && (
        <div className="team-dashboard-grid">
          {data.owners.map((owner, index) => (
            <article className="team-dashboard-card" key={owner.name}>
              <PixelAvatar avatar={owner.employee.avatar} size={54} animated={index < 4} />
              <div><span className="eyebrow">{owner.employee.cargo}</span><h3>{owner.name}</h3><p>{owner.leads} leads · {owner.clients} clientes</p></div>
              <strong>{formatCurrency(owner.value)}</strong>
              <i style={{ width: `${Math.max(8, owner.value / Math.max(data.owners[0]?.value || 1, 1) * 100)}%` }} />
            </article>
          ))}
        </div>
      )}

      {tab === 'acquisition' && (
        <div className="source-dashboard-grid">
          {data.sources.map((source, index) => (
            <button className="source-dashboard-card" key={source.source} onClick={() => setSourceFilter(source.source)} type="button">
              <span>#{index + 1}</span>
              <h3>{source.source}</h3>
              <strong>{formatCurrency(source.value)}</strong>
              <small>{source.count} leads · {source.won} ganhos</small>
              <i style={{ '--source-share': `${Math.min(360, source.value / Math.max(data.sources[0]?.value || 1, 1) * 300)}deg` }} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
