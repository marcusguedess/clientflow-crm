const themes = [
  { id: 'aurora', label: 'Aurora', colors: ['#6b56e8', '#25c6a4'] },
  { id: 'sunset', label: 'Sunset', colors: ['#f05c78', '#f1a443'] },
  { id: 'ocean', label: 'Ocean', colors: ['#246bdc', '#23b9ce'] },
  { id: 'lime', label: 'Lime', colors: ['#269977', '#9acb38'] },
]

export default function ThemeStudio({ theme, onChange, soundEnabled, onToggleSound }) {
  return (
    <div className="theme-studio">
      <span>Clima visual</span>
      {themes.map((item) => (
        <button
          type="button"
          key={item.id}
          className={theme === item.id ? 'is-active' : ''}
          onClick={() => onChange(item.id)}
          aria-label={`Usar tema ${item.label}`}
          title={item.label}
          style={{ '--theme-a': item.colors[0], '--theme-b': item.colors[1] }}
        />
      ))}
      <button className={`theme-sound ${soundEnabled ? 'is-active' : ''}`} onClick={onToggleSound} title={soundEnabled ? 'Desligar sons' : 'Ligar sons'}>{soundEnabled ? '♪' : '×'}</button>
    </div>
  )
}
