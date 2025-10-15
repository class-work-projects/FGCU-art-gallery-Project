import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_PORT || env.PORT || 5173);
  return {
    plugins: [react()],
    server: {
      port,
      host: true
    },
    preview: {
      port
    }
  };
});
