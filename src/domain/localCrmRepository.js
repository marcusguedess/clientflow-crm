import { migrateLeadsToCrmEntities } from './crmEntities.js'

function sameCollection(left = [], right = []) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function buildLocalCrmSnapshot({ leads = [], accounts = [], contacts = [], deals = [], activities = [], timelineEvents = [] }) {
  return migrateLeadsToCrmEntities(leads, { accounts, contacts, deals, activities }, timelineEvents)
}

export function shouldUpdateCrmSnapshot(current, next) {
  return !sameCollection(current.accounts, next.accounts) ||
    !sameCollection(current.contacts, next.contacts) ||
    !sameCollection(current.deals, next.deals) ||
    !sameCollection(current.activities, next.activities)
}

export function createLocalCrmRepository(snapshot) {
  return {
    getSnapshot() {
      return snapshot
    },
    getAccounts() {
      return snapshot.accounts
    },
    getContacts() {
      return snapshot.contacts
    },
    getDeals() {
      return snapshot.deals
    },
    getActivities() {
      return snapshot.activities
    },
    findAccount(accountId) {
      return snapshot.accounts.find((account) => account.id === accountId) || null
    },
    findDeal(dealId) {
      return snapshot.deals.find((deal) => deal.id === dealId || deal.sourceLeadId === dealId) || null
    },
  }
}
