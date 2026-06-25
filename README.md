# ClientFlow CRM

> **Em pleno desenvolvimento.** O projeto já pode ser explorado e demonstrado, mas novas áreas, interações e ajustes visuais continuam entrando.

Um CRM moderno, divertido e feito para organizar leads, acompanhar oportunidades e dar mais vida à rotina comercial.

O projeto foi desenvolvido como uma aplicação frontend publicável no GitHub Pages. Os dados são armazenados localmente no navegador, sem backend ou serviços externos.

**Slogan:** Relacionamentos que avançam.

## Funcionalidades

- Dashboard com total de leads, valor em negociação, negócios ganhos e taxa de conversão
- Pipeline Kanban com seis etapas comerciais
- Cadastro, edição e exclusão de leads
- Movimentação de leads entre etapas por seletor de status
- Busca por nome, empresa ou email
- Filtro por status
- Persistência automática com `localStorage`
- Restauração dos dados de demonstração
- Oito leads fictícios incluídos
- Layout responsivo para desktop, tablet e celular
- Fluxora, espaço virtual local da equipe
- Flow Messenger com conversas por funcionário
- Mural social com publicações e joinhas
- Perfis e crachás pixel art personalizáveis
- Sistema local de três respeitos
- ClientFlow City com setores, praça, café e área de lazer
- Diretório de leads em tabela
- Feedback por notificações e opção de desfazer exclusão
- Backup criptografado por senha
- Dashboard executivo e ranking dos dez profissionais
- Páginas de clientes, atividades e tarefas
- Flowboard com stickers e movimentação de tarefas
- Escritório virtual com estações, café, sala de reunião e lounge
- Personagens com ações de andar, dançar, acenar e descansar

## Fluxora e comunicação local

O Fluxora é uma experiência local de demonstração. Mensagens, perfis, reações e publicações são armazenados somente no navegador atual. Não existe comunicação real entre dispositivos ou funcionários nesta versão.

Uma versão multiusuário exige backend com autenticação e autorização aplicadas no servidor. Controles visuais no React não substituem segurança server-side.

## Segurança

- Política de Segurança de Conteúdo com scripts restritos à própria origem
- Nenhum script, fonte ou serviço externo
- Validação dos leads lidos e importados
- Backup com AES-GCM 256 e PBKDF2-SHA256
- Limite de tamanho e verificação de versão na importação
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
- localStorage

## Como rodar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

O terminal exibirá o endereço local da aplicação, normalmente `http://localhost:5173/clientflow-crm/`.

Para gerar a versão usada pela Vercel:

```bash
npm run build
```

Para gerar a versão com caminho compatível com GitHub Pages:

```bash
npm run build:github
```

Para testar localmente a versão gerada:

```bash
npm run preview
```

## Publicação na Vercel

O projeto inclui `vercel.json` com:

- build do Vite;
- cache prolongado para assets versionados;
- CSP e cabeçalhos de proteção;
- bloqueio de câmera, microfone, localização e pagamentos.

Conecte o repositório à Vercel e mantenha:

```text
Build Command: npm run build
Output Directory: dist
```

## Publicação no GitHub Pages

O modo `github-pages` está configurado com a base `/clientflow-crm/`.

1. Crie um repositório no GitHub chamado `clientflow-crm`.
2. Envie o projeto para a branch `main`.
3. Instale o pacote de publicação:

```bash
npm install --save-dev gh-pages
```

4. Adicione os scripts abaixo ao `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

5. Execute:

```bash
npm run deploy
```

6. Em **Settings > Pages** no GitHub, confirme a publicação pela branch `gh-pages`.

A aplicação ficará disponível em:

```text
https://SEU-USUARIO.github.io/clientflow-crm/
```

## Estrutura de pastas

```text
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Logo.jsx
│   ├── StatCard.jsx
│   ├── LeadCard.jsx
│   ├── LeadForm.jsx
│   ├── PipelineBoard.jsx
│   ├── SearchBar.jsx
│   └── StatusBadge.jsx
├── data/
│   └── seedData.js
│   └── teamData.js
├── hooks/
│   └── useLocalStorage.js
├── services/
│   └── crmStorage.js
├── utils/
│   ├── formatCurrency.js
│   ├── leadStats.js
│   ├── sanitizeData.js
│   └── secureBackup.js
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

## Próximas melhorias

- Drag-and-drop no pipeline
- Histórico de atividades por lead
- Exportação e importação de dados
- Lembretes e tarefas comerciais
- Dashboard com evolução por período
- Integração futura com um backend e banco de dados
