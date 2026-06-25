import { useState } from 'react'
import EmployeeBadge from './EmployeeBadge'

export default function FloatingChat({ employees, onOpenTeam }) {
  const [open, setOpen] = useState(false)
  const online = employees.filter((employee) => employee.status === 'online')

  return (
    <div className="floating-chat">
      {open && (
        <div className="floating-chat__panel">
          <header><strong>Equipe online</strong><button onClick={() => setOpen(false)}>×</button></header>
          {online.map((employee) => <EmployeeBadge key={employee.id} employee={employee} compact />)}
          <button className="button button--primary floating-chat__open" onClick={onOpenTeam}>Abrir Flow Messenger</button>
        </div>
      )}
      <button className="floating-chat__button" onClick={() => setOpen((current) => !current)} aria-label="Abrir chat da equipe">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5 3 21l.7-4A8 8 0 1 1 5 18.5Z" /></svg>
        <span>{online.length}</span>
      </button>
    </div>
  )
}
