export default function Header({ title, subtitle, onNewLead, onOpenMenu, onOpenCommandPalette, showNewLead = true }) {
  return (
    <header className="page-header">
      <div className="page-header__title">
        <button className="icon-button menu-button" type="button" onClick={onOpenMenu} aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div>
          <div className="header-title-row"><h1>{title}</h1></div>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="page-header__actions">
        <button className="header-command-button" type="button" onClick={onOpenCommandPalette} aria-label="Abrir busca e comandos" title="Busca e comandos">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <span>Buscar</span>
          <kbd>Ctrl K</kbd>
        </button>
        {showNewLead && (
          <button className="button button--primary" type="button" onClick={onNewLead}>
            <span aria-hidden="true">+</span>
            Novo lead
          </button>
        )}
      </div>
    </header>
  )
}
