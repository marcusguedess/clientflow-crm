export const TASK_STATUSES = ['Planejado', 'Em andamento', 'Em revisão', 'Concluído']

export const seedTasks = [
  { id: 'task-1', title: 'Follow-up ForteLog', description: 'Confirmar retorno da proposta regional.', status: 'Planejado', owner: 'Bruno Rocha', priority: 'Alta', dueDate: '2026-06-26', sticker: '🔥', relatedLeadId: 'lead-004' },
  { id: 'task-2', title: 'Preparar reunião Vitta', description: 'Separar diagnóstico e exemplos de onboarding.', status: 'Em andamento', owner: 'Ana Lima', priority: 'Alta', dueDate: '2026-06-25', sticker: '📌', relatedLeadId: 'lead-003' },
  { id: 'task-3', title: 'Revisar apresentação', description: 'Validar narrativa comercial criada pelo marketing.', status: 'Em revisão', owner: 'Ana Lima', priority: 'Média', dueDate: '2026-06-27', sticker: '✨', relatedLeadId: 'lead-003' },
  { id: 'task-4', title: 'Passagem Ponto Solar', description: 'Enviar contexto completo para Customer Success.', status: 'Concluído', owner: 'Lia Martins', priority: 'Média', dueDate: '2026-06-23', sticker: '✅', relatedLeadId: 'lead-006' },
  { id: 'task-5', title: 'Retomar Mobi Educação', description: 'Criar lembrete para o próximo trimestre.', status: 'Planejado', owner: 'Ana Lima', priority: 'Baixa', dueDate: '2026-07-10', sticker: '🌱', relatedLeadId: 'lead-007' },
  { id: 'task-6', title: 'Revisar proposta Lumina', description: 'Validar escopo nacional e condições de implantação.', status: 'Em revisão', owner: 'Ana Lima', priority: 'Alta', dueDate: '2026-06-27', sticker: '💎', relatedLeadId: 'lead-023' },
  { id: 'task-7', title: 'Mapear decisores Ponte', description: 'Confirmar sponsor, financeiro e operação regional.', status: 'Em andamento', owner: 'Marcus Guedes', priority: 'Alta', dueDate: '2026-06-26', sticker: '🎯', relatedLeadId: 'lead-031' },
  { id: 'task-8', title: 'Preparar demo Vértice', description: 'Montar narrativa para projetos e gestão executiva.', status: 'Planejado', owner: 'Bruno Rocha', priority: 'Média', dueDate: '2026-06-28', sticker: '🧭', relatedLeadId: 'lead-024' },
  { id: 'task-9', title: 'Qualificar Seta Mobilidade', description: 'Levantar unidades, usuários e integrações prioritárias.', status: 'Em andamento', owner: 'Yara Freire', priority: 'Alta', dueDate: '2026-06-27', sticker: '🚦', relatedLeadId: 'lead-025' },
  { id: 'task-10', title: 'Onboarding NorteCloud', description: 'Organizar kickoff, responsáveis e primeira trilha de adoção.', status: 'Planejado', owner: 'Lia Martins', priority: 'Alta', dueDate: '2026-06-30', sticker: '🚀', relatedLeadId: 'lead-027' },
  { id: 'task-11', title: 'Reativar Instituto Horizonte', description: 'Enviar agenda de diagnóstico para as cinco unidades.', status: 'Planejado', owner: 'Lia Martins', priority: 'Média', dueDate: '2026-06-29', sticker: '📅', relatedLeadId: 'lead-033' },
  { id: 'task-12', title: 'Diagnóstico RotaPay', description: 'Preparar roteiro sobre segurança, IA e equipes híbridas.', status: 'Planejado', owner: 'Leonardo Magdanello', priority: 'Média', dueDate: '2026-07-01', sticker: '🔐', relatedLeadId: 'lead-034' },
]

export const seedActivities = [
  { id: 'activity-1', type: 'proposal', title: 'Proposta enviada', detail: 'Bruno enviou a proposta para ForteLog Transportes.', at: '2026-06-24T17:20:00.000Z' },
  { id: 'activity-2', type: 'meeting', title: 'Reunião agendada', detail: 'Camila Duarte confirmou o diagnóstico para quinta-feira.', at: '2026-06-24T14:35:00.000Z' },
  { id: 'activity-3', type: 'won', title: 'Negócio fechado', detail: 'Ponto Solar avançou para cliente.', at: '2026-06-23T18:10:00.000Z' },
  { id: 'activity-4', type: 'contact', title: 'Contato realizado', detail: 'Rafael Menezes respondeu ao primeiro contato.', at: '2026-06-23T10:45:00.000Z' },
  { id: 'activity-5', type: 'proposal', title: 'Proposta enterprise revisada', detail: 'Lumina Saúde recebeu a versão com implantação nacional.', at: '2026-06-25T13:40:00.000Z' },
  { id: 'activity-6', type: 'meeting', title: 'Comitê executivo confirmado', detail: 'Ponte Engenharia confirmou reunião com quatro decisores.', at: '2026-06-25T11:15:00.000Z' },
  { id: 'activity-7', type: 'won', title: 'Novo cliente em onboarding', detail: 'NorteCloud iniciou a passagem para Customer Success.', at: '2026-06-25T09:05:00.000Z' },
  { id: 'activity-8', type: 'contact', title: 'Lead enterprise qualificado', detail: 'Seta Mobilidade compartilhou estrutura e prioridades.', at: '2026-06-24T18:30:00.000Z' },
]
