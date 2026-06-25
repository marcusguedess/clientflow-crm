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

export default function OfficeCity({ employees, onSelectEmployee, onCityEvent, onSound }) {
  const [insideOffice, setInsideOffice] = useState(false)
  const [activeEmployeeId, setActiveEmployeeId] = useState(employees[0].id)
  const [actions, setActions] = useState({})
  const [dialog, setDialog] = useState(null)

  function setCharacterAction(action) {
    setActions((current) => ({ ...current, [activeEmployeeId]: action }))
    const employee = employees.find((item) => item.id === activeEmployeeId)
    onCityEvent(`${employee.nome.split(' ')[0]} começou a ${action === 'dance' ? 'dançar' : action === 'wave' ? 'acenar' : action === 'walk' ? 'caminhar' : 'descansar'}.`)
  }

  function interact(title, text, sound = 'click') {
    onSound?.(sound)
    setDialog({ title, text })
  }

  const dialogModal = dialog && (
    <div className="city-dialog-backdrop" role="presentation" onMouseDown={() => setDialog(null)}>
      <section className="city-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <span className="city-dialog__portrait">☕</span>
        <div><span className="eyebrow">Interação</span><h3>{dialog.title}</h3><p>{dialog.text}</p></div>
        <button className="button button--primary" onClick={() => setDialog(null)}>Continuar</button>
      </section>
    </div>
  )

  if (insideOffice) {
    return (
      <section className="city-shell">
        <div className="city-heading">
          <div><span className="eyebrow">Fluxora HQ</span><h2>Escritório central</h2><p>Mesas, café, lounge e estações de trabalho da equipe.</p></div>
          <button className="button button--ghost" onClick={() => setInsideOffice(false)}>← Voltar à cidade</button>
        </div>
        <div className="office-interior">
          <div className="office-wall-sign">CLIENTFLOW HQ</div>
          <button className="office-coffee" onClick={() => interact('Café do escritório', 'Você preparou um espresso e recuperou a energia da tarde.', 'shop')} type="button"><span>CAFÉ</span><i>☕</i></button>
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
          <button className="office-seat office-seat--meeting" onClick={() => interact('Mesa de reunião', 'Você se sentou para revisar o pipeline com a equipe.')} type="button">Sentar</button>
          <button className="office-seat office-seat--lounge" onClick={() => interact('Pausa no lounge', 'Poltrona confortável, plantas e cinco minutos longe das notificações.')} type="button">Descansar</button>
        </div>
        {dialogModal}
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
        <button className="city-npc city-npc--vendor" onClick={() => interact('Carrinho do Nico', 'Um hot-dog caprichado saiu por 12 FlowCoins. O vendedor agradeceu a visita.', 'shop')} type="button">
          <span className="npc-bubble">HOT-DOG</span>
          <span className="vendor-cart"><i>🌭</i></span>
          <span className="npc-person">🧑🏽‍🍳</span>
        </button>
        <button className="city-npc city-npc--baker" onClick={() => interact('Padaria da Luma', 'Croissant quentinho, manteiga derretendo e cheiro de café pela praça.', 'shop')} type="button"><span className="npc-bubble">CROISSANT</span><span className="npc-person">🧑🏻‍🍳</span><span className="bakery-tray">🥐</span></button>
        <button className="city-pet city-pet--dog" onClick={() => onCityEvent('Bolt abanou o rabo e ganhou carinho. 🐕')} type="button" aria-label="Interagir com Bolt">🐕</button>
        <button className="city-pet city-pet--cat" onClick={() => onCityEvent('Pixel decidiu sentar no seu teclado. 🐈')} type="button" aria-label="Interagir com Pixel">🐈</button>
        <button className="city-pet city-pet--bird" onClick={() => onCityEvent('Um passarinho trouxe boas notícias do pipeline. 🐦')} type="button" aria-label="Interagir com pássaro">🐦</button>
        <div className="city-car city-car--one" aria-hidden="true"><span>CF</span></div>
        <div className="city-car city-car--two" aria-hidden="true"><span>🚚</span></div>
        <button className="city-vending" onClick={() => interact('Máquina expressa', 'Café curto servido. A máquina piscou: “boa reunião!”.', 'shop')} type="button"><span>CAFÉ</span><i>☕</i></button>
        <button className="city-door city-door--sales" onClick={() => interact('Escritório comercial', 'Porta aberta: telefones tocando, propostas na tela e uma meta quase batida.')} type="button">Entrar</button>
        <button className="city-door city-door--success" onClick={() => interact('Sucesso do cliente', 'Uma sala tranquila com mapas de jornada e histórias de clientes.')} type="button">Entrar</button>
        <button className="city-door city-door--marketing" onClick={() => interact('Estúdio de marketing', 'Luzes, câmera, post-its e uma campanha sendo finalizada.')} type="button">Entrar</button>

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
      {dialogModal}
    </section>
  )
}
