# Contribuindo com o ClientFlow CRM

Obrigado por ajudar a evoluir o projeto.

## Preparação

```bash
git clone https://github.com/marcusguedess/clientflow-crm.git
cd clientflow-crm
npm ci
npm run dev
```

## Fluxo recomendado

1. Crie uma branch a partir da `main`.
2. Faça alterações pequenas e focadas.
3. Não adicione credenciais, tokens, dados reais de clientes ou arquivos `.env`.
4. Execute as validações:

```bash
npm run build
npm audit
```

5. Abra um pull request explicando objetivo, alterações e como testar.

## Padrões

- Use JavaScript e componentes React organizados.
- Preserve a compatibilidade com GitHub Pages.
- Renderize textos com JSX; não use HTML arbitrário.
- Valide qualquer dado lido do navegador ou importado por arquivo.
- Mantenha acessibilidade por teclado e layout responsivo.
- Não use assets protegidos ou scripts externos sem revisão.

## Commits

Prefira mensagens diretas:

```text
feat: adiciona filtro por responsável
fix: corrige layout mobile do pipeline
docs: atualiza instruções de deploy
security: valida estrutura do backup
```

## Segurança

O projeto é local-first e não possui autenticação real. Não implemente permissões somente no frontend como se fossem controles de segurança. Recursos multiusuário exigem backend com autorização no servidor.

Leia também [security_best_practices_report.md](security_best_practices_report.md).
