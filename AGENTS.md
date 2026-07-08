# Regras para agentes

## Visão do produto

ClientFlow transforma sinais comerciais em próximas ações, e transforma o trabalho da empresa em um mundo vivo.

O CRM é o sistema operacional sério do produto. A ClientFlow City é a interface espacial e social desse mesmo sistema, não um minigame isolado. O ciclo central é:

CRM → inteligência → ação → consequência → mundo vivo.

Toda funcionalidade deve ajudar o usuário a identificar um sinal importante, tomar uma próxima ação ou fortalecer a sensação de que a empresa é um organismo vivo.

## Idioma

- Código, funções, eventos de domínio e identificadores técnicos devem permanecer em inglês quando fizer sentido.
- Produto, interface, documentação de produto e Pull Requests devem usar PT-BR.
- Commits técnicos podem permanecer em inglês para preservar o padrão existente.

## Git

- Nunca fazer push direto na `main`.
- Trabalhar com uma mudança de produto por PR.
- Usar branch isolada para cada ciclo.
- Executar testes e build antes de mergear.
- Não iniciar o próximo PR antes do anterior estar concluído ou explicitamente bloqueado.

## Escopo

- Não misturar CRM, City e backend sem escopo explícito.
- Não criar novas áreas no produto sem necessidade clara.
- Não antecipar itens futuros do roadmap.
- Não expandir horizontalmente o produto dentro de um PR focado.

## Produto

- Não criar métrica falsa.
- Não criar botão cenográfico.
- Não criar gráfico sem função.
- Não criar prédio sem propósito.
- Não criar interação que pareça funcional mas não execute nada.
- Todo elemento interativo deve executar, navegar, abrir contexto, modificar estado, gerar consequência ou estar explicitamente desabilitado como "em breve".

## Dados

- Preservar dados antigos.
- Criar migrations idempotentes.
- Evitar dual-write espalhado por componentes.
- Usar entidades reais como direção principal: Account, Contact, Deal, Activity e Task.
- Manter legado apenas como migração, compatibilidade ou fallback temporário.

## Arquitetura

- Preservar React, Vite, JavaScript e a arquitetura local-first atual.
- O alvo de deploy é Vercel.
- Backend e autenticação são direções futuras, não pressupostos do ciclo atual.
- A direção técnica é: Domain → Repository API → Local Adapter agora → API/Backend Adapter futuramente.
- `App.jsx` não deve crescer indefinidamente.
- Ações centrais de domínio devem concentrar escritas e transições relevantes.
- Eventos de domínio devem ser emitidos de forma coerente e sem duplicidade.

## Qualidade

Antes de concluir um PR, executar:

```bash
npm test
npm run build
git diff --check
```

Quando o PR tocar lógica de negócio, adicionar ou ajustar testes. Quando tocar interação visual, fazer smoke test quando houver navegador disponível.

## Segurança

- Nunca versionar segredos, tokens, credenciais ou arquivos `.env` sensíveis.
- Nunca usar dados sensíveis reais na demo.
- Não vender local-first como segurança multiusuário.
- Verificar arquivos alterados antes de commit e PR.

## City

- Não expandir o mapa indiscriminadamente.
- A City futura deve ser jogável e conectada ao CRM.
- A City não deve duplicar lógica do CRM.
- A City deve usar as mesmas ações e eventos do CRM.
- Não implementar expansões da City sem PR e escopo explícitos.
