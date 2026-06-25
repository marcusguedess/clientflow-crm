import { useMemo, useState } from 'react'
import EmployeeBadge from './EmployeeBadge'
import PixelAvatar from './PixelAvatar'
import { cleanText } from '../utils/sanitizeData'

export default function TeamHub({
  employees,
  currentEmployee,
  posts,
  onAddPost,
  onLikePost,
  onOpenProfile,
  tasks = [],
  socialStats = {},
}) {
  const [post, setPost] = useState('')
  const peoplePulse = useMemo(() => {
    const online = employees.filter((employee) => employee.status === 'online').length
    const sectors = [...new Set(employees.map((employee) => employee.setor))]
    const workload = employees.map((employee) => ({
      employee,
      tasks: tasks.filter((task) => task.owner === employee.nome && task.status !== 'Concluído'),
      recognition: (socialStats[employee.id]?.likes || 0) + (socialStats[employee.id]?.respects || 0),
    })).sort((a, b) => b.tasks.length - a.tasks.length)
    const overloaded = workload.filter((item) => item.tasks.length >= 2).length
    const recognitionTotal = Object.values(socialStats).reduce((sum, item) => sum + (item.likes || 0) + (item.respects || 0), 0)
    return { online, sectors, workload, overloaded, recognitionTotal }
  }, [employees, socialStats, tasks])

  function submitPost(event) {
    event.preventDefault()
    const safePost = cleanText(post, 500)
    if (!safePost) return
    onAddPost(safePost)
    setPost('')
  }

  return (
    <div className="team-hub">
      <section className="people-command">
        <div className="people-command__intro">
          <span className="eyebrow">People operations</span>
          <h2>Diretório, rituais e carga do time</h2>
          <p>Um painel rápido para acompanhar presença, setores, reconhecimento e risco de sobrecarga.</p>
        </div>
        <div className="people-command__metrics">
          <span><small>Online agora</small><strong>{peoplePulse.online}/{employees.length}</strong></span>
          <span><small>Setores</small><strong>{peoplePulse.sectors.length}</strong></span>
          <span><small>Sobrecarga</small><strong>{peoplePulse.overloaded}</strong></span>
          <span><small>Reconhecimentos</small><strong>{peoplePulse.recognitionTotal}</strong></span>
        </div>
        <div className="people-rituals">
          <article><strong>Check-in semanal</strong><small>Prioridades, bloqueios e humor do time.</small></article>
          <article><strong>1:1s</strong><small>Conversas de evolução por líder e colaborador.</small></article>
          <article><strong>Reconhecimento</strong><small>Joinhas e respeitos conectados ao crachá.</small></article>
        </div>
        <div className="people-workload">
          {peoplePulse.workload.slice(0, 6).map((item) => (
            <button key={item.employee.id} type="button" onClick={() => onOpenProfile(item.employee)}>
              <PixelAvatar avatar={item.employee.avatar} size={34} animated />
              <span><strong>{item.employee.nome}</strong><small>{item.employee.setor}</small></span>
              <b>{item.tasks.length}</b>
            </button>
          ))}
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
