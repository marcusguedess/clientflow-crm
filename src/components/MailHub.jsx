import { useEffect, useMemo, useState } from 'react'
import PixelAvatar from './PixelAvatar'
import { cleanText } from '../utils/sanitizeData'

const folders = [
  { id: 'inbox', label: 'Entrada' },
  { id: 'priority', label: 'Prioritários' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'sent', label: 'Enviados' },
  { id: 'archive', label: 'Arquivados' },
]

function buildInitialThreads(employees, currentEmployee, leads = []) {
  const peers = employees.filter((employee) => employee.id !== currentEmployee.id)
  const openLeads = leads.filter((lead) => !['Fechado', 'Perdido'].includes(lead.status))
  return peers.slice(0, 6).map((employee, index) => ({
    id: `mail-${employee.id}`,
    folder: index < 2 ? 'priority' : index < 4 ? 'followup' : 'inbox',
    unread: index < 3,
    starred: index === 0,
    from: employee,
    relatedLead: openLeads[index % Math.max(openLeads.length, 1)] || null,
    subject:
      index === 0
        ? `Revisão do forecast com ${employee.setor}`
        : index === 1
          ? `Pendência comercial com ${employee.nome.split(' ')[0]}`
          : `Atualização de rotina - ${employee.setor}`,
    preview:
      index === 0
        ? 'Preciso alinhar a previsão da semana e os próximos riscos.'
        : index === 1
          ? 'Deixei alguns pontos para fechar antes da reunião de amanhã.'
          : 'Resumo rápido das prioridades e do que ficou combinado.',
    updatedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
    labels: index === 0 ? ['forecast', 'gestão'] : index === 1 ? ['pipeline', 'follow-up'] : ['rotina'],
    body: [
      {
        id: `${employee.id}-0`,
        senderId: employee.id,
        text:
          index === 0
            ? 'Pode revisar o forecast antes do comitê? Quero chegar com o número fechado.'
            : index === 1
              ? 'Temos alguns passos pendentes para a oportunidade principal da conta.'
              : 'Envio o consolidado da manhã com as prioridades da área.',
        createdAt: new Date(Date.now() - (index + 1) * 2_400_000).toISOString(),
      },
      {
        id: `${employee.id}-1`,
        senderId: currentEmployee.id,
        text: 'Recebido. Vou responder com os pontos críticos e o próximo passo.',
        createdAt: new Date(Date.now() - index * 2_000_000).toISOString(),
      },
    ],
  }))
}

