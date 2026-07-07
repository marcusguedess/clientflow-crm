import { PIPELINE_STATUSES } from '../data/seedData.js'

const MAX_TEXT = 2000
const LEAD_FIELDS = [
  'id',
  'nome',
  'empresa',
  'email',
  'telefone',
  'status',
  'valorEstimado',
  'origem',
  'responsavel',
  'notas',
  'criadoEm',
  'segmento',
  'probabilidade',
  'previsaoFechamento',
  'proximoPasso',
  'motivoPerda',
  'tipoConta',
]

export function cleanText(value, maxLength = MAX_TEXT) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength)
}

export function sanitizeLead(input) {
  if (!input || typeof input !== 'object') return null
  const lead = Object.fromEntries(LEAD_FIELDS.map((field) => [field, input[field]]))
  const status = PIPELINE_STATUSES.includes(lead.status) ? lead.status : 'Novo Lead'
  const valor = Number(lead.valorEstimado)
  const probabilidade = Number(lead.probabilidade)
  const defaultProbability = {
    'Novo Lead': 12,
    'Contato Feito': 25,
    Reunião: 45,
    Proposta: 72,
    Fechado: 100,
    Perdido: 0,
  }[status]

  return {
    id: cleanText(lead.id, 80) || globalThis.crypto.randomUUID(),
    nome: cleanText(lead.nome, 100),
    empresa: cleanText(lead.empresa, 120),
    email: cleanText(lead.email, 180),
    telefone: cleanText(lead.telefone, 40),
    status,
    valorEstimado: Number.isFinite(valor) ? Math.max(0, Math.min(valor, 1_000_000_000)) : 0,
    origem: cleanText(lead.origem, 80),
    responsavel: cleanText(lead.responsavel, 100),
    notas: cleanText(lead.notas, 2000),
    criadoEm: Number.isNaN(Date.parse(lead.criadoEm)) ? new Date().toISOString() : lead.criadoEm,
    segmento: cleanText(lead.segmento, 80) || 'PME',
    probabilidade: Number.isFinite(probabilidade) ? Math.max(0, Math.min(probabilidade, 100)) : defaultProbability,
    previsaoFechamento: /^\d{4}-\d{2}-\d{2}$/.test(lead.previsaoFechamento) ? lead.previsaoFechamento : '',
    proximoPasso: /^\d{4}-\d{2}-\d{2}$/.test(lead.proximoPasso) ? lead.proximoPasso : '',
    motivoPerda: status === 'Perdido' ? cleanText(lead.motivoPerda, 160) : cleanText(lead.motivoPerda, 160),
    tipoConta: ['Lead', 'Conta', 'Cliente', 'Parceiro'].includes(lead.tipoConta) ? lead.tipoConta : (status === 'Fechado' ? 'Cliente' : 'Lead'),
  }
}

export function sanitizeLeadList(value, fallback = []) {
  if (!Array.isArray(value)) return fallback
  return value.slice(0, 5000).map(sanitizeLead).filter((lead) => lead?.nome && lead?.empresa)
}

