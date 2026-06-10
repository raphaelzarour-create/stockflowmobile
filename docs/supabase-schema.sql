-- StockFlow Mobile - Supabase/Postgres schema
-- Rode este arquivo no SQL Editor do Supabase antes de usar o app.

create extension if not exists pgcrypto;

create table if not exists public.itens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null check (
    categoria in ('iluminacao', 'cabos', 'paineis_led', 'estruturas', 'som', 'acessorios', 'outros')
  ),
  quantidade_total integer not null check (quantidade_total >= 0),
  quantidade_disponivel integer not null check (quantidade_disponivel >= 0),
  status text not null check (status in ('disponivel', 'em_uso', 'manutencao', 'danificado')),
  observacao text not null default '',
  data_cadastro timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por uuid references auth.users(id) default auth.uid(),
  constraint itens_quantidades_validas check (quantidade_disponivel <= quantidade_total)
);

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cliente text not null,
  data date not null,
  local text not null,
  descricao text not null default '',
  status text not null check (status in ('planejado', 'em_andamento', 'concluido', 'cancelado')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por uuid references auth.users(id) default auth.uid()
);

create table if not exists public.itens_evento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  item_id uuid not null references public.itens(id) on delete cascade,
  item_nome text not null,
  quantidade integer not null check (quantidade > 0),
  devolvido boolean not null default false,
  data_vinculo timestamptz not null default now(),
  criado_por uuid references auth.users(id) default auth.uid()
);

create table if not exists public.movimentacoes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.itens(id) on delete set null,
  item_nome text not null,
  evento_id uuid references public.eventos(id) on delete set null,
  evento_nome text not null default '',
  tipo text not null check (tipo in ('entrada', 'saida', 'devolucao', 'manutencao', 'danificado')),
  quantidade integer not null check (quantidade > 0),
  observacao text not null default '',
  data timestamptz not null default now(),
  criado_por uuid references auth.users(id) default auth.uid()
);

create index if not exists idx_itens_nome on public.itens (nome);
create index if not exists idx_eventos_data on public.eventos (data);
create index if not exists idx_itens_evento_evento on public.itens_evento (evento_id);
create index if not exists idx_movimentacoes_data on public.movimentacoes (data desc);

create or replace function public.stockflow_set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_itens_atualizado_em on public.itens;
create trigger trg_itens_atualizado_em
before update on public.itens
for each row execute function public.stockflow_set_atualizado_em();

drop trigger if exists trg_eventos_atualizado_em on public.eventos;
create trigger trg_eventos_atualizado_em
before update on public.eventos
for each row execute function public.stockflow_set_atualizado_em();

create or replace function public.stockflow_status_por_disponibilidade(
  p_quantidade_total integer,
  p_quantidade_disponivel integer,
  p_tipo text default null
)
returns text
language plpgsql
immutable
as $$
begin
  if p_tipo = 'manutencao' then
    return 'manutencao';
  end if;

  if p_tipo = 'danificado' then
    return 'danificado';
  end if;

  if p_quantidade_total > 0 and p_quantidade_disponivel <= 0 then
    return 'em_uso';
  end if;

  return 'disponivel';
end;
$$;

create or replace function public.stockflow_validar_quantidade(p_quantidade integer)
returns void
language plpgsql
immutable
as $$
begin
  if p_quantidade is null or p_quantidade <= 0 then
    raise exception 'Informe uma quantidade inteira maior que zero.';
  end if;
end;
$$;

create or replace function public.stockflow_exigir_usuario()
returns void
language plpgsql
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;
end;
$$;

