import { useEffect, useState } from 'react'

const themes = [
  { id: 'aurora', label: 'Aurora', family: 'Vibrante', colors: ['#6b56e8', '#25c6a4'] },
  { id: 'sunset', label: 'Pôr do sol', family: 'Vibrante', colors: ['#f05c78', '#f1a443'] },
  { id: 'ocean', label: 'Oceano', family: 'Fresco', colors: ['#246bdc', '#23b9ce'] },
  { id: 'lime', label: 'Jardim', family: 'Fresco', colors: ['#269977', '#9acb38'] },
  { id: 'neon', label: 'Neon', family: 'Vibrante', colors: ['#00b9e8', '#e63bd8'] },
  { id: 'candy', label: 'Candy', family: 'Vibrante', colors: ['#f15ca4', '#43c9f3'] },
  { id: 'executive', label: 'Executivo', family: 'Sóbrio', colors: ['#374c80', '#19b99a'] },
  { id: 'arcade', label: 'Arcade', family: 'Vibrante', colors: ['#7c3cff', '#f8c63d'] },
  { id: 'terracotta', label: 'Terracota', family: 'Terroso', colors: ['#b85f42', '#d69a56'] },
  { id: 'olive', label: 'Oliva', family: 'Terroso', colors: ['#697a42', '#b59a54'] },
  { id: 'copper', label: 'Cobre', family: 'Terroso', colors: ['#a85d39', '#527f78'] },
  { id: 'coffee', label: 'Café', family: 'Terroso', colors: ['#76513d', '#b47a52'] },
]

const visualModes = [
  { id: 'essential', label: 'Essencial', detail: 'Poucos efeitos, foco máximo' },
  { id: 'balanced', label: 'Equilibrado', detail: 'Profundidade sem excesso' },
  { id: 'immersive', label: 'Imersivo', detail: 'Cores, brilho e movimento' },
]

export default function ThemeStudio({
  theme,
  onChange,
  visualMode,
  onVisualModeChange,
  density,
  onDensityChange,
  soundEnabled,
  onToggleSound,
}) {
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
            <div><strong>Seu ClientFlow</strong><small>Paleta, intensidade e densidade</small></div>
            <button className="theme-studio__close" type="button" onClick={() => setOpen(false)} aria-label="Fechar personalização">×</button>
          </header>
          <div className="theme-studio__section-heading">
            <span>Atmosfera</span>
            <small>{themes.find((item) => item.id === theme)?.family}</small>
          </div>
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
          <div className="theme-studio__section-heading">
            <span>Experiência visual</span>
            <small>Escolha a intensidade</small>
          </div>
          <div className="theme-studio__modes">
            {visualModes.map((mode) => (
              <button
                key={mode.id}
                className={visualMode === mode.id ? 'is-active' : ''}
                type="button"
                onClick={() => onVisualModeChange(mode.id)}
              >
                <i aria-hidden="true" />
                <span><strong>{mode.label}</strong><small>{mode.detail}</small></span>
              </button>
            ))}
          </div>
          <div className="theme-studio__preferences">
            <div><strong>Densidade</strong><small>Espaço entre informações</small></div>
            <div className="theme-studio__segmented">
              <button className={density === 'comfortable' ? 'is-active' : ''} type="button" onClick={() => onDensityChange('comfortable')}>Confortável</button>
              <button className={density === 'compact' ? 'is-active' : ''} type="button" onClick={() => onDensityChange('compact')}>Compacta</button>
            </div>
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
