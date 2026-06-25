import { useState } from 'react'
import PixelAvatar from './PixelAvatar'

const locations = {
  'employee-ana': { left: '23%', top: '42%' },
  'employee-bruno': { left: '36%', top: '54%' },
  'employee-lia': { left: '70%', top: '38%' },
  'employee-caio': { left: '62%', top: '70%' },
  'employee-nina': { left: '17%', top: '68%' },
  'employee-theo': { left: '82%', top: '57%' },
  'employee-bia': { left: '43%', top: '23%' },
  'employee-davi': { left: '73%', top: '79%' },
  'employee-yara': { left: '29%', top: '31%' },
  'employee-otto': { left: '88%', top: '27%' },
}

export default function OfficeCity({ employees, onSelectEmployee, onCityEvent }) {
  const [insideOffice, setInsideOffice] = useState(false)
  const [activeEmployeeId, setActiveEmployeeId] = useState(employees[0].id)
  const [actions, setActions] = useState({})

  function setCharacterAction(action) {
    setActions((current) => ({ ...current, [activeEmployeeId]: action }))
    const employee = employees.find((item) => item.id === activeEmployeeId)
    onCityEvent(`${employee.nome.split(' ')[0]} começou a ${action === 'dance' ? 'dançar' : action === 'wave' ? 'acenar' : action === 'walk' ? 'caminhar' : 'descansar'}.`)
  }

  if (insideOffice) {
    return (
      <section className="city-shell">
        <div className="city-heading">
          <div><span className="eyebrow">Fluxora HQ</span><h2>Escritório central</h2><p>Mesas, café, lounge e estações de trabalho da equipe.</p></div>
          <button className="button button--ghost" onClick={() => setInsideOffice(false)}>← Voltar à cidade</button>
        </div>
        <div className="office-interior">
          <div className="office-wall-sign">CLIENTFLOW HQ</div>
          <button className="office-coffee" onClick={() => onCityEvent('Café servido. Energia do time restaurada. ☕')} type="button"><span>CAFÉ</span><i>☕</i></button>
          <div className="office-lounge"><span>LOUNGE</span><i /><i /><b>🪴</b></div>
          <div className="office-meeting"><span>SALA DE REUNIÃO</span><i /><i /><i /><i /></div>
          {employees.slice(0, 8).map((employee, index) => (
            <button className={`office-desk office-desk--${index + 1} character-action--${actions[employee.id] || 'idle'}`} key={employee.id} onClick={() => onSelectEmployee(employee)}>
              <span className="desk-screen"><i /></span>
              <span className="desk-chair" />
              <PixelAvatar avatar={employee.avatar} size={46} animated />
              <small>{employee.nome.split(' ')[0]}</small>
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="city-shell">
      <div className="city-heading">
        <div>
          <span className="eyebrow">ClientFlow City</span>
          <h2>O escritório virou um pequeno mundo</h2>
          <p>Clique nos crachás para abrir o perfil de cada funcionário.</p>
        </div>
        <div className="city-heading__actions"><div className="city-weather"><span>☀</span> 26°C · Fluxo tranquilo</div><button className="button button--primary" onClick={() => setInsideOffice(true)}>Entrar no escritório →</button></div>
      </div>

      <div className="city-action-dock">
        <label><span>Personagem</span><select value={activeEmployeeId} onChange={(event) => setActiveEmployeeId(event.target.value)}>{employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.nome}</option>)}</select></label>
        <button onClick={() => setCharacterAction('walk')}>🚶 Andar</button>
        <button onClick={() => setCharacterAction('dance')}>♫ Dançar</button>
        <button onClick={() => setCharacterAction('wave')}>👋 Acenar</button>
        <button onClick={() => setCharacterAction('rest')}>☕ Descansar</button>
      </div>

      <div className="pixel-city" aria-label="Cidade virtual da equipe">
        <div className="city-road city-road--horizontal" />
        <div className="city-road city-road--vertical" />
        <div className="city-building city-building--sales">
          <span>COMERCIAL</span>
          <i /><i /><i />
        </div>
        <div className="city-building city-building--success">
          <span>SUCESSO</span>
          <i /><i />
        </div>
        <div className="city-building city-building--marketing">
          <span>MARKETING</span>
          <i /><i /><i />
        </div>
        <div className="city-food">
          <span>CAFÉ FLOW</span>
          <i>☕</i>
        </div>
        <div className="city-park">
          <span>Praça Central</span>
          <i className="tree tree--one" />
          <i className="tree tree--two" />
          <i className="bench" />
        </div>
        <div className="city-leisure">
          <span>Área de lazer</span>
          <i />
        </div>
        <div className="city-fountain" aria-hidden="true"><i /><i /><i /></div>
        <button className="city-npc city-npc--vendor" onClick={() => onCityEvent('O vendedor preparou um hot-dog virtual para você. 🌭')} type="button">
          <span className="npc-bubble">HOT-DOG</span>
          <span className="vendor-cart"><i>🌭</i></span>
          <span className="npc-person">🧑🏽‍🍳</span>
        </button>
        <button className="city-pet city-pet--dog" onClick={() => onCityEvent('Bolt abanou o rabo e ganhou carinho. 🐕')} type="button" aria-label="Interagir com Bolt">🐕</button>
        <button className="city-pet city-pet--cat" onClick={() => onCityEvent('Pixel decidiu sentar no seu teclado. 🐈')} type="button" aria-label="Interagir com Pixel">🐈</button>
        <button className="city-pet city-pet--bird" onClick={() => onCityEvent('Um passarinho trouxe boas notícias do pipeline. 🐦')} type="button" aria-label="Interagir com pássaro">🐦</button>
        <div className="city-car city-car--one" aria-hidden="true"><span>CF</span></div>
        <div className="city-car city-car--two" aria-hidden="true"><span>🚚</span></div>
        <button className="city-vending" onClick={() => onCityEvent('Você pegou um café energético na máquina. ☕')} type="button"><span>CAFÉ</span><i>☕</i></button>

        {employees.map((employee) => (
          <button
            className={`city-character character-action--${actions[employee.id] || 'idle'}`}
            key={employee.id}
            style={locations[employee.id]}
            onClick={() => onSelectEmployee(employee)}
            type="button"
          >
            <span className="city-character__badge">
              <strong>{employee.nome.split(' ')[0]}</strong>
              <small>{employee.setor}</small>
            </span>
            <PixelAvatar avatar={employee.avatar} size={55} animated />
            <span className={`city-character__presence presence-dot--${employee.status}`} />
          </button>
        ))}
      </div>
    </section>
  )
}
