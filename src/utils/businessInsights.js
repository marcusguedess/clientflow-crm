export function getLeadProbability(lead) {
  if (Number.isFinite(Number(lead.probabilidade))) return Number(lead.probabilidade)
  return {
    'Novo Lead': 12,
    'Contato Feito': 25,
    Reunião: 45,
    Proposta: 72,
    Fechado: 100,
    Perdido: 0,
  }[lead.status] || 0
}

export function getWeightedForecast(leads) {
  return leads
    .filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    .reduce((total, lead) => total + Number(lead.valorEstimado || 0) * (getLeadProbability(lead) / 100), 0)
}

export function buildBusinessAlerts(leads, tasks, today = new Date()) {
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const overdueTasks = tasks.filter((task) =>
    task.status !== 'Concluído' &&
    task.dueDate &&
    new Date(`${task.dueDate}T23:59:59`) < endOfToday,
  )
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const noNextStep = openLeads.filter((lead) => !lead.proximoPasso)
  const overdueNextSteps = openLeads.filter((lead) =>
    lead.proximoPasso &&
    new Date(`${lead.proximoPasso}T23:59:59`) < endOfToday,
  )
  const closingSoon = openLeads.filter((lead) => {
    if (!lead.previsaoFechamento) return false
    const closeDate = new Date(`${lead.previsaoFechamento}T12:00:00`)
    const days = (closeDate - today) / 86_400_000
    return days >= 0 && days <= 14
  })
  const highValueNoTask = openLeads.filter((lead) =>
    Number(lead.valorEstimado || 0) >= 20000 &&
    !tasks.some((task) => task.relatedLeadId === lead.id && task.status !== 'Concluído'),
  )

  return [
    {
      id: 'overdue-tasks',
      label: 'Tarefas atrasadas',
      value: overdueTasks.length,
      tone: overdueTasks.length ? 'red' : 'green',
      detail: overdueTasks.length ? 'Resolver pendências vencidas do time.' : 'Nenhuma pendência vencida.',
    },
    {
      id: 'no-next-step',
      label: 'Sem próximo passo',
      value: noNextStep.length,
      tone: noNextStep.length ? 'orange' : 'green',
      detail: noNextStep.length ? 'Definir próxima ação para oportunidades abertas.' : 'Carteira aberta com próximos passos.',
    },
    {
      id: 'overdue-next-step',
      label: 'Próximo passo vencido',
      value: overdueNextSteps.length,
      tone: overdueNextSteps.length ? 'red' : 'green',
      detail: overdueNextSteps.length ? 'Reativar oportunidades com follow-up vencido.' : 'Follow-ups dentro do prazo.',
    },
    {
      id: 'closing-soon',
      label: 'Fechamento em 14 dias',
      value: closingSoon.length,
      tone: closingSoon.length ? 'violet' : 'blue',
      detail: closingSoon.length ? 'Revisar decisores, proposta e risco.' : 'Sem fechamentos imediatos mapeados.',
    },
    {
      id: 'high-value-no-task',
      label: 'Alto valor sem tarefa',
      value: highValueNoTask.length,
      tone: highValueNoTask.length ? 'orange' : 'green',
      detail: highValueNoTask.length ? 'Criar plano de ação para deals estratégicos.' : 'Deals estratégicos com cobertura operacional.',
    },
  ]
}
