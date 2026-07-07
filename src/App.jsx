import { useEffect, useMemo, useRef, useState } from 'react'
import EmployeeProfile from './components/EmployeeProfile'
import ActivitiesPage from './components/ActivitiesPage'
import AnalyticsHub from './components/AnalyticsHub'
import ClientsPage from './components/ClientsPage'
import CommercialWorkspace from './components/CommercialWorkspace'
import CommandPalette from './components/CommandPalette'
import DashboardHome from './components/DashboardHome'
import FloatingChat from './components/FloatingChat'
import Header from './components/Header'
import MailHub from './components/MailHub'
import MessengerPage from './components/MessengerPage'
import LeadForm from './components/LeadForm'
import OfficeCity from './components/OfficeCity'
import PipelineBoard from './components/PipelineBoard'
import PerformanceDashboard from './components/PerformanceDashboard'
import SearchBar from './components/SearchBar'
import SecurityCenter from './components/SecurityCenter'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import TeamHub from './components/TeamHub'
import ThemeStudio from './components/ThemeStudio'
import Toast from './components/Toast'
import { viewCopy } from './app/navigation'
import { seedLeads } from './data/seedData'
import { seedEmployees, seedMessages, seedPosts } from './data/teamData'
import { seedActivities, seedTasks } from './data/workData'
import { buildCitySignals } from './domain/clientflowBridge'
import { createDomainEvent, DOMAIN_EVENT_TYPES, domainEventsToTimelineEvents } from './domain/events'
import { analyzeDealRisk, DEFAULT_GOAL_CONFIG, normalizeGoalConfig } from './domain/metrics'
import { normalizeTask } from './domain/tasks'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePersistentState } from './hooks/usePersistentState'
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
  const [domainEvents, setDomainEvents] = usePersistentState('clientflow-domain-events-v1', [], (value) =>
    Array.isArray(value)
      ? value.slice(0, 250).filter((event) => event?.id && event?.type && event?.at)
      : [],
  )
  const [goalConfig, setGoalConfig] = usePersistentState('clientflow-goal-config-v1', DEFAULT_GOAL_CONFIG, normalizeGoalConfig)
  const [timelineNotes, setTimelineNotes] = usePersistentState('clientflow-timeline-notes-v1', [], (value) =>
    Array.isArray(value)
      ? value.slice(0, 500).map((note) => ({
          id: cleanText(note?.id, 80) || globalThis.crypto.randomUUID(),
          type: 'note',
          title: cleanText(note?.title, 160),
          detail: cleanText(note?.detail, 500),
          at: Number.isNaN(Date.parse(note?.at)) ? new Date().toISOString() : note.at,
          dealId: cleanText(note?.dealId, 80),
        })).filter((note) => note.title && note.detail)
      : [],
  )
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isUtilityDockOpen, setIsUtilityDockOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletedLead, setDeletedLead] = useState(null)
  const [toast, setToast] = useState(null)
  const [profileEmployee, setProfileEmployee] = useState(null)
  const [teamContactId, setTeamContactId] = useState(null)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [theme, setTheme] = usePersistentState('clientflow-theme-v1', 'aurora', (value) =>
    ['aurora', 'sunset', 'ocean', 'lime', 'neon', 'candy', 'executive', 'arcade', 'terracotta', 'olive', 'copper', 'coffee'].includes(value) ? value : 'aurora',
  )
  const [visualMode, setVisualMode] = usePersistentState('clientflow-visual-mode-v1', 'balanced', (value) =>
    ['essential', 'balanced', 'immersive'].includes(value) ? value : 'balanced',
  )
  const [density, setDensity] = usePersistentState('clientflow-density-v1', 'comfortable', (value) =>
    ['comfortable', 'compact'].includes(value) ? value : 'comfortable',
  )
  const [soundEnabled, setSoundEnabled] = usePersistentState('clientflow-sound-v1', true, (value) => value !== false)
  const actionLogRef = useRef({})
  const currentEmployee = employees[0]
  const timelineActivities = useMemo(() =>
    [
      ...domainEventsToTimelineEvents(domainEvents),
      ...timelineNotes,
      ...seedActivities,
    ].sort((a, b) => new Date(b.at) - new Date(a.at)),
  [domainEvents, timelineNotes])
  const citySignals = useMemo(() => buildCitySignals(domainEvents), [domainEvents])

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
    window.scrollTo(0, 0)
  }, [activeView])

  useEffect(() => {
    function openCommandPalette(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', openCommandPalette)
    return () => window.removeEventListener('keydown', openCommandPalette)
  }, [])

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

  function emitDomainEvent(type, payload = {}) {
    const event = createDomainEvent(type, payload, currentEmployee?.nome || 'system')
    setDomainEvents((current) => [event, ...current].slice(0, 250))
    return event
  }

  function handleCityEvent(message, payload = {}) {
    setToast({ message })
    emitDomainEvent(DOMAIN_EVENT_TYPES.CITY_INTERACTION, {
      title: payload.title || 'Interação na cidade',
      detail: payload.detail || message,
      district: payload.district,
    })
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
      emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_UPDATED, {
        dealId: safeLeadData.id,
        company: safeLeadData.empresa,
        contactName: safeLeadData.nome,
        owner: safeLeadData.responsavel,
        detail: `${safeLeadData.empresa} atualizada em ${safeLeadData.status}.`,
      })
      if (editingLead.status !== safeLeadData.status) {
        emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED, {
          dealId: safeLeadData.id,
          company: safeLeadData.empresa,
          contactName: safeLeadData.nome,
          owner: safeLeadData.responsavel,
          from: editingLead.status,
          to: safeLeadData.status,
          risk: analyzeDealRisk(safeLeadData, tasks),
          detail: `${editingLead.status} → ${safeLeadData.status}`,
        })
      }
    } else {
      setLeads((current) => [safeLeadData, ...current])
      emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_CREATED, {
        dealId: safeLeadData.id,
        company: safeLeadData.empresa,
        contactName: safeLeadData.nome,
        owner: safeLeadData.responsavel,
        detail: `${safeLeadData.empresa} entrou no pipeline.`,
      })
    }
    const statusChanged = !editingLead || editingLead.status !== safeLeadData.status
    if (statusChanged && safeLeadData.status === 'Fechado') {
      emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_WON, {
        dealId: safeLeadData.id,
        company: safeLeadData.empresa,
        contactName: safeLeadData.nome,
        owner: safeLeadData.responsavel,
        value: Number(safeLeadData.valorEstimado || 0),
      })
    }
    if (statusChanged && safeLeadData.status === 'Perdido') {
      emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_LOST, {
        dealId: safeLeadData.id,
        company: safeLeadData.empresa,
        contactName: safeLeadData.nome,
        owner: safeLeadData.responsavel,
        reason: safeLeadData.motivoPerda || 'Sem motivo registrado',
      })
    }
    setToast({ message: editingLead ? 'Lead atualizado com segurança.' : 'Novo lead criado.' })
    setIsFormOpen(false)
    setEditingLead(null)
  }

  function changeLeadStatus(id, status) {
    const currentLead = leads.find((lead) => lead.id === id)
    const nextLead = currentLead ? { ...currentLead, status } : null
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)))
    if (nextLead && currentLead.status !== status) {
      emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_STAGE_CHANGED, {
        dealId: id,
        company: nextLead.empresa,
        contactName: nextLead.nome,
        owner: nextLead.responsavel,
        from: currentLead.status,
        to: status,
        risk: analyzeDealRisk(nextLead, tasks),
        detail: `${currentLead.status} → ${status}`,
      })
      if (status === 'Fechado') {
        emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_WON, {
          dealId: id,
          company: nextLead.empresa,
          contactName: nextLead.nome,
          owner: nextLead.responsavel,
          value: Number(nextLead.valorEstimado || 0),
        })
      }
      if (status === 'Perdido') {
        emitDomainEvent(DOMAIN_EVENT_TYPES.DEAL_LOST, {
          dealId: id,
          company: nextLead.empresa,
          contactName: nextLead.nome,
          owner: nextLead.responsavel,
          reason: nextLead.motivoPerda || 'Sem motivo registrado',
        })
      }
    }
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
    emitDomainEvent(DOMAIN_EVENT_TYPES.MESSAGE_SENT, {
      threadId,
      detail: `Mensagem enviada por ${currentEmployee.nome}.`,
    })
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

  function createTask(task, defaults = {}) {
    const nextTask = normalizeTask(task, {
      owner: currentEmployee?.nome || 'Sem responsável',
      ...defaults,
    })
    setTasks((current) => [nextTask, ...current])
    emitDomainEvent(DOMAIN_EVENT_TYPES.TASK_CREATED, {
      taskId: nextTask.id,
      dealId: nextTask.relatedLeadId,
      title: nextTask.title,
      owner: nextTask.owner,
      detail: `${nextTask.title} · ${nextTask.owner}`,
    })
    setToast({ message: 'Tarefa criada no Flowboard.' })
    return nextTask
  }

  function createCommunicationFollowUp(lead, source) {
    const dueDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    const task = createTask({
      title: `Follow-up ${lead.empresa}`,
      description: `Retomar contexto iniciado no ${source} com ${lead.nome}.`,
      status: 'Planejado',
      owner: lead.responsavel || currentEmployee.nome,
      priority: Number(lead.valorEstimado || 0) >= 50000 ? 'Alta' : 'Média',
      dueDate,
      sticker: source === 'chat' ? '💬' : '✉️',
      relatedLeadId: lead.id,
    })
    emitDomainEvent(DOMAIN_EVENT_TYPES.FOLLOW_UP_SCHEDULED, {
      taskId: task.id,
      dealId: lead.id,
      company: lead.empresa,
      contactName: lead.nome,
      owner: lead.responsavel || currentEmployee.nome,
      title: task.title,
      detail: `Follow-up criado a partir do ${source}.`,
    })
  }

  function moveTask(id, status) {
    const task = tasks.find((item) => item.id === id)
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task))
    if (task) {
      emitDomainEvent(status === 'Concluído' ? DOMAIN_EVENT_TYPES.TASK_COMPLETED : DOMAIN_EVENT_TYPES.TASK_UPDATED, {
        taskId: id,
        dealId: task.relatedLeadId,
        title: task.title,
        owner: task.owner,
        from: task.status,
        to: status,
        detail: `${task.title} → ${status}`,
      })
    }
    setToast({ message: `Tarefa movida para ${status}.` })
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id))
    setToast({ message: 'Tarefa removida.', tone: 'warning' })
  }

  function addTimelineNote({ entity, entityType, text }) {
    const dealId =
      entityType === 'deal'
        ? entity.id
        : entity?.dealId || entity?.deals?.[0]?.id || ''
    const company = entity?.company || entity?.title || entity?.name || 'Relacionamento'
    setTimelineNotes((current) => [{
      id: globalThis.crypto.randomUUID(),
      type: 'note',
      title: `Nota em ${company}`,
      detail: `${currentEmployee.nome}: ${cleanText(text, 500)}`,
      at: new Date().toISOString(),
      dealId,
    }, ...current].slice(0, 500))
    emitDomainEvent(DOMAIN_EVENT_TYPES.NOTE_CREATED, {
      dealId,
      company,
      owner: currentEmployee.nome,
      detail: cleanText(text, 500),
    })
    setToast({ message: 'Nota adicionada à timeline.' })
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
        timelineNotes,
        domainEvents,
        goalConfig,
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
      if (Array.isArray(data.timelineNotes)) setTimelineNotes(data.timelineNotes)
      if (Array.isArray(data.domainEvents)) setDomainEvents(data.domainEvents)
      if (data.goalConfig && typeof data.goalConfig === 'object') setGoalConfig(normalizeGoalConfig(data.goalConfig))
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

  return (
    <div className={`app-shell theme-${theme} visual-${visualMode} density-${density} ${privacyMode ? 'privacy-mode' : ''}`}>
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
          {...viewCopy[activeView]}
          onNewLead={openNewLead}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          showNewLead={['dashboard', 'pipeline', 'leads', 'clients'].includes(activeView)}
        />

        <div className="content-area">
          {activeView === 'dashboard' && (
            <DashboardHome
              stats={stats}
              leads={leads}
              tasks={tasks}
              employees={employees}
              currentEmployee={currentEmployee}
              goalConfig={goalConfig}
              onNavigate={setActiveView}
              onEditLead={openEditLead}
              onCompleteTask={(taskId) => moveTask(taskId, 'Concluído')}
            />
          )}

          {activeView === 'performance' && <PerformanceDashboard leads={leads} employees={employees} tasks={tasks} goalConfig={goalConfig} onGoalConfigChange={(nextGoalConfig) => setGoalConfig(normalizeGoalConfig(nextGoalConfig))} onNavigate={setActiveView} />}

          {activeView === 'pipeline' && (
            <section className="pipeline-section">
              <div className="pipeline-toolbar">
                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  status={statusFilter}
                  onStatusChange={setStatusFilter}
                />
                <button className="button button--text" type="button" onClick={resetDemo}>
                  Restaurar carteira inicial
                </button>
              </div>
              <PipelineBoard
                leads={filteredLeads}
                employees={employees}
                tasks={tasks}
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
              activities={timelineActivities}
              employees={employees}
              onEditLead={openEditLead}
              onCreateLead={openNewLead}
              onAddTimelineNote={addTimelineNote}
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
              leads={leads}
              initialContactId={teamContactId}
              onSendMessage={sendMessage}
              onOpenProfile={setProfileEmployee}
              onOpenDeal={openEditLead}
              onCreateFollowUp={createCommunicationFollowUp}
            />
          )}

          {activeView === 'mail' && (
            <MailHub
              employees={employees}
              currentEmployee={currentEmployee}
              leads={leads}
              onOpenProfile={setProfileEmployee}
              onOpenDeal={openEditLead}
              onCreateFollowUp={createCommunicationFollowUp}
            />
          )}

          {activeView === 'city' && (
            <OfficeCity
              employees={employees}
              onSelectEmployee={setProfileEmployee}
              onCityEvent={handleCityEvent}
              currentEmployee={currentEmployee}
              citySignals={citySignals}
              onOpenPipeline={() => setActiveView('pipeline')}
              onOpenMessenger={() => setActiveView('messenger')}
              onCreateTask={(task) => createTask(task, { owner: currentEmployee?.nome || 'Sem responsável', priority: 'Média', sticker: '📌', relatedLeadId: '' })}
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

          {activeView === 'clients' && <ClientsPage leads={leads} employees={employees} tasks={tasks} activities={timelineActivities} onEdit={openEditLead} />}

          {activeView === 'activities' && <ActivitiesPage activities={timelineActivities} tasks={tasks} leads={leads} />}

          {activeView === 'tasks' && (
            <TaskBoard tasks={tasks} employees={employees} leads={leads} onCreate={createTask} onMove={moveTask} onDelete={deleteTask} />
          )}

          {activeView === 'analytics' && <AnalyticsHub leads={leads} employees={employees} tasks={tasks} />}
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
              <button className="button button--ghost" type="button" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="button button--danger" type="button" onClick={confirmDelete}>
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

      <CommandPalette
        open={isCommandPaletteOpen}
        leads={leads}
        employees={employees}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveView}
        onNewLead={openNewLead}
        onOpenLead={openEditLead}
        onOpenEmployee={setProfileEmployee}
      />

      <div className={`utility-dock ${isUtilityDockOpen ? 'is-open' : ''}`}>
        <div
          className="utility-dock__tools"
          aria-hidden={!isUtilityDockOpen}
          inert={!isUtilityDockOpen}
        >
          <button
            className={`privacy-toggle ${privacyMode ? 'is-active' : ''}`}
            type="button"
            onClick={() => setPrivacyMode((current) => !current)}
            title="Ocultar ou exibir dados sensíveis"
            tabIndex={isUtilityDockOpen ? 0 : -1}
          >
            {privacyMode ? '◉ Dados ocultos' : '◌ Modo apresentação'}
          </button>
          <ThemeStudio
            theme={theme}
            onChange={(nextTheme) => { playSound('click', soundEnabled); setTheme(nextTheme) }}
            visualMode={visualMode}
            onVisualModeChange={setVisualMode}
            density={density}
            onDensityChange={setDensity}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((current) => !current)}
          />
          <FloatingChat employees={employees} onOpenMessenger={() => setActiveView('messenger')} />
        </div>
        <button
          className="utility-dock__toggle"
          type="button"
          onClick={() => setIsUtilityDockOpen((current) => !current)}
          aria-expanded={isUtilityDockOpen}
          aria-label={isUtilityDockOpen ? 'Fechar ferramentas rápidas' : 'Abrir ferramentas rápidas'}
          title="Ferramentas rápidas"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6" />
          </svg>
        </button>
      </div>
      <Toast toast={toast} onUndo={undoDelete} onClose={() => setToast(null)} />
    </div>
  )
}
