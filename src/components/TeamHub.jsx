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
  const contacts = employees.filter((employee) => employee.id !== currentEmployee.id)
  const [selectedId, setSelectedId] = useState(initialContactId || contacts[0]?.id)
  const [message, setMessage] = useState('')
  const [post, setPost] = useState('')
  const emojis = ['👍', '🎉', '🔥', '✨', '😂', '🚀', '❤️', '☕']
  const selected = employees.find((employee) => employee.id === selectedId)
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

  return (
    <div className="team-hub">
      <section className="messenger">
        <aside className="messenger__contacts">
          <div className="messenger__brand">
            <span className="messenger__orb">CF</span>
            <div><strong>Flow Messenger</strong><small>Mensagens locais</small></div>
          </div>
          {contacts.map((employee) => (
            <div className={selectedId === employee.id ? 'contact-row is-active' : 'contact-row'} key={employee.id}>
              <EmployeeBadge employee={employee} compact onClick={() => setSelectedId(employee.id)} />
              <button className="contact-profile-button" onClick={() => onOpenProfile(employee)} title="Abrir perfil">i</button>
            </div>
          ))}
        </aside>

        <div className="messenger__chat">
          <header className="messenger__header">
            <EmployeeBadge employee={selected} compact onClick={() => onOpenProfile(selected)} />
            <span className="local-only-pill">Neste navegador</span>
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
            }) : <div className="message-empty">Comece uma conversa com {selected?.nome}.</div>}
          </div>
          <form className="message-compose" onSubmit={submitMessage}>
            <div className="emoji-row">
              {emojis.map((emoji) => <button key={emoji} type="button" onClick={() => setMessage((current) => `${current}${emoji}`)}>{emoji}</button>)}
            </div>
            <input value={message} maxLength="500" onChange={(event) => setMessage(event.target.value)} placeholder="Digite uma mensagem..." />
            <button className="button button--primary" type="submit">Enviar</button>
          </form>
        </div>
      </section>

      <aside className="team-feed">
        <form className="post-composer" onSubmit={submitPost}>
          <PixelAvatar avatar={currentEmployee.avatar} size={42} />
          <textarea value={post} maxLength="500" onChange={(event) => setPost(event.target.value)} placeholder="Compartilhe uma atualização com a equipe..." />
          <button className="button button--primary" type="submit">Publicar</button>
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
