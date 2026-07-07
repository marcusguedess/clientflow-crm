import { useEffect, useState } from 'react'
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
  'employee-marcus': { left: '52%', top: '46%' },
  'employee-leonardo': { left: '55%', top: '23%' },
}

export default function OfficeCity({
  employees,
  currentEmployee,
  citySignals = [],
  onSelectEmployee,
  onCityEvent,
  onOpenPipeline,
  onOpenMessenger,
  onCreateTask,
  onSound,
}) {
  const [insideOffice, setInsideOffice] = useState(false)
  const playerId = currentEmployee?.id || employees[0]?.id
  const player = employees.find((employee) => employee.id === playerId) || employees[0]
  const [activeEmployeeId, setActiveEmployeeId] = useState(playerId)
  const [positions, setPositions] = useState(locations)
  const [actions, setActions] = useState({})
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    if (playerId) setActiveEmployeeId(playerId)
  }, [playerId])

  function setCharacterAction(action) {
    setActions((current) => ({ ...current, [playerId]: action }))
    onCityEvent(
      `${player.nome.split(' ')[0]} começou a ${action === 'dance' ? 'dançar' : action === 'wave' ? 'acenar' : action === 'walk' ? 'caminhar' : 'descansar'}.`,
      { title: 'Ação do avatar', detail: action, district: 'city' },
    )
  }

  function moveActive(dx, dy) {
    setActions((current) => ({ ...current, [playerId]: 'walk' }))
    setPositions((current) => {
      const currentPosition = current[playerId] || locations[playerId] || { left: '50%', top: '50%' }
      const left = Math.min(92, Math.max(8, Number.parseFloat(currentPosition.left) + dx))
      const top = Math.min(84, Math.max(12, Number.parseFloat(currentPosition.top) + dy))
      return { ...current, [playerId]: { left: `${left}%`, top: `${top}%` } }
    })
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const keys = {
        ArrowUp: [0, -4],
        w: [0, -4],
        W: [0, -4],
        ArrowDown: [0, 4],
        s: [0, 4],
        S: [0, 4],
        ArrowLeft: [-4, 0],
        a: [-4, 0],
        A: [-4, 0],
        ArrowRight: [4, 0],
        d: [4, 0],
        D: [4, 0],
      }
      const move = keys[event.key]
      if (!move || insideOffice) return
      event.preventDefault()
      moveActive(move[0], move[1])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [insideOffice, playerId])

  function interact(title, text, sound = 'click', payload = {}) {
    onSound?.(sound)
    onCityEvent?.(text, { title, detail: text, ...payload })
    setDialog({ title, text })
  }

  function createCityTask() {
    onCreateTask?.({
      title: 'Revisar prioridades do pipeline',
      description: 'Criada a partir da ClientFlow City para revisar oportunidades sem próxima ação.',
      status: 'Planejado',
      dueDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    })
    onCityEvent?.('Tarefa criada no Flowboard a partir da cidade.', {
      title: 'Tarefa criada na cidade',
      detail: 'Revisar prioridades do pipeline',
      district: 'commercial',
    })
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
        <div className="city-canvas-scroll" aria-label="Área navegável do escritório">
          <div className="office-interior">
            <div className="office-wall-sign">CLIENTFLOW HQ</div>
            <button className="office-coffee" onClick={() => interact('Café do escritório', 'Pausa registrada. Volte para o pipeline com uma próxima ação clara.', 'shop', { district: 'office' })} type="button"><span>CAFÉ</span><i>☕</i></button>
            <div className="office-lounge"><span>LOUNGE</span><i /><i /><b>🪴</b></div>
            <div className="office-meeting"><span>SALA DE REUNIÃO</span><i /><i /><i /><i /></div>
            {employees.map((employee, index) => (
              <button className={`office-desk office-desk--${index + 1} character-action--${actions[employee.id] || 'idle'}`} key={employee.id} onClick={() => onSelectEmployee(employee)}>
                <span className="desk-screen"><i /></span>
                <span className="desk-chair" />
                <PixelAvatar avatar={employee.avatar} size={46} animated />
                <small>{employee.nome.split(' ')[0]}</small>
              </button>
            ))}
            <button className="office-seat office-seat--meeting" onClick={() => { interact('Mesa de reunião', 'Revisão comercial iniciada. Abrindo pipeline para priorizar decisões.', 'click', { district: 'office' }); onOpenPipeline?.() }} type="button">Sentar</button>
            <button className="office-seat office-seat--lounge" onClick={() => interact('Pausa no lounge', 'Pausa curta registrada sem mudar dados comerciais.', 'click', { district: 'office' })} type="button">Descansar</button>
          </div>
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
          <p>Controle seu avatar, abra perfis da equipe e use os prédios como atalhos para áreas reais do CRM.</p>
        </div>
        <div className="city-heading__actions"><div className="city-weather"><span>☀</span> {citySignals[0]?.title || 'Fluxo tranquilo'}</div><button className="button button--primary" onClick={() => setInsideOffice(true)}>Entrar no escritório →</button></div>
      </div>

      <div className="city-action-dock">
        <div className="city-player-chip"><span>Jogador</span><strong>{player?.nome}</strong></div>
        <button onClick={() => setCharacterAction('walk')}>🚶 Andar</button>
        <button onClick={() => setCharacterAction('dance')}>♫ Dançar</button>
        <button onClick={() => setCharacterAction('wave')}>👋 Acenar</button>
        <button onClick={() => setCharacterAction('rest')}>☕ Descansar</button>
        <button onClick={createCityTask}>📌 Criar tarefa</button>
        <div className="city-move-pad" aria-label="Mover avatar ativo">
          <button onClick={() => moveActive(0, -5)} aria-label="Mover para cima">↑</button>
          <button onClick={() => moveActive(-5, 0)} aria-label="Mover para esquerda">←</button>
          <button onClick={() => moveActive(5, 0)} aria-label="Mover para direita">→</button>
          <button onClick={() => moveActive(0, 5)} aria-label="Mover para baixo">↓</button>
        </div>
        <span className="city-keyboard-hint">WASD / setas</span>
      </div>

      {citySignals.length > 0 && (
        <div className="city-signal-strip" aria-label="Sinais recentes do CRM">
          {citySignals.slice(0, 3).map((signal) => (
            <button key={signal.id} type="button" onClick={() => ['sales', 'commercial'].includes(signal.district) ? onOpenPipeline?.() : onOpenMessenger?.()}>
              <span>{signal.title}</span>
              <small>{signal.detail}</small>
            </button>
          ))}
        </div>
      )}

      <div className="city-canvas-scroll" aria-label="Área navegável da cidade">
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
        <div className="city-building city-building--enterprise">
          <span>ENTERPRISE</span>
          <i /><i /><i /><i />
        </div>
        <div className="city-building city-building--data">
          <span>DADOS</span>
          <i /><i />
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
        <button className="city-npc city-npc--vendor" onClick={() => interact('Carrinho do Nico', 'Pausa informal registrada. Nenhuma métrica comercial foi alterada.', 'shop', { district: 'park' })} type="button">
          <span className="npc-bubble">HOT-DOG</span>
          <span className="vendor-cart"><i>🌭</i></span>
          <span className="npc-person">🧑🏽‍🍳</span>
        </button>
        <button className="city-npc city-npc--baker" onClick={() => interact('Padaria da Luma', 'Pausa curta registrada. Bom momento para revisar follow-ups pendentes.', 'shop', { district: 'park' })} type="button"><span className="npc-bubble">CROISSANT</span><span className="npc-person">🧑🏻‍🍳</span><span className="bakery-tray">🥐</span></button>
        <button className="city-pet city-pet--dog" onClick={() => onCityEvent('Bolt lembrou você de revisar oportunidades sem próxima ação. 🐕', { title: 'Lembrete leve', district: 'park' })} type="button" aria-label="Interagir com Bolt">🐕</button>
        <button className="city-pet city-pet--cat" onClick={() => onCityEvent('Pixel sentou no teclado. Pausa aceita, dados preservados. 🐈', { title: 'Pausa na cidade', district: 'park' })} type="button" aria-label="Interagir com Pixel">🐈</button>
        <button className="city-pet city-pet--bird" onClick={() => onCityEvent('Sinal recebido: confira o pipeline antes de encerrar o dia. 🐦', { title: 'Sinal do pipeline', district: 'park' })} type="button" aria-label="Interagir com pássaro">🐦</button>
        <div className="city-car city-car--one" aria-hidden="true"><span>CF</span></div>
        <div className="city-car city-car--two" aria-hidden="true"><span>🚚</span></div>
        <button className="city-vending" onClick={() => interact('Máquina expressa', 'Café servido. Sugestão: registre a próxima ação antes de trocar de contexto.', 'shop', { district: 'commercial' })} type="button"><span>CAFÉ</span><i>☕</i></button>
        <button className="city-door city-door--sales" onClick={() => { onCityEvent?.('Abrindo pipeline comercial.', { title: 'Atalho da cidade', district: 'commercial' }); onOpenPipeline?.() }} type="button">Pipeline</button>
        <button className="city-door city-door--success" onClick={() => { onCityEvent?.('Abrindo conversas e handoffs.', { title: 'Atalho da cidade', district: 'success' }); onOpenMessenger?.() }} type="button">Conversas</button>
        <button className="city-door city-door--marketing" onClick={createCityTask} type="button">Tarefa</button>

          {employees.map((employee) => (
            <button
              className={`city-character ${activeEmployeeId === employee.id ? 'is-active' : ''} character-action--${actions[employee.id] || 'idle'}`}
              key={employee.id}
              style={positions[employee.id] || locations[employee.id]}
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
      </div>
      {dialogModal}
    </section>
  )
}
