import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_PORT || env.PORT || 5173);
  
  // Parse allowed hosts from environment variable (comma-separated)
  const allowedHosts = env.VITE_ALLOWED_HOSTS 
    ? env.VITE_ALLOWED_HOSTS.split(',').map(host => host.trim())
    : undefined;
  
  return {
    plugins: [react()],
    server: {
      port,
      host: true,
      ...(allowedHosts && { hmr: { host: allowedHosts[0] } }),
      proxy: allowedHosts ? undefined : {}
    },
    preview: {
      port,
      host: true
    }
  };
});
