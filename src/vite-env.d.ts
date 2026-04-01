/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // más variables de entorno aquí si fuesen necesarias...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
