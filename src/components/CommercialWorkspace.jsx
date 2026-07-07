import { useEffect, useMemo, useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { buildCommercialModel } from '../utils/commercialModel'
import { formatCurrency } from '../utils/formatCurrency'
import EntityTimeline from './EntityTimeline'
import PixelAvatar from './PixelAvatar'
import StatusBadge from './StatusBadge'

const tabs = [
  { id: 'accounts', label: 'Contas' },
  { id: 'contacts', label: 'Contatos' },
  { id: 'deals', label: 'Oportunidades' },
  { id: 'timeline', label: 'Timeline' },
]

function formatDate(value) {
  if (!value) return 'Sem data'
  return new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: value.length === 10 ? undefined : '2-digit',
  })
}

function includesQuery(item, query) {
  if (!query) return true
  return JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
}

function EntityCard({ item, tab, selected, onSelect }) {
  if (tab === 'accounts') {
    return (
      <button className={`entity-card ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
        <div className="entity-card__top">
          {item.ownerAvatar && <PixelAvatar avatar={item.ownerAvatar} size={36} animated />}
          <span><strong>{item.company}</strong><small>{item.segment} · {item.owner}</small></span>
          <b>{item.health}%</b>
        </div>
        <div className="entity-card__meter"><i style={{ width: `${item.health}%` }} /></div>
        <div className="entity-card__meta">
          <span>{item.deals.length} deals</span>
          <span>{item.contacts.length} contatos</span>
          <strong>{formatCurrency(item.value)}</strong>
        </div>
      </button>
    )
  }

  if (tab === 'contacts') {
    return (
      <button className={`entity-card ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
        <div className="entity-card__top">
          {item.ownerAvatar && <PixelAvatar avatar={item.ownerAvatar} size={36} animated />}
          <span><strong>{item.name}</strong><small>{item.company}</small></span>
          <b>{item.deals.length}</b>
        </div>
        <div className="entity-card__contact sensitive-data">
          <span>{item.email}</span>
          <span>{item.phone}</span>
        </div>
        <div className="entity-card__meta">
          <span>{item.segment}</span>
          <span>{item.owner}</span>
        </div>
      </button>
    )
  }

  if (tab === 'timeline') {
    return (
      <button className={`entity-card entity-card--timeline ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
        <div className="entity-card__top">
          <span><strong>{item.title}</strong><small>{item.detail}</small></span>
          <b>{formatDate(item.at)}</b>
        </div>
      </button>
    )
  }

  return (
    <button className={`entity-card ${selected ? 'is-selected' : ''}`} type="button" onClick={onSelect}>
      <div className="entity-card__top">
        {item.ownerAvatar && <PixelAvatar avatar={item.ownerAvatar} size={36} animated />}
        <span><strong>{item.company}</strong><small>{item.contactName} · {item.owner}</small></span>
        <StatusBadge status={item.stage} />
      </div>
      <div className="entity-card__meta">
        <span>{item.probability}%</span>
        <span>{formatDate(item.closeDate)}</span>
        <strong>{formatCurrency(item.forecast)}</strong>
      </div>
    </button>
  )
}

function DetailPanel({ item, tab, timeline, onEditLead, onAddTimelineNote, onOpenDeal }) {
  if (!item) {
    return (
      <article className="entity-detail">
        <div className="empty-state"><strong>Nenhum registro selecionado</strong><span>Escolha um item da lista para ver o contexto.</span></div>
      </article>
    )
  }

  if (tab === 'accounts') {
    return (
      <article className="entity-detail">
        <header>
          <span className="eyebrow">Conta B2B</span>
          <h2>{item.company}</h2>
          <p>{item.segment} · {item.owner} · último toque {formatDate(item.lastTouchAt)}</p>
        </header>
        <div className="entity-detail__stats">
          <span><small>Valor total</small><strong>{formatCurrency(item.value)}</strong></span>
          <span><small>Forecast</small><strong>{formatCurrency(item.forecast)}</strong></span>
          <span><small>Saúde</small><strong>{item.health}/100</strong></span>
        </div>
        <section className="entity-detail__block">
          <h3>Health score explicável</h3>
          <div className="entity-health-grid">
            <div>
              <span className="eyebrow">Contribuições</span>
              {(item.healthDetails?.contributions || []).map((entry) => <p key={entry}>{entry}</p>)}
            </div>
            <div>
              <span className="eyebrow">Penalidades</span>
              {(item.healthDetails?.penalties || []).map((entry) => <p key={entry}>{entry}</p>)}
            </div>
          </div>
        </section>
        <section className="entity-detail__block">
          <h3>Oportunidades</h3>
          {item.deals.map((deal) => (
            <button key={deal.id} type="button" onClick={() => onEditLead(deal)} className="entity-mini-row">
              <span><strong>{deal.stage}</strong><small>{deal.contactName} · {deal.probability}%</small></span>
              <em>{formatCurrency(deal.value)}</em>
            </button>
          ))}
        </section>
        <section className="entity-detail__block">
          <h3>Plano da conta</h3>
          <div className="entity-mini-row"><span><strong>Objetivo</strong><small>{item.openDeals.length ? 'Converter pipeline aberto com próximo passo claro.' : 'Proteger relacionamento e mapear expansão.'}</small></span><em>{item.segment}</em></div>
          <div className="entity-mini-row"><span><strong>Risco</strong><small>{item.healthDetails?.penalties?.[0] || 'Sem risco operacional relevante.'}</small></span><em>{item.health}/100</em></div>
        </section>
        <EntityTimeline
          compact
          entity={item}
          entityType="account"
          events={timeline.filter((event) => event.accountId === item.id)}
          onAddNote={onAddTimelineNote}
          onOpenDeal={onOpenDeal}
        />
      </article>
    )
  }

  if (tab === 'contacts') {
    return (
      <article className="entity-detail">
        <header>
          <span className="eyebrow">Contato</span>
          <h2>{item.name}</h2>
          <p className="sensitive-data">{item.company} · {item.email} · {item.phone}</p>
        </header>
        <div className="entity-detail__stats">
          <span><small>Oportunidades</small><strong>{item.deals.length}</strong></span>
          <span><small>Tarefas</small><strong>{item.tasks.length}</strong></span>
          <span><small>Dono</small><strong>{item.owner}</strong></span>
        </div>
        <section className="entity-detail__block">
          <h3>Negócios relacionados</h3>
          {item.deals.map((deal) => (
            <button key={deal.id} type="button" onClick={() => onEditLead(deal)} className="entity-mini-row">
              <span><strong>{deal.stage}</strong><small>{formatDate(deal.nextStep)} · {deal.probability}%</small></span>
              <em>{formatCurrency(deal.forecast)}</em>
            </button>
          ))}
        </section>
        <EntityTimeline
          compact
          entity={item}
          entityType="contact"
          events={timeline.filter((event) => event.contactId === item.id || item.deals.some((deal) => deal.id === event.dealId))}
          onAddNote={onAddTimelineNote}
          onOpenDeal={onOpenDeal}
        />
      </article>
    )
  }

  if (tab === 'timeline') {
    return (
      <article className="entity-detail">
        <header>
          <span className="eyebrow">Evento</span>
          <h2>{item.title}</h2>
          <p>{item.detail}</p>
        </header>
        <div className="entity-detail__stats">
          <span><small>Tipo</small><strong>{item.type}</strong></span>
          <span><small>Data</small><strong>{formatDate(item.at)}</strong></span>
        </div>
        <EntityTimeline
          compact
          entity={item}
          entityType="event"
          events={item.dealId ? timeline.filter((event) => event.dealId === item.dealId) : [item]}
          onOpenDeal={onOpenDeal}
        />
      </article>
    )
  }

  return (
    <article className="entity-detail">
      <header>
        <span className="eyebrow">Oportunidade</span>
        <h2>{item.company}</h2>
        <p>{item.contactName} · {item.owner} · {item.segment}</p>
      </header>
      <div className="entity-detail__stats">
        <span><small>Valor</small><strong>{formatCurrency(item.value)}</strong></span>
        <span><small>Forecast</small><strong>{formatCurrency(item.forecast)}</strong></span>
        <span><small>Prob.</small><strong>{item.probability}%</strong></span>
      </div>
      <div className="entity-deal-progress">
        <i style={{ width: `${item.probability}%` }} />
      </div>
      <section className="entity-detail__block">
        <h3>Plano comercial</h3>
        <div className="entity-mini-row"><span><strong>Etapa</strong><small><StatusBadge status={item.stage} /></small></span><em>{formatDate(item.closeDate)}</em></div>
        <div className="entity-mini-row"><span><strong>Próximo passo</strong><small>{formatDate(item.nextStep)}</small></span><em>{item.lossReason || 'Sem perda'}</em></div>
        <p className="sensitive-data">{item.notes}</p>
      </section>
      <EntityTimeline
        compact
        entity={item}
        entityType="deal"
        events={timeline.filter((event) => event.dealId === item.id)}
        onAddNote={onAddTimelineNote}
        onOpenDeal={onOpenDeal}
      />
      <button className="button button--primary" type="button" onClick={() => onEditLead(item)}>Editar oportunidade</button>
    </article>
  )
}

export default function CommercialWorkspace({ leads, tasks, activities, employees, onEditLead, onCreateLead, onAddTimelineNote }) {
  const [tab, setTab] = useState('accounts')
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState('Todos')
  const [selectedId, setSelectedId] = useState('')
  const [savedViews, setSavedViews] = usePersistentState('clientflow-commercial-views-v1', [], (value) =>
    Array.isArray(value)
      ? value.slice(0, 12).filter((item) => item?.id && item?.label && tabs.some((tabItem) => tabItem.id === item.tab))
      : [],
  )
  const model = useMemo(() => buildCommercialModel(leads, tasks, activities, employees), [leads, tasks, activities, employees])

  const collection = useMemo(() => {
    const source = model[tab] || []
    return source.filter((item) =>
      includesQuery(item, query) &&
      (tab === 'timeline' || segment === 'Todos' || item.segment === segment),
    )
  }, [model, query, segment, tab])

  useEffect(() => {
    if (!collection.length) {
      setSelectedId('')
      return
    }
    if (!collection.some((item) => item.id === selectedId)) setSelectedId(collection[0].id)
  }, [collection, selectedId])

  const selected = collection.find((item) => item.id === selectedId)
  const segmentOptions = ['Todos', ...new Set([...model.accounts, ...model.deals, ...model.contacts].map((item) => item.segment).filter(Boolean))]

  function saveCurrentView() {
    const normalizedQuery = query.trim()
    const label = [
      tabs.find((item) => item.id === tab)?.label,
      segment !== 'Todos' ? segment : '',
      normalizedQuery ? `"${normalizedQuery}"` : '',
    ].filter(Boolean).join(' · ')
    const view = {
      id: globalThis.crypto.randomUUID(),
      label: label || 'Visão comercial',
      tab,
      segment,
      query: normalizedQuery,
    }
    setSavedViews((current) => [view, ...current.filter((item) =>
      !(item.tab === view.tab && item.segment === view.segment && item.query === view.query),
    )].slice(0, 12))
  }

  function applySavedView(viewId) {
    const view = savedViews.find((item) => item.id === viewId)
    if (!view) return
    setTab(view.tab)
    setSegment(view.segment)
    setQuery(view.query)
  }

  return (
    <section className="commercial-workspace">
      <div className="commercial-hero">
        <div>
          <span className="eyebrow">Modelo comercial B2B</span>
          <h2>Leads, contas, contatos e oportunidades conectados</h2>
          <p>Uma carteira navegável do primeiro interesse até o cliente, com forecast, saúde de conta e timeline operacional.</p>
        </div>
        <div className="commercial-hero__metrics">
          <span><small>Contas</small><strong>{model.summary.accounts}</strong></span>
          <span><small>Contatos</small><strong>{model.summary.contacts}</strong></span>
          <span><small>Deals abertos</small><strong>{model.summary.openDeals}</strong></span>
          <span><small>Forecast</small><strong>{formatCurrency(model.summary.totalForecast)}</strong></span>
        </div>
      </div>

      <div className="commercial-control-bar">
        <div className="commercial-tabs" role="tablist" aria-label="Entidades comerciais">
          {tabs.map((item) => (
            <button key={item.id} className={tab === item.id ? 'is-active' : ''} type="button" onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="commercial-filters">
          <select defaultValue="" onChange={(event) => applySavedView(event.target.value)} aria-label="Abrir visão salva">
            <option value="" disabled>Visões salvas</option>
            {savedViews.map((view) => <option value={view.id} key={view.id}>{view.label}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa, pessoa, email, etapa..." />
          <select value={segment} onChange={(event) => setSegment(event.target.value)}>
            {segmentOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="button button--ghost" type="button" onClick={saveCurrentView}>Salvar visão</button>
          <button className="button button--primary" type="button" onClick={onCreateLead}>+ Novo lead</button>
        </div>
      </div>

      <div className="commercial-layout">
        <aside className="entity-list" aria-label={`Lista de ${tab}`}>
          {collection.length ? collection.map((item) => (
            <EntityCard key={item.id} item={item} tab={tab} selected={item.id === selectedId} onSelect={() => setSelectedId(item.id)} />
          )) : (
            <div className="empty-state"><strong>Nada encontrado</strong><span>Ajuste os filtros para ver outros registros.</span></div>
          )}
        </aside>
        <DetailPanel
          item={selected}
          tab={tab}
          timeline={model.timeline}
          onAddTimelineNote={onAddTimelineNote}
          onOpenDeal={(dealId) => {
            const lead = leads.find((item) => item.id === dealId)
            if (lead) onEditLead(lead)
          }}
          onEditLead={(entity) => onEditLead(leads.find((lead) => lead.id === entity.id) || entity)}
        />
      </div>
    </section>
  )
}
