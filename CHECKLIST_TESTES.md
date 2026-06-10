# Checklist Manual de Testes - StockFlow

Use este roteiro em um celular Android ou Expo Go antes da apresentação.

## Preparação

- [ ] Abrir o app no celular.
- [ ] Conferir se a tela inicial carrega sem erro.
- [ ] Fazer login com e-mail e senha cadastrados no Supabase.
- [ ] Fechar e abrir o app novamente para confirmar que a sessão continua ativa.
- [ ] Cadastrar um produto real, se o estoque estiver vazio.
- [ ] Conferir no Supabase se o produto foi gravado na tabela `itens`.
- [ ] Confirmar se a barra inferior navega entre Início, Estoque, Eventos, Histórico e Info.

## Estoque

- [ ] Criar um item com nome, categoria, quantidade total e quantidade disponível.
- [ ] Validar que o app exibe erro quando o nome fica vazio.
- [ ] Validar que o app exibe erro quando a quantidade disponível é maior que a total.
- [ ] Editar um item existente.
- [ ] Buscar um item pelo nome.
- [ ] Filtrar por categoria.
- [ ] Filtrar por status.
- [ ] Registrar entrada de estoque.
- [ ] Registrar saída de estoque.
- [ ] Registrar devolução de estoque.
- [ ] Registrar item em manutenção.
- [ ] Excluir um item que não será mais usado.

## Eventos

- [ ] Criar evento com nome, cliente, data e local.
- [ ] Validar que o app exibe erro quando campos obrigatórios ficam vazios.
- [ ] Buscar evento pelo nome ou cliente.
- [ ] Filtrar eventos por status.
- [ ] Editar evento existente.
- [ ] Associar item disponível ao evento.
- [ ] Confirmar que a quantidade disponível do item diminui após associação.
- [ ] Finalizar evento.
- [ ] Confirmar que os itens reservados retornam ao estoque.
- [ ] Excluir evento de teste.

## Histórico

- [ ] Conferir se entrada, saída, devolução e associação aparecem no histórico.
- [ ] Buscar movimentação pelo nome do item.
- [ ] Filtrar histórico por tipo de movimentação.

## Usabilidade Mobile

- [ ] Confirmar que os botões são fáceis de tocar.
- [ ] Confirmar que os textos cabem na tela.
- [ ] Confirmar que não há tabelas grandes ou layout de desktop.
- [ ] Confirmar que os formulários não ficam carregados demais.
- [ ] Confirmar que os feedbacks de sucesso ou erro aparecem após as ações.
- [ ] Testar em pelo menos dois tamanhos de tela, se possível.

## Evidências para Extensão

- [ ] Print da dashboard.
- [ ] Print da tela de estoque.
- [ ] Print da tela de eventos.
- [ ] Print do histórico.
- [ ] Vídeo curto mostrando cadastro de item.
- [ ] Vídeo curto mostrando criação de evento e reserva de item.
- [ ] Feedback de um colaborador da empresa parceira.
