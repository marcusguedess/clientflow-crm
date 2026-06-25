# ClientFlow CRM

ClientFlow CRM é uma aplicação comercial local-first para organizar leads, acompanhar oportunidades, visualizar desempenho e manter a equipe alinhada em uma experiência viva, colorida e produtiva.

**Slogan:** Relacionamentos que avançam.

## Funcionalidades

- Dashboard executivo com forecast, meta, conversão, fontes de aquisição e ranking da equipe
- Filtros de dashboard por responsável, etapa e origem
- Visão 3D do funil comercial com Three.js carregada sob demanda
- Pipeline Kanban com seis etapas comerciais
- Cadastro, edição e exclusão de leads
- Movimentação de leads entre etapas por seletor de status
- Busca por nome, empresa ou email
- Filtro por status
- Persistência automática com `localStorage`
- Restauração da carteira inicial
- Leads iniciais com responsáveis, valores, origens e contexto comercial
- Layout responsivo para desktop, tablet e celular
- Fluxora, espaço virtual local da equipe
- Flow Messenger com conversas por funcionário
- Mural social com publicações e reações
- Perfis e crachás pixel art personalizáveis
- Avatares dos funcionários em áreas comerciais, ranking, equipe e clientes
- Sistema local de três respeitos
- ClientFlow City com setores, praça, café e área de lazer
- Diretório de leads em tabela
- Feedback por notificações e opção de desfazer exclusão
- Backup criptografado por senha
- Páginas de clientes, atividades e tarefas
- Flowboard com stickers e movimentação de tarefas
- Escritório virtual com estações, café, sala de reunião e lounge
- Personagens com ações de andar, dançar, acenar e descansar

## Fluxora e comunicação local

O Fluxora é uma camada de colaboração local. Mensagens, perfis, reações e publicações são armazenados no navegador atual.

Uma operação multiusuário deve usar backend com autenticação, autorização, isolamento por empresa e regras aplicadas no servidor. Controles visuais no React são recursos de experiência, não substituem segurança server-side.

## Segurança

- Política de Segurança de Conteúdo com scripts restritos à própria origem
- Nenhum script, fonte ou serviço externo
- Validação dos leads lidos e importados
- Validação de funcionários, mensagens, publicações e tarefas persistidas
- Backup com AES-GCM 256 e PBKDF2-SHA256
- Senha mínima de 12 caracteres para backup
- Limite de tamanho, extensão `.cfbackup` e verificação de parâmetros criptográficos na importação
- Nenhum token, senha ou segredo armazenado pelo aplicativo
- Modo apresentação e ocultação automática por inatividade
- Limite preventivo para mensagens e publicações
- Limpeza de emergência dos dados locais

Consulte [security_best_practices_report.md](security_best_practices_report.md) para detalhes e limitações.

## Tecnologias

- React
- Vite
- JavaScript
- CSS puro
- Three.js
- localStorage
- Web Crypto API

## Como rodar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

O terminal exibirá o endereço local da aplicação, normalmente `http://localhost:5173/`.

Para gerar a versão de produção:

```bash
npm run build
```

Para testar localmente a versão gerada:

```bash
npm run preview
```

## Publicação

O projeto pode ser publicado em qualquer hospedagem capaz de servir uma aplicação Vite estática. Em produção, configure os cabeçalhos HTTP de segurança no provedor, CDN ou edge.

O arquivo `vercel.json` já inclui:

- build do Vite;
- cache prolongado para assets versionados;
- CSP e cabeçalhos de proteção;
- bloqueio de câmera, microfone, localização e pagamentos;
- bloqueio de iframe por `frame-ancestors` e `X-Frame-Options`.

Configuração recomendada:

```text
Build Command: npm run build
Output Directory: dist
```

## Estrutura de pastas

```text
src/
├── components/
├── data/
├── hooks/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

## Próximas melhorias

- Drag-and-drop no pipeline
- Histórico de atividades por lead
- Exportação comercial em CSV/XLSX
- Lembretes e tarefas vinculados a leads
- Dashboard com evolução real por período
- Backend multiempresa com autenticação, permissões e auditoria
