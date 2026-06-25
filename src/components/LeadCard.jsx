import { PIPELINE_STATUSES } from '../data/seedData'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'
import StatusBadge from './StatusBadge'

export default function LeadCard({ lead, owner, onEdit, onDelete, onStatusChange, compact = false }) {
  const initials = lead.nome
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <article className={`lead-card ${compact ? 'lead-card--compact' : ''}`}>
      <div className="lead-card__header">
        <div className="lead-card__person">
          {owner?.avatar ? <PixelAvatar avatar={owner.avatar} size={42} animated /> : <span className="lead-avatar">{initials}</span>}
          <div>
            <strong>{lead.nome}</strong>
            <span>{lead.empresa}</span>
            {owner?.nome && <small className="lead-owner">Resp. {owner.nome}</small>}
          </div>
        </div>
        <div className="lead-card__actions">
          <button onClick={() => onEdit(lead)} aria-label={`Editar ${lead.nome}`} title="Editar lead">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m14 5 5 5M4 20l3.5-.7L19 7.8a2 2 0 0 0-2.8-2.8L4.7 16.5 4 20Z" />
            </svg>
          </button>
          <button
            className="danger-action"
            onClick={() => onDelete(lead)}
            aria-label={`Excluir ${lead.nome}`}
            title="Excluir lead"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
      </div>

      {!compact && (
        <div className="lead-card__contact sensitive-data">
          <span>{lead.email}</span>
          <span>{lead.telefone}</span>
        </div>
      )}

      <div className="lead-card__meta">
        <div>
          <small>Valor estimado</small>
          <strong>{formatCurrency(lead.valorEstimado)}</strong>
        </div>
        {!compact && <StatusBadge status={lead.status} />}
      </div>

      <label className="status-control">
        <span>Mover para</span>
        <select value={lead.status} onChange={(event) => onStatusChange(lead.id, event.target.value)}>
          {PIPELINE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
