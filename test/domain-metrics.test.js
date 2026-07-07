import assert from 'node:assert/strict'
import test from 'node:test'
import {
  analyzeDealRisk,
  buildPipelineMetrics,
  buildTodayQueue,
  calculateAccountHealth,
  getWeightedForecast,
} from '../src/domain/metrics.js'

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
