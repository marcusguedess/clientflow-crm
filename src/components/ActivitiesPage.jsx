export default function ActivitiesPage({ activities, tasks }) {
  const pending = tasks.filter((task) => task.status !== 'Concluído')
  return (
    <section className="activities-page">
      <div className="activity-summary">
        <div><span className="eyebrow">Hoje</span><h2>Central de atividades</h2><p>Próximos passos, histórico e itens que precisam de atenção.</p></div>
        <strong>{pending.length}<small>pendências</small></strong>
      </div>
      <div className="activity-layout">
        <div className="timeline">
          <h3>Histórico recente</h3>
          {activities.map((activity) => (
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
