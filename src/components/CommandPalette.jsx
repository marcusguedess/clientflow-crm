import { useEffect, useMemo, useRef, useState } from 'react'

const actions = [
  { id: 'dashboard', label: 'Abrir visão geral', detail: 'Dashboard do dia', view: 'dashboard' },
  { id: 'pipeline', label: 'Abrir pipeline', detail: 'Oportunidades por etapa', view: 'pipeline' },
  { id: 'leads', label: 'Abrir comercial', detail: 'Contas, contatos e deals', view: 'leads' },
  { id: 'tasks', label: 'Abrir Flowboard', detail: 'Tarefas e próximos passos', view: 'tasks' },
  { id: 'messenger', label: 'Abrir Flow Chat', detail: 'Conversas internas', view: 'messenger' },
  { id: 'mail', label: 'Abrir Flow Mail', detail: 'Caixa corporativa', view: 'mail' },
  { id: 'city', label: 'Entrar na cidade', detail: 'Presença e interação', view: 'city' },
  { id: 'analytics', label: 'Abrir relatórios', detail: 'Indicadores e análises', view: 'analytics' },
]

export default function CommandPalette({
  open,
  leads,
  employees,
  onClose,
  onNavigate,
  onNewLead,
  onOpenLead,
  onOpenEmployee,
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    setSelectedIndex(0)
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 30)
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onClose])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const createResults = !normalized || 'criar novo lead adicionar oportunidade'.includes(normalized)
      ? [{
          id: 'new-lead',
          label: 'Criar novo lead',
          detail: 'Adicionar oportunidade à carteira',
          kind: 'Criar',
          createLead: true,
        }]
      : []
    const actionResults = actions
      .filter((action) => !normalized || `${action.label} ${action.detail}`.toLowerCase().includes(normalized))
      .map((action) => ({ ...action, kind: 'Ação' }))
    const leadResults = leads
      .filter((lead) => !normalized || [lead.nome, lead.empresa, lead.email, lead.status].join(' ').toLowerCase().includes(normalized))
      .slice(0, normalized ? 6 : 3)
      .map((lead) => ({
        id: lead.id,
        label: lead.empresa,
        detail: `${lead.nome} · ${lead.status}`,
        kind: 'Oportunidade',
        lead,
      }))
    const employeeResults = employees
      .filter((employee) => !normalized || [employee.nome, employee.cargo, employee.setor].join(' ').toLowerCase().includes(normalized))
      .slice(0, normalized ? 4 : 2)
      .map((employee) => ({
        id: employee.id,
        label: employee.nome,
        detail: `${employee.cargo} · ${employee.setor}`,
        kind: 'Pessoa',
        employee,
      }))
    return [
      ...createResults,
      ...actionResults,
      ...leadResults,
      ...employeeResults,
    ].slice(0, 15)
  }, [employees, leads, query])

  if (!open) return null

  function selectResult(result) {
    if (result.createLead) onNewLead()
    else if (result.view) onNavigate(result.view)
    else if (result.lead) onOpenLead(result.lead)
    else if (result.employee) onOpenEmployee(result.employee)
    onClose()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => Math.min(results.length - 1, current + 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => Math.max(0, current - 1))
    }
    if (event.key === 'Enter' && results[selectedIndex]) {
      event.preventDefault()
      selectResult(results[selectedIndex])
    }
  }

  return (
    <div className="command-palette-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Busca e comandos" onMouseDown={(event) => event.stopPropagation()}>
        <label className="command-palette__search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar empresa, pessoa ou comando..."
          />
          <kbd>Esc</kbd>
        </label>
        <div className="command-palette__results">
          {results.map((result, index) => (
            <button
              key={`${result.kind}-${result.id}`}
              className={selectedIndex === index ? 'is-selected' : ''}
              type="button"
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => selectResult(result)}
            >
              <span>
                <small>{result.kind}</small>
                <strong>{result.label}</strong>
              </span>
              <em>{result.detail}</em>
            </button>
          ))}
          {!results.length && (
            <div className="command-palette__empty">
              <strong>Nada encontrado</strong>
              <span>Tente buscar pelo nome da empresa, pessoa ou área.</span>
            </div>
          )}
        </div>
        <footer>
          <span>Enter para abrir</span>
          <span>Ctrl K para chamar</span>
        </footer>
      </section>
    </div>
  )
}
