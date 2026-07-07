import assert from 'node:assert/strict'
import test from 'node:test'
import {
  analyzeDealRisk,
  buildBusinessAlerts,
  buildPipelineMetrics,
  buildTodayQueue,
  buildTodayQueueData,
  calculateAccountHealth,
  getWeightedForecast,
  normalizeGoalConfig,
} from '../src/domain/metrics.js'
import { normalizeTask } from '../src/domain/tasks.js'

const today = new Date('2026-07-07T12:00:00')

test('getWeightedForecast usa probabilidade real quando informada', () => {
  const leads = [
    { id: 'a', status: 'Proposta', valorEstimado: 100000, probabilidade: 70 },
    { id: 'b', status: 'Contato Feito', valorEstimado: 50000 },
    { id: 'c', status: 'Fechado', valorEstimado: 40000, probabilidade: 100 },
  ]

  assert.equal(getWeightedForecast(leads), 82500)
})

test('analyzeDealRisk explica risco alto para oportunidade sem próxima ação e sem tarefa', () => {
  const lead = {
    id: 'lead-1',
    status: 'Novo Lead',
    valorEstimado: 65000,
    criadoEm: '2026-06-01',
  }

  const risk = analyzeDealRisk(lead, [], today)

  assert.equal(risk.level, 'high')
  assert.ok(risk.reasons.some((reason) => reason.includes('Sem próximo passo')))
  assert.ok(risk.reasons.some((reason) => reason.includes('Sem tarefa ativa')))
})

test('buildTodayQueue prioriza tarefas e próximos passos vencidos', () => {
  const leads = [
    {
      id: 'lead-1',
      empresa: 'Acme',
      status: 'Proposta',
      responsavel: 'Ana',
      valorEstimado: 70000,
      proximoPasso: '2026-07-01',
    },
  ]
  const tasks = [
    {
      id: 'task-1',
      title: 'Ligar para decisor',
      owner: 'Ana',
      status: 'Planejado',
      priority: 'Alta',
      dueDate: '2026-07-03',
      relatedLeadId: 'lead-1',
    },
  ]

  const queue = buildTodayQueue(leads, tasks, today)

  assert.ok(queue.some((item) => item.action === 'complete-task'))
  assert.ok(queue.some((item) => item.action === 'open-deal'))
})

test('buildTodayQueue separa tarefas de ontem, hoje e amanhã', () => {
  const tasks = [
    { id: 'task-yesterday', title: 'Ontem', status: 'Planejado', owner: 'Ana', priority: 'Alta', dueDate: '2026-07-06' },
    { id: 'task-today', title: 'Hoje', status: 'Planejado', owner: 'Ana', priority: 'Média', dueDate: '2026-07-07' },
    { id: 'task-tomorrow', title: 'Amanhã', status: 'Planejado', owner: 'Ana', priority: 'Média', dueDate: '2026-07-08' },
  ]

  const data = buildTodayQueueData([], tasks, today)

  assert.equal(data.overdueTasks.length, 1)
  assert.equal(data.todayTasks.length, 1)
  assert.equal(data.fullQueue.some((item) => item.id === 'task-task-tomorrow'), false)
})

test('buildTodayQueue separa próximos passos de ontem e hoje', () => {
  const leads = [
    { id: 'lead-yesterday', empresa: 'Ontem Ltda', status: 'Proposta', responsavel: 'Ana', valorEstimado: 30000, proximoPasso: '2026-07-06' },
    { id: 'lead-today', empresa: 'Hoje Ltda', status: 'Proposta', responsavel: 'Ana', valorEstimado: 30000, proximoPasso: '2026-07-07' },
    { id: 'lead-tomorrow', empresa: 'Amanhã Ltda', status: 'Proposta', responsavel: 'Ana', valorEstimado: 30000, proximoPasso: '2026-07-08' },
  ]

  const data = buildTodayQueueData(leads, [], today)

  assert.equal(data.overdueNextSteps.length, 1)
  assert.equal(data.todayNextSteps.length, 1)
  assert.equal(data.fullQueue.some((item) => item.dealId === 'lead-tomorrow'), false)
})

test('buildBusinessAlerts usa dados completos mesmo com fila visual limitada', () => {
  const tasks = Array.from({ length: 14 }, (_, index) => ({
    id: `task-${index}`,
    title: `Tarefa ${index}`,
    status: 'Planejado',
    owner: 'Ana',
    priority: 'Alta',
    dueDate: '2026-07-06',
  }))

  const queue = buildTodayQueue([], tasks, today)
  const alerts = buildBusinessAlerts([], tasks, today)
  const overdueAlert = alerts.find((alert) => alert.id === 'overdue-tasks')

  assert.equal(queue.length, 8)
  assert.equal(overdueAlert.value, 14)
})

test('calculateAccountHealth retorna score com contribuições e penalidades', () => {
  const account = {
    deals: [
      { id: 'won-1', stage: 'Fechado' },
      { id: 'open-1', stage: 'Proposta' },
    ],
  }
  const tasks = [
    { id: 'task-1', relatedLeadId: 'open-1', status: 'Planejado', dueDate: '2026-06-30' },
  ]

  const health = calculateAccountHealth(account, tasks, today)

  assert.equal(typeof health.score, 'number')
  assert.ok(health.contributions.length > 0)
  assert.ok(health.penalties.some((penalty) => penalty.includes('vencida')))
})

test('buildPipelineMetrics centraliza meta, forecast e riscos', () => {
  const leads = [
    { id: 'won-1', status: 'Fechado', valorEstimado: 50000 },
    { id: 'open-1', status: 'Novo Lead', valorEstimado: 80000, criadoEm: '2026-06-01' },
  ]

  const metrics = buildPipelineMetrics(leads, [], { periodGoal: 100000 }, today)

  assert.equal(metrics.wonRevenue, 50000)
  assert.equal(metrics.goal, 100000)
  assert.equal(metrics.riskCount, 1)
  assert.ok(metrics.goalCoverage >= 100)
})

test('normalizeGoalConfig rejeita NaN e normaliza meta negativa ou zero', () => {
  assert.equal(normalizeGoalConfig({ periodGoal: 'abc' }).periodGoal, 250000)
  assert.equal(normalizeGoalConfig({ periodGoal: -50 }).periodGoal, 0)
  assert.equal(normalizeGoalConfig({ periodGoal: 0 }).periodGoal, 0)
})

test('normalizeTask completa tarefas incompletas com defaults seguros', () => {
  const task = normalizeTask({ title: '', priority: undefined }, { owner: 'Marcus Guedes' })

  assert.equal(task.title, 'Nova tarefa')
  assert.equal(task.owner, 'Marcus Guedes')
  assert.equal(task.priority, 'Média')
  assert.equal(task.status, 'Planejado')
  assert.equal(task.sticker, '📌')
  assert.equal(task.relatedLeadId, '')
})
