import { useMemo } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import PixelAvatar from './PixelAvatar'

export default function PerformanceDashboard({ leads, employees }) {
  const metrics = useMemo(() => {
    const won = leads.filter((lead) => lead.status === 'Fechado')
    const lost = leads.filter((lead) => lead.status === 'Perdido')
    const newLeads = leads.filter((lead) => lead.status === 'Novo Lead')
    const revenue = won.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0)
    return { won: won.length, lost: lost.length, newLeads: newLeads.length, revenue }
  }, [leads])

  const performance = employees.map((employee, index) => {
    const owned = leads.filter((lead) => lead.responsavel === employee.nome)
    const closed = owned.filter((lead) => lead.status === 'Fechado')
    const baseScore = closed.length * 32 + owned.length * 8 + (10 - index) * 2
    return {
      employee,
      score: Math.min(100, Math.max(18, baseScore)),
      deals: closed.length,
      value: closed.reduce((sum, lead) => sum + Number(lead.valorEstimado || 0), 0),
    }
  }).sort((a, b) => b.score - a.score)

  return (
    <section className="performance-dashboard">
      <div className="executive-strip">
        <div><small>Entradas</small><strong>{metrics.newLeads}</strong><span>novos leads</span></div>
        <div><small>Fechamentos</small><strong>{metrics.won}</strong><span>clientes ganhos</span></div>
        <div><small>Perdas</small><strong>{metrics.lost}</strong><span>oportunidades</span></div>
        <div><small>Receita ganha</small><strong>{formatCurrency(metrics.revenue)}</strong><span>valor fechado</span></div>
      </div>

      <div className="performance-grid">
        <article className="result-chart">
          <header><div><span className="eyebrow">Resultado comercial</span><h2>Fluxo de oportunidades</h2></div><span className="live-pill"><i /> Atualizado</span></header>
          <div className="funnel-bars">
            {[
              ['Entradas', leads.length, '#4e6fe0'],
              ['Contato', leads.filter((lead) => lead.status !== 'Novo Lead').length, '#7961d5'],
              ['Propostas', leads.filter((lead) => ['Proposta','Fechado'].includes(lead.status)).length, '#e1a442'],
              ['Ganhos', metrics.won, '#36b789'],
            ].map(([label, value, color]) => (
              <div key={label}><span>{label}</span><div><i style={{ width: `${Math.max(12, (value / Math.max(leads.length, 1)) * 100)}%`, background: color }} /></div><strong>{value}</strong></div>
            ))}
          </div>
        </article>

        <article className="team-ranking">
          <header><span className="eyebrow">10 profissionais</span><h2>Desempenho da equipe</h2></header>
          <div>
            {performance.map((item, index) => (
              <article key={item.employee.id}>
                <span className="rank-position">{index + 1}</span>
                <PixelAvatar avatar={item.employee.avatar} size={34} />
                <div className="rank-copy"><strong>{item.employee.nome}</strong><small>{item.employee.cargo}</small><span><i style={{ width: `${item.score}%` }} /></span></div>
                <div className="rank-result"><strong>{item.score}</strong><small>{item.deals} ganhos · {formatCurrency(item.value)}</small></div>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
