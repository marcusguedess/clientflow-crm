import { getDealProbability } from './metrics.js'
import { normalizeTask } from './tasks.js'
import { cleanText } from '../utils/sanitizeData.js'

export const CRM_STORAGE_KEYS = {
  accounts: 'clientflow-accounts-v1',
  contacts: 'clientflow-contacts-v1',
  deals: 'clientflow-deals-v1',
  activities: 'clientflow-activities-v1',
}

export const DEFAULT_BUYING_ROLES = {
  decisionMaker: 'decisor',
  champion: 'campeão interno',
  influencer: 'influenciador',
  finance: 'financeiro',
  technical: 'técnico',
  user: 'usuário',
  blocker: 'bloqueador',
}

function toDateOrNow(value) {
  return Number.isNaN(Date.parse(value)) ? new Date().toISOString() : value
}

export function slugifyEntityId(value, fallback = 'registro') {
  const slug = cleanText(value, 160)
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
  return slug || fallback
}

export function getAccountIdFromLead(lead) {
  return `account-${slugifyEntityId(lead?.empresa, lead?.id || 'sem-empresa')}`
}

export function getContactIdFromLead(lead) {
  return lead?.email
    ? `contact-${slugifyEntityId(lead.email, lead.id || 'sem-email')}`
    : `contact-${slugifyEntityId(lead?.id, 'sem-email')}`
}

export function getDealIdFromLead(lead) {
  return cleanText(lead?.id, 80) || `deal-${slugifyEntityId(lead?.empresa, 'sem-oportunidade')}`
}

function inferBuyingRole(lead) {
  if (lead.status === 'Fechado') return DEFAULT_BUYING_ROLES.champion
  if (Number(lead.valorEstimado || 0) >= 50000) return DEFAULT_BUYING_ROLES.decisionMaker
  return DEFAULT_BUYING_ROLES.influencer
}

function inferInfluence(lead) {
  if (Number(lead.valorEstimado || 0) >= 50000) return 'alta'
  if (lead.status === 'Perdido') return 'baixa'
  return 'média'
}

export function accountFromLead(lead, existing = {}) {
  const now = new Date().toISOString()
  const createdAt = toDateOrNow(lead.criadoEm)
  return {
    id: getAccountIdFromLead(lead),
    name: cleanText(existing.name || lead.empresa, 120),
    segment: cleanText(existing.segment || lead.segmento, 80) || 'PME',
    owner: cleanText(existing.owner || lead.responsavel, 100),
    createdAt: existing.createdAt || createdAt,
    updatedAt: existing.updatedAt || now,
    sourceLeadIds: [...new Set([...(existing.sourceLeadIds || []), lead.id].filter(Boolean))],
  }
}

export function contactFromLead(lead, existing = {}) {
  const now = new Date().toISOString()
  const createdAt = toDateOrNow(lead.criadoEm)
  return {
    id: getContactIdFromLead(lead),
    accountId: getAccountIdFromLead(lead),
    name: cleanText(existing.name || lead.nome, 100),
    email: cleanText(existing.email || lead.email, 180),
    phone: cleanText(existing.phone || lead.telefone, 40),
    role: cleanText(existing.role, 100) || 'Contato principal',
    buyingRole: cleanText(existing.buyingRole, 80) || inferBuyingRole(lead),
    influence: ['alta', 'média', 'baixa'].includes(existing.influence) ? existing.influence : inferInfluence(lead),
    createdAt: existing.createdAt || createdAt,
    updatedAt: existing.updatedAt || now,
    sourceLeadIds: [...new Set([...(existing.sourceLeadIds || []), lead.id].filter(Boolean))],
  }
}

