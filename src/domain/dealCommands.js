import { accountFromLead, contactFromLead, dealFromLead, normalizeTaskRelations } from './crmEntities.js'
import { DOMAIN_EVENT_TYPES } from './events.js'
import { analyzeDealRisk } from './metrics.js'
import { normalizeTask } from './tasks.js'
import { PIPELINE_STATUSES } from '../data/seedData.js'
import { cleanText, sanitizeLead } from '../utils/sanitizeData.js'

function now(context = {}) {
  return context.now || new Date().toISOString()
}

function createId(prefix, context = {}) {
  return context.createId?.(prefix) || globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}`
}

function toState(state = {}) {
  return {
    leads: state.leads || [],
    accounts: state.accounts || [],
    contacts: state.contacts || [],
    deals: state.deals || [],
    tasks: state.tasks || [],
  }
}

function failure(message, state) {
  return {
    ok: false,
    error: message,
    state: toState(state),
    events: [],
  }
}

function upsertById(collection, item) {
  return collection.some((current) => current.id === item.id)
    ? collection.map((current) => (current.id === item.id ? item : current))
    : [item, ...collection]
}

function sortAccounts(accounts) {
  return [...accounts].sort((a, b) => a.name.localeCompare(b.name))
}

function sortContacts(contacts) {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name))
}

function sortDeals(deals) {
  return [...deals].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
}

function findDeal(state, dealId) {
  const safeId = cleanText(dealId, 80)
  return state.deals.find((deal) => deal.id === safeId || deal.sourceLeadId === safeId) || null
}

function findLeadForDeal(state, deal) {
  return state.leads.find((lead) => lead.id === deal?.sourceLeadId || lead.id === deal?.id) || null
}

function dealPatchToLeadPatch(patch = {}) {
  const nextPatch = {}
  if ('stage' in patch) nextPatch.status = patch.stage
  if ('value' in patch) nextPatch.valorEstimado = patch.value
  if ('probability' in patch) nextPatch.probabilidade = patch.probability
  if ('expectedCloseDate' in patch) nextPatch.previsaoFechamento = patch.expectedCloseDate
  if ('nextStep' in patch) nextPatch.proximoPasso = patch.nextStep
  if ('owner' in patch) nextPatch.responsavel = patch.owner
  if ('lossReason' in patch) nextPatch.motivoPerda = patch.lossReason
  if ('title' in patch) nextPatch.empresa = patch.title
  return nextPatch
}

function buildEventPayload(lead, deal, extra = {}) {
  return {
    dealId: deal.id,
    accountId: deal.accountId,
    contactId: deal.primaryContactId,
    company: lead?.empresa || deal.title,
    contactName: lead?.nome || '',
    owner: deal.owner || lead?.responsavel || '',
    ...extra,
  }
}

function persistLeadBackedDeal(state, lead) {
  const account = accountFromLead(lead)
  const contact = contactFromLead(lead)
  const existingDeal = findDeal(state, lead.id) || {}
  const deal = dealFromLead(lead, existingDeal)

  return {
    lead,
    deal,
    state: {
      ...state,
      leads: upsertById(state.leads, lead),
      accounts: sortAccounts(upsertById(state.accounts, account)),
      contacts: sortContacts(upsertById(state.contacts, contact)),
      deals: sortDeals(upsertById(state.deals, deal)),
    },
  }
}

function updateDealOnly(state, deal, patch, context) {
  const nextDeal = {
    ...deal,
    ...patch,
    value: 'value' in patch ? Math.max(0, Number(patch.value || 0)) : deal.value,
    probability: 'probability' in patch ? Math.max(0, Math.min(100, Number(patch.probability || 0))) : deal.probability,
    updatedAt: now(context),
  }
  return {
    deal: nextDeal,
    state: {
      ...state,
      deals: sortDeals(upsertById(state.deals, nextDeal)),
    },
  }
}

function success(state, events, extras = {}) {
  return {
    ok: true,
    state,
    events,
    ...extras,
  }
}

export function createDeal(stateInput, leadInput, context = {}) {
  const state = toState(stateInput)
  const lead = sanitizeLead({
    ...leadInput,
    id: leadInput?.id || createId('deal', context),
    criadoEm: leadInput?.criadoEm || now(context),
  })

  if (!lead?.nome || !lead?.empresa) return failure('Informe nome e empresa para criar a oportunidade.', state)
  if (state.leads.some((current) => current.id === lead.id)) return failure('Já existe uma oportunidade com este ID.', state)

  const persisted = persistLeadBackedDeal(state, lead)
  const events = [
    {
      type: DOMAIN_EVENT_TYPES.DEAL_CREATED,
      payload: buildEventPayload(lead, persisted.deal, {
        detail: `${lead.empresa} entrou no pipeline.`,
      }),
    },
  ]

  if (lead.status === 'Fechado') {
    events.push({
      type: DOMAIN_EVENT_TYPES.DEAL_WON,
      payload: buildEventPayload(lead, persisted.deal, { value: Number(lead.valorEstimado || 0) }),
    })
  }

  if (lead.status === 'Perdido') {
    events.push({
      type: DOMAIN_EVENT_TYPES.DEAL_LOST,
      payload: buildEventPayload(lead, persisted.deal, { reason: lead.motivoPerda || 'Sem motivo registrado' }),
    })
  }

  return success(persisted.state, events, { lead, deal: persisted.deal })
}

export function updateDeal(stateInput, dealId, patch = {}, context = {}) {
  const state = toState(stateInput)
  const currentDeal = findDeal(state, dealId)
  if (!currentDeal) return failure('Oportunidade não encontrada.', state)

  const currentLead = findLeadForDeal(state, currentDeal)
  const previousStage = currentDeal.stage || currentLead?.status
  const nextStage = patch.stage || previousStage
  const events = []
  let persisted

  if (currentLead) {
    const lead = sanitizeLead({
      ...currentLead,
      ...dealPatchToLeadPatch(patch),
      ...patch.legacyLead,
      id: currentLead.id,
      criadoEm: currentLead.criadoEm,
    })
    if (!lead?.nome || !lead?.empresa) return failure('Oportunidade inválida.', state)
    persisted = persistLeadBackedDeal(state, lead)
  } else {
    persisted = updateDealOnly(state, currentDeal, patch, context)
  }

  const lead = persisted.lead || currentLead
  const deal = persisted.deal
  const stageChanged = previousStage && nextStage && previousStage !== nextStage

  events.push({
    type: DOMAIN_EVENT_TYPES.DEAL_UPDATED,
    payload: buildEventPayload(lead, deal, {
      detail: `${lead?.empresa || deal.title} atualizada em ${deal.stage}.`,
    }),
  })

  if (stageChanged) {
    events.push({
      type: DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED,
      payload: buildEventPayload(lead, deal, {
        from: previousStage,
        to: nextStage,
        risk: analyzeDealRisk(lead || deal, state.tasks),
        detail: `${previousStage} → ${nextStage}`,
      }),
    })
  }

  if (stageChanged && nextStage === 'Fechado') {
    events.push({
      type: DOMAIN_EVENT_TYPES.DEAL_WON,
      payload: buildEventPayload(lead, deal, { value: Number(deal.value || 0) }),
    })
  }

  if (stageChanged && nextStage === 'Perdido') {
    events.push({
      type: DOMAIN_EVENT_TYPES.DEAL_LOST,
      payload: buildEventPayload(lead, deal, { reason: deal.lossReason || lead?.motivoPerda || 'Sem motivo registrado' }),
    })
  }

  return success(persisted.state, events, { lead, deal })
}

export function moveDeal(state, dealId, stage, context = {}) {
  const cleanStage = cleanText(stage, 40)
  if (!PIPELINE_STATUSES.includes(cleanStage)) return failure('Informe uma etapa de destino válida.', state)
  return updateDeal(state, dealId, { stage: cleanStage }, context)
}

export function updateNextStep(state, dealId, nextStep, context = {}) {
  return updateDeal(state, dealId, { nextStep }, context)
}

export function markDealWon(state, dealId, patch = {}, context = {}) {
  return updateDeal(state, dealId, { ...patch, stage: 'Fechado', probability: 100 }, context)
}

export function markDealLost(state, dealId, reason, context = {}) {
  const lossReason = cleanText(reason, 160)
  if (!lossReason) return failure('Informe o motivo da perda.', state)
  return updateDeal(state, dealId, { stage: 'Perdido', probability: 0, lossReason }, context)
}

export function scheduleFollowUp(stateInput, dealId, taskInput = {}, context = {}) {
  const state = toState(stateInput)
  const deal = findDeal(state, dealId)
  if (!deal) return failure('Oportunidade não encontrada.', state)

  const lead = findLeadForDeal(state, deal)
  const task = normalizeTaskRelations(normalizeTask({
    id: taskInput.id || createId('task', context),
    title: taskInput.title || `Follow-up ${lead?.empresa || deal.title}`,
    description: taskInput.description || '',
    status: taskInput.status || 'Planejado',
    owner: taskInput.owner || deal.owner,
    priority: taskInput.priority || 'Média',
    dueDate: taskInput.dueDate || '',
    sticker: taskInput.sticker || '📌',
    relatedLeadId: lead?.id || deal.sourceLeadId || '',
    dealId: deal.id,
    accountId: deal.accountId,
    contactId: deal.primaryContactId,
  }), state.deals)

  const nextState = {
    ...state,
    tasks: [task, ...state.tasks],
  }

  return success(nextState, [
    {
      type: DOMAIN_EVENT_TYPES.TASK_CREATED,
      payload: {
        taskId: task.id,
        dealId: deal.id,
        title: task.title,
        owner: task.owner,
        detail: `${task.title} · ${task.owner}`,
      },
    },
    {
      type: DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED,
      payload: buildEventPayload(lead, deal, {
        taskId: task.id,
        title: task.title,
        detail: taskInput.detail || 'Follow-up criado.',
      }),
    },
  ], { deal, lead, task })
}
