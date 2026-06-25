# Relatório de segurança — ClientFlow CRM

## Resumo executivo

O projeto não apresentou vulnerabilidades conhecidas nas dependências (`npm audit`) nem padrões de execução dinâmica, HTML não sanitizado, segredos no bundle ou scripts de terceiros. A aplicação segue um modelo local-first compatível com GitHub Pages.

Não existem achados críticos ou altos no escopo atual. A principal limitação é estrutural: `localStorage` não oferece confidencialidade contra pessoas ou extensões com acesso ao mesmo perfil do navegador. Por isso, autenticação, permissões e colaboração real não foram simuladas como controles de segurança.

## Médio

### SEC-001 — Dados operacionais ficam acessíveis no perfil do navegador

- Regra: JS-STORAGE-001 / REACT-AUTHZ-001
- Severidade: Média
- Localização: `src/hooks/usePersistentState.js:6-15`, `src/services/crmStorage.js:8-18`
- Evidência: leads, mensagens, perfis e mural são persistidos em `localStorage`.
- Impacto: uma extensão maliciosa, XSS futuro ou pessoa com acesso ao mesmo perfil do navegador pode ler ou alterar os dados.
- Correção definitiva: mover dados sensíveis para backend com autenticação, autorização no servidor e sessões protegidas.
- Mitigação atual: não armazenar segredos, tokens ou documentos regulados; validar leads lidos do armazenamento; usar CSP; oferecer backup criptografado.
- Observação: é uma limitação assumida do requisito de hospedagem exclusivamente estática.

## Baixo

### SEC-002 — CSP permite estilos inline

- Regra: JS-CSP-001 / REACT-CSP-001
- Severidade: Baixa
- Localização: `index.html:6-7`
- Evidência: `style-src 'self' 'unsafe-inline'`.
- Impacto: reduz a proteção da CSP contra injeção de CSS, mas não permite execução de JavaScript.
- Justificativa: Vite em desenvolvimento e a personalização dinâmica de cores utilizam estilos inline.
- Mitigação atual: `script-src 'self'` permanece sem `unsafe-inline` e sem `unsafe-eval`; `object-src 'none'`; nenhuma renderização de HTML arbitrário.
- Melhoria futura: substituir estilos dinâmicos por classes predefinidas e remover `unsafe-inline` de `style-src`.

### SEC-003 — Cabeçalhos HTTP completos não podem ser definidos pelo app no GitHub Pages

- Regra: REACT-HEADERS-001
- Severidade: Baixa
- Localização: `index.html:6-7`
- Evidência: CSP é entregue por `<meta>`, não por cabeçalho HTTP.
- Impacto: diretivas como `frame-ancestors` não funcionam via meta; cabeçalhos como `X-Content-Type-Options` e `Permissions-Policy` dependem da hospedagem.
- Correção definitiva: usar uma hospedagem/CDN que permita configurar cabeçalhos HTTP.
- Mitigação atual: CSP compatível com meta, sem scripts externos e sem conteúdo ativo de terceiros.

## Controles implementados

- CSP com scripts restritos à própria origem.
- Nenhum segredo ou credencial no frontend.
- Nenhum uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `new Function`.
- Validação e limites para leads, funcionários, mensagens, posts e tarefas.
- IDs aleatórios com `crypto.randomUUID()`.
- Backup protegido por AES-GCM 256.
- Derivação de chave PBKDF2-SHA256 com 210.000 iterações.
- Senha mínima de 10 caracteres e não persistida.
- Importação limitada a 1 MB e com verificação de formato/versão.
- Modo apresentação para ocultar emails, telefones e notas.
- Ocultação automática após três minutos de inatividade.
- Limite local de frequência para mensagens e publicações.
- Prevenção de emails duplicados na base de leads.
- Limpeza de emergência de todas as chaves ClientFlow no navegador.
- Lockfile presente e `npm audit` sem vulnerabilidades conhecidas.

## Recomendação para uma futura versão multiusuário

Não adicionar login ou autorização somente no React. Uma versão colaborativa deve usar backend com:

- autenticação e autorização aplicadas no servidor;
- banco com isolamento por organização;
- cookies `HttpOnly`, `Secure` e política `SameSite` adequada;
- proteção CSRF quando houver autenticação por cookie;
- rate limiting, logs de auditoria e validação server-side;
- criptografia em trânsito e política de retenção de dados.
