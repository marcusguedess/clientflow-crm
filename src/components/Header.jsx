export default function Header({ title, subtitle, onNewLead, onOpenMenu, showNewLead = true }) {
  return (
    <header className="page-header">
      <div className="page-header__title">
        <button className="icon-button menu-button" onClick={onOpenMenu} aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div>
          <div className="header-title-row"><h1>{title}</h1></div>
          <p>{subtitle}</p>
        </div>
      </div>
      {showNewLead && (
        <button className="button button--primary" onClick={onNewLead}>
          <span aria-hidden="true">+</span>
          Novo lead
        </button>
      )}
    </header>
  )
}
