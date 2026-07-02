/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: 'real' | 'mock';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
