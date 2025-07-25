create function decrement_informes_restantes(user_id_param uuid)
returns void as $$
  update profiles
  set informes_restantes = informes_restantes - 1
  where user_id = user_id_param;
$$ language sql;