export function sanitizeEmployees(value, fallback = []) {
  if (!Array.isArray(value)) return fallback
  const allowedStatuses = new Set(['online', 'ocupado', 'ausente'])
  const allowedAccessories = new Set(['none', 'glasses', 'headset', 'cap', 'hat'])
  const allowedHair = new Set(['short', 'long', 'curly', 'bun', 'mohawk', 'afro', 'braids', 'sidecut'])
  const allowedOutfits = new Set(['shirt', 'suit', 'blazer', 'dress', 'skirt', 'jacket', 'hoodie', 'vest', 'overalls'])
  const storedById = new Map(value.map((employee) => [employee?.id, employee]))
  return fallback.map((base) => {
    const employee = storedById.get(base.id)
    if (!employee) return base
    return {
      ...base,
      nome: cleanText(employee.nome, 80) || base.nome,
      cargo: cleanText(employee.cargo, 100) || base.cargo,
      setor: cleanText(employee.setor, 80) || base.setor,
      bio: cleanText(employee.bio, 300),
      frase: cleanText(employee.frase, 180),
      status: allowedStatuses.has(employee.status) ? employee.status : base.status,
      avatar: {
        skin: /^#[0-9a-f]{6}$/i.test(employee.avatar?.skin) ? employee.avatar.skin : base.avatar.skin,
        hair: /^#[0-9a-f]{6}$/i.test(employee.avatar?.hair) ? employee.avatar.hair : base.avatar.hair,
        shirt: /^#[0-9a-f]{6}$/i.test(employee.avatar?.shirt) ? employee.avatar.shirt : base.avatar.shirt,
        accessory: allowedAccessories.has(employee.avatar?.accessory) ? employee.avatar.accessory : 'none',
        hairStyle: allowedHair.has(employee.avatar?.hairStyle) ? employee.avatar.hairStyle : 'short',
        outfit: allowedOutfits.has(employee.avatar?.outfit) ? employee.avatar.outfit : 'shirt',
      },
    }
  })
}

export function sanitizeMessages(value, employeeIds, fallback = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback
  const allowedIds = new Set(employeeIds)
  return Object.fromEntries(employeeIds.filter((id) => id !== 'employee-ana').map((id) => {
    const list = Array.isArray(value[id]) ? value[id] : fallback[id] || []
    return [id, list.slice(-100).map((message) => ({
      id: cleanText(message?.id, 80) || globalThis.crypto.randomUUID(),
      senderId: allowedIds.has(message?.senderId) ? message.senderId : id,
      text: cleanText(message?.text, 500),
      createdAt: Number.isNaN(Date.parse(message?.createdAt)) ? new Date().toISOString() : message.createdAt,
    })).filter((message) => message.text)]
  }))
}

export function sanitizePosts(value, employeeIds, fallback = []) {
  if (!Array.isArray(value)) return fallback
  const allowedIds = new Set(employeeIds)
  return value.slice(0, 200).map((post) => ({
    id: cleanText(post?.id, 80) || globalThis.crypto.randomUUID(),
    employeeId: allowedIds.has(post?.employeeId) ? post.employeeId : employeeIds[0],
    text: cleanText(post?.text, 500),
    createdAt: Number.isNaN(Date.parse(post?.createdAt)) ? new Date().toISOString() : post.createdAt,
    likes: Math.max(0, Math.min(100000, Number(post?.likes) || 0)),
  })).filter((post) => post.text)
}

export function sanitizeTasks(value, fallback = []) {
  if (!Array.isArray(value)) return fallback
  const statuses = new Set(['Planejado', 'Em andamento', 'Em revisão', 'Concluído'])
  const priorities = new Set(['Baixa', 'Média', 'Alta'])
  const tasks = value.slice(0, 500).map((task) => ({
    id: cleanText(task?.id, 80) || globalThis.crypto.randomUUID(),
    title: cleanText(task?.title, 100),
    description: cleanText(task?.description, 300),
    status: statuses.has(task?.status) ? task.status : 'Planejado',
    owner: cleanText(task?.owner, 100),
    priority: priorities.has(task?.priority) ? task.priority : 'Média',
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(task?.dueDate) ? task.dueDate : '',
    sticker: cleanText(task?.sticker, 8) || '📌',
    relatedLeadId: cleanText(task?.relatedLeadId, 80),
    accountId: cleanText(task?.accountId, 80),
    contactId: cleanText(task?.contactId, 80),
    dealId: cleanText(task?.dealId, 80),
  })).filter((task) => task.title)
  const isDemoBoard = tasks.every((task) => /^task-\d+$/.test(task.id))
  return isDemoBoard
    ? [...tasks, ...fallback.filter((task) => !tasks.some((stored) => stored.id === task.id))]
    : tasks
}
