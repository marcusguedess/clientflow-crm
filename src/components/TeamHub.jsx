import { useMemo, useState } from 'react'
import EmployeeBadge from './EmployeeBadge'
import PixelAvatar from './PixelAvatar'
import { cleanText } from '../utils/sanitizeData'

export default function TeamHub({
  employees,
  currentEmployee,
  messages,
  posts,
  onSendMessage,
  onAddPost,
  onLikePost,
  onOpenProfile,
  initialContactId,
}) {
  const [search, setSearch] = useState('')
  const contacts = employees.filter((employee) => employee.id !== currentEmployee.id)
  const channelMap = useMemo(() => {
    const sectors = [...new Set(employees.map((employee) => employee.setor))]
    return {
      direct: contacts.map((employee) => ({
        id: employee.id,
        label: employee.nome,
        kind: 'Direto',
        members: [employee],
        avatar: employee.avatar,
      })),
      groups: [
        {
          id: 'group-comercial',
          label: 'Comercial',
          kind: 'Grupo',
          members: employees.filter((employee) => ['Comercial', 'Diretoria'].includes(employee.setor)),
          avatar: employees.find((employee) => ['Comercial', 'Diretoria'].includes(employee.setor))?.avatar,
        },
        {
          id: 'group-operacoes',
          label: 'Operações',
          kind: 'Grupo',
          members: employees.filter((employee) => ['Operações', 'Financeiro', 'Dados'].includes(employee.setor)),
          avatar: employees.find((employee) => ['Operações', 'Financeiro', 'Dados'].includes(employee.setor))?.avatar,
        },
        {
          id: 'group-gente',
          label: 'Pessoas & Cultura',
          kind: 'Grupo',
          members: employees.filter((employee) => ['Pessoas', 'Sucesso do cliente'].includes(employee.setor)),
          avatar: employees.find((employee) => ['Pessoas', 'Sucesso do cliente'].includes(employee.setor))?.avatar,
        },
      ].filter((group) => group.members.length),
      sectors: sectors.map((sector) => ({
        id: `sector-${sector.toLowerCase().replaceAll(' ', '-')}`,
        label: sector,
        kind: 'Setor',
        members: employees.filter((employee) => employee.setor === sector),
        avatar: employees.find((employee) => employee.setor === sector)?.avatar,
      })),
    }
  }, [employees, contacts])

  const [viewMode, setViewMode] = useState('direct')
  const [selectedId, setSelectedId] = useState(initialContactId || contacts[0]?.id)
  const [message, setMessage] = useState('')
  const [post, setPost] = useState('')
  const emojis = ['👍', '🎉', '🔥', '✨', '😂', '🚀', '❤️', '☕']
  const channels = channelMap[viewMode]
  const visibleChannels = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return channels
    return channels.filter((channel) =>
      [channel.label, channel.kind, ...(channel.members || []).map((member) => member.nome), ...(channel.members || []).map((member) => member.setor)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [channels, search])
  const selected = employees.find((employee) => employee.id === selectedId) || channels.find((channel) => channel.id === selectedId)
  const conversation = useMemo(() => messages[selectedId] || [], [messages, selectedId])

  function submitMessage(event) {
    event.preventDefault()
    const safeMessage = cleanText(message, 500)
    if (!safeMessage) return
    onSendMessage(selectedId, safeMessage)
    setMessage('')
  }

  function submitPost(event) {
    event.preventDefault()
    const safePost = cleanText(post, 500)
    if (!safePost) return
    onAddPost(safePost)
    setPost('')
  }

  function sendCoffee(channel) {
    setSelectedId(channel.id)
    setMessage((current) => `${current}${current ? ' ' : ''}☕ Brinde de café para ${channel.label}.`)
  }

  function selectChannel(channelId) {
    setSelectedId(channelId)
  }

  return (
    <div className="team-hub">
      <section className="messenger">
        <aside className="messenger__contacts">
          <div className="messenger__brand">
            <span className="messenger__orb">CF</span>
            <div><strong>Flow Inbox</strong><small>Conversas, grupos e setores</small></div>
          </div>
          <div className="messenger-view-switch">
            <button className={viewMode === 'direct' ? 'is-active' : ''} onClick={() => setViewMode('direct')} type="button">Diretas</button>
            <button className={viewMode === 'groups' ? 'is-active' : ''} onClick={() => setViewMode('groups')} type="button">Grupos</button>
            <button className={viewMode === 'sectors' ? 'is-active' : ''} onClick={() => setViewMode('sectors')} type="button">Setores</button>
          </div>
          <input
            className="messenger-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conversa, setor ou grupo"
          />
          {visibleChannels.map((channel) => (
            <div className={selectedId === channel.id ? 'contact-row is-active' : 'contact-row'} key={channel.id}>
              <button className="channel-row" onClick={() => selectChannel(channel.id)} type="button">
                <PixelAvatar avatar={channel.avatar} size={38} animated />
                <span>
                  <strong>{channel.label}</strong>
                  <small>{channel.kind} · {channel.members.length} pessoas</small>
                </span>
              </button>
              <div className="contact-actions">
                {channel.kind === 'Direto' && <button className="contact-profile-button" onClick={() => onOpenProfile(channel.members[0])} title="Abrir perfil">i</button>}
                <button className="contact-coffee-button" onClick={() => sendCoffee(channel)} title="Brindar café" type="button">☕</button>
              </div>
            </div>
          ))}
        </aside>

        <div className="messenger__chat">
          <header className="messenger__header">
            {selected?.members?.length ? (
              <div className="channel-header">
                <PixelAvatar avatar={selected.avatar} size={42} animated />
                <div>
                  <strong>{selected.label}</strong>
                  <small>{selected.kind} · {selected.members.length} participantes</small>
                </div>
              </div>
            ) : (
              <EmployeeBadge employee={selected} compact onClick={() => onOpenProfile(selected)} />
            )}
            <div className="messenger__header-actions">
              <span className="local-only-pill">Inbox operacional</span>
              <button type="button" className="button button--ghost messenger__new-thread" onClick={() => setViewMode('direct')}>Nova conversa</button>
            </div>
          </header>
          <div className="message-list">
            {conversation.length ? conversation.map((item) => {
              const sender = employees.find((employee) => employee.id === item.senderId)
              const mine = item.senderId === currentEmployee.id
              return (
                <div className={`message-row ${mine ? 'message-row--mine' : ''}`} key={item.id}>
                  {!mine && <PixelAvatar avatar={sender?.avatar || selected.avatar} size={30} />}
                  <div>
                    <span className="message-bubble">{item.text}</span>
                    <small>{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </div>
              )
            }) : <div className="message-empty">Comece uma conversa com {selected?.label || selected?.nome}.</div>}
          </div>
          <form className="message-compose" onSubmit={submitMessage}>
            <div className="emoji-row">
              {emojis.map((emoji) => <button key={emoji} type="button" onClick={() => setMessage((current) => `${current}${emoji}`)}>{emoji}</button>)}
            </div>
            <input value={message} maxLength="500" onChange={(event) => setMessage(event.target.value)} placeholder="Escreva uma mensagem, update ou convite..." />
            <div className="compose-actions">
              <button className="button button--ghost" type="button" onClick={() => sendCoffee(selected)}>☕ Brinde de café</button>
              <button className="button button--primary" type="submit">Enviar</button>
            </div>
          </form>
        </div>
      </section>

      <aside className="team-feed">
        <div className="team-feed__header">
          <div>
            <span className="eyebrow">Feed interno</span>
            <h3>Atualizações em estilo e-mail</h3>
          </div>
          <span className="local-only-pill">Comunicados, tarefas e pauta</span>
        </div>
        <form className="post-composer" onSubmit={submitPost}>
          <PixelAvatar avatar={currentEmployee.avatar} size={42} />
          <textarea value={post} maxLength="500" onChange={(event) => setPost(event.target.value)} placeholder="Publique um update para o time, um comunicado ou lembrete..." />
          <button className="button button--primary" type="submit">Enviar</button>
        </form>
        <div className="feed-list">
          {posts.map((item) => {
            const author = employees.find((employee) => employee.id === item.employeeId)
            return (
              <article className="feed-post" key={item.id}>
                <EmployeeBadge employee={author} compact onClick={() => onOpenProfile(author)} />
                <p>{item.text}</p>
                <footer>
                  <small>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</small>
                  <button onClick={() => onLikePost(item.id)} type="button">♥ {item.likes}</button>
                </footer>
              </article>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
