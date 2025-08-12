-- Overload to resolve schema cache param-order mismatch when invoking RPC
-- Creates a wrapper with signature (p_email text, p_user_id uuid) that calls the canonical function

create or replace function public.admin_update_user_email(
  p_email text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_update_user_email(p_user_id := p_user_id, p_email := p_email);
end;
$$;

revoke all on function public.admin_update_user_email(text, uuid) from public;
grant execute on function public.admin_update_user_email(text, uuid) to authenticated;


