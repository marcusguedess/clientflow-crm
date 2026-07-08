import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createDeal,
  markDealLost,
  markDealWon,
  moveDeal,
  scheduleFollowUp,
  updateDeal,
  updateNextStep,
} from '../src/domain/dealCommands.js'
import { DOMAIN_EVENT_TYPES } from '../src/domain/events.js'

const baseLead = {
  id: 'lead-1',
  nome: 'Ana Compradora',
  empresa: 'Acme Saúde',
  email: 'ana@acme.test',
  telefone: '11999990000',
  status: 'Proposta',
  valorEstimado: 50000,
  responsavel: 'Ana Lima',
  segmento: 'Enterprise',
  probabilidade: 70,
  previsaoFechamento: '2026-08-10',
  proximoPasso: '2026-07-10',
  criadoEm: '2026-07-01T12:00:00.000Z',
}

function createState() {
  const created = createDeal({
    leads: [],
    accounts: [],
    contacts: [],
    deals: [],
    tasks: [],
  }, baseLead, {
    now: '2026-07-08T12:00:00.000Z',
    createId: (prefix) => `${prefix}-1`,
  })
  assert.equal(created.ok, true)
  return created.state
}

function countEvents(result, type) {
  return result.events.filter((event) => event.type === type).length
}

test('createDeal cria Deal real, entidades relacionadas e lead legado compatível', () => {
  const result = createDeal({
    leads: [],
    accounts: [],
    contacts: [],
    deals: [],
    tasks: [],
  }, baseLead)

  assert.equal(result.ok, true)
  assert.equal(result.state.leads.length, 1)
  assert.equal(result.state.accounts.length, 1)
  assert.equal(result.state.contacts.length, 1)
  assert.equal(result.state.deals.length, 1)
  assert.equal(result.state.deals[0].id, 'lead-1')
  assert.equal(result.state.deals[0].stage, 'Proposta')
  assert.equal(result.state.leads[0].status, 'Proposta')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.DEAL_CREATED), 1)
})

test('updateDeal atualiza Deal e mantém campos legados sincronizados', () => {
  const state = createState()
  const result = updateDeal(state, 'lead-1', { value: 62000, probability: 80, owner: 'Bruno Rocha' })

  assert.equal(result.ok, true)
  assert.equal(result.state.deals[0].value, 62000)
  assert.equal(result.state.deals[0].probability, 80)
  assert.equal(result.state.deals[0].owner, 'Bruno Rocha')
  assert.equal(result.state.leads[0].valorEstimado, 62000)
  assert.equal(result.state.leads[0].probabilidade, 80)
  assert.equal(result.state.leads[0].responsavel, 'Bruno Rocha')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.DEAL_UPDATED), 1)
})

test('moveDeal muda etapa, persiste e emite evento de etapa uma vez', () => {
  const state = createState()
  const result = moveDeal(state, 'lead-1', 'Reunião')

  assert.equal(result.ok, true)
  assert.equal(result.state.deals[0].stage, 'Reunião')
  assert.equal(result.state.leads[0].status, 'Reunião')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED), 1)
})

test('markDealWon marca ganho com deal.won uma vez', () => {
  const state = createState()
  const result = markDealWon(state, 'lead-1', { value: 70000 })

  assert.equal(result.ok, true)
  assert.equal(result.state.deals[0].stage, 'Fechado')
  assert.equal(result.state.deals[0].probability, 100)
  assert.equal(result.state.leads[0].status, 'Fechado')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.DEAL_WON), 1)
})

test('markDealLost exige motivo e marca perda com evento único', () => {
  const state = createState()
  const invalid = markDealLost(state, 'lead-1', '')
  assert.equal(invalid.ok, false)

  const result = markDealLost(state, 'lead-1', 'Orçamento congelado')
  assert.equal(result.ok, true)
  assert.equal(result.state.deals[0].stage, 'Perdido')
  assert.equal(result.state.deals[0].lossReason, 'Orçamento congelado')
  assert.equal(result.state.leads[0].motivoPerda, 'Orçamento congelado')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.DEAL_LOST), 1)
})

test('updateNextStep centraliza próximo passo em Deal e legado', () => {
  const state = createState()
  const result = updateNextStep(state, 'lead-1', '2026-07-20')

  assert.equal(result.ok, true)
  assert.equal(result.state.deals[0].nextStep, '2026-07-20')
  assert.equal(result.state.leads[0].proximoPasso, '2026-07-20')
})

test('scheduleFollowUp cria tarefa vinculada ao Deal real sem perder relatedLeadId', () => {
  const state = createState()
  const result = scheduleFollowUp(state, 'lead-1', {
    id: 'task-1',
    title: 'Retomar proposta',
    dueDate: '2026-07-09',
  })

  assert.equal(result.ok, true)
  assert.equal(result.state.tasks.length, 1)
  assert.equal(result.state.tasks[0].dealId, 'lead-1')
  assert.equal(result.state.tasks[0].relatedLeadId, 'lead-1')
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.TASK_CREATED), 1)
  assert.equal(countEvents(result, DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED), 1)
})

test('comandos rejeitam dados inválidos sem alterar persistência', () => {
  const state = createState()
  const missingDeal = moveDeal(state, 'missing', 'Proposta')
  const invalidStage = moveDeal(state, 'lead-1', 'Etapa inventada')
  const invalidCreate = createDeal(state, { nome: '', empresa: '' })

  assert.equal(missingDeal.ok, false)
  assert.deepEqual(missingDeal.state, state)
  assert.equal(invalidStage.ok, false)
  assert.deepEqual(invalidStage.state, state)
  assert.equal(invalidCreate.ok, false)
  assert.equal(invalidCreate.state.deals.length, state.deals.length)
})
