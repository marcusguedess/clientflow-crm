import { cleanText } from '../utils/sanitizeData.js'

export const DEFAULT_TASK = {
  title: 'Nova tarefa',
  description: '',
  status: 'Planejado',
  owner: 'Sem responsável',
  priority: 'Média',
  dueDate: '',
  sticker: '📌',
  relatedLeadId: '',
  accountId: '',
  contactId: '',
  dealId: '',
}

const TASK_STATUSES = new Set(['Planejado', 'Em andamento', 'Em revisão', 'Concluído'])
const TASK_PRIORITIES = new Set(['Baixa', 'Média', 'Alta'])

export function normalizeTask(input = {}, defaults = {}) {
  const merged = {
    ...DEFAULT_TASK,
    ...defaults,
    ...(input && typeof input === 'object' ? input : {}),
  }

  const title = cleanText(merged.title, 100) || DEFAULT_TASK.title
  const priority = TASK_PRIORITIES.has(merged.priority) ? merged.priority : DEFAULT_TASK.priority
  const status = TASK_STATUSES.has(merged.status) ? merged.status : DEFAULT_TASK.status

  return {
    id: cleanText(merged.id, 80) || globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
    title,
    description: cleanText(merged.description, 300),
    status,
    owner: cleanText(merged.owner, 100) || DEFAULT_TASK.owner,
    priority,
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(merged.dueDate) ? merged.dueDate : '',
    sticker: cleanText(merged.sticker, 8) || DEFAULT_TASK.sticker,
    relatedLeadId: cleanText(merged.relatedLeadId, 80),
    accountId: cleanText(merged.accountId, 80),
    contactId: cleanText(merged.contactId, 80),
    dealId: cleanText(merged.dealId, 80),
  }
}
