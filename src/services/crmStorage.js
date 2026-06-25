import { sanitizeLeadList } from '../utils/sanitizeData'

const STORAGE_KEY = 'clientflow-crm-leads-v2'
const LEGACY_KEY = 'clientflow-crm-leads'

export function loadLeads(fallback = []) {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY)
    if (!storedValue) return sanitizeLeadList(fallback, fallback)
    const storedLeads = sanitizeLeadList(JSON.parse(storedValue), fallback)
    const isDemoPortfolio = storedLeads.every((lead) => /^lead-\d{3}$/.test(lead.id))
    return isDemoPortfolio
      ? [...storedLeads, ...fallback.filter((lead) => !storedLeads.some((stored) => stored.id === lead.id))]
      : storedLeads
  } catch (error) {
    console.warn('Não foi possível carregar os leads salvos.', error)
    return sanitizeLeadList(fallback, fallback)
  }
}

export function saveLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeLeadList(leads)))
  } catch (error) {
    console.warn('Não foi possível salvar os leads.', error)
  }
}

export function clearLeads() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(LEGACY_KEY)
}

export { STORAGE_KEY }
