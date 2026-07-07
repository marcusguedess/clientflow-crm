export const DOMAIN_EVENT_TYPES = {
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_STAGE_CHANGED: 'deal.stage_changed',
  DEAL_WON: 'deal.won',
  DEAL_LOST: 'deal.lost',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  NOTE_CREATED: 'note.created',
  MESSAGE_SENT: 'message.sent',
  FOLLOW_UP_SCHEDULED: 'follow_up.scheduled',
  CITY_INTERACTION: 'city.interaction',
}

const EVENT_LABELS = {
  [DOMAIN_EVENT_TYPES.DEAL_CREATED]: 'Oportunidade criada',
  [DOMAIN_EVENT_TYPES.DEAL_UPDATED]: 'Oportunidade atualizada',
  [DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED]: 'Etapa alterada',
  [DOMAIN_EVENT_TYPES.DEAL_WON]: 'Negócio ganho',
  [DOMAIN_EVENT_TYPES.DEAL_LOST]: 'Negócio perdido',
  [DOMAIN_EVENT_TYPES.TASK_CREATED]: 'Tarefa criada',
  [DOMAIN_EVENT_TYPES.TASK_UPDATED]: 'Tarefa atualizada',
  [DOMAIN_EVENT_TYPES.TASK_COMPLETED]: 'Tarefa concluída',
  [DOMAIN_EVENT_TYPES.NOTE_CREATED]: 'Nota criada',
  [DOMAIN_EVENT_TYPES.MESSAGE_SENT]: 'Mensagem enviada',
  [DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED]: 'Follow-up agendado',
  [DOMAIN_EVENT_TYPES.CITY_INTERACTION]: 'Interação na City',
}

export function createDomainEvent(type, payload = {}, actor = 'system', at = new Date().toISOString()) {
  return {
    id: globalThis.crypto?.randomUUID?.() || `${type}-${Date.now()}`,
    type,
    label: EVENT_LABELS[type] || type,
    actor,
    at,
    payload,
  }
}

export function getEventTimelineType(eventType) {
  if (eventType === DOMAIN_EVENT_TYPES.DEAL_WON) return 'won'
  if (eventType === DOMAIN_EVENT_TYPES.DEAL_LOST) return 'lost'
  if (eventType === DOMAIN_EVENT_TYPES.TASK_CREATED || eventType === DOMAIN_EVENT_TYPES.TASK_COMPLETED) return 'task'
  if (eventType === DOMAIN_EVENT_TYPES.NOTE_CREATED) return 'note'
  if (eventType === DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED) return 'task'
  if (eventType === DOMAIN_EVENT_TYPES.MESSAGE_SENT) return 'contact'
  return 'activity'
}

export function eventToTimelineEvent(event) {
  const payload = event.payload || {}
  return {
    id: event.id,
    type: getEventTimelineType(event.type),
    title: event.label,
    detail: payload.detail || payload.title || payload.company || event.type,
    at: event.at,
    dealId: payload.dealId || payload.leadId || '',
    accountId: payload.accountId || '',
    contactId: payload.contactId || '',
    company: payload.company || '',
    contactName: payload.contactName || '',
    owner: payload.owner || event.actor || '',
  }
}
