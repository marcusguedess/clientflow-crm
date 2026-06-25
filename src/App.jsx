import { useEffect, useMemo, useRef, useState } from 'react'
import EmployeeProfile from './components/EmployeeProfile'
import ActivitiesPage from './components/ActivitiesPage'
import AnalyticsHub from './components/AnalyticsHub'
import BusinessCommandCenter from './components/BusinessCommandCenter'
import ClientsPage from './components/ClientsPage'
import CommercialWorkspace from './components/CommercialWorkspace'
import FloatingChat from './components/FloatingChat'
import Header from './components/Header'
import MessengerPage from './components/MessengerPage'
import LeadCard from './components/LeadCard'
import LeadForm from './components/LeadForm'
import OfficeCity from './components/OfficeCity'
import PipelineBoard from './components/PipelineBoard'
import PerformanceDashboard from './components/PerformanceDashboard'
import SearchBar from './components/SearchBar'
import SecurityCenter from './components/SecurityCenter'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import TaskBoard from './components/TaskBoard'
import TeamHub from './components/TeamHub'
import ThemeStudio from './components/ThemeStudio'
import Toast from './components/Toast'
import { seedLeads } from './data/seedData'
import { seedEmployees, seedMessages, seedPosts } from './data/teamData'
import { seedActivities, seedTasks } from './data/workData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePersistentState } from './hooks/usePersistentState'
import { formatCurrency } from './utils/formatCurrency'
import { calculateLeadStats } from './utils/leadStats'
import {
  cleanText,
  sanitizeEmployees,
  sanitizeLead,
  sanitizeLeadList,
  sanitizeMessages,
  sanitizePosts,
  sanitizeTasks,
} from './utils/sanitizeData'
import { decryptBackup, encryptBackup } from './utils/secureBackup'
import { playSound } from './utils/soundEffects'

function findEmployeeByName(employees, name) {
  return employees.find((employee) => employee.nome === name) || employees[0]
}

