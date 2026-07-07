import { calculateAccountHealth, getDealProbability } from '../domain/metrics'

function normalizeDate(value) {
  return Number.isNaN(Date.parse(value)) ? null : value
}

function chooseTopValue(items) {
  return [...items].sort((a, b) => Number(b.valorEstimado || 0) - Number(a.valorEstimado || 0))[0] || null
}

export function buildCommercialModel(leads, tasks = [], activities = [], employees = []) {
  const accountsByName = new Map()
  const contactsByEmail = new Map()

  leads.forEach((lead) => {
    const deal = {
      id: lead.id,
      accountId: `account-${lead.empresa.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
      contactId: `contact-${lead.id}`,
      title: `${lead.empresa}`,
      contactName: lead.nome,
      email: lead.email,
      phone: lead.telefone,
      owner: lead.responsavel,
      segment: lead.segmento || 'PME',
      stage: lead.status,
      value: Number(lead.valorEstimado || 0),
      probability: getDealProbability(lead),
      forecast: Math.round(Number(lead.valorEstimado || 0) * (getDealProbability(lead) / 100)),
      closeDate: lead.previsaoFechamento || '',
      nextStep: lead.proximoPasso || '',
      lossReason: lead.motivoPerda || '',
      createdAt: normalizeDate(lead.criadoEm) || new Date().toISOString(),
      notes: lead.notas,
      type: lead.tipoConta || (lead.status === 'Fechado' ? 'Cliente' : 'Lead'),
    }

    const accountKey = deal.accountId
    if (!accountsByName.has(accountKey)) {
      accountsByName.set(accountKey, {
        id: accountKey,
        company: lead.empresa,
        segment: deal.segment,
        owner: lead.responsavel,
        deals: [],
        contacts: [],
        value: 0,
        forecast: 0,
        stage: lead.status,
        lastTouchAt: null,
        nextStep: null,
      })
    }

    const account = accountsByName.get(accountKey)
    account.deals.push(deal)
    account.value += deal.value
    account.forecast += deal.forecast
    if (!account.owner || lead.status === 'Proposta' || lead.status === 'Fechado') account.owner = lead.responsavel
    if (!account.nextStep || (deal.nextStep && (!account.nextStep || deal.nextStep < account.nextStep))) account.nextStep = deal.nextStep
    if (!account.lastTouchAt || deal.createdAt > account.lastTouchAt) account.lastTouchAt = deal.createdAt
    account.stage = account.deals.find((item) => item.stage === 'Proposta')
      ? 'Proposta'
      : account.deals.find((item) => item.stage === 'Reunião')
        ? 'Reunião'
        : chooseTopValue(account.deals)?.stage || account.stage

    const contactKey = lead.email.toLowerCase()
    if (!contactsByEmail.has(contactKey)) {
      contactsByEmail.set(contactKey, {
        id: `contact-${lead.id}`,
        name: lead.nome,
        company: lead.empresa,
        email: lead.email,
        phone: lead.telefone,
        owner: lead.responsavel,
        segment: deal.segment,
        status: lead.status,
        deals: [],
        tasks: [],
        lastTouchAt: null,
      })
    }

    const contact = contactsByEmail.get(contactKey)
    contact.deals.push(deal)
    contact.lastTouchAt = contact.lastTouchAt && contact.lastTouchAt > deal.createdAt ? contact.lastTouchAt : deal.createdAt
    if (!account.contacts.some((item) => item.id === contact.id)) {
      account.contacts.push({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        role: lead.status === 'Fechado' ? 'campeão interno' : 'contato principal',
        influence: Number(lead.valorEstimado || 0) >= 50000 ? 'alta' : 'média',
      })
    }
  })

  tasks.forEach((task) => {
    const deal = leads.find((lead) => lead.id === task.relatedLeadId)
    if (!deal) return
    const contactKey = deal.email.toLowerCase()
    const contact = contactsByEmail.get(contactKey)
    const account = accountsByName.get(`account-${deal.empresa.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`)
    const taskEvent = {
      id: `task-${task.id}`,
      type: 'task',
      title: task.title,
      detail: `${task.owner} · ${task.priority} · ${task.status}`,
      at: task.dueDate ? `${task.dueDate}T12:00:00.000Z` : new Date().toISOString(),
      status: task.status,
    }

    if (contact) {
      contact.tasks.push(task)
      contact.lastTouchAt = contact.lastTouchAt && contact.lastTouchAt > taskEvent.at ? contact.lastTouchAt : taskEvent.at
    }
    if (account) {
      account.lastTouchAt = account.lastTouchAt && account.lastTouchAt > taskEvent.at ? account.lastTouchAt : taskEvent.at
    }
  })

  activities.forEach((activity) => {
    const at = normalizeDate(activity.at) || new Date().toISOString()
    const matchedLead = leads.find((lead) =>
      [lead.empresa, lead.nome, lead.responsavel]
        .filter(Boolean)
        .some((token) => `${activity.title || ''} ${activity.detail || ''}`.toLowerCase().includes(String(token).toLowerCase())),
    )
    if (!matchedLead) return

    const contact = contactsByEmail.get(matchedLead.email.toLowerCase())
    const account = accountsByName.get(`account-${matchedLead.empresa.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`)
    if (contact && (!contact.lastTouchAt || contact.lastTouchAt < at)) contact.lastTouchAt = at
    if (account && (!account.lastTouchAt || account.lastTouchAt < at)) account.lastTouchAt = at
  })

  const accounts = [...accountsByName.values()].map((account) => {
    const openDeals = account.deals.filter((deal) => !['Fechado', 'Perdido'].includes(deal.stage))
    const wonDeals = account.deals.filter((deal) => deal.stage === 'Fechado')
    const health = calculateAccountHealth(account, tasks)
    return {
      ...account,
      wonDeals,
      openDeals,
      health: health.score,
      healthDetails: health,
      ownerAvatar: employees.find((employee) => employee.nome === account.owner)?.avatar,
      lastTouchAt: account.lastTouchAt,
    }
  }).sort((a, b) => b.value - a.value)

  const contacts = [...contactsByEmail.values()].map((contact) => ({
    ...contact,
    deals: contact.deals.sort((a, b) => b.value - a.value),
    tasks: contact.tasks.sort((a, b) => String(a.dueDate || '').localeCompare(String(b.dueDate || ''))),
    ownerAvatar: employees.find((employee) => employee.nome === contact.owner)?.avatar,
  })).sort((a, b) => b.deals.length - a.deals.length)

  const deals = leads.map((lead) => ({
    id: lead.id,
    title: lead.empresa,
    contactName: lead.nome,
    company: lead.empresa,
    owner: lead.responsavel,
    ownerAvatar: employees.find((employee) => employee.nome === lead.responsavel)?.avatar,
    email: lead.email,
    phone: lead.telefone,
    stage: lead.status,
    value: Number(lead.valorEstimado || 0),
    forecast: Math.round(Number(lead.valorEstimado || 0) * (getDealProbability(lead) / 100)),
    probability: getDealProbability(lead),
    segment: lead.segmento || 'PME',
    closeDate: lead.previsaoFechamento || '',
    nextStep: lead.proximoPasso || '',
    notes: lead.notas,
    lossReason: lead.motivoPerda || '',
    createdAt: normalizeDate(lead.criadoEm) || new Date().toISOString(),
  })).sort((a, b) => b.value - a.value)

  const activityEvents = activities.map((activity) => {
    const matchedLead = leads.find((lead) => lead.id === activity.dealId) || leads.find((lead) =>
      [lead.empresa, lead.nome, lead.responsavel]
        .filter(Boolean)
        .some((token) => `${activity.title || ''} ${activity.detail || ''}`.toLowerCase().includes(String(token).toLowerCase())),
    )
    return {
      id: activity.id,
      type: activity.type || 'activity',
      title: activity.title,
      detail: activity.detail,
      at: normalizeDate(activity.at) || new Date().toISOString(),
      dealId: matchedLead?.id || '',
      accountId: matchedLead ? `account-${matchedLead.empresa.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}` : '',
      contactId: matchedLead ? `contact-${matchedLead.id}` : '',
      company: matchedLead?.empresa || '',
      contactName: matchedLead?.nome || '',
      owner: matchedLead?.responsavel || '',
    }
  })

  const dealEvents = deals.map((deal) => ({
    id: `deal-${deal.id}`,
    type: deal.stage === 'Fechado' ? 'won' : deal.stage === 'Perdido' ? 'lost' : 'contact',
    title: `${deal.stage}: ${deal.company}`,
    detail: `${deal.contactName} · ${deal.owner}`,
    at: deal.createdAt,
    dealId: deal.id,
    accountId: `account-${deal.company.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    contactId: `contact-${deal.id}`,
    company: deal.company,
    contactName: deal.contactName,
    owner: deal.owner,
  }))

  const taskEvents = tasks.filter((task) => task.relatedLeadId).map((task) => {
    const relatedLead = leads.find((lead) => lead.id === task.relatedLeadId)
    return {
      id: `task-${task.id}`,
      type: task.status === 'Concluído' ? 'won' : 'task',
      title: task.title,
      detail: `${task.owner} · ${task.priority} · ${task.status}`,
      at: task.dueDate ? `${task.dueDate}T12:00:00.000Z` : new Date().toISOString(),
      dealId: relatedLead?.id || task.relatedLeadId,
      accountId: relatedLead ? `account-${relatedLead.empresa.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}` : '',
      contactId: relatedLead ? `contact-${relatedLead.id}` : '',
      company: relatedLead?.empresa || '',
      contactName: relatedLead?.nome || '',
      owner: task.owner,
      taskId: task.id,
      status: task.status,
    }
  })

  const timeline = [...activityEvents, ...dealEvents, ...taskEvents]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 80)

  const summary = {
    totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
    totalForecast: deals.reduce((sum, deal) => sum + deal.forecast, 0),
    openDeals: deals.filter((deal) => !['Fechado', 'Perdido'].includes(deal.stage)).length,
    wonDeals: deals.filter((deal) => deal.stage === 'Fechado').length,
    accounts: accounts.length,
    contacts: contacts.length,
    enterpriseAccounts: accounts.filter((account) => account.segment === 'Enterprise').length,
  }

  return { summary, accounts, contacts, deals, timeline }
}
