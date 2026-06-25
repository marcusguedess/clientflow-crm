export const navigationGroups = [
  {
    id: 'work',
    label: 'Trabalho',
    items: [
      { id: 'dashboard', label: 'Visão geral', icon: 'grid' },
      { id: 'pipeline', label: 'Pipeline', icon: 'pipeline' },
      { id: 'leads', label: 'Comercial', icon: 'list' },
      { id: 'clients', label: 'Clientes', icon: 'clients' },
      { id: 'activities', label: 'Atividades', icon: 'activity' },
      { id: 'tasks', label: 'Flowboard', icon: 'tasks' },
      { id: 'performance', label: 'Cockpit & 3D', icon: 'cockpit' },
      { id: 'analytics', label: 'Relatórios', icon: 'reports' },
    ],
  },
  {
    id: 'communication',
    label: 'Comunicação',
    items: [
      { id: 'messenger', label: 'Flow Chat', icon: 'chat' },
      { id: 'mail', label: 'Flow Mail', icon: 'mail' },
    ],
  },
  {
    id: 'world',
    label: 'Cultura & mundo',
    items: [
      { id: 'city', label: 'ClientFlow City', icon: 'city' },
      { id: 'team', label: 'People & equipe', icon: 'people' },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    items: [
      { id: 'security', label: 'Dados & segurança', icon: 'shield' },
    ],
  },
]

export const viewCopy = {
  dashboard: {
    title: 'Visão geral',
    subtitle: 'Seu dia, sua equipe e o movimento da empresa em uma única leitura.',
  },
  pipeline: {
    title: 'Pipeline comercial',
    subtitle: 'Visualize cada oportunidade e avance seus leads pelo funil.',
  },
  leads: {
    title: 'Comercial',
    subtitle: 'Leads, contas, contatos e oportunidades conectados em um fluxo B2B.',
  },
  clients: {
    title: 'Clientes',
    subtitle: 'Acompanhe contas conquistadas e o contexto do relacionamento.',
  },
  activities: {
    title: 'Atividades',
    subtitle: 'Histórico comercial, pendências e próximos passos.',
  },
  tasks: {
    title: 'Flowboard',
    subtitle: 'Organize o trabalho comercial em um quadro visual.',
  },
  performance: {
    title: 'Cockpit & 3D',
    subtitle: 'Explore desempenho, forecast e a leitura holográfica da operação.',
  },
  analytics: {
    title: 'Relatórios',
    subtitle: 'Analise leads, clientes, receita e perdas com mais contexto.',
  },
  security: {
    title: 'Dados & segurança',
    subtitle: 'Proteja, exporte e restaure os dados locais do workspace.',
  },
  team: {
    title: 'People & equipe',
    subtitle: 'Rituais, perfis e cultura conectados ao espaço virtual da empresa.',
  },
  messenger: {
    title: 'Flow Chat',
    subtitle: 'Conversas diretas, grupos e setores sem sair do fluxo de trabalho.',
  },
  mail: {
    title: 'Flow Mail',
    subtitle: 'Caixa corporativa, triagem e follow-ups em um só lugar.',
  },
  city: {
    title: 'ClientFlow City',
    subtitle: 'Circule, encontre pessoas e viva a presença virtual da sua empresa.',
  },
}
