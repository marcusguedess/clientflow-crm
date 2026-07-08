import assert from 'node:assert/strict'
import test from 'node:test'
import { migrateLeadsToCrmEntities } from '../src/domain/crmEntities.js'
import { buildPipelineViewModel, filterPipelineItems, getPipelineFilterOptions } from '../src/utils/pipelineViewModel.js'

const leads = [
  {
    id: 'lead-real-1',
    nome: 'Ana Compradora',
    empresa: 'Acme Saúde',
    email: 'ana@acme.test',
    telefone: '11999990000',
    status: 'Proposta',
    valorEstimado: 50000,
    origem: 'Indicação',
    responsavel: 'Ana Lima',
    segmento: 'Enterprise',
    probabilidade: 70,
    previsaoFechamento: '2026-08-10',
    proximoPasso: '',
    criadoEm: '2026-06-01T12:00:00.000Z',
  },
  {
    id: 'lead-real-2',
    nome: 'Bruno Financeiro',
    empresa: 'Beta Log',
    email: 'bruno@beta.test',
    telefone: '11888880000',
    status: 'Reunião',
    valorEstimado: 30000,
    origem: 'Site',
    responsavel: 'Bruno Rocha',
    segmento: 'PME',
    probabilidade: 45,
    proximoPasso: '2026-07-15',
    criadoEm: '2026-07-01T12:00:00.000Z',
  },
]

const employees = [
  { id: 'employee-ana', nome: 'Ana Lima', avatar: { skin: '#f5c6a5' } },
  { id: 'employee-bruno', nome: 'Bruno Rocha', avatar: { skin: '#d8a47f' } },
]

test('Pipeline view model usa Deals reais e resolve conta e contato principal', () => {
  const crmData = migrateLeadsToCrmEntities(leads)
  const model = buildPipelineViewModel({ leads, tasks: [], employees, crmData })
  const item = model.items.find((deal) => deal.dealId === 'lead-real-1')

  assert.equal(model.source, 'crm')
  assert.equal(item.status, 'Proposta')
  assert.equal(item.empresa, 'Acme Saúde')
  assert.equal(item.nome, 'Ana Compradora')
  assert.equal(item.accountName, 'Acme Saúde')
  assert.equal(item.primaryContactName, 'Ana Compradora')
  assert.equal(item.valorEstimado, 50000)
})

test('Pipeline view model calcula risco e aging para cards reais', () => {
  const crmData = migrateLeadsToCrmEntities(leads)
  const model = buildPipelineViewModel({ leads, tasks: [], employees, crmData })
  const item = model.items.find((deal) => deal.dealId === 'lead-real-1')

  assert.equal(item.riskLevel, 'medium')
  assert.ok(item.riskReasons.some((reason) => reason.includes('Sem próximo passo')))
  assert.equal(typeof item.ageDays, 'number')
})

test('Pipeline filters cobrem responsável, etapa, risco, segmento e origem existente', () => {
  const crmData = migrateLeadsToCrmEntities(leads)
  const model = buildPipelineViewModel({ leads, tasks: [], employees, crmData })
  const options = getPipelineFilterOptions(model.items)
  const filtered = filterPipelineItems(model.items, {
    owner: 'Ana Lima',
    stage: 'Proposta',
    risk: 'Atenção',
    segment: 'Enterprise',
    origin: 'Indicação',
  })

  assert.ok(options.owners.includes('Ana Lima'))
  assert.ok(options.segments.includes('Enterprise'))
  assert.ok(options.origins.includes('Indicação'))
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].dealId, 'lead-real-1')
})

test('Pipeline view model preserva fallback legado quando CRM real não existe', () => {
  const model = buildPipelineViewModel({ leads, tasks: [], employees, crmData: null })

  assert.equal(model.source, 'legacy')
  assert.equal(model.items.length, leads.length)
  assert.equal(model.items[0].dealId, leads[0].id)
  assert.equal(model.items[0].empresa, leads[0].empresa)
})
