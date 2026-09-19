/// <reference types="vite/client" />

// Tipagem das variáveis de ambiente do projeto. Sem isto o TypeScript não
// sabe que import.meta.env.VITE_REFRESH_MS existe.
interface ImportMetaEnv {
  readonly VITE_REFRESH_MS?: string
  readonly VITE_OTEL_EXPORTER_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
