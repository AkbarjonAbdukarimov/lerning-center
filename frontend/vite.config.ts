import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:3000';
  // In dev the API is proxied, so the app always calls same-origin paths (as in production).
  const proxy = Object.fromEntries(['/students', '/payments', '/debtors'].map((p) => [p, apiTarget]));

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, proxy },
  };
});
