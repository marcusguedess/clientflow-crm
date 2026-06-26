import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import PixelAvatar from './PixelAvatar'
import { navigationGroups } from '../app/navigation'

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}

function PipelineIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="5" height="16" rx="2" />
      <rect x="10" y="4" width="5" height="10" rx="2" />
      <rect x="17" y="4" width="4" height="13" rx="2" />
    </svg>
  )
}

function PeopleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5M14 15c3.8-.7 6 1.5 6 5" /></svg>
}

function CityIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V8l6-3v16M9 21V3l7 3v15M16 21v-9l5-2v11M6 11h1M6 15h1M12 8h1M12 12h1M12 16h1M19 14h.1M19 17h.1" /></svg>
}

function ListIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12M4 6h.1M4 12h.1M4 18h.1" /></svg>
}

function ChatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5 3 21l.7-4A8 8 0 1 1 5 18.5Z" /></svg>
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4.5 7.5 7.5 6 7.5-6" /><path d="M4.5 16.5 9.5 12" /><path d="M19.5 16.5 14.5 12" /></svg>
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-5" /></svg>
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 9h8M8 13h5" /></svg>
}

function ActivityIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l2-6 4 12 2-6h4" /></svg>
}

function ClientIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.5-6 6-6s6 3 6 6M16 8h5M18.5 5.5v5" /></svg>
}

function ReportIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18" /></svg>
}

function CockpitIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V9M10 18V5M16 18v-7M3 20h18" /><circle cx="19" cy="6" r="2" /></svg>
}

const icons = {
  activity: <ActivityIcon />,
  chat: <ChatIcon />,
  mail: <MailIcon />,
  city: <CityIcon />,
  clients: <ClientIcon />,
  cockpit: <CockpitIcon />,
  grid: <GridIcon />,
  list: <ListIcon />,
  people: <PeopleIcon />,
  pipeline: <PipelineIcon />,
  reports: <ReportIcon />,
  shield: <ShieldIcon />,
  tasks: <CheckIcon />,
}

export default function Sidebar({ activeView, onViewChange, isOpen, onClose, currentEmployee, onProfile }) {
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const closeButtonRef = useRef(null)
  const shouldHideSidebar = isCompactViewport && !isOpen

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1180px)')
    const syncViewport = () => setIsCompactViewport(media.matches)

    syncViewport()
    media.addEventListener('change', syncViewport)

    return () => media.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    if (!isCompactViewport || !isOpen) return undefined

    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCompactViewport, isOpen, onClose])

  return (
    <>
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
        aria-hidden={shouldHideSidebar}
        inert={shouldHideSidebar}
      >
        <div className="sidebar__top">
          <Logo />
          <button ref={closeButtonRef} className="icon-button sidebar__close" type="button" onClick={onClose} aria-label="Fechar menu">
            ×
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {navigationGroups.map((group, groupIndex) => (
            <div className="sidebar__group" key={group.id}>
              <span className={`sidebar__label ${groupIndex ? 'sidebar__label--space' : ''}`}>{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar__link ${group.id === 'world' ? 'sidebar__link--fluxora' : ''} ${activeView === item.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    onViewChange(item.id)
                    onClose()
                  }}
                >
                  {icons[item.icon]}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            className="sidebar__profile"
            type="button"
            onClick={() => {
              onProfile(currentEmployee)
              onClose()
            }}
          >
            <PixelAvatar avatar={currentEmployee.avatar} size={38} animated />
            <span>
              <strong>{currentEmployee.nome}</strong>
              <small>Personalizar crachá</small>
            </span>
          </button>
        </div>
      </aside>
      {isOpen && <button className="sidebar-overlay" type="button" onClick={onClose} aria-label="Fechar menu" />}
    </>
  )
}
