export function calculateLeadStats(leads) {
  const total = leads.length
  const ganhos = leads.filter((lead) => lead.status === 'Fechado').length
  const perdidos = leads.filter((lead) => lead.status === 'Perdido').length
  const oportunidadesConcluidas = ganhos + perdidos

  const valorNegociacao = leads
    .filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
    .reduce((totalValue, lead) => totalValue + Number(lead.valorEstimado || 0), 0)

  return {
    total,
    valorNegociacao,
    ganhos,
    conversao: oportunidadesConcluidas
      ? Math.round((ganhos / oportunidadesConcluidas) * 100)
      : 0,
  }
}
