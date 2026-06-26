# ClientFlow CRM

ClientFlow CRM é uma aplicação local-first para organizar leads, acompanhar oportunidades comerciais e visualizar a rotina de um time de vendas em uma interface mais visual.

O projeto está em desenvolvimento ativo. A versão atual funciona como uma base demonstrativa e evolutiva: roda no navegador, salva dados localmente e ainda não possui backend, autenticação real ou operação multiusuário.

**Slogan:** Relacionamentos que avançam.

## Status

Em desenvolvimento ativo.

A aplicação já permite cadastrar leads, acompanhar pipeline, visualizar indicadores, simular colaboração local e gerar backup protegido por senha. Ainda não deve ser tratada como um CRM empresarial pronto para produção, porque recursos como contas por empresa, permissões, auditoria e sincronização entre usuários dependem de backend.

## Principais áreas

### Leads e pipeline

- Cadastro, edição e exclusão de leads.
- Pipeline com etapas comerciais.
- Busca por nome, empresa ou email.
- Filtros por status, responsável, etapa e origem.
- Diretório de leads em tabela.

### Dashboards

- Visão executiva com forecast, metas, conversão, fontes de aquisição e ranking da equipe.
- Indicadores derivados dos dados locais da aplicação.
- Visualização 3D do funil comercial com Three.js carregada sob demanda.

### Automações e rotina comercial

- Feedback por notificações.
- Opção de desfazer exclusão.
- Restauração da carteira inicial de demonstração.
- Tarefas e próximos passos no Flowboard.

### Workspace e colaboração local

- Fluxora como camada local de colaboração visual.
- Conversas, mural social, perfis e reações salvos no navegador atual.
- Escritório virtual e ClientFlow City como recursos de experiência e presença.

Esses recursos são locais e demonstrativos. Eles não substituem permissões, auditoria, autenticação ou comunicação em tempo real entre usuários.

### Segurança local e backup

- Persistência automática com `localStorage`.
- Validação dos dados lidos ou importados.
- Backup criptografado por senha com Web Crypto API.
- Limpeza de emergência dos dados locais.
- Política de Segurança de Conteúdo configurada para publicação estática.

Consulte [SECURITY.md](SECURITY.md) para detalhes e limitações.

### Experiência visual

- Layout responsivo para desktop, tablet e celular.
- Avatares, crachás e elementos visuais para dar identidade ao workspace.
- Temas, superfícies de controle e microinterações em CSS.

## Decisões de produto

- **Local-first nesta etapa:** os dados ficam no navegador para simplificar desenvolvimento, testes e demonstrações.
- **CRM antes de plataforma:** o foco atual é validar fluxo comercial, organização de leads e experiência de uso antes de adicionar infraestrutura.
- **Colaboração visual como protótipo:** Fluxora, Flowboard e ClientFlow City exploram presença e comunicação, mas ainda não representam colaboração multiusuário real.
- **Segurança com limites claros:** backups e validações reduzem riscos locais, mas segurança empresarial exige backend, autenticação, autorização e auditoria.

## Limitações atuais

- Os dados ficam no `localStorage` do navegador.
- Não há autenticação, contas por empresa ou permissões reais.
- Não há sincronização entre dispositivos ou usuários.
- Indicadores e dashboards usam os dados locais disponíveis, não uma base histórica auditada.
- A proteção de dados sensíveis depende do ambiente do navegador e do uso responsável da aplicação.

Para uma versão de mercado, autenticação, permissões por empresa, isolamento de dados, auditoria e regras de negócio precisam ser implementados no servidor.

## Tecnologias

- React
- Vite
- JavaScript
- CSS
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

O arquivo `vercel.json` inclui uma configuração pronta para Vercel, com build do Vite, cache de assets versionados e cabeçalhos básicos de proteção. Caso use outro provedor, replique cabeçalhos equivalentes.

Configuração comum:

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

## Roadmap

- Drag-and-drop no pipeline.
- Histórico de atividades por lead.
- Exportação CSV/XLSX.
- Lembretes e tarefas vinculados a leads.
- Evolução de dashboard por período.
- Backend multiempresa.
- Autenticação.
- Permissões por empresa/equipe.
- Auditoria de ações sensíveis.
