import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getAccountIdFromLead,
  getContactIdFromLead,
  migrateLeadsToCrmEntities,
  normalizeTaskRelations,
} from '../src/domain/crmEntities.js'

const legacyLeads = [
  {
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
  },
  {
    id: 'lead-2',
    nome: 'Bruno Financeiro',
    empresa: 'Acme Saúde',
    email: 'bruno@acme.test',
    telefone: '11888880000',
    status: 'Fechado',
    valorEstimado: 30000,
    responsavel: 'Ana Lima',
    segmento: 'Enterprise',
    probabilidade: 100,
    previsaoFechamento: '2026-07-20',
    proximoPasso: '',
    criadoEm: '2026-06-20T12:00:00.000Z',
  },
]

test('migração cria conta, contatos e deals a partir de leads antigos', () => {
  const migrated = migrateLeadsToCrmEntities(legacyLeads)

  assert.equal(migrated.accounts.length, 1)
  assert.equal(migrated.contacts.length, 2)
  assert.equal(migrated.deals.length, 2)
  assert.equal(migrated.accounts[0].name, 'Acme Saúde')
  assert.equal(migrated.deals.some((deal) => deal.id === 'lead-1'), true)
})

test('vários leads da mesma empresa geram uma conta e contatos separados', () => {
  const migrated = migrateLeadsToCrmEntities(legacyLeads)
  const accountId = getAccountIdFromLead(legacyLeads[0])

  assert.equal(migrated.accounts[0].id, accountId)
  assert.equal(new Set(migrated.contacts.map((contact) => contact.id)).size, 2)
  assert.equal(migrated.contacts.every((contact) => contact.accountId === accountId), true)
})

test('migração repetida não duplica entidades', () => {
  const first = migrateLeadsToCrmEntities(legacyLeads)
  const second = migrateLeadsToCrmEntities(legacyLeads, first)

  assert.equal(second.accounts.length, first.accounts.length)
  assert.equal(second.contacts.length, first.contacts.length)
  assert.equal(second.deals.length, first.deals.length)
})

test('tarefas antigas encontram deal e conta corretos sem perder relatedLeadId', () => {
  const migrated = migrateLeadsToCrmEntities(legacyLeads)
  const task = normalizeTaskRelations({
    id: 'task-1',
    title: 'Revisar proposta',
    relatedLeadId: 'lead-1',
  }, migrated.deals)

  assert.equal(task.relatedLeadId, 'lead-1')
  assert.equal(task.dealId, 'lead-1')
  assert.equal(task.accountId, getAccountIdFromLead(legacyLeads[0]))
  assert.equal(task.contactId, getContactIdFromLead(legacyLeads[0]))
})

test('atividades são vinculadas à conta quando apontam para um deal migrado', () => {
  const migrated = migrateLeadsToCrmEntities(legacyLeads, {}, [
    {
      id: 'event-1',
      type: 'note',
      title: 'Nota comercial',
      detail: 'Alinhamento com comprador',
      at: '2026-07-07T12:00:00.000Z',
      dealId: 'lead-1',
    },
  ])

  assert.equal(migrated.activities.length, 1)
  assert.equal(migrated.activities[0].accountId, getAccountIdFromLead(legacyLeads[0]))
  assert.equal(migrated.activities[0].dealId, 'lead-1')
})
