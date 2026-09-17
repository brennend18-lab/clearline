/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "1" for statically hosted builds so routing falls back to hashes. */
  readonly VITE_HASH_ROUTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv & { BASE_URL: string };
}
