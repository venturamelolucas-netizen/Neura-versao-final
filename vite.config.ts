import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { spawn } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function fastApiPlugin(): Plugin {
  return {
    name: 'fastapi-backend',
    configureServer(server) {
      console.log('[FastAPI] Spawning background Uvicorn server on port 8001...');
      const py = spawn(
        'python3',
        ['-m', 'uvicorn', 'api.main:app', '--port', '8001', '--host', '127.0.0.1'],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            PYTHONPATH: process.cwd(),
            PATH: `${process.env.PATH || ''}:/root/.local/bin`
          },
          stdio: 'ignore'
        }
      );

      py.on('error', (err) => {
        console.error('[FastAPI] Process error:', err);
      });

      server.httpServer?.on('close', () => {
        py.kill('SIGTERM');
      });
      process.on('exit', () => {
        py.kill('SIGTERM');
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), fastApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true
        }
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