export default function MailHub({
  employees,
  currentEmployee,
  leads = [],
  onOpenProfile,
  onOpenDeal,
  onCreateFollowUp,
}) {
  const initialThreads = useMemo(() => buildInitialThreads(employees, currentEmployee, leads), [employees, currentEmployee, leads])
  const [threads, setThreads] = useState(initialThreads)
  const [folder, setFolder] = useState('inbox')
  const [selectedId, setSelectedId] = useState(initialThreads[0]?.id || null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setThreads(initialThreads)
    setSelectedId(initialThreads[0]?.id || null)
  }, [initialThreads])

  const visibleThreads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return threads.filter((thread) => {
      const matchesFolder =
        folder === 'inbox' ? thread.folder !== 'archive' : thread.folder === folder
      const matchesSearch =
        !normalizedSearch ||
        [thread.subject, thread.preview, thread.from.nome, thread.from.setor, ...(thread.labels || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      return matchesFolder && matchesSearch
    })
  }, [folder, search, threads])

  const selectedThread = visibleThreads.find((thread) => thread.id === selectedId) || visibleThreads[0] || null

  useEffect(() => {
    if (!selectedThread && visibleThreads[0]) setSelectedId(visibleThreads[0].id)
  }, [selectedThread, visibleThreads])

  function openThread(threadId) {
    setSelectedId(threadId)
    setThreads((current) =>
      current.map((thread) => (thread.id === threadId ? { ...thread, unread: false } : thread)),
    )
  }

  function toggleStar(threadId) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId ? { ...thread, starred: !thread.starred } : thread,
      ),
    )
  }

  function archiveThread(threadId) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? { ...thread, folder: thread.folder === 'archive' ? 'inbox' : 'archive' }
          : thread,
      ),
    )
  }

  function submitReply(event) {
    event.preventDefault()
    if (!selectedThread) return
    const safeDraft = cleanText(draft, 500)
    if (!safeDraft) return
    const nextMessage = {
      id: `${selectedThread.id}-${Date.now()}`,
      senderId: currentEmployee.id,
      text: safeDraft,
      createdAt: new Date().toISOString(),
    }
    setThreads((current) =>
      current.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              unread: false,
              folder: thread.folder === 'archive' ? 'inbox' : thread.folder,
              preview: safeDraft,
              updatedAt: nextMessage.createdAt,
              body: [...thread.body, nextMessage].slice(-8),
            }
          : thread,
      ),
    )
    setDraft('')
  }

  const totalUnread = threads.filter((thread) => thread.unread).length
  const priorityCount = threads.filter((thread) => thread.folder === 'priority').length

  return (
    <section className="mail-hub">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Comunicação</span>
          <h2>Flow Mail</h2>
        </div>
        <span className="result-count">Caixa corporativa</span>
      </div>

      <section className="mail-suite">
        <aside className="mail-suite__folders">
          <div className="mail-suite__brand">
            <span className="messenger__orb">CF</span>
            <div>
              <strong>Flow Mail</strong>
              <small>Inbox, follow-up e arquivos vivos</small>
            </div>
          </div>

          <div className="mail-suite__folder-list">
            {folders.map((item) => (
              <button
                key={item.id}
                type="button"
                className={folder === item.id ? 'is-active' : ''}
                onClick={() => setFolder(item.id)}
              >
                <span>{item.label}</span>
                <small>
                  {item.id === 'inbox'
                    ? totalUnread
                    : item.id === 'priority'
                      ? priorityCount
                      : threads.filter((thread) => thread.folder === item.id).length}
                </small>
              </button>
            ))}
          </div>

          <input
            className="mail-suite__search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar remetente, assunto ou etiqueta"
          />

          <div className="mail-suite__stats">
            <div>
              <strong>{threads.length}</strong>
              <small>Conversas</small>
            </div>
            <div>
              <strong>{totalUnread}</strong>
              <small>Não lidas</small>
            </div>
          </div>
        </aside>

        <div className="mail-suite__list">
          {visibleThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className={`mail-thread ${selectedThread?.id === thread.id ? 'is-active' : ''} ${thread.unread ? 'is-unread' : ''}`}
              onClick={() => openThread(thread.id)}
            >
              <PixelAvatar avatar={thread.from.avatar} size={38} animated />
              <div className="mail-thread__copy">
                <strong>{thread.subject}</strong>
                <small>{thread.from.nome} · {thread.from.setor}</small>
                <p>{thread.preview}</p>
              </div>
              <span className="mail-thread__time">
                {new Date(thread.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>

        <article className="mail-suite__reader">
          {selectedThread ? (
            <>
              <header className="mail-reader__header">
                <div>
                  <span className="eyebrow">Mensagem</span>
                  <h3>{selectedThread.subject}</h3>
                  <small>
                    {selectedThread.from.nome} · {selectedThread.from.setor}
                  </small>
                  {selectedThread.relatedLead && (
                    <span className="mail-reader__deal">
                      {selectedThread.relatedLead.empresa} · {selectedThread.relatedLead.status}
                    </span>
                  )}
                </div>
                <div className="mail-reader__actions">
                  {selectedThread.relatedLead && (
                    <>
                      <button type="button" className="button button--ghost" onClick={() => onOpenDeal?.(selectedThread.relatedLead)}>
                        Abrir deal
                      </button>
                      <button type="button" className="button button--ghost" onClick={() => onCreateFollowUp?.(selectedThread.relatedLead, 'e-mail')}>
                        Criar follow-up
                      </button>
                    </>
                  )}
                  <button type="button" className="button button--ghost" onClick={() => toggleStar(selectedThread.id)}>
                    {selectedThread.starred ? 'Remover destaque' : 'Destacar'}
                  </button>
                  <button type="button" className="button button--ghost" onClick={() => archiveThread(selectedThread.id)}>
                    {selectedThread.folder === 'archive' ? 'Tirar do arquivo' : 'Arquivar'}
                  </button>
                  <button type="button" className="button button--ghost" onClick={() => onOpenProfile?.(selectedThread.from)}>
                    Ver perfil
                  </button>
                </div>
              </header>

              <div className="mail-reader__timeline">
                {selectedThread.body.map((item) => {
                  const mine = item.senderId === currentEmployee.id
                  const sender = employees.find((employee) => employee.id === item.senderId)
                  return (
                    <div key={item.id} className={`mail-message ${mine ? 'mail-message--mine' : ''}`}>
                      {!mine && <PixelAvatar avatar={sender?.avatar || selectedThread.from.avatar} size={28} />}
                      <div>
                        <p>{item.text}</p>
                        <small>
                          {new Date(item.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form className="mail-reader__compose" onSubmit={submitReply}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Responder com próximo passo, contexto ou alinhamento..."
                  rows={4}
                  maxLength={500}
                />
                <div className="compose-actions">
                  <button type="button" className="button button--ghost" onClick={() => setDraft('')}>
                    Limpar
                  </button>
                  <button className="button button--primary" type="submit">
                    Enviar resposta
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="mail-suite__empty">
              <strong>Nenhum e-mail encontrado.</strong>
              <p>Troque o filtro ou refine a busca para localizar outra conversa.</p>
            </div>
          )}
        </article>
      </section>
    </section>
  )
}
