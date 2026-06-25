import { avatarOptions } from '../data/teamData'
import PixelAvatar from './PixelAvatar'

export default function EmployeeProfile({
  employee,
  editable,
  onChange,
  onClose,
  onMessage,
  onLike,
  onRespect,
  socialStats,
  respectsLeft,
}) {
  if (!employee) return null

  function updateAvatar(field, value) {
    onChange?.({ ...employee, avatar: { ...employee.avatar, [field]: value } })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="profile-card" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button profile-card__close" onClick={onClose} aria-label="Fechar perfil">×</button>
        <div className="profile-card__cover">
          <span className={`presence-dot presence-dot--${employee.status}`} />
          <PixelAvatar avatar={employee.avatar} size={112} animated />
        </div>
        <div className="profile-card__body">
          <span className="pixel-label">CRACHÁ DIGITAL • CF-{employee.id.slice(-3).toUpperCase()}</span>
          <h2>{employee.nome}</h2>
          <strong>{employee.cargo}</strong>
          <p>{employee.bio}</p>
          <blockquote>“{employee.frase}”</blockquote>
          <div className="profile-social-stats">
            <span><strong>{socialStats?.likes || 0}</strong> joinhas</span>
            <span><strong>{socialStats?.respects || 0}</strong> respeitos</span>
          </div>
          {!editable && (
            <div className="profile-actions">
              <button className="button button--primary" onClick={() => onMessage?.(employee)}>Mensagem</button>
              <button className="button button--ghost" onClick={() => onLike?.(employee.id)}>👍 Joinha</button>
              <button className="button button--respect" disabled={!respectsLeft} onClick={() => onRespect?.(employee.id)}>
                ★ Respeito ({respectsLeft})
              </button>
            </div>
          )}

          {editable && (
            <div className="avatar-customizer">
              <h3>Personalizar avatar</h3>
              {['skin', 'hair', 'shirt'].map((field) => (
                <div className="swatch-row" key={field}>
                  <span>{field === 'skin' ? 'Pele' : field === 'hair' ? 'Cabelo' : 'Roupa'}</span>
                  {avatarOptions[field].map((color) => (
                    <button
                      key={color}
                      className={employee.avatar[field] === color ? 'is-selected' : ''}
                      style={{ backgroundColor: color }}
                      onClick={() => updateAvatar(field, color)}
                      aria-label={`Selecionar cor ${color}`}
                      type="button"
                    />
                  ))}
                </div>
              ))}
              <label>
                <span>Penteado</span>
                <select value={employee.avatar.hairStyle || 'short'} onChange={(event) => updateAvatar('hairStyle', event.target.value)}>
                  <option value="short">Curto</option>
                  <option value="long">Longo</option>
                  <option value="curly">Cacheado</option>
                  <option value="bun">Coque</option>
                  <option value="mohawk">Moicano</option>
                </select>
              </label>
              <label>
                <span>Roupa</span>
                <select value={employee.avatar.outfit || 'shirt'} onChange={(event) => updateAvatar('outfit', event.target.value)}>
                  <option value="shirt">Camiseta</option>
                  <option value="suit">Terno</option>
                  <option value="blazer">Blazer</option>
                  <option value="dress">Vestido</option>
                  <option value="skirt">Saia</option>
                  <option value="jacket">Jaqueta</option>
                </select>
              </label>
              <label>
                <span>Acessório</span>
                <select value={employee.avatar.accessory} onChange={(event) => updateAvatar('accessory', event.target.value)}>
                  <option value="none">Nenhum</option>
                  <option value="glasses">Óculos</option>
                  <option value="headset">Headset</option>
                  <option value="cap">Boné</option>
                  <option value="hat">Chapéu</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
