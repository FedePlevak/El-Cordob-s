-- Copia y pega este código en el editor SQL de Supabase (SQL Editor) y ejecútalo.

-- 1. Crear la tabla de perfiles (profiles)
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  role text default 'admin'::text not null,
  status text default 'pending'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Activar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para que cualquiera pueda insertar (necesario para el registro)
CREATE POLICY "Permitir inserción de perfiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- 4. Permitir que cada usuario lea su propio perfil o que el super admin lea todos
CREATE POLICY "Permitir leer perfiles" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR auth.jwt() ->> 'email' = 'fedeplevak@gmail.com'
);

-- 5. Permitir que el super admin actualice cualquier perfil
CREATE POLICY "Permitir actualizar al super admin" ON public.profiles FOR UPDATE USING (
  auth.jwt() ->> 'email' = 'fedeplevak@gmail.com'
);

-- Funcionalidad extra: Trigger para crear automáticamente el perfil al registrarse (Opcional, pero recomendado)
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, status)
  values (new.id, new.email, 'admin', 'pending');
  return new;
end;
$$ language plpgsql security definer;

-- Primero borramos el trigger si existiera
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