export function dealFromLead(lead, existing = {}) {
  const now = new Date().toISOString()
  const contactId = getContactIdFromLead(lead)
  const createdAt = toDateOrNow(lead.criadoEm)
  const probability = getDealProbability(lead)
  return {
    id: getDealIdFromLead(lead),
    accountId: getAccountIdFromLead(lead),
    primaryContactId: existing.primaryContactId || contactId,
    contactIds: [...new Set([...(existing.contactIds || []), contactId])],
    title: cleanText(existing.title || lead.empresa, 140),
    stage: lead.status || existing.stage || 'Novo Lead',
    value: Math.max(0, Number(lead.valorEstimado || existing.value || 0)),
    probability,
    expectedCloseDate: /^\d{4}-\d{2}-\d{2}$/.test(lead.previsaoFechamento) ? lead.previsaoFechamento : '',
    owner: cleanText(lead.responsavel || existing.owner, 100),
    nextStep: /^\d{4}-\d{2}-\d{2}$/.test(lead.proximoPasso) ? lead.proximoPasso : '',
    lastContactAt: existing.lastContactAt || createdAt,
    lossReason: cleanText(lead.motivoPerda || existing.lossReason, 160),
    createdAt: existing.createdAt || createdAt,
    updatedAt: existing.updatedAt || now,
    sourceLeadId: lead.id,
  }
}

export function activityFromTimelineEvent(event, relatedDeal = null) {
  return {
    id: cleanText(event.id, 100) || `activity-${Date.now()}`,
    accountId: event.accountId || relatedDeal?.accountId || '',
    contactId: event.contactId || relatedDeal?.primaryContactId || '',
    dealId: event.dealId || relatedDeal?.id || '',
    type: cleanText(event.type, 60) || 'activity',
    title: cleanText(event.title, 160) || 'Atividade',
    detail: cleanText(event.detail, 600),
    actor: cleanText(event.owner || event.actor, 100),
    at: toDateOrNow(event.at),
  }
}

export function migrateLeadsToCrmEntities(leads = [], existing = {}, timelineEvents = []) {
  const accountsById = new Map((existing.accounts || []).map((account) => [account.id, account]))
  const contactsById = new Map((existing.contacts || []).map((contact) => [contact.id, contact]))
  const dealsById = new Map((existing.deals || []).map((deal) => [deal.id, deal]))

  leads.forEach((lead) => {
    const accountId = getAccountIdFromLead(lead)
    const contactId = getContactIdFromLead(lead)
    const dealId = getDealIdFromLead(lead)
    accountsById.set(accountId, accountFromLead(lead, accountsById.get(accountId)))
    contactsById.set(contactId, contactFromLead(lead, contactsById.get(contactId)))
    dealsById.set(dealId, dealFromLead(lead, dealsById.get(dealId)))
  })

  const deals = [...dealsById.values()]
  const activitiesById = new Map((existing.activities || []).map((activity) => [activity.id, activity]))
  timelineEvents.forEach((event) => {
    const relatedDeal = deals.find((deal) => deal.id === event.dealId || deal.sourceLeadId === event.dealId)
    const nextActivity = activityFromTimelineEvent(event, relatedDeal)
    activitiesById.set(nextActivity.id, { ...activitiesById.get(nextActivity.id), ...nextActivity })
  })

  return {
    accounts: [...accountsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    contacts: [...contactsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    deals: deals.sort((a, b) => Number(b.value || 0) - Number(a.value || 0)),
    activities: [...activitiesById.values()].sort((a, b) => new Date(b.at) - new Date(a.at)),
  }
}

export function normalizeTaskRelations(task, deals = []) {
  const normalized = normalizeTask(task)
  const relatedDeal = deals.find((deal) =>
    deal.id === normalized.dealId ||
    deal.id === normalized.relatedLeadId ||
    deal.sourceLeadId === normalized.relatedLeadId,
  )
  return {
    ...normalized,
    dealId: normalized.dealId || relatedDeal?.id || '',
    accountId: normalized.accountId || relatedDeal?.accountId || '',
    contactId: normalized.contactId || relatedDeal?.primaryContactId || '',
    relatedLeadId: normalized.relatedLeadId || relatedDeal?.sourceLeadId || '',
  }
}
