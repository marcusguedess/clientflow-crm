import { useMemo, useState } from 'react'
import { cleanText } from '../utils/sanitizeData'

const typeLabels = {
  activity: 'Atividade',
  contact: 'Movimento',
  lost: 'Perda',
  meeting: 'Reunião',
  note: 'Nota',
  proposal: 'Proposta',
  task: 'Tarefa',
  won: 'Conquista',
}

function formatEventDate(value) {
  if (!value) return 'Sem data'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EntityTimeline({
  events = [],
  entity,
  entityType,
  onAddNote,
  onOpenDeal,
  compact = false,
}) {
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState('all')
  const availableTypes = useMemo(() => [...new Set(events.map((event) => event.type))], [events])
  const visibleEvents = filter === 'all' ? events : events.filter((event) => event.type === filter)

  function submitNote(event) {
    event.preventDefault()
    const safeNote = cleanText(note, 500)
    if (!safeNote || !onAddNote) return
    onAddNote({
      entity,
      entityType,
      text: safeNote,
    })
    setNote('')
  }

  return (
    <section className={`entity-timeline ${compact ? 'entity-timeline--compact' : ''}`}>
      <header className="entity-timeline__header">
        <div>
          <span className="eyebrow">Histórico vivo</span>
          <h3>Timeline da relação</h3>
        </div>
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filtrar eventos da timeline">
          <option value="all">Todos os eventos</option>
          {availableTypes.map((type) => (
            <option value={type} key={type}>{typeLabels[type] || type}</option>
          ))}
        </select>
      </header>

      {onAddNote && (
        <form className="entity-timeline__composer" onSubmit={submitNote}>
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Registre contexto, objeção, decisão ou próximo passo..."
          />
          <div>
            <small>{note.length}/500</small>
            <button className="button button--primary" type="submit">Adicionar nota</button>
          </div>
        </form>
      )}

      <div className="entity-timeline__stream">
        {visibleEvents.length ? visibleEvents.map((event) => (
          <article className={`timeline-event timeline-event--${event.type}`} key={event.id}>
            <i aria-hidden="true" />
            <div>
              <div className="timeline-event__meta">
                <span>{typeLabels[event.type] || event.type}</span>
                <time>{formatEventDate(event.at)}</time>
              </div>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              {event.dealId && onOpenDeal && (
                <button type="button" onClick={() => onOpenDeal(event.dealId)}>
                  Abrir oportunidade
                </button>
              )}
            </div>
          </article>
        )) : (
          <div className="empty-state">
            <strong>Nenhum evento neste filtro</strong>
            <span>Novas atividades e notas aparecerão aqui.</span>
          </div>
        )}
      </div>
    </section>
  )
}
