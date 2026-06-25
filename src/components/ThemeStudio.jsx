import { useEffect, useState } from 'react'

const themes = [
  { id: 'aurora', label: 'Aurora', colors: ['#6b56e8', '#25c6a4'] },
  { id: 'sunset', label: 'Sunset', colors: ['#f05c78', '#f1a443'] },
  { id: 'ocean', label: 'Ocean', colors: ['#246bdc', '#23b9ce'] },
  { id: 'lime', label: 'Lime', colors: ['#269977', '#9acb38'] },
  { id: 'neon', label: 'Neon', colors: ['#00d9ff', '#ff3df2'] },
  { id: 'candy', label: 'Candy', colors: ['#ff6fb1', '#57d7ff'] },
  { id: 'executive', label: 'Executive', colors: ['#374c80', '#19b99a'] },
  { id: 'arcade', label: 'Arcade', colors: ['#7c3cff', '#f8c63d'] },
]

export default function ThemeStudio({ theme, onChange, soundEnabled, onToggleSound }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className={`theme-studio ${open ? 'is-open' : ''}`}>
      {open && (
        <section className="theme-studio__panel" aria-label="Personalização visual">
          <header>
            <div><strong>Clima visual</strong><small>Personalize seu workspace</small></div>
            <button className="theme-studio__close" type="button" onClick={() => setOpen(false)} aria-label="Fechar personalização">×</button>
          </header>
          <div className="theme-studio__themes">
            {themes.map((item) => (
              <button
                type="button"
                key={item.id}
                className={theme === item.id ? 'is-active' : ''}
                onClick={() => onChange(item.id)}
                aria-label={`Usar tema ${item.label}`}
                title={item.label}
                style={{ '--theme-a': item.colors[0], '--theme-b': item.colors[1] }}
              >
                <i />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <button className={`theme-sound ${soundEnabled ? 'is-active' : ''}`} type="button" onClick={onToggleSound}>
            <span aria-hidden="true">{soundEnabled ? '♪' : '×'}</span>
            {soundEnabled ? 'Sons ligados' : 'Sons desligados'}
          </button>
        </section>
      )}
      <button
        className="theme-studio__trigger"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? 'Fechar personalização visual' : 'Abrir personalização visual'}
        title="Personalização visual"
      >
        <span className="theme-studio__trigger-swatch" style={{ '--theme-a': themes.find((item) => item.id === theme)?.colors[0], '--theme-b': themes.find((item) => item.id === theme)?.colors[1] }} />
      </button>
    </div>
  )
}
