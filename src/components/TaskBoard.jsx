import { useState } from 'react'
import { TASK_STATUSES } from '../data/workData'
import { cleanText } from '../utils/sanitizeData'

const stickerOptions = ['🔥', '📌', '✨', '✅', '🌱', '🚀', '💡', '☕']

export default function TaskBoard({ tasks, employees, onCreate, onMove, onDelete }) {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', owner: employees[0].nome, priority: 'Média', dueDate: '', sticker: '📌' })

  function submit(event) {
    event.preventDefault()
    const title = cleanText(form.title, 100)
    if (!title) return
    onCreate({ ...form, title, description: cleanText(form.description, 300), status: 'Planejado' })
    setForm({ title: '', description: '', owner: employees[0].nome, priority: 'Média', dueDate: '', sticker: '📌' })
    setFormOpen(false)
  }

  return (
    <section className="tasks-page">
      <div className="section-heading">
        <div><span className="eyebrow">Operação comercial</span><h2>Flowboard</h2></div>
        <button className="button button--primary" onClick={() => setFormOpen((current) => !current)}>+ Nova tarefa</button>
      </div>

      {formOpen && (
        <form className="task-quick-form" onSubmit={submit}>
          <input required maxLength="100" placeholder="Título da tarefa" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input maxLength="300" placeholder="Descrição curta" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })}>{employees.map((employee) => <option key={employee.id}>{employee.nome}</option>)}</select>
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Baixa</option><option>Média</option><option>Alta</option></select>
          <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          <div className="sticker-picker">{stickerOptions.map((sticker) => <button className={form.sticker === sticker ? 'is-selected' : ''} type="button" key={sticker} onClick={() => setForm({ ...form, sticker })}>{sticker}</button>)}</div>
          <button className="button button--primary" type="submit">Criar</button>
        </form>
      )}

      <div className="task-board">
        {TASK_STATUSES.map((status) => (
          <section className="task-column" key={status}>
            <header><strong>{status}</strong><span>{tasks.filter((task) => task.status === status).length}</span></header>
            <div>
              {tasks.filter((task) => task.status === status).map((task) => (
                <article className={`task-card priority-${task.priority.toLowerCase()}`} key={task.id}>
                  <span className="task-sticker">{task.sticker}</span>
                  <button className="task-delete" onClick={() => onDelete(task.id)} aria-label={`Excluir ${task.title}`}>×</button>
                  <span className="task-priority">{task.priority}</span>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-meta"><span>{task.owner}</span><span>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem data'}</span></div>
                  <select value={task.status} onChange={(event) => onMove(task.id, event.target.value)}>{TASK_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