create or replace function public.stockflow_registrar_movimentacao_manual(
  p_item_id uuid,
  p_tipo text,
  p_quantidade integer,
  p_observacao text default ''
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item public.itens%rowtype;
  v_total integer;
  v_disponivel integer;
begin
  perform public.stockflow_exigir_usuario();
  perform public.stockflow_validar_quantidade(p_quantidade);

  if p_tipo not in ('entrada', 'saida', 'devolucao', 'manutencao', 'danificado') then
    raise exception 'Tipo de movimentacao invalido.';
  end if;

  select * into v_item from public.itens where id = p_item_id for update;
  if not found then
    raise exception 'Item nao encontrado.';
  end if;

  v_total := v_item.quantidade_total;
  v_disponivel := v_item.quantidade_disponivel;

  if p_tipo = 'entrada' then
    v_total := v_total + p_quantidade;
    v_disponivel := v_disponivel + p_quantidade;
  elsif p_tipo = 'saida' then
    if p_quantidade > v_disponivel then
      raise exception 'Nao ha quantidade disponivel suficiente para registrar a saida.';
    end if;
    v_disponivel := v_disponivel - p_quantidade;
  elsif p_tipo = 'devolucao' then
    v_disponivel := least(v_total, v_disponivel + p_quantidade);
  elsif p_tipo in ('manutencao', 'danificado') then
    if p_quantidade > v_disponivel then
      raise exception 'Nao ha quantidade disponivel suficiente para alterar o status.';
    end if;
    v_disponivel := v_disponivel - p_quantidade;
  end if;

  update public.itens
     set quantidade_total = v_total,
         quantidade_disponivel = v_disponivel,
         status = public.stockflow_status_por_disponibilidade(v_total, v_disponivel, p_tipo)
   where id = p_item_id;

  insert into public.movimentacoes (
    item_id,
    item_nome,
    tipo,
    quantidade,
    observacao
  ) values (
    v_item.id,
    v_item.nome,
    p_tipo,
    p_quantidade,
    coalesce(nullif(trim(p_observacao), ''), 'Movimentacao manual de estoque')
  );
end;
$$;

create or replace function public.stockflow_associar_item_evento(
  p_evento_id uuid,
  p_item_id uuid,
  p_quantidade integer
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_evento public.eventos%rowtype;
  v_item public.itens%rowtype;
  v_disponivel integer;
begin
  perform public.stockflow_exigir_usuario();
  perform public.stockflow_validar_quantidade(p_quantidade);

  select * into v_evento from public.eventos where id = p_evento_id for update;
  if not found then
    raise exception 'Evento nao encontrado.';
  end if;

  if v_evento.status in ('concluido', 'cancelado') then
    raise exception 'Nao e possivel associar itens a eventos finalizados ou cancelados.';
  end if;

  select * into v_item from public.itens where id = p_item_id for update;
  if not found then
    raise exception 'Item nao encontrado.';
  end if;

  if p_quantidade > v_item.quantidade_disponivel then
    raise exception 'O item selecionado nao possui quantidade disponivel suficiente.';
  end if;

  v_disponivel := v_item.quantidade_disponivel - p_quantidade;

  update public.itens
     set quantidade_disponivel = v_disponivel,
         status = public.stockflow_status_por_disponibilidade(v_item.quantidade_total, v_disponivel, 'saida')
   where id = v_item.id;

  insert into public.itens_evento (
    evento_id,
    item_id,
    item_nome,
    quantidade
  ) values (
    v_evento.id,
    v_item.id,
    v_item.nome,
    p_quantidade
  );

  insert into public.movimentacoes (
    item_id,
    item_nome,
    evento_id,
    evento_nome,
    tipo,
    quantidade,
    observacao
  ) values (
    v_item.id,
    v_item.nome,
    v_evento.id,
    v_evento.nome,
    'saida',
    p_quantidade,
    'Saida vinculada ao evento ' || v_evento.nome
  );
end;
$$;

create or replace function public.stockflow_devolver_pendentes_evento(p_evento_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_evento public.eventos%rowtype;
  v_vinculo public.itens_evento%rowtype;
  v_item public.itens%rowtype;
  v_disponivel integer;
begin
  perform public.stockflow_exigir_usuario();

  select * into v_evento from public.eventos where id = p_evento_id for update;
  if not found then
    raise exception 'Evento nao encontrado.';
  end if;

  for v_vinculo in
    select * from public.itens_evento
     where evento_id = p_evento_id and devolvido = false
     for update
  loop
    select * into v_item from public.itens where id = v_vinculo.item_id for update;
    if found then
      v_disponivel := least(v_item.quantidade_total, v_item.quantidade_disponivel + v_vinculo.quantidade);

      update public.itens
         set quantidade_disponivel = v_disponivel,
             status = public.stockflow_status_por_disponibilidade(v_item.quantidade_total, v_disponivel, 'devolucao')
       where id = v_item.id;

      insert into public.movimentacoes (
        item_id,
        item_nome,
        evento_id,
        evento_nome,
        tipo,
        quantidade,
        observacao
      ) values (
        v_item.id,
        v_item.nome,
        v_evento.id,
        v_evento.nome,
        'devolucao',
        v_vinculo.quantidade,
        'Devolucao do evento ' || v_evento.nome
      );
    end if;

    update public.itens_evento set devolvido = true where id = v_vinculo.id;
  end loop;
end;
$$;

create or replace function public.stockflow_finalizar_evento(p_evento_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.stockflow_devolver_pendentes_evento(p_evento_id);
  update public.eventos set status = 'concluido' where id = p_evento_id;
end;
$$;

create or replace function public.stockflow_excluir_evento(p_evento_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.stockflow_devolver_pendentes_evento(p_evento_id);
  delete from public.eventos where id = p_evento_id;
end;
$$;

alter table public.itens enable row level security;
alter table public.eventos enable row level security;
alter table public.itens_evento enable row level security;
alter table public.movimentacoes enable row level security;

drop policy if exists "stockflow_itens_select" on public.itens;
drop policy if exists "stockflow_itens_insert" on public.itens;
drop policy if exists "stockflow_itens_update" on public.itens;
drop policy if exists "stockflow_itens_delete" on public.itens;
create policy "stockflow_itens_select" on public.itens for select to authenticated using (true);
create policy "stockflow_itens_insert" on public.itens for insert to authenticated with check (auth.uid() is not null);
create policy "stockflow_itens_update" on public.itens for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "stockflow_itens_delete" on public.itens for delete to authenticated using (auth.uid() is not null);

drop policy if exists "stockflow_eventos_select" on public.eventos;
drop policy if exists "stockflow_eventos_insert" on public.eventos;
drop policy if exists "stockflow_eventos_update" on public.eventos;
drop policy if exists "stockflow_eventos_delete" on public.eventos;
create policy "stockflow_eventos_select" on public.eventos for select to authenticated using (true);
create policy "stockflow_eventos_insert" on public.eventos for insert to authenticated with check (auth.uid() is not null);
create policy "stockflow_eventos_update" on public.eventos for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "stockflow_eventos_delete" on public.eventos for delete to authenticated using (auth.uid() is not null);

drop policy if exists "stockflow_itens_evento_select" on public.itens_evento;
drop policy if exists "stockflow_itens_evento_insert" on public.itens_evento;
drop policy if exists "stockflow_itens_evento_update" on public.itens_evento;
drop policy if exists "stockflow_itens_evento_delete" on public.itens_evento;
create policy "stockflow_itens_evento_select" on public.itens_evento for select to authenticated using (true);
create policy "stockflow_itens_evento_insert" on public.itens_evento for insert to authenticated with check (auth.uid() is not null);
create policy "stockflow_itens_evento_update" on public.itens_evento for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "stockflow_itens_evento_delete" on public.itens_evento for delete to authenticated using (auth.uid() is not null);

drop policy if exists "stockflow_movimentacoes_select" on public.movimentacoes;
drop policy if exists "stockflow_movimentacoes_insert" on public.movimentacoes;
create policy "stockflow_movimentacoes_select" on public.movimentacoes for select to authenticated using (true);
create policy "stockflow_movimentacoes_insert" on public.movimentacoes for insert to authenticated with check (auth.uid() is not null);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.itens to authenticated;
grant select, insert, update, delete on public.eventos to authenticated;
grant select, insert, update, delete on public.itens_evento to authenticated;
grant select, insert on public.movimentacoes to authenticated;
grant execute on function public.stockflow_status_por_disponibilidade(integer, integer, text) to authenticated;
grant execute on function public.stockflow_validar_quantidade(integer) to authenticated;
grant execute on function public.stockflow_exigir_usuario() to authenticated;
grant execute on function public.stockflow_devolver_pendentes_evento(uuid) to authenticated;
grant execute on function public.stockflow_registrar_movimentacao_manual(uuid, text, integer, text) to authenticated;
grant execute on function public.stockflow_associar_item_evento(uuid, uuid, integer) to authenticated;
grant execute on function public.stockflow_finalizar_evento(uuid) to authenticated;
grant execute on function public.stockflow_excluir_evento(uuid) to authenticated;

alter table public.itens replica identity full;
alter table public.eventos replica identity full;
alter table public.itens_evento replica identity full;
alter table public.movimentacoes replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.itens;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.eventos;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.itens_evento;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.movimentacoes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
