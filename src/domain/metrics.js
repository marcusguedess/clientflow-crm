import { PIPELINE_STATUSES } from '../data/seedData.js'

export const DEFAULT_GOAL_CONFIG = {
  periodGoal: 250000,
  currency: 'BRL',
  period: 'Mensal',
}

export const DEFAULT_STAGE_PROBABILITY = {
  'Novo Lead': 12,
  'Contato Feito': 25,
  Reunião: 45,
  Proposta: 72,
  Fechado: 100,
  Perdido: 0,
}

export function toDate(value) {
  if (!value) return null
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeGoalConfig(value = {}) {
  const rawGoal = Number(value?.periodGoal)
  return {
    ...DEFAULT_GOAL_CONFIG,
    ...(value && typeof value === 'object' ? value : {}),
    periodGoal: Number.isFinite(rawGoal) ? Math.max(0, rawGoal) : DEFAULT_GOAL_CONFIG.periodGoal,
    currency: value?.currency === 'BRL' ? 'BRL' : DEFAULT_GOAL_CONFIG.currency,
    period: typeof value?.period === 'string' && value.period.trim() ? value.period.trim().slice(0, 40) : DEFAULT_GOAL_CONFIG.period,
  }
}

export function startOfDay(date = new Date()) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

export function endOfDay(date = new Date()) {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
  return nextDate
}

export function classifyDateAgainstDay(value, today = new Date()) {
  const date = toDate(value)
  if (!date) return 'none'
  if (date < startOfDay(today)) return 'overdue'
  if (date <= endOfDay(today)) return 'today'
  return 'future'
}

export function daysBetween(from, to = new Date()) {
  const start = toDate(from)
  if (!start) return null
  return Math.floor((to - start) / 86_400_000)
}

export function getDealProbability(deal) {
  if (Number.isFinite(Number(deal.probabilidade))) return Number(deal.probabilidade)
  if (Number.isFinite(Number(deal.probability))) return Number(deal.probability)
  return DEFAULT_STAGE_PROBABILITY[deal.status || deal.stage] || 0
}

export function getWeightedForecast(leads) {
  return Math.round(leads
    .filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    .reduce((total, lead) => total + Number(lead.valorEstimado || 0) * (getDealProbability(lead) / 100), 0))
}

export function getWonRevenue(leads) {
  return leads
    .filter((lead) => lead.status === 'Fechado')
    .reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
}

export function getOpenPipelineValue(leads) {
  return leads
    .filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    .reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0)
}

export function analyzeDealRisk(lead, tasks = [], today = new Date()) {
  if (['Fechado', 'Perdido'].includes(lead.status)) {
    return { level: 'none', score: 0, reasons: ['Oportunidade encerrada.'] }
  }

  const reasons = []
  let score = 0
  const nextStepAge = lead.proximoPasso ? daysBetween(lead.proximoPasso, today) : null
  const createdAge = daysBetween(lead.criadoEm, today)
  const relatedTasks = tasks.filter((task) => task.relatedLeadId === lead.id && task.status !== 'Concluído')

  if (!lead.proximoPasso) {
    score += 35
    reasons.push('Sem próximo passo definido.')
  } else if (nextStepAge > 0) {
    score += 30
    reasons.push(`Próximo passo vencido há ${nextStepAge} dia${nextStepAge === 1 ? '' : 's'}.`)
  }

  if (!relatedTasks.length) {
    score += 20
    reasons.push('Sem tarefa ativa vinculada.')
  }

  if (['Novo Lead', 'Contato Feito'].includes(lead.status) && Number(lead.valorEstimado || 0) >= 20000) {
    score += 20
    reasons.push('Alto valor ainda em etapa inicial.')
  }

  if (createdAge !== null && createdAge >= 21 && !['Proposta', 'Reunião'].includes(lead.status)) {
    score += 15
    reasons.push(`Aberta há ${createdAge} dias com baixa progressão.`)
  }

  const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : score > 0 ? 'low' : 'none'
  return { level, score: Math.min(100, score), reasons: reasons.length ? reasons : ['Sem risco operacional relevante.'] }
}

