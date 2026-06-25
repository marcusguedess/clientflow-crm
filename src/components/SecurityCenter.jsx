import { useRef, useState } from 'react'

export default function SecurityCenter({ onExport, onImport, privacyMode, onTogglePrivacy, onWipe }) {
  const [exportPassword, setExportPassword] = useState('')
  const [importPassword, setImportPassword] = useState('')
  const [file, setFile] = useState(null)
  const fileRef = useRef(null)

  async function exportData(event) {
    event.preventDefault()
    await onExport(exportPassword)
    setExportPassword('')
  }

  async function importData(event) {
    event.preventDefault()
    if (!file) return
    await onImport(file, importPassword)
    setImportPassword('')
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="security-center">
      <div className="security-hero">
        <span className="security-lock">◆</span>
        <div>
          <span className="eyebrow">Armazenamento local-first</span>
          <h2>Dados & segurança</h2>
          <p>Este site estático não possui contas, servidor ou sincronização real. Os dados permanecem neste navegador.</p>
        </div>
      </div>

      <div className="security-grid">
        <article className="security-card security-card--presentation">
          <span className="security-card__number">00</span>
          <h3>Modo apresentação</h3>
          <p>Oculta emails, telefones e notas para reduzir exposição acidental durante reuniões e gravações.</p>
          <button className={`button ${privacyMode ? 'button--respect' : 'button--primary'}`} onClick={onTogglePrivacy}>
            {privacyMode ? 'Desativar ocultação' : 'Ativar modo apresentação'}
          </button>
        </article>
        <article className="security-card security-card--prevention">
          <span className="security-card__number">P</span>
          <h3>Sistema de prevenção</h3>
          <ul className="prevention-list">
            <li><i /> Ocultação automática após 3 minutos sem interação</li>
            <li><i /> Limite de mensagens e publicações em sequência</li>
            <li><i /> Prevenção de leads com email duplicado</li>
            <li><i /> Validação de armazenamento e backups</li>
            <li><i /> CSP e ausência de scripts externos</li>
          </ul>
        </article>
        <article className="security-card">
          <span className="security-card__number">01</span>
          <h3>Backup criptografado</h3>
          <p>Gera um arquivo protegido com AES-GCM e chave derivada da senha. A senha nunca é armazenada.</p>
          <form onSubmit={exportData}>
            <label><span>Senha do backup</span><input type="password" minLength="10" required value={exportPassword} onChange={(event) => setExportPassword(event.target.value)} autoComplete="new-password" /></label>
            <button className="button button--primary" type="submit">Exportar backup</button>
          </form>
        </article>

        <article className="security-card">
          <span className="security-card__number">02</span>
          <h3>Restaurar dados</h3>
          <p>A importação aceita apenas backups ClientFlow com até 1 MB e valida os leads antes de persistir.</p>
          <form onSubmit={importData}>
            <label><span>Arquivo .cfbackup</span><input ref={fileRef} type="file" accept=".cfbackup,application/json" required onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
            <label><span>Senha do backup</span><input type="password" minLength="10" required value={importPassword} onChange={(event) => setImportPassword(event.target.value)} autoComplete="current-password" /></label>
            <button className="button button--ghost" type="submit">Validar e restaurar</button>
          </form>
        </article>

        <article className="security-card security-card--wide">
          <span className="security-card__number">03</span>
          <h3>Limites de proteção</h3>
          <ul>
            <li>Não armazene senhas, tokens, documentos sigilosos ou dados regulados no CRM estático.</li>
            <li>Quem tiver acesso ao perfil do navegador poderá acessar os dados já abertos.</li>
            <li>Autenticação, permissões e colaboração real exigem backend com autorização no servidor.</li>
          </ul>
        </article>
        <article className="security-card security-card--wide security-card--danger">
          <span className="security-card__number">04</span>
          <h3>Limpeza de emergência</h3>
          <p>Remove leads, mensagens, mural, perfis, tarefas e preferências ClientFlow deste navegador.</p>
          <button className="button button--danger" onClick={onWipe}>Apagar todos os dados locais</button>
        </article>
      </div>
    </section>
  )
}
