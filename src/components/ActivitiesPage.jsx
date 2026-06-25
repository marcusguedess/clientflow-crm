export default function ActivitiesPage({ activities, tasks, leads = [] }) {
  const pending = tasks.filter((task) => task.status !== 'Concluído')
  const commercialTimeline = [
    ...activities.map((activity) => ({
      ...activity,
      at: activity.at,
      title: activity.title,
      detail: activity.detail,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: lead.status === 'Fechado' ? 'won' : lead.status === 'Perdido' ? 'lost' : 'contact',
      title: `${lead.status}: ${lead.empresa}`,
      detail: `${lead.nome} · ${lead.responsavel || 'Sem responsável'}${lead.proximoPasso ? ` · próximo passo em ${new Date(`${lead.proximoPasso}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}`,
      at: Number.isNaN(Date.parse(lead.criadoEm)) ? new Date().toISOString() : lead.criadoEm,
    })),
    ...tasks.filter((task) => task.relatedLeadId).map((task) => {
      const lead = leads.find((item) => item.id === task.relatedLeadId)
      return {
        id: `task-${task.id}`,
        type: task.status === 'Concluído' ? 'won' : 'meeting',
        title: `Tarefa ${task.status.toLowerCase()}: ${task.title}`,
        detail: `${lead?.empresa || 'Oportunidade vinculada'} · ${task.owner} · ${task.priority}`,
        at: task.dueDate ? `${task.dueDate}T12:00:00.000Z` : new Date().toISOString(),
      }
    }),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 18)

  return (
    <section className="activities-page">
      <div className="activity-summary">
        <div><span className="eyebrow">Hoje</span><h2>Central de atividades</h2><p>Próximos passos, histórico e itens que precisam de atenção.</p></div>
        <strong>{pending.length}<small>pendências</small></strong>
      </div>
      <div className="activity-layout">
        <div className="timeline">
          <h3>Histórico recente</h3>
          {commercialTimeline.map((activity) => (
            <article className={`timeline-item timeline-item--${activity.type}`} key={activity.id}>
              <i />
              <div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{new Date(activity.at).toLocaleString('pt-BR')}</small></div>
            </article>
          ))}
        </div>
        <div className="upcoming-list">
          <h3>Próximas ações</h3>
          {pending.map((task) => (
            <article key={task.id}><span>{task.sticker}</span><div><strong>{task.title}</strong><small>{task.owner} · {task.priority}</small></div><time>{task.dueDate ? new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}</time></article>
          ))}
        </div>
      </div>
    </section>
  )
}