export function calculateAccountHealth(account, tasks = [], today = new Date()) {
  const openDeals = account.deals?.filter((deal) => !['Fechado', 'Perdido'].includes(deal.stage || deal.status)) || []
  const wonDeals = account.deals?.filter((deal) => (deal.stage || deal.status) === 'Fechado') || []
  const accountTasks = tasks.filter((task) => account.deals?.some((deal) =>
    deal.id === task.relatedLeadId ||
    deal.id === task.dealId ||
    deal.sourceLeadId === task.relatedLeadId,
  ))
  const overdueTasks = accountTasks.filter((task) => task.status !== 'Concluído' && task.dueDate && toDate(task.dueDate) < today)
  const missingNextStep = openDeals.filter((deal) => !deal.nextStep && !deal.proximoPasso)
  const overdueNextSteps = openDeals.filter((deal) => {
    const nextStep = deal.nextStep || deal.proximoPasso
    return nextStep && toDate(nextStep) < today
  })

  const contributions = []
  const penalties = []
  let score = 62

  if (wonDeals.length) {
    score += 12
    contributions.push(`${wonDeals.length} negócio${wonDeals.length === 1 ? '' : 's'} ganho${wonDeals.length === 1 ? '' : 's'}.`)
  }

  if (openDeals.length) {
    score += 8
    contributions.push(`${openDeals.length} oportunidade${openDeals.length === 1 ? '' : 's'} ativa${openDeals.length === 1 ? '' : 's'}.`)
  }

  if (accountTasks.some((task) => task.status !== 'Concluído')) {
    score += 8
    contributions.push('Há tarefa ativa vinculada à conta.')
  }

  if (overdueTasks.length) {
    score -= overdueTasks.length * 12
    penalties.push(`${overdueTasks.length} tarefa${overdueTasks.length === 1 ? '' : 's'} vencida${overdueTasks.length === 1 ? '' : 's'}.`)
  }

  if (missingNextStep.length) {
    score -= missingNextStep.length * 8
    penalties.push(`${missingNextStep.length} oportunidade${missingNextStep.length === 1 ? '' : 's'} sem próximo passo.`)
  }

  if (overdueNextSteps.length) {
    score -= overdueNextSteps.length * 10
    penalties.push(`${overdueNextSteps.length} próximo${overdueNextSteps.length === 1 ? ' passo vencido' : 's passos vencidos'}.`)
  }

  if (!contributions.length) contributions.push('Conta ainda sem sinal positivo forte registrado.')
  if (!penalties.length) penalties.push('Sem penalidades operacionais relevantes.')

  return {
    score: Math.max(15, Math.min(100, Math.round(score))),
    contributions,
    penalties,
  }
}

export function buildPipelineMetrics(leads, tasks = [], goalConfig = DEFAULT_GOAL_CONFIG, today = new Date()) {
  const safeGoalConfig = normalizeGoalConfig(goalConfig)
  const wonRevenue = getWonRevenue(leads)
  const openPipeline = getOpenPipelineValue(leads)
  const weightedForecast = getWeightedForecast(leads)
  const goal = safeGoalConfig.periodGoal
  const won = leads.filter((lead) => lead.status === 'Fechado')
  const lost = leads.filter((lead) => lead.status === 'Perdido')
  const open = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const risks = open.map((lead) => ({ lead, risk: analyzeDealRisk(lead, tasks, today) }))
  const atRiskValue = risks
    .filter(({ risk }) => ['medium', 'high'].includes(risk.level))
    .reduce((total, { lead }) => total + Number(lead.valorEstimado || 0), 0)

  return {
    wonRevenue,
    openPipeline,
    weightedForecast,
    goal,
    goalCoverage: goal ? Math.round(((wonRevenue + openPipeline) / goal) * 100) : 0,
    forecastCoverage: goal ? Math.round(((wonRevenue + weightedForecast) / goal) * 100) : 0,
    conversion: won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
    atRiskValue,
    riskCount: risks.filter(({ risk }) => ['medium', 'high'].includes(risk.level)).length,
    risks,
    stageTotals: PIPELINE_STATUSES.map((status) => {
      const items = leads.filter((lead) => lead.status === status)
      return {
        status,
        count: items.length,
        value: items.reduce((total, lead) => total + Number(lead.valorEstimado || 0), 0),
        forecast: items.reduce((total, lead) => total + Number(lead.valorEstimado || 0) * (getDealProbability(lead) / 100), 0),
      }
    }),
  }
}

export function buildRevenueTrend(leads, limit = 7) {
  const won = leads
    .filter((lead) => lead.status === 'Fechado')
    .map((lead) => ({
      label: toDate(lead.previsaoFechamento || lead.criadoEm)?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) || 'Sem data',
      value: Number(lead.valorEstimado || 0),
      at: toDate(lead.previsaoFechamento || lead.criadoEm)?.getTime() || 0,
    }))
    .sort((a, b) => a.at - b.at)
    .slice(-limit)

  return won.length ? won : [{ label: 'Sem ganhos', value: 0, at: 0 }]
}

