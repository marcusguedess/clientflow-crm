# Segurança

O ClientFlow CRM é uma aplicação local-first em desenvolvimento ativo. A versão atual roda no navegador e armazena dados localmente, por isso deve ser usada como demonstração ou base de evolução, não como sistema empresarial finalizado.

## Controles atuais

- Política de Segurança de Conteúdo com scripts restritos à própria origem.
- Nenhum script, fonte ou serviço externo obrigatório.
- Validação dos dados persistidos e importados.
- Backup criptografado por senha com AES-GCM 256.
- Derivação de chave com PBKDF2-SHA256.
- Senha mínima de 12 caracteres para backup.
- Limite de tamanho e extensão `.cfbackup` na importação.
- Nenhum token, senha ou segredo armazenado pelo aplicativo.
- Modo de apresentação e limpeza de emergência dos dados locais.

## Limitação principal

Os dados ficam em `localStorage`. Isso significa que pessoas, extensões ou scripts com acesso ao mesmo perfil do navegador podem ler ou alterar essas informações.

Por esse motivo, a versão atual não deve armazenar dados reais sensíveis, documentos regulados, credenciais, tokens ou informações confidenciais de clientes.

## Requisitos para uma versão multiusuário

Uma versão de mercado precisa implementar no backend:

- autenticação;
- autorização aplicada no servidor;
- isolamento por empresa ou organização;
- papéis e permissões;
- auditoria de ações sensíveis;
- validação server-side;
- política de retenção e exclusão de dados;
- proteção de sessões;
- criptografia em trânsito.

Controles visuais no React ajudam na experiência, mas não substituem regras de segurança aplicadas no servidor.
