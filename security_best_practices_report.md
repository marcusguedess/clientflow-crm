# Relatório de segurança — ClientFlow CRM

## Resumo executivo

O projeto não apresentou padrões de execução dinâmica, HTML não sanitizado, segredos no bundle ou scripts de terceiros. A aplicação segue um modelo local-first com validação de dados, CSP, backup criptografado e controles de apresentação para reduzir exposição acidental.

Não há achados críticos ou altos no escopo atual. A principal limitação é estrutural: dados em `localStorage` não têm confidencialidade contra pessoas, extensões ou scripts que já tenham acesso ao mesmo perfil do navegador.

## Médio

### SEC-001 — Dados operacionais ficam acessíveis no perfil do navegador

- Regra: JS-STORAGE-001 / REACT-AUTHZ-001
- Severidade: Média
- Localização: `src/hooks/usePersistentState.js:6`, `src/services/crmStorage.js:8`
- Evidência: leads, mensagens, perfis, tarefas e mural são persistidos em `localStorage`.
- Impacto: uma extensão maliciosa, XSS futuro ou pessoa com acesso ao mesmo perfil do navegador pode ler ou alterar os dados.
- Correção definitiva: mover dados sensíveis para backend com autenticação, autorização no servidor, isolamento por organização e sessões protegidas.
- Mitigação atual: não armazenar segredos, tokens ou documentos regulados; validar dados lidos do armazenamento; usar CSP; oferecer backup criptografado; permitir limpeza de emergência.

## Baixo

### SEC-002 — CSP permite estilos inline

- Regra: JS-CSP-001 / REACT-CSP-001
- Severidade: Baixa
- Localização: `index.html:6`, `vercel.json:12`
- Evidência: `style-src 'self' 'unsafe-inline'`.
- Impacto: reduz a rigidez da CSP para CSS, mas não libera execução de JavaScript.
- Justificativa: a interface usa estilos dinâmicos para temas, gráficos e medidores visuais.
- Mitigação atual: `script-src 'self'` permanece sem `unsafe-inline` e sem `unsafe-eval`; `object-src 'none'`; nenhum HTML arbitrário é renderizado.
- Melhoria futura: migrar valores dinâmicos críticos para classes predefinidas e avaliar remoção de `unsafe-inline` em produção.

### SEC-003 — Segurança completa depende da configuração da hospedagem

- Regra: REACT-HEADERS-001
- Severidade: Baixa
- Localização: `vercel.json:7`
- Evidência: os cabeçalhos estão definidos para Vercel; outros provedores precisam de configuração equivalente.
- Impacto: publicar em provedor sem headers pode reduzir proteção contra clickjacking, MIME sniffing e exposição de referência.
- Correção: replicar CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e bloqueio de iframe no provedor escolhido.

## Controles implementados

- CSP com scripts restritos à própria origem.
- Nenhum segredo ou credencial no frontend.
- Nenhum uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval` ou `new Function`.
- Validação e limites para leads, funcionários, mensagens, posts e tarefas.
- IDs aleatórios com `crypto.randomUUID()`.
- Backup protegido por AES-GCM 256.
- Derivação de chave PBKDF2-SHA256 com 210.000 iterações.
- Senha mínima de 12 caracteres e não persistida.
- Importação limitada a 1 MB, extensão `.cfbackup`, verificação de formato, versão e parâmetros criptográficos.
- Modo apresentação para ocultar emails, telefones e notas.
- Ocultação automática após três minutos de inatividade.
- Limite local de frequência para mensagens e publicações.
- Prevenção de emails duplicados na base de leads.
- Limpeza de emergência de todas as chaves ClientFlow no navegador.
- Lockfile presente para builds reproduzíveis.

## Recomendação para versão multiusuário

Uma versão colaborativa deve usar backend com:

- autenticação e autorização aplicadas no servidor;
- banco com isolamento por organização;
- papéis e permissões por equipe;
- cookies `HttpOnly`, `Secure` e política `SameSite` adequada;
- proteção CSRF quando houver autenticação por cookie;
- rate limiting, logs de auditoria e validação server-side;
- criptografia em trânsito;
- política de retenção e exclusão de dados.