export function buildTodayQueue(leads, tasks = [], today = new Date()) {
  const data = buildTodayQueueData(leads, tasks, today)
  return data.priorityQueue
}

export function buildTodayQueueData(leads, tasks = [], today = new Date()) {
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const overdueTasks = tasks
    .filter((task) => task.status !== 'Concluído' && classifyDateAgainstDay(task.dueDate, today) === 'overdue')
    .map((task) => ({
      id: `task-${task.id}`,
      type: 'task',
      priority: task.priority === 'Alta' ? 90 : 70,
      title: task.title,
      detail: `${task.owner} · prazo vencido ${toDate(task.dueDate)?.toLocaleDateString('pt-BR') || 'sem data'}`,
      taskId: task.id,
      dealId: task.relatedLeadId,
      action: 'complete-task',
      timing: 'overdue',
    }))

  const todayTasks = tasks
    .filter((task) => task.status !== 'Concluído' && classifyDateAgainstDay(task.dueDate, today) === 'today')
    .map((task) => ({
      id: `task-today-${task.id}`,
      type: 'task',
      priority: task.priority === 'Alta' ? 75 : 58,
      title: task.title,
      detail: `${task.owner} · para hoje`,
      taskId: task.id,
      dealId: task.relatedLeadId,
      action: 'complete-task',
      timing: 'today',
    }))

  const overdueNextSteps = openLeads
    .filter((lead) => lead.proximoPasso && classifyDateAgainstDay(lead.proximoPasso, today) === 'overdue')
    .map((lead) => ({
      id: `next-${lead.id}`,
      type: 'deal',
      priority: Number(lead.valorEstimado || 0) >= 50000 ? 95 : 80,
      title: `Retomar ${lead.empresa}`,
      detail: `Próximo passo vencido · ${lead.status} · ${lead.responsavel}`,
      dealId: lead.id,
      action: 'open-deal',
      timing: 'overdue',
    }))

  const todayNextSteps = openLeads
    .filter((lead) => lead.proximoPasso && classifyDateAgainstDay(lead.proximoPasso, today) === 'today')
    .map((lead) => ({
      id: `next-today-${lead.id}`,
      type: 'deal',
      priority: Number(lead.valorEstimado || 0) >= 50000 ? 78 : 60,
      title: `Acompanhar ${lead.empresa}`,
      detail: `Próximo passo hoje · ${lead.status} · ${lead.responsavel}`,
      dealId: lead.id,
      action: 'open-deal',
      timing: 'today',
    }))

  const noNextStep = openLeads
    .filter((lead) => !lead.proximoPasso)
    .slice(0, 6)
    .map((lead) => ({
      id: `missing-step-${lead.id}`,
      type: 'deal',
      priority: Number(lead.valorEstimado || 0) >= 50000 ? 85 : 62,
      title: `Definir próximo passo: ${lead.empresa}`,
      detail: `${lead.status} · ${lead.responsavel} · sem próxima ação`,
      dealId: lead.id,
      action: 'open-deal',
      timing: 'missing',
    }))

  const fullQueue = [...overdueTasks, ...overdueNextSteps, ...todayTasks, ...todayNextSteps, ...noNextStep]
    .sort((a, b) => b.priority - a.priority)

  return {
    overdueTasks,
    todayTasks,
    overdueNextSteps,
    todayNextSteps,
    noNextStep,
    fullQueue,
    priorityQueue: fullQueue.slice(0, 8),
  }
}

export function buildBusinessAlerts(leads, tasks, today = new Date()) {
  const queueData = buildTodayQueueData(leads, tasks, today)
  const metrics = buildPipelineMetrics(leads, tasks, DEFAULT_GOAL_CONFIG, today)
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  const noNextStep = openLeads.filter((lead) => !lead.proximoPasso)
  const overdueTasks = queueData.overdueTasks
  const overdueNextSteps = queueData.overdueNextSteps
  const closingSoon = openLeads.filter((lead) => {
    const closeDate = toDate(lead.previsaoFechamento)
    if (!closeDate) return false
    const days = Math.ceil((closeDate - today) / 86_400_000)
    return days >= 0 && days <= 14
  })

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
      id: 'pipeline-risk',
      label: 'Receita em risco',
      value: metrics.riskCount,
      tone: metrics.riskCount ? 'orange' : 'green',
      detail: metrics.riskCount ? 'Há oportunidades com risco operacional explicável.' : 'Sem risco operacional relevante.',
    },
  ]
}
