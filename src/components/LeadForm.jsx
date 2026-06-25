import { useEffect, useState } from 'react'
import { PIPELINE_STATUSES } from '../data/seedData'

const emptyLead = {
  nome: '',
  empresa: '',
  email: '',
  telefone: '',
  status: 'Novo Lead',
  valorEstimado: '',
  origem: '',
  responsavel: '',
  notas: '',
  segmento: 'PME',
  tipoConta: 'Lead',
  probabilidade: '',
  previsaoFechamento: '',
  proximoPasso: '',
  motivoPerda: '',
}

export default function LeadForm({ lead, employees = [], onSave, onClose }) {
  const [formData, setFormData] = useState(emptyLead)

  useEffect(() => {
    setFormData(lead ? { ...lead } : emptyLead)
  }, [lead])

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave({
      ...formData,
      valorEstimado: Number(formData.valorEstimado),
      probabilidade: formData.probabilidade === '' ? undefined : Number(formData.probabilidade),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="lead-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">{lead ? 'Atualizar oportunidade' : 'Nova oportunidade'}</span>
            <h2 id="lead-form-title">{lead ? 'Editar lead' : 'Adicionar lead'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar formulário">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Nome *</span>
              <input name="nome" value={formData.nome} onChange={updateField} required />
            </label>
            <label>
              <span>Empresa *</span>
              <input name="empresa" value={formData.empresa} onChange={updateField} required />
            </label>
            <label>
              <span>Email *</span>
              <input name="email" type="email" value={formData.email} onChange={updateField} required />
            </label>
            <label>
              <span>Telefone</span>
              <input name="telefone" value={formData.telefone} onChange={updateField} />
            </label>
            <label>
              <span>Status</span>
              <select name="status" value={formData.status} onChange={updateField}>
                {PIPELINE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Valor estimado (R$)</span>
              <input
                name="valorEstimado"
                type="number"
                min="0"
                step="100"
                value={formData.valorEstimado}
                onChange={updateField}
              />
            </label>
            <label>
              <span>Origem</span>
              <input
                name="origem"
                value={formData.origem}
                onChange={updateField}
                placeholder="Ex.: Indicação"
              />
            </label>
            <label>
              <span>Responsável</span>
              <select
                name="responsavel"
                value={formData.responsavel}
                onChange={updateField}
              >
                <option value="">Selecionar responsável</option>
                {employees.map((employee) => <option key={employee.id} value={employee.nome}>{employee.nome} · {employee.cargo}</option>)}
              </select>
            </label>
            <label>
              <span>Segmento</span>
              <select name="segmento" value={formData.segmento} onChange={updateField}>
                <option>PME</option>
                <option>Mid-market</option>
                <option>Enterprise</option>
                <option>Setor público</option>
              </select>
            </label>
            <label>
              <span>Tipo de conta</span>
              <select name="tipoConta" value={formData.tipoConta} onChange={updateField}>
                <option>Lead</option>
                <option>Conta</option>
                <option>Cliente</option>
                <option>Parceiro</option>
              </select>
            </label>
            <label>
              <span>Probabilidade (%)</span>
              <input
                name="probabilidade"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.probabilidade}
                onChange={updateField}
                placeholder="Ex.: 72"
              />
            </label>
            <label>
              <span>Previsão de fechamento</span>
              <input name="previsaoFechamento" type="date" value={formData.previsaoFechamento} onChange={updateField} />
            </label>
            <label>
              <span>Próximo passo</span>
              <input name="proximoPasso" type="date" value={formData.proximoPasso} onChange={updateField} />
            </label>
            <label>
              <span>Motivo de perda</span>
              <input
                name="motivoPerda"
                value={formData.motivoPerda}
                onChange={updateField}
                placeholder="Obrigatório para análise de perdas"
              />
            </label>
            <label className="form-grid__wide">
              <span>Notas</span>
              <textarea name="notas" value={formData.notas} onChange={updateField} rows="4" />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="button button--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="button button--primary">
              {lead ? 'Salvar alterações' : 'Criar lead'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
