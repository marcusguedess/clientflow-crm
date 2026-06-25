const statusClassNames = {
  'Novo Lead': 'new',
  'Contato Feito': 'contacted',
  Reunião: 'meeting',
  Proposta: 'proposal',
  Fechado: 'won',
  Perdido: 'lost',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${statusClassNames[status] || 'new'}`}>
      <span />
      {status}
    </span>
  )
}
