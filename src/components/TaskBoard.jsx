import { useMemo, useState } from 'react'
import { TASK_STATUSES } from '../data/workData'
import { normalizeTask } from '../domain/tasks'
import { cleanText } from '../utils/sanitizeData'

const stickerOptions = ['🔥', '📌', '✨', '✅', '🌱', '🚀', '💡', '☕']

export default function TaskBoard({ tasks, employees, leads = [], onCreate, onMove, onDelete }) {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', owner: employees[0].nome, priority: 'Média', dueDate: '', sticker: '📌', relatedLeadId: '' })
  const safeTasks = useMemo(() => tasks.map((task, index) => normalizeTask(task, {
    id: task?.id || `legacy-task-${index}`,
    owner: employees[0]?.nome || 'Sem responsável',
  })), [employees, tasks])

  function submit(event) {
    event.preventDefault()
    const title = cleanText(form.title, 100)
    if (!title) return
    onCreate({ ...form, title, description: cleanText(form.description, 300), status: 'Planejado' })
    setForm({ title: '', description: '', owner: employees[0].nome, priority: 'Média', dueDate: '', sticker: '📌', relatedLeadId: '' })
    setFormOpen(false)
  }

  return (
    <section className="tasks-page">
      <div className="section-heading">
        <div><span className="eyebrow">Operação comercial</span><h2>Flowboard</h2></div>
        <button className="button button--primary" type="button" onClick={() => setFormOpen((current) => !current)}>+ Nova tarefa</button>
      </div>

      {formOpen && (
        <form className="task-quick-form" onSubmit={submit}>
          <input required maxLength="100" aria-label="Título da tarefa" placeholder="Título da tarefa" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input maxLength="300" aria-label="Descrição curta da tarefa" placeholder="Descrição curta" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select aria-label="Responsável pela tarefa" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })}>{employees.map((employee) => <option key={employee.id}>{employee.nome}</option>)}</select>
          <select aria-label="Oportunidade vinculada" value={form.relatedLeadId} onChange={(event) => setForm({ ...form, relatedLeadId: event.target.value })}>
            <option value="">Sem oportunidade vinculada</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.empresa} · {lead.nome}</option>)}
          </select>
          <select aria-label="Prioridade da tarefa" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Baixa</option><option>Média</option><option>Alta</option></select>
          <input type="date" aria-label="Prazo da tarefa" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          <div className="sticker-picker">{stickerOptions.map((sticker) => <button className={form.sticker === sticker ? 'is-selected' : ''} type="button" key={sticker} onClick={() => setForm({ ...form, sticker })}>{sticker}</button>)}</div>
          <button className="button button--primary" type="submit">Criar</button>
        </form>
      )}

      <div className="task-board">
        {TASK_STATUSES.map((status) => (
          <section className="task-column" key={status}>
            <header><strong>{status}</strong><span>{safeTasks.filter((task) => task.status === status).length}</span></header>
            <div>
              {safeTasks.filter((task) => task.status === status).map((task) => {
                const relatedLead = leads.find((lead) => lead.id === task.relatedLeadId)
                const priorityClass = task.priority.toLowerCase()
                return (
                  <article className={`task-card priority-${priorityClass}`} key={task.id}>
                    <span className="task-sticker">{task.sticker}</span>
                    <button className="task-delete" type="button" onClick={() => onDelete(task.id)} aria-label={`Excluir ${task.title}`}>×</button>
                    <span className="task-priority">{task.priority}</span>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    {relatedLead && <small className="task-related">Vinculada a {relatedLead.empresa}</small>}
                    <div className="task-meta"><span>{task.owner}</span><span>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR') : 'Sem data'}</span></div>
                    <select aria-label={`Mover ${task.title}`} value={task.status} onChange={(event) => onMove(task.id, event.target.value)}>{TASK_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
