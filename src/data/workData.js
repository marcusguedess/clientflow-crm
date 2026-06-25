export const TASK_STATUSES = ['Planejado', 'Em andamento', 'Em revisão', 'Concluído']

export const seedTasks = [
  { id: 'task-1', title: 'Follow-up ForteLog', description: 'Confirmar retorno da proposta regional.', status: 'Planejado', owner: 'Bruno Rocha', priority: 'Alta', dueDate: '2026-06-26', sticker: '🔥' },
  { id: 'task-2', title: 'Preparar reunião Vitta', description: 'Separar diagnóstico e exemplos de onboarding.', status: 'Em andamento', owner: 'Ana Lima', priority: 'Alta', dueDate: '2026-06-25', sticker: '📌' },
  { id: 'task-3', title: 'Revisar apresentação', description: 'Validar narrativa comercial criada pelo marketing.', status: 'Em revisão', owner: 'Ana Lima', priority: 'Média', dueDate: '2026-06-27', sticker: '✨' },
  { id: 'task-4', title: 'Passagem Ponto Solar', description: 'Enviar contexto completo para Customer Success.', status: 'Concluído', owner: 'Lia Martins', priority: 'Média', dueDate: '2026-06-23', sticker: '✅' },
  { id: 'task-5', title: 'Retomar Mobi Educação', description: 'Criar lembrete para o próximo trimestre.', status: 'Planejado', owner: 'Ana Lima', priority: 'Baixa', dueDate: '2026-07-10', sticker: '🌱' },
]

export const seedActivities = [
  { id: 'activity-1', type: 'proposal', title: 'Proposta enviada', detail: 'Bruno enviou a proposta para ForteLog Transportes.', at: '2026-06-24T17:20:00.000Z' },
  { id: 'activity-2', type: 'meeting', title: 'Reunião agendada', detail: 'Camila Duarte confirmou o diagnóstico para quinta-feira.', at: '2026-06-24T14:35:00.000Z' },
  { id: 'activity-3', type: 'won', title: 'Negócio fechado', detail: 'Ponto Solar avançou para cliente.', at: '2026-06-23T18:10:00.000Z' },
  { id: 'activity-4', type: 'contact', title: 'Contato realizado', detail: 'Rafael Menezes respondeu ao primeiro contato.', at: '2026-06-23T10:45:00.000Z' },
]
