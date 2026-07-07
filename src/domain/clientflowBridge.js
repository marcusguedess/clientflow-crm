import { DOMAIN_EVENT_TYPES } from './events.js'

export function translateEventToCitySignal(event) {
  const payload = event.payload || {}

  if (event.type === DOMAIN_EVENT_TYPES.DEAL_WON) {
    return {
      id: `city-${event.id}`,
      tone: 'celebration',
      title: 'Sales Tower celebrou um fechamento',
      detail: `${payload.company || 'Um deal'} avançou para cliente.`,
      district: 'sales',
    }
  }

  if (event.type === DOMAIN_EVENT_TYPES.TASK_COMPLETED) {
    return {
      id: `city-${event.id}`,
      tone: 'progress',
      title: 'Missão operacional avançou',
      detail: payload.title || 'Uma tarefa foi concluída.',
      district: 'operations',
    }
  }

  if (event.type === DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED || event.type === DOMAIN_EVENT_TYPES.TASK_CREATED) {
    return {
      id: `city-${event.id}`,
      tone: 'focus',
      title: 'Novo próximo passo no Flowboard',
      detail: payload.title || 'Uma ação comercial foi criada.',
      district: 'sales',
    }
  }

  if (event.type === DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED && payload.risk?.level === 'high') {
    return {
      id: `city-${event.id}`,
      tone: 'warning',
      title: 'Alerta na Sales Tower',
      detail: `${payload.company || 'Uma oportunidade'} está em risco alto.`,
      district: 'sales',
    }
  }

  if (event.type === DOMAIN_EVENT_TYPES.CITY_INTERACTION) {
    return {
      id: `city-${event.id}`,
      tone: 'social',
      title: payload.title || 'Interação na City',
      detail: payload.detail || 'Um evento social aconteceu.',
      district: payload.district || 'central',
    }
  }

  return null
}

export function buildCitySignals(events = []) {
  return events
    .map(translateEventToCitySignal)
    .filter(Boolean)
    .slice(0, 6)
}