function MetricIcon({ type }) {
  const paths = {
    leads: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.8M17 15c2.3.4 4 2.4 4 5" /></>,
    value: <><path d="M12 2v20M17 6.5c0-1.4-2.2-2.5-5-2.5S7 5.1 7 6.5 9.2 9 12 9s5 1.1 5 2.5S14.8 14 12 14s-5 1.1-5 2.5S9.2 19 12 19s5-1.1 5-2.5" /></>,
    won: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    rate: <><path d="M4 19 19 4M7.5 5.5h.01M16.5 17.5h.01" /><circle cx="7.5" cy="5.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /></>,
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>
}

export default function App() {
  const [leads, setLeads] = useLocalStorage(seedLeads)
  const employeeIds = seedEmployees.map((employee) => employee.id)
  const [employees, setEmployees] = usePersistentState('clientflow-employees-v1', seedEmployees, sanitizeEmployees)
  const [messages, setMessages] = usePersistentState('clientflow-messages-v1', seedMessages, (value, fallback) =>
    sanitizeMessages(value, employeeIds, fallback),
  )
  const [posts, setPosts] = usePersistentState('clientflow-posts-v1', seedPosts, (value, fallback) =>
    sanitizePosts(value, employeeIds, fallback),
  )
  const [socialStats, setSocialStats] = usePersistentState('clientflow-social-v1', {}, (value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? value : {},
  )
  const [tasks, setTasks] = usePersistentState('clientflow-tasks-v1', seedTasks, sanitizeTasks)
  const [respectState, setRespectState] = usePersistentState('clientflow-respects-v1', {
    date: new Date().toISOString().slice(0, 10),
    remaining: 3,
  })
  const [activeView, setActiveView] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [editingLead, setEditingLead] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletedLead, setDeletedLead] = useState(null)
  const [toast, setToast] = useState(null)
  const [profileEmployee, setProfileEmployee] = useState(null)
  const [teamContactId, setTeamContactId] = useState(null)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [theme, setTheme] = usePersistentState('clientflow-theme-v1', 'aurora', (value) =>
    ['aurora', 'sunset', 'ocean', 'lime', 'neon', 'candy', 'executive', 'arcade'].includes(value) ? value : 'aurora',
  )
  const [soundEnabled, setSoundEnabled] = usePersistentState('clientflow-sound-v1', true, (value) => value !== false)
  const actionLogRef = useRef({})
  const currentEmployee = employees[0]

  useEffect(() => {
    if (respectState.date !== new Date().toISOString().slice(0, 10)) {
      setRespectState({ date: new Date().toISOString().slice(0, 10), remaining: 3 })
    }
  }, [respectState.date, setRespectState])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    let timeout
    const armPrivacyCurtain = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        setPrivacyMode(true)
        setToast({ message: 'Dados ocultados automaticamente após inatividade.' })
      }, 3 * 60 * 1000)
    }
    const events = ['pointerdown', 'keydown', 'touchstart']
    events.forEach((eventName) => window.addEventListener(eventName, armPrivacyCurtain, { passive: true }))
    armPrivacyCurtain()
    return () => {
      window.clearTimeout(timeout)
      events.forEach((eventName) => window.removeEventListener(eventName, armPrivacyCurtain))
    }
  }, [])

  function allowAction(key, limit = 5, windowMs = 10_000) {
    const now = Date.now()
    const recent = (actionLogRef.current[key] || []).filter((time) => now - time < windowMs)
    if (recent.length >= limit) {
      setToast({ message: 'Muitas ações em sequência. Aguarde alguns segundos.', tone: 'warning' })
      return false
    }
    actionLogRef.current[key] = [...recent, now]
    return true
  }

  const stats = useMemo(() => calculateLeadStats(leads), [leads])

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        [lead.nome, lead.empresa, lead.email].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [leads, query, statusFilter])

  function openNewLead() {
    setEditingLead(null)
    setIsFormOpen(true)
  }

  function openEditLead(lead) {
    setEditingLead(lead)
    setIsFormOpen(true)
  }

  function saveLead(leadData) {
    const safeLeadData = sanitizeLead({
      ...leadData,
      id: editingLead?.id || globalThis.crypto.randomUUID(),
      criadoEm: editingLead?.criadoEm || new Date().toISOString(),
    })
    const duplicate = leads.some((lead) =>
      lead.id !== editingLead?.id && lead.email.toLowerCase() === safeLeadData.email.toLowerCase(),
    )
    if (safeLeadData.email && duplicate) {
      setToast({ message: 'Já existe um lead com este email.', tone: 'warning' })
      return
    }
    if (editingLead) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === editingLead.id
            ? safeLeadData
            : lead,
        ),
      )
    } else {
      setLeads((current) => [safeLeadData, ...current])
    }
    setToast({ message: editingLead ? 'Lead atualizado com segurança.' : 'Novo lead criado.' })
    setIsFormOpen(false)
    setEditingLead(null)
  }

  function changeLeadStatus(id, status) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)))
    setToast({ message: `Lead movido para ${status}.` })
  }

  function confirmDelete() {
    setDeletedLead(deleteTarget)
    setLeads((current) => current.filter((lead) => lead.id !== deleteTarget.id))
    setToast({ message: 'Lead excluído.', tone: 'warning', undo: true })
    setDeleteTarget(null)
  }

  function undoDelete() {
    if (!deletedLead) return
    setLeads((current) => [deletedLead, ...current])
    setDeletedLead(null)
    setToast({ message: 'Exclusão desfeita.' })
  }

  function resetDemo() {
    if (window.confirm(`Restaurar a carteira inicial com ${seedLeads.length} registros? Seus dados atuais serão substituídos.`)) {
      setLeads(seedLeads.map((lead) => ({ ...lead })))
      setQuery('')
      setStatusFilter('Todos')
      setToast({ message: 'Carteira inicial restaurada.' })
    }
  }

  function updateCurrentEmployee(updatedEmployee) {
    setEmployees((current) => current.map((employee) => employee.id === updatedEmployee.id ? updatedEmployee : employee))
    setProfileEmployee(updatedEmployee)
  }

  function openMessage(employee) {
    setTeamContactId(employee.id)
    setProfileEmployee(null)
    setActiveView('messenger')
  }

  function sendMessage(threadId, text) {
    if (!allowAction('message')) return
    const safeText = cleanText(text, 500)
    if (!safeText) return
    const newMessage = {
      id: globalThis.crypto.randomUUID(),
      senderId: currentEmployee.id,
      text: safeText,
      createdAt: new Date().toISOString(),
    }
    setMessages((current) => ({
      ...current,
      [threadId]: [...(current[threadId] || []), newMessage].slice(-100),
    }))
  }

  function addPost(text) {
    if (!allowAction('post', 3, 30_000)) return
    setPosts((current) => [{
      id: globalThis.crypto.randomUUID(),
      employeeId: currentEmployee.id,
      text: cleanText(text, 500),
      createdAt: new Date().toISOString(),
      likes: 0,
    }, ...current].slice(0, 200))
    setToast({ message: 'Atualização publicada no mural local.' })
  }

  function likePost(id) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, likes: post.likes + 1 } : post))
  }

  function addSocialReaction(employeeId, type) {
    setSocialStats((current) => ({
      ...current,
      [employeeId]: {
        likes: current[employeeId]?.likes || 0,
        respects: current[employeeId]?.respects || 0,
        [type]: (current[employeeId]?.[type] || 0) + 1,
      },
    }))
    setToast({ message: type === 'likes' ? 'Joinha enviado.' : 'Respeito concedido.' })
  }

  function giveRespect(employeeId) {
    if (!respectState.remaining) return
    addSocialReaction(employeeId, 'respects')
    setRespectState((current) => ({ ...current, remaining: current.remaining - 1 }))
  }

  function callAttention(employee) {
    playSound('attention', soundEnabled)
    document.documentElement.classList.remove('attention-shake')
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add('attention-shake')
      window.setTimeout(() => document.documentElement.classList.remove('attention-shake'), 650)
    })
    setToast({ message: `${employee.nome.split(' ')[0]} recebeu um toque de atenção.` })
  }

  function createTask(task) {
    setTasks((current) => [{ ...task, id: globalThis.crypto.randomUUID() }, ...current])
    setToast({ message: 'Tarefa criada no Flowboard.' })
  }

  function moveTask(id, status) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task))
    setToast({ message: `Tarefa movida para ${status}.` })
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    setToast({ message: 'Tarefa removida.', tone: 'warning' })
  }

  async function exportBackup(password) {
    try {
      const content = await encryptBackup({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        leads,
        employees,
        messages,
        posts,
        socialStats,
        tasks,
      }, password)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `clientflow-${new Date().toISOString().slice(0, 10)}.cfbackup`
      anchor.click()
      URL.revokeObjectURL(url)
      setToast({ message: 'Backup criptografado gerado.' })
    } catch (error) {
      setToast({ message: error.message || 'Não foi possível gerar o backup.', tone: 'warning' })
    }
  }

  async function importBackup(file, password) {
    try {
      if (!file.name.toLowerCase().endsWith('.cfbackup')) throw new Error('Extensão de arquivo inválida.')
      if (file.size > 1_000_000) throw new Error('O arquivo excede o limite de 1 MB.')
      const data = await decryptBackup(await file.text(), password)
      if (data?.schemaVersion !== 1) throw new Error('Versão de backup incompatível.')
      setLeads(sanitizeLeadList(data.leads, seedLeads))
      setEmployees(sanitizeEmployees(data.employees, seedEmployees))
      setMessages(sanitizeMessages(data.messages, employeeIds, seedMessages))
      setPosts(sanitizePosts(data.posts, employeeIds, seedPosts))
      if (data.socialStats && typeof data.socialStats === 'object') setSocialStats(data.socialStats)
      setTasks(sanitizeTasks(data.tasks, seedTasks))
      setToast({ message: 'Backup validado e restaurado.' })
    } catch {
      setToast({ message: 'Backup inválido ou senha incorreta.', tone: 'warning' })
    }
  }

  function wipeLocalData() {
    if (!window.confirm('Apagar permanentemente todos os dados locais do ClientFlow neste navegador?')) return
    Object.keys(localStorage).filter((key) => key.startsWith('clientflow-')).forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }

  const viewCopy =
    ({
      dashboard: { title: 'Visão geral', subtitle: 'Acompanhe o desempenho e as oportunidades do seu time.' },
      pipeline: { title: 'Pipeline comercial', subtitle: 'Visualize cada oportunidade e avance seus leads pelo funil.' },
      leads: { title: 'Comercial', subtitle: 'Leads, contas, contatos e oportunidades conectados em um fluxo B2B.' },
      clients: { title: 'Clientes', subtitle: 'Acompanhe contas conquistadas e o contexto do relacionamento.' },
      activities: { title: 'Atividades', subtitle: 'Histórico comercial, pendências e próximos passos.' },
      tasks: { title: 'Flowboard', subtitle: 'Organize o trabalho comercial em um quadro visual.' },
      analytics: { title: 'Relatórios', subtitle: 'Analise leads, clientes, receita e perdas com mais contexto.' },
      security: { title: 'Dados & segurança', subtitle: 'Proteja, exporte e restaure os dados locais do workspace.' },
      team: { title: 'Fluxora · Equipe online', subtitle: 'Messenger e mural local para o espaço virtual da empresa.' },
      messenger: { title: 'Flow Messenger', subtitle: 'Bate-papo interno por pessoa, grupo e setor.' },
      city: { title: 'Fluxora · ClientFlow City', subtitle: 'Explore setores, perfis e a presença virtual da equipe.' },
    }[activeView])

  return (
    <div className={`app-shell theme-${theme} ${privacyMode ? 'privacy-mode' : ''}`}>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentEmployee={currentEmployee}
        onProfile={setProfileEmployee}
      />

      <main className="main-content">
        <Header
          {...viewCopy}
          onNewLead={openNewLead}
          onOpenMenu={() => setIsSidebarOpen(true)}
          showNewLead={['dashboard', 'pipeline', 'leads', 'clients'].includes(activeView)}
        />

        <div className="content-area">
          {activeView === 'dashboard' && (
            <>
              <section className="stats-grid" aria-label="Métricas do CRM">
                <StatCard
                  label="Total de leads"
                  value={stats.total}
                  detail="oportunidades cadastradas"
                  tone="blue"
                  icon={<MetricIcon type="leads" />}
                />
                <StatCard
                  label="Em negociação"
                  value={formatCurrency(stats.valorNegociacao)}
                  detail="pipeline em aberto"
                  tone="violet"
                  icon={<MetricIcon type="value" />}
                />
                <StatCard
                  label="Leads ganhos"
                  value={stats.ganhos}
                  detail="negócios fechados"
                  tone="green"
                  icon={<MetricIcon type="won" />}
                />
                <StatCard
                  label="Taxa de conversão"
                  value={`${stats.conversao}%`}
                  detail="ganhos entre concluídos"
                  tone="orange"
                  icon={<MetricIcon type="rate" />}
                />
              </section>

              <BusinessCommandCenter leads={leads} tasks={tasks} />

              <PerformanceDashboard leads={leads} employees={employees} tasks={tasks} />

              <section className="leads-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Base comercial</span>
                    <h2>Leads recentes</h2>
                  </div>
                  <button className="button button--text" onClick={resetDemo}>
                    Restaurar carteira inicial
                  </button>
                </div>
                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  status={statusFilter}
                  onStatusChange={setStatusFilter}
                />
                <div className="leads-grid">
                  {filteredLeads.length ? (
                    filteredLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        owner={findEmployeeByName(employees, lead.responsavel)}
                        onEdit={openEditLead}
                        onDelete={setDeleteTarget}
                        onStatusChange={changeLeadStatus}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <strong>Nenhum lead encontrado</strong>
                      <span>Ajuste a busca ou o filtro para ver outros resultados.</span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeView === 'pipeline' && (
            <section className="pipeline-section">
              <div className="pipeline-toolbar">
                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  status={statusFilter}
                  onStatusChange={setStatusFilter}
                />
                <button className="button button--text" onClick={resetDemo}>
                  Restaurar carteira inicial
                </button>
              </div>
              <PipelineBoard
                leads={filteredLeads}
                employees={employees}
                onEdit={openEditLead}
                onDelete={setDeleteTarget}
                onStatusChange={changeLeadStatus}
              />
            </section>
          )}

          {activeView === 'leads' && (
            <CommercialWorkspace
              leads={leads}
              tasks={tasks}
              activities={seedActivities}
              employees={employees}
              onEditLead={openEditLead}
              onCreateLead={openNewLead}
            />
          )}

          {activeView === 'team' && (
            <TeamHub
              key={teamContactId || 'team'}
              employees={employees}
              currentEmployee={currentEmployee}
              posts={posts}
              onAddPost={addPost}
              onLikePost={likePost}
              onOpenProfile={setProfileEmployee}
              tasks={tasks}
              socialStats={socialStats}
            />
          )}

          {activeView === 'messenger' && (
            <MessengerPage
              employees={employees}
              currentEmployee={currentEmployee}
              messages={messages}
              initialContactId={teamContactId}
              onSendMessage={sendMessage}
              onOpenProfile={setProfileEmployee}
            />
          )}

          {activeView === 'city' && (
            <OfficeCity
              employees={employees}
              onSelectEmployee={setProfileEmployee}
              onCityEvent={(message) => setToast({ message })}
              onSound={(name) => playSound(name, soundEnabled)}
            />
          )}

          {activeView === 'security' && (
            <SecurityCenter
              onExport={exportBackup}
              onImport={importBackup}
              privacyMode={privacyMode}
              onTogglePrivacy={() => setPrivacyMode((current) => !current)}
              onWipe={wipeLocalData}
            />
          )}

          {activeView === 'clients' && <ClientsPage leads={leads} employees={employees} tasks={tasks} activities={seedActivities} onEdit={openEditLead} />}

          {activeView === 'activities' && <ActivitiesPage activities={seedActivities} tasks={tasks} leads={leads} />}

          {activeView === 'tasks' && (
            <TaskBoard tasks={tasks} employees={employees} leads={leads} onCreate={createTask} onMove={moveTask} onDelete={deleteTask} />
          )}

          {activeView === 'analytics' && <AnalyticsHub leads={leads} employees={employees} />}
        </div>
      </main>

      {isFormOpen && (
        <LeadForm
          lead={editingLead}
          employees={employees}
          onSave={saveLead}
          onClose={() => {
            setIsFormOpen(false)
            setEditingLead(null)
          }}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="confirm-modal__icon">!</div>
            <h2 id="confirm-title">Excluir este lead?</h2>
            <p>
              <strong>{deleteTarget.nome}</strong>, da empresa {deleteTarget.empresa}, será removido
              permanentemente.
            </p>
            <div className="modal-footer">
              <button className="button button--ghost" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="button button--danger" onClick={confirmDelete}>
                Excluir lead
              </button>
            </div>
          </section>
        </div>
      )}

      {profileEmployee && (
        <EmployeeProfile
          employee={employees.find((employee) => employee.id === profileEmployee.id) || profileEmployee}
          editable={profileEmployee.id === currentEmployee.id}
          onChange={updateCurrentEmployee}
          onClose={() => setProfileEmployee(null)}
          onMessage={openMessage}
          onLike={(id) => addSocialReaction(id, 'likes')}
          onRespect={giveRespect}
          socialStats={socialStats[profileEmployee.id]}
          respectsLeft={respectState.remaining}
          onAttention={callAttention}
        />
      )}

      <FloatingChat employees={employees} onOpenMessenger={() => setActiveView('messenger')} />
      <ThemeStudio theme={theme} onChange={(nextTheme) => { playSound('click', soundEnabled); setTheme(nextTheme) }} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((current) => !current)} />
      <button
        className={`privacy-toggle ${privacyMode ? 'is-active' : ''}`}
        onClick={() => setPrivacyMode((current) => !current)}
        title="Ocultar ou exibir dados sensíveis"
      >
        {privacyMode ? '◉ Dados ocultos' : '◌ Modo apresentação'}
      </button>
      <Toast toast={toast} onUndo={undoDelete} onClose={() => setToast(null)} />
    </div>
  )
}
