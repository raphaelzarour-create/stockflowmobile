# Documentação de Extensão - StockFlow

## Descrição da Solução

O StockFlow é um aplicativo mobile desenvolvido para auxiliar a empresa 4K Leds e Eventos no controle de estoque e na organização dos eventos realizados. A solução permite cadastrar equipamentos, registrar movimentações, criar eventos e reservar itens para uso nas montagens.

O aplicativo foi pensado para uso em celular, considerando a rotina operacional da empresa e o perfil dos colaboradores. Por isso, a interface utiliza cards, botões grandes, textos objetivos e formulários curtos.

## Contexto e Problema Identificado

A empresa parceira atua no segmento de eventos e utiliza equipamentos como materiais de iluminação, painéis de LED, cabos, estruturas, som e acessórios. Durante o levantamento inicial, foi identificado que parte do controle de estoque era realizada de forma manual, descentralizada ou informal.

Essa situação gerava risco de perda de informações, dificuldade para consultar a disponibilidade dos materiais, retrabalho e problemas no planejamento dos eventos. Também foi observado que alguns usuários possuem pouca familiaridade com sistemas complexos, reforçando a necessidade de uma solução simples e acessível.

## Justificativa Técnica

O projeto foi desenvolvido com React Native, Expo e TypeScript, pois essas tecnologias permitem criar um aplicativo mobile multiplataforma com boa produtividade e organização de código.

O login e a persistência utilizam Supabase Auth e Supabase Postgres. Assim, o aplicativo deixa de depender de registros isolados no aparelho e passa a operar com um banco real, compartilhado entre colaboradores autenticados. O banco utiliza Row Level Security para restringir acesso a usuários autenticados e funções SQL para garantir consistência em operações críticas de estoque.

A arquitetura separa responsabilidades:

- Telas em `src/screens`.
- Componentes reutilizáveis em `src/components`.
- Regras de negócio em `src/services`.
- Persistência real em `src/storage`, usando Supabase/Postgres.
- Tipos de domínio em `src/types`.
- Controlador da interface em `src/hooks`.

## Funcionalidades Implementadas

- Visualização de resumo do estoque.
- Login real por e-mail e senha.
- Cadastro, edição e exclusão de itens.
- Registro de entrada, saída, devolução, manutenção e item danificado.
- Cadastro, edição e exclusão de eventos.
- Associação de itens do estoque a eventos.
- Atualização automática da disponibilidade ao reservar itens.
- Devolução automática dos itens ao finalizar um evento.
- Histórico das movimentações.
- Busca e filtros simples.
- Dados da empresa e informações acadêmicas do projeto.

## Benefícios para a Empresa Parceira

- Melhor organização dos materiais utilizados nos eventos.
- Consulta rápida da disponibilidade dos equipamentos.
- Redução de falhas no controle manual.
- Apoio ao planejamento logístico de eventos.
- Registro do histórico de movimentações.
- Uso prático em celular durante a rotina de trabalho.
- Banco compartilhado para uso por mais de um colaborador.

## Critérios de Avaliação do Projeto

- Facilidade de uso por colaboradores da empresa.
- Capacidade de cadastrar e localizar itens rapidamente.
- Atualização correta da disponibilidade após movimentações.
- Funcionamento do fluxo de criação de evento e reserva de itens.
- Funcionamento do login real e da gravação dos dados no banco Supabase.
- Clareza das informações exibidas na dashboard.
- Feedback visual após ações de salvar, excluir, movimentar ou finalizar evento.

## Evidências Recomendadas

Para comprovar o desenvolvimento e a aplicação extensionista, recomenda-se coletar:

- Prints das telas principais no celular.
- Vídeo curto demonstrando o fluxo de cadastro de item.
- Vídeo curto demonstrando criação de evento e reserva de item.
- Registro de conversa ou reunião com a empresa parceira.
- Formulário de satisfação dos usuários.
- Feedback dos colaboradores sobre facilidade de uso.
- Relato do grupo sobre aprendizados e dificuldades.

## Possíveis Melhorias Futuras

- Perfis de usuário por cargo.
- Relatórios gerenciais.
- Scanner de QR Code para equipamentos.
- Cadastro de fotos dos itens.
- Controle de permissões.
- Exportação de dados para planilhas ou PDF.

## Considerações Finais

O StockFlow aplica conhecimentos de desenvolvimento mobile, banco de dados, modelagem de sistemas e experiência do usuário para resolver um problema real de uma empresa parceira. A solução contribui para a organização operacional da 4K Leds e Eventos e demonstra a integração entre prática acadêmica e demanda da comunidade externa.
