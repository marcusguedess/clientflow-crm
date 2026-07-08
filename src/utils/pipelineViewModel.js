import { analyzeDealRisk, daysBetween, getDealProbability } from '../domain/metrics.js'
import { buildCommercialModel } from './commercialModel.js'

function formatPipelineDate(value) {
  if (!value) return ''
  return Number.isNaN(Date.parse(value)) ? '' : value
}

function getActiveTask(tasks, deal) {
  return tasks.find((task) =>
    task.status !== 'Concluído' && (
      task.dealId === deal.id ||
      task.relatedLeadId === deal.id ||
      task.relatedLeadId === deal.sourceLeadId
    ),
  ) || null
}

function legacyLeadForDeal(leadsById, deal) {
  return leadsById.get(deal.sourceLeadId) || leadsById.get(deal.id) || {}
}

function dealToPipelineItem(deal, leadsById, tasks) {
  const legacyLead = legacyLeadForDeal(leadsById, deal)
  const pipelineItem = {
    id: deal.sourceLeadId || deal.id,
    dealId: deal.id,
    accountId: deal.accountId || '',
    contactId: deal.contactId || '',
    contactIds: deal.contactIds || [],
    sourceLeadId: deal.sourceLeadId || '',
    nome: deal.contactName || legacyLead.nome || deal.company,
    empresa: deal.company || legacyLead.empresa || deal.title,
    email: deal.email || legacyLead.email || '',
    telefone: deal.phone || legacyLead.telefone || '',
    status: deal.stage,
    valorEstimado: Number(deal.value || 0),
    origem: legacyLead.origem || '',
    responsavel: deal.owner || legacyLead.responsavel || '',
    notas: deal.notes || legacyLead.notas || '',
    criadoEm: formatPipelineDate(deal.createdAt) || legacyLead.criadoEm || new Date().toISOString(),
    segmento: deal.segment || legacyLead.segmento || 'PME',
    probabilidade: Number.isFinite(Number(deal.probability)) ? Number(deal.probability) : getDealProbability(legacyLead),
    previsaoFechamento: deal.closeDate || legacyLead.previsaoFechamento || '',
    proximoPasso: deal.nextStep || legacyLead.proximoPasso || '',
    motivoPerda: deal.lossReason || legacyLead.motivoPerda || '',
    tipoConta: legacyLead.tipoConta || (deal.stage === 'Fechado' ? 'Cliente' : 'Lead'),
    accountName: deal.company || '',
    primaryContactName: deal.contactName || '',
    forecast: Number(deal.forecast || 0),
    lastContactAt: deal.lastContactAt || deal.createdAt || legacyLead.criadoEm || '',
  }
  const risk = analyzeDealRisk(pipelineItem, tasks)
  const activeTask = getActiveTask(tasks, deal)
  return {
    ...pipelineItem,
    risk,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    ageDays: daysBetween(pipelineItem.criadoEm, new Date()) ?? 0,
    activeTaskTitle: activeTask?.title || '',
  }
}

function leadToPipelineItem(lead, tasks) {
  const risk = analyzeDealRisk(lead, tasks)
  const activeTask = tasks.find((task) => task.relatedLeadId === lead.id && task.status !== 'Concluído')
  return {
    ...lead,
    dealId: lead.id,
    accountName: lead.empresa,
    primaryContactName: lead.nome,
    forecast: Math.round(Number(lead.valorEstimado || 0) * (getDealProbability(lead) / 100)),
    risk,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    ageDays: daysBetween(lead.criadoEm, new Date()) ?? 0,
    activeTaskTitle: activeTask?.title || '',
  }
}

export function buildPipelineViewModel({ leads = [], tasks = [], employees = [], crmData = null } = {}) {
  const hasRealDeals = Boolean(crmData?.accounts?.length && crmData?.contacts?.length && crmData?.deals?.length)
  if (!hasRealDeals) {
    return {
      source: 'legacy',
      items: leads.map((lead) => leadToPipelineItem(lead, tasks)),
    }
  }

  const model = buildCommercialModel(leads, tasks, [], employees, crmData)
  const leadsById = new Map(leads.map((lead) => [lead.id, lead]))
  const visibleLeadIds = new Set(leads.map((lead) => lead.id))
  return {
    source: 'crm',
    items: model.deals
      .filter((deal) => !deal.sourceLeadId || visibleLeadIds.has(deal.sourceLeadId) || visibleLeadIds.has(deal.id))
      .map((deal) => dealToPipelineItem(deal, leadsById, tasks)),
  }
}

export function getPipelineFilterOptions(items = []) {
  return {
    owners: ['Todos', ...new Set(items.map((item) => item.responsavel).filter(Boolean))],
    segments: ['Todos', ...new Set(items.map((item) => item.segmento).filter(Boolean))],
    origins: ['Todos', ...new Set(items.map((item) => item.origem).filter(Boolean))],
    risks: ['Todos', 'Risco alto', 'Atenção', 'Risco baixo', 'Sem risco'],
  }
}

export function filterPipelineItems(items = [], filters = {}) {
  const riskMap = {
    'Risco alto': 'high',
    Atenção: 'medium',
    'Risco baixo': 'low',
    'Sem risco': 'none',
  }
  return items.filter((item) =>
    (!filters.owner || filters.owner === 'Todos' || item.responsavel === filters.owner) &&
    (!filters.stage || filters.stage === 'Todos' || item.status === filters.stage) &&
    (!filters.segment || filters.segment === 'Todos' || item.segmento === filters.segment) &&
    (!filters.origin || filters.origin === 'Todos' || item.origem === filters.origin) &&
    (!filters.risk || filters.risk === 'Todos' || item.riskLevel === riskMap[filters.risk]),
  )
}
